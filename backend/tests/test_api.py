from fastapi.testclient import TestClient

from tests.conftest import register


def categories(client: TestClient, auth: dict[str, str]) -> dict[str, dict]:
    return {c["name"]: c for c in client.get("/api/categories", headers=auth).json()}


def add_expense(client, auth, category_id, amount=100, date="2026-11-10", title="Lunch"):
    response = client.post(
        "/api/expenses",
        headers=auth,
        json={"title": title, "amount": amount, "categoryId": category_id, "date": date},
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_register_login_and_me(client: TestClient):
    register(client)
    assert client.post(
        "/api/auth/register",
        json={"name": "Dup", "email": "SAM@example.com", "password": "correct-horse"},
    ).status_code == 409

    bad = client.post("/api/auth/login", json={"email": "sam@example.com", "password": "nope"})
    assert bad.status_code == 401

    ok = client.post(
        "/api/auth/login", json={"email": "Sam@Example.com", "password": "correct-horse"}
    )
    assert ok.status_code == 200
    token = ok.json()["accessToken"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    assert me["email"] == "sam@example.com"
    assert me["currency"] == "LKR"


def test_requires_auth(client: TestClient):
    assert client.get("/api/expenses").status_code == 401
    assert client.get("/api/expenses", headers={"Authorization": "Bearer junk"}).status_code == 401


def test_default_categories_seeded(client: TestClient, auth):
    cats = categories(client, auth)
    assert len(cats) == 8
    assert cats["Other"]["isFallback"] is True
    assert cats["Foods"]["isCustom"] is False


def test_expense_crud_and_filters(client: TestClient, auth):
    cats = categories(client, auth)
    food, transport = cats["Foods"]["id"], cats["Transport"]["id"]
    lunch = add_expense(client, auth, food, 250.5, "2026-11-10", "Lunch")
    add_expense(client, auth, transport, 80, "2026-11-11", "Bus 100%")
    add_expense(client, auth, food, 40, "2026-10-01", "Tea")

    page = client.get("/api/expenses", headers=auth).json()
    assert page["total"] == 3
    assert page["totalAmount"] == 370.5
    assert [e["title"] for e in page["items"]] == ["Bus 100%", "Lunch", "Tea"]

    november = client.get(
        "/api/expenses", headers=auth, params={"start": "2026-11-01", "end": "2026-11-30"}
    ).json()
    assert november["total"] == 2

    by_cat = client.get("/api/expenses", headers=auth, params={"categoryId": food}).json()
    assert by_cat["total"] == 2

    # "%" must be matched literally, not as a wildcard.
    assert client.get("/api/expenses", headers=auth, params={"q": "100%"}).json()["total"] == 1
    assert client.get("/api/expenses", headers=auth, params={"q": "%"}).json()["total"] == 1

    paged = client.get(
        "/api/expenses", headers=auth, params={"limit": 1, "offset": 1, "sort": "amount_desc"}
    ).json()
    assert paged["total"] == 3 and paged["items"][0]["title"] == "Bus 100%"

    updated = client.patch(
        f"/api/expenses/{lunch['id']}",
        headers=auth,
        json={"amount": 300, "note": "with friends", "categoryId": transport},
    ).json()
    assert updated["amount"] == 300 and updated["note"] == "with friends"
    assert updated["categoryId"] == transport

    assert client.delete(f"/api/expenses/{lunch['id']}", headers=auth).status_code == 204
    assert client.get(f"/api/expenses/{lunch['id']}", headers=auth).status_code == 404


def test_expense_validation(client: TestClient, auth):
    food = categories(client, auth)["Foods"]["id"]
    for amount in (0, -5, 1.234):
        r = client.post(
            "/api/expenses",
            headers=auth,
            json={"title": "x", "amount": amount, "categoryId": food, "date": "2026-11-10"},
        )
        assert r.status_code == 422, amount
    r = client.post(
        "/api/expenses",
        headers=auth,
        json={"title": "   ", "amount": 5, "categoryId": food, "date": "2026-11-10"},
    )
    assert r.status_code == 422


def test_users_are_isolated(client: TestClient, auth):
    food = categories(client, auth)["Foods"]["id"]
    expense = add_expense(client, auth, food)
    other = register(client, "other@example.com")

    assert client.get("/api/expenses", headers=other).json()["total"] == 0
    assert client.get(f"/api/expenses/{expense['id']}", headers=other).status_code == 404
    assert client.delete(f"/api/expenses/{expense['id']}", headers=other).status_code == 404
    # Cannot file an expense under someone else's category.
    r = client.post(
        "/api/expenses",
        headers=other,
        json={"title": "x", "amount": 5, "categoryId": food, "date": "2026-11-10"},
    )
    assert r.status_code == 404


def test_custom_category_lifecycle(client: TestClient, auth):
    created = client.post(
        "/api/categories", headers=auth, json={"name": "Fitness", "color": "#123abc"}
    )
    assert created.status_code == 201
    fitness = created.json()
    assert client.post(
        "/api/categories", headers=auth, json={"name": "fitness", "color": "#123abc"}
    ).status_code == 409

    add_expense(client, auth, fitness["id"])
    renamed = client.patch(
        f"/api/categories/{fitness['id']}",
        headers=auth,
        json={"name": "Gym", "monthlyBudget": 5000},
    ).json()
    assert renamed["name"] == "Gym" and renamed["monthlyBudget"] == 5000
    assert renamed["expenseCount"] == 1

    cats = categories(client, auth)
    assert client.delete(f"/api/categories/{cats['Foods']['id']}", headers=auth).status_code == 400

    assert client.delete(f"/api/categories/{fitness['id']}", headers=auth).status_code == 204
    cats = categories(client, auth)
    assert "Gym" not in cats
    assert cats["Other"]["expenseCount"] == 1  # expense moved, not lost


def test_reports(client: TestClient, auth):
    cats = categories(client, auth)
    food, transport = cats["Foods"]["id"], cats["Transport"]["id"]
    client.patch(f"/api/categories/{food}", headers=auth, json={"monthlyBudget": 1000})
    client.patch("/api/auth/me", headers=auth, json={"monthlyBudget": 20000})

    add_expense(client, auth, food, 100, "2026-11-10")  # Tuesday
    add_expense(client, auth, food, 50, "2026-11-12")  # Thursday (today)
    add_expense(client, auth, transport, 30, "2026-11-12")
    add_expense(client, auth, food, 70, "2026-11-04")  # previous week

    report = client.get(
        "/api/reports/summary", headers=auth, params={"start": "2026-11-09", "end": "2026-11-15"}
    ).json()
    assert report["total"] == 180 and report["count"] == 3
    assert report["previousTotal"] == 70
    assert len(report["daily"]) == 7
    assert report["daily"][3] == {"date": "2026-11-12", "amount": 80.0}
    assert report["byCategory"][0] == {"categoryId": food, "amount": 150.0, "count": 2}

    dash = client.get("/api/reports/dashboard", headers=auth, params={"today": "2026-11-12"}).json()
    assert dash["todayTotal"] == 80 and dash["todayCount"] == 2
    assert dash["weekTotal"] == 180
    assert dash["monthTotal"] == 250 and dash["monthCount"] == 4
    assert dash["monthlyBudget"] == 20000
    assert dash["categoryBudgets"] == [{"categoryId": food, "budget": 1000.0, "spent": 220.0}]

    bad = client.get(
        "/api/reports/summary", headers=auth, params={"start": "2026-11-09", "end": "2026-11-01"}
    )
    assert bad.status_code == 422


def test_import_and_export(client: TestClient, auth):
    r = client.post(
        "/api/expenses/import",
        headers=auth,
        json={
            "expenses": [
                {"title": "Rice", "amount": 120, "categoryName": "foods", "date": "2026-11-01"},
                {
                    "title": "=HYPERLINK()",
                    "amount": 900,
                    "categoryName": "Fitness",
                    "categoryColor": "#123456",
                    "date": "2026-11-02",
                },
            ]
        },
    )
    assert r.json() == {"imported": 2, "categoriesCreated": 1}
    assert categories(client, auth)["Foods"]["expenseCount"] == 1

    csv = client.get("/api/expenses/export.csv", headers=auth)
    assert csv.status_code == 200
    lines = csv.text.strip().splitlines()
    assert lines[0] == "Date,Title,Category,Amount,Note"
    assert lines[1].startswith("2026-11-02,'=HYPERLINK(),Fitness,900.00")


def test_profile_and_password(client: TestClient, auth):
    me = client.patch(
        "/api/auth/me", headers=auth, json={"currency": "USD", "monthlyBudget": None}
    ).json()
    assert me["currency"] == "USD" and me["monthlyBudget"] is None
    assert client.post(
        "/api/auth/password",
        headers=auth,
        json={"currentPassword": "wrong", "newPassword": "another-pass"},
    ).status_code == 400
    assert client.post(
        "/api/auth/password",
        headers=auth,
        json={"currentPassword": "correct-horse", "newPassword": "another-pass"},
    ).status_code == 200
    assert client.post(
        "/api/auth/login", json={"email": "sam@example.com", "password": "another-pass"}
    ).status_code == 200
