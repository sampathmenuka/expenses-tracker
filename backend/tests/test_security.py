import uuid
from datetime import UTC, datetime, timedelta

import jwt
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.config import Settings, get_settings
from tests.conftest import register
from tests.test_api import add_expense, categories

LOGIN = "/api/auth/login"


def login(client, password="correct-horse", email="sam@example.com"):
    return client.post(LOGIN, json={"email": email, "password": password})


def test_forged_and_tampered_tokens_are_rejected(client: TestClient, auth):
    user_id = client.get("/api/auth/me", headers=auth).json()["id"]
    claims = {"sub": user_id, "ver": 0, "exp": datetime.now(UTC) + timedelta(hours=1)}

    wrong_key = jwt.encode(claims, "x" * 48, algorithm="HS256")
    unsigned = jwt.encode(claims, None, algorithm="none")
    expired = jwt.encode(
        {**claims, "exp": datetime.now(UTC) - timedelta(seconds=1)},
        get_settings().jwt_secret,
        algorithm="HS256",
    )
    no_version = jwt.encode(
        {"sub": user_id, "exp": claims["exp"]}, get_settings().jwt_secret, algorithm="HS256"
    )
    for token in (wrong_key, unsigned, expired, no_version):
        r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 401, token


def test_password_change_revokes_other_sessions(client: TestClient, auth):
    other_device = {"Authorization": f"Bearer {login(client).json()['accessToken']}"}
    r = client.post(
        "/api/auth/password",
        headers=auth,
        json={"currentPassword": "correct-horse", "newPassword": "brand-new-pass"},
    )
    assert r.status_code == 200
    fresh = {"Authorization": f"Bearer {r.json()['accessToken']}"}

    assert client.get("/api/auth/me", headers=other_device).status_code == 401
    assert client.get("/api/auth/me", headers=auth).status_code == 401
    assert client.get("/api/auth/me", headers=fresh).status_code == 200


def test_sign_out_everywhere(client: TestClient, auth):
    other_device = {"Authorization": f"Bearer {login(client).json()['accessToken']}"}
    r = client.post("/api/auth/sessions/revoke", headers=auth)
    fresh = {"Authorization": f"Bearer {r.json()['accessToken']}"}
    assert client.get("/api/auth/me", headers=other_device).status_code == 401
    assert client.get("/api/auth/me", headers=fresh).status_code == 200


def test_login_is_rate_limited_per_account(client: TestClient, auth):
    for _ in range(5):
        assert login(client, "wrong-password").status_code == 401
    blocked = login(client, "wrong-password")
    assert blocked.status_code == 429 and int(blocked.headers["Retry-After"]) > 0
    # Even the right password is refused while locked out.
    assert login(client).status_code == 429
    # Other accounts are unaffected.
    register(client, "other@example.com")
    assert login(client, email="other@example.com").status_code == 200


def test_successful_login_resets_failures(client: TestClient, auth):
    for _ in range(4):
        login(client, "wrong-password")
    assert login(client).status_code == 200
    for _ in range(4):
        assert login(client, "wrong-password").status_code == 401


def test_unknown_email_gets_same_answer(client: TestClient, auth):
    unknown = login(client, email="nobody@example.com")
    wrong = login(client, "wrong-password")
    assert unknown.status_code == wrong.status_code == 401
    assert unknown.json() == wrong.json()


def test_registration_is_rate_limited(client: TestClient):
    for i in range(10):
        register(client, f"user{i}@example.com")
    r = client.post(
        "/api/auth/register",
        json={"name": "x", "email": "user99@example.com", "password": "correct-horse"},
    )
    assert r.status_code == 429


def test_password_byte_limit(client: TestClient):
    # 30 multi-byte characters = 90 bytes: bcrypt would silently ignore the tail.
    r = client.post(
        "/api/auth/register",
        json={"name": "x", "email": "long@example.com", "password": "ශ" * 30},
    )
    assert r.status_code == 422


