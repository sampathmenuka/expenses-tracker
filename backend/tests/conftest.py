import os
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.rate_limit import login_failures, login_failures_by_ip, registrations

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL", "postgresql+psycopg://ledger:ledger@127.0.0.1:5433/ledger_test"
)

engine = create_engine(TEST_DATABASE_URL)
TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


@pytest.fixture(autouse=True)
def fresh_schema() -> Iterator[None]:
    for limiter in (login_failures, login_failures_by_ip, registrations):
        limiter.clear()
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield


@pytest.fixture
def client() -> Iterator[TestClient]:
    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def register(client: TestClient, email: str = "sam@example.com") -> dict[str, str]:
    response = client.post(
        "/api/auth/register",
        json={"name": "Sam", "email": email, "password": "correct-horse"},
    )
    assert response.status_code == 201, response.text
    return {"Authorization": f"Bearer {response.json()['accessToken']}"}


@pytest.fixture
def auth(client: TestClient) -> dict[str, str]:
    return register(client)
