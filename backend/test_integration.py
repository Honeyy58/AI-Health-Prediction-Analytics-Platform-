import os
import json
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_full_pipeline():
    print("Testing Full API Pipeline...")

    # 1. Root & Health
    r_root = client.get("/")
    assert r_root.status_code == 200
    print("✓ GET / returned 200:", r_root.json()["title"])

    r_health = client.get("/health")
    assert r_health.status_code == 200
    print("✓ GET /health returned 200, ML status:", r_health.json()["ml_service"])

    # 2. Prediction: Low Risk Profile
    low_risk = {
        "gender": "Female",
        "age": 28.0,
        "hypertension": 0,
        "heart_disease": 0,
        "smoking_history": "never",
        "bmi": 21.5,
        "HbA1c_level": 4.8,
        "blood_glucose_level": 88.0
    }
    r_pred_low = client.post("/predict", json=low_risk)
    assert r_pred_low.status_code == 200
    res_low = r_pred_low.json()
    assert res_low["prediction"] == 0
    assert res_low["result"] == "Negative"
    assert "lower likelihood of diabetes" in res_low["message"]
    print(f"✓ Low Risk Prediction: {res_low['result']} ({res_low['confidence']}% confidence)")

    # 3. Prediction: High Risk Profile
    high_risk = {
        "gender": "Male",
        "age": 68.0,
        "hypertension": 1,
        "heart_disease": 1,
        "smoking_history": "current",
        "bmi": 36.5,
        "HbA1c_level": 8.4,
        "blood_glucose_level": 220.0
    }
    r_pred_high = client.post("/predict", json=high_risk)
    assert r_pred_high.status_code == 200
    res_high = r_pred_high.json()
    assert res_high["prediction"] == 1
    assert res_high["result"] == "Positive"
    assert "higher likelihood of diabetes" in res_high["message"]
    print(f"✓ High Risk Prediction: {res_high['result']} ({res_high['confidence']}% confidence)")

    # 4. Input bounds validation checks
    bad_inputs = [
        {"gender": "UnknownGender", "age": 40, "hypertension": 0, "heart_disease": 0, "smoking_history": "never", "bmi": 25, "HbA1c_level": 5.5, "blood_glucose_level": 100},
        {"gender": "Male", "age": -10, "hypertension": 0, "heart_disease": 0, "smoking_history": "never", "bmi": 25, "HbA1c_level": 5.5, "blood_glucose_level": 100},
        {"gender": "Male", "age": 40, "hypertension": 0, "heart_disease": 0, "smoking_history": "never", "bmi": 150, "HbA1c_level": 5.5, "blood_glucose_level": 100},
        {"gender": "Male", "age": 40, "hypertension": 0, "heart_disease": 0, "smoking_history": "invalid_smoking", "bmi": 25, "HbA1c_level": 5.5, "blood_glucose_level": 100},
        {"gender": "Male", "age": 40, "hypertension": 0, "heart_disease": 0, "smoking_history": "never", "bmi": 25, "HbA1c_level": 25.0, "blood_glucose_level": 100},
        {"gender": "Male", "age": 40, "hypertension": 0, "heart_disease": 0, "smoking_history": "never", "bmi": 25, "HbA1c_level": 5.5, "blood_glucose_level": 1000},
    ]

    for i, b in enumerate(bad_inputs):
        r_bad = client.post("/predict", json=b)
        assert r_bad.status_code == 422, f"Expected 422 for bad input #{i}, got {r_bad.status_code}"
    print(f"✓ All {len(bad_inputs)} bound and schema validation checks passed with 422 Unprocessable Content!")

    # 5. Analytics Graceful Offline Behavior (Should return 200, not 503)
    r_analytics = client.get("/analytics")
    assert r_analytics.status_code == 200
    analytics_data = r_analytics.json()
    assert "total_predictions" in analytics_data
    assert "database_connected" in analytics_data
    print(f"✓ GET /analytics returned 200 gracefully! (database_connected={analytics_data['database_connected']})")

    # 6. History Graceful Offline Behavior (Should return 200, not 503)
    r_history = client.get("/predictions")
    assert r_history.status_code == 200
    history_data = r_history.json()
    assert "items" in history_data
    assert "database_connected" in history_data
    print(f"✓ GET /predictions returned 200 gracefully! (database_connected={history_data['database_connected']})")

    print("ALL API INTEGRATION TESTS COMPLETED SUCCESSFULLY!")

if __name__ == '__main__':
    test_full_pipeline()