def test_out_of_range_dates_are_rejected_not_crashing(client: TestClient, auth):
    food = categories(client, auth)["Foods"]["id"]
    for path, params in [
        ("/api/reports/dashboard", {"today": "0001-01-01"}),
        ("/api/reports/dashboard", {"today": "9999-12-31"}),
        ("/api/reports/summary", {"start": "0001-01-01", "end": "0001-01-02"}),
        ("/api/analytics/trends", {"today": "0001-03-01", "months": 12}),
        ("/api/analytics/pacing", {"today": "9999-12-31"}),
        ("/api/expenses", {"start": "0001-01-01"}),
    ]:
        assert client.get(path, headers=auth, params=params).status_code == 422, path
    r = client.post(
        "/api/expenses",
        headers=auth,
        json={"title": "x", "amount": 1, "categoryId": food, "date": "0001-01-01"},
    )
    assert r.status_code == 422


def test_delete_account_removes_everything(client: TestClient, auth):
    food = categories(client, auth)["Foods"]["id"]
    add_expense(client, auth, food)
    assert client.request(
        "DELETE", "/api/auth/me", headers=auth, json={"password": "wrong"}
    ).status_code == 400
    assert client.request(
        "DELETE", "/api/auth/me", headers=auth, json={"password": "correct-horse"}
    ).status_code == 204
    assert client.get("/api/auth/me", headers=auth).status_code == 401
    assert login(client).status_code == 401
    # The email can be used again.
    register(client)


def test_cannot_touch_another_users_category(client: TestClient, auth):
    food = categories(client, auth)["Foods"]["id"]
    other = register(client, "other@example.com")
    renamed = client.patch(f"/api/categories/{food}", headers=other, json={"name": "x"})
    assert renamed.status_code == 404
    assert client.delete(f"/api/categories/{food}", headers=other).status_code == 404
    assert client.get(f"/api/expenses/{uuid.uuid4()}", headers=other).status_code == 404


def test_security_headers_and_no_store(client: TestClient, auth):
    r = client.get("/api/auth/me", headers=auth)
    assert r.headers["X-Content-Type-Options"] == "nosniff"
    assert r.headers["X-Frame-Options"] == "DENY"
    assert "frame-ancestors 'none'" in r.headers["Content-Security-Policy"]
    assert r.headers["Cache-Control"] == "no-store"


def test_oversized_body_rejected(client: TestClient, auth):
    big = b"x" * (get_settings().max_body_bytes + 1)
    r = client.post(
        "/api/expenses/import",
        headers={**auth, "Content-Type": "application/json"},
        content=big,
    )
    assert r.status_code == 413


def test_cors_does_not_allow_credentials(client: TestClient):
    r = client.options(
        LOGIN,
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST"},
    )
    assert "access-control-allow-credentials" not in r.headers
    evil = client.options(
        LOGIN,
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"},
    )
    assert "access-control-allow-origin" not in evil.headers


def test_production_requires_real_secret():
    with pytest.raises(ValidationError):
        Settings(app_env="production")
    with pytest.raises(ValidationError):
        Settings(app_env="production", jwt_secret="change-me-in-production")
    with pytest.raises(ValidationError):
        Settings(jwt_secret="")  # too short, even in development
    assert Settings(app_env="production", jwt_secret="s" * 40).is_production


def test_csv_export_neutralises_formulas(client: TestClient, auth):
    food = categories(client, auth)["Foods"]["id"]
    # (Leading tabs/CRs can't reach storage: titles are whitespace-stripped on input.)
    for title in ("=cmd()", "+1", "-1", "@SUM(A1)"):
        add_expense(client, auth, food, title=title)
    body = client.get("/api/expenses/export.csv", headers=auth).text
    rows = [line.split(",")[1] for line in body.strip().splitlines()[1:]]
    assert all(cell.startswith("'") or cell.startswith('"\'') for cell in rows), rows
