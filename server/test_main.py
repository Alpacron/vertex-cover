from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_read_generate():
    response = client.post("/generate", json={"vertices": 10, "probability": 0})
    assert response.status_code == 200
    assert response.json() == {
        "0": [],
        "1": [],
        "2": [],
        "3": [],
        "4": [],
        "5": [],
        "6": [],
        "7": [],
        "8": [],
        "9": []
    }
