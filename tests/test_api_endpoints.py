from fastapi.testclient import TestClient

from api.main import app


def test_health_endpoint_returns_status():
    with TestClient(app) as client:
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        payload = response.json()
        assert payload["status"] == "ok"
        assert payload["data_loaded"] is True


def test_invalid_date_returns_422():
    with TestClient(app) as client:
        response = client.get("/api/v1/summary/kpis", params={"start_date": "2026/01/01"})
        assert response.status_code == 422
        assert "Invalid start_date" in response.json()["detail"]


def test_forecast_with_invalid_date_order_returns_422():
    with TestClient(app) as client:
        response = client.get(
            "/api/v1/forecast/generate",
            params={"start_date": "2011-01-10", "end_date": "2010-12-01", "periods": 30},
        )
        assert response.status_code == 422
        assert "start_date cannot be after end_date" in response.json()["detail"]


def test_chat_without_api_key_returns_400():
    with TestClient(app) as client:
        response = client.post("/api/v1/chat/", json={"message": "hello"})
        assert response.status_code == 400
