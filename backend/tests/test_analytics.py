from fastapi.testclient import TestClient

from tests.test_api import add_expense, categories


def test_pacing_compares_like_with_like(client: TestClient, auth):
    cats = categories(client, auth)
    food, transport = cats["Foods"]["id"], cats["Transport"]["id"]
    client.patch("/api/auth/me", headers=auth, json={"monthlyBudget": 1000})

    add_expense(client, auth, food, 100, "2026-11-01")
    add_expense(client, auth, food, 50, "2026-11-12")
    add_expense(client, auth, transport, 30, "2026-11-12")
    add_expense(client, auth, food, 200, "2026-10-05")
    add_expense(client, auth, transport, 90, "2026-10-31")  # after "day 12" last month
    add_expense(client, auth, food, 999, "2026-09-30")  # outside both months

    data = client.get("/api/analytics/pacing", headers=auth, params={"today": "2026-11-12"}).json()
    assert data["monthStart"] == "2026-11-01"
    assert data["daysInMonth"] == 30 and data["daysElapsed"] == 12
    assert len(data["thisMonthDaily"]) == 30 and len(data["lastMonthDaily"]) == 31
    assert data["thisMonthDaily"][0] == 100 and data["thisMonthDaily"][11] == 80
    assert data["thisMonthTotal"] == 180 and data["lastMonthTotal"] == 290
    assert data["lastMonthSamePoint"] == 200
    assert data["monthlyBudget"] == 1000
    by_cat = {c["categoryId"]: c for c in data["byCategory"]}
    assert by_cat[food] == {
        "categoryId": food, "thisMonth": 150.0, "lastMonth": 200.0, "lastMonthToDate": 200.0
    }
    # Transport's October spend came after day 12, so to-date it's a pure increase.
    assert by_cat[transport]["lastMonth"] == 90 and by_cat[transport]["lastMonthToDate"] == 0
    # Largest increase (vs the same point last month) first: transport +30, food -50.
    assert [c["categoryId"] for c in data["byCategory"]] == [transport, food]


def test_pacing_handles_january_and_short_months(client: TestClient, auth):
    food = categories(client, auth)["Foods"]["id"]
    add_expense(client, auth, food, 10, "2025-12-31")
    data = client.get("/api/analytics/pacing", headers=auth, params={"today": "2026-01-31"}).json()
    assert data["lastMonthTotal"] == 10 and data["lastMonthSamePoint"] == 10

    data = client.get("/api/analytics/pacing", headers=auth, params={"today": "2026-03-31"}).json()
    assert len(data["lastMonthDaily"]) == 28  # February 2026


def test_trends(client: TestClient, auth):
    cats = categories(client, auth)
    food, transport = cats["Foods"]["id"], cats["Transport"]["id"]
    add_expense(client, auth, food, 100, "2026-11-09", "Coffee")  # Monday
    add_expense(client, auth, food, 120, "2026-11-02", "coffee ")  # Monday
    add_expense(client, auth, transport, 40, "2026-10-14", "Bus")  # Wednesday
    add_expense(client, auth, food, 1000, "2026-09-20", "Groceries")  # Sunday
    add_expense(client, auth, food, 5, "2026-08-31", "Too old")

    data = client.get(
        "/api/analytics/trends", headers=auth, params={"today": "2026-11-12", "months": 3}
    ).json()
    assert data["start"] == "2026-09-01" and data["end"] == "2026-11-12"
    stats = data["stats"]
    assert stats["total"] == 1260 and stats["count"] == 4
    assert stats["averageTransaction"] == 315 and stats["medianTransaction"] == 110
    assert stats["days"] == 73 and stats["spendingDays"] == 4
    assert stats["averagePerMonth"] == 420

    assert [m["month"] for m in data["monthly"]] == ["2026-09", "2026-10", "2026-11"]
    assert [m["total"] for m in data["monthly"]] == [1000, 40, 220]
    assert data["monthly"][2]["byCategory"] == [{"categoryId": food, "amount": 220.0, "count": 2}]

    monday = data["weekdays"][0]
    assert monday["total"] == 220 and monday["count"] == 2
    assert monday["occurrences"] == 10  # Sep 7 ... Nov 9, 2026
    assert monday["average"] == 22

    assert data["frequent"] == [
        {"title": "Coffee", "count": 2, "total": 220.0, "average": 110.0, "categoryId": food}
    ]
    assert [e["amount"] for e in data["largest"]] == [1000, 120, 100, 40]
    assert len(data["daily"]) == 4


def test_trends_empty_and_validation(client: TestClient, auth):
    data = client.get("/api/analytics/trends", headers=auth, params={"today": "2026-11-12"}).json()
    assert data["stats"]["count"] == 0 and data["stats"]["medianTransaction"] == 0
    assert len(data["monthly"]) == 6
    assert client.get(
        "/api/analytics/trends", headers=auth, params={"today": "2026-11-12", "months": 99}
    ).status_code == 422
