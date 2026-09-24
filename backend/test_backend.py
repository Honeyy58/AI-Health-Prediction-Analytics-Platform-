import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.ml_service import ml_service
from backend.app.schemas import PredictionRequest

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["ml_model_loaded"] is True
    assert "disclaimer" in data

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["ml_service"] == "ready"

def test_ml_service_positive_case():
    # Patient with high clinical indicators: elderly, high glucose, high HbA1c, high BMI, hypertension
    high_risk_data = PredictionRequest(
        gender="Male",
        age=68.0,
        hypertension=1,
        heart_disease=1,
        smoking_history="former",
        bmi=36.5,
        hba1c_level=8.2,
        blood_glucose_level=220.0
    )
    result = ml_service.predict(high_risk_data)
    assert result["prediction"] == 1
    assert result["result"] == "Positive"
    assert result["confidence"] > 50.0
    assert "higher likelihood of diabetes" in result["message"]

def test_ml_service_negative_case():
    # Healthy young individual: normal BMI, normal HbA1c, normal fasting glucose
    low_risk_data = PredictionRequest(
        gender="Female",
        age=24.0,
        hypertension=0,
        heart_disease=0,
        smoking_history="never",
        bmi=21.5,
        hba1c_level=4.8,
        blood_glucose_level=85.0
    )
    result = ml_service.predict(low_risk_data)
    assert result["prediction"] == 0
    assert result["result"] == "Negative"
    assert result["confidence"] > 50.0
    assert "lower likelihood of diabetes" in result["message"]

def test_validation_errors():
    # Negative age
    invalid_age = {
        "gender": "Female",
        "age": -5,
        "hypertension": 0,
        "heart_disease": 0,
        "smoking_history": "never",
        "bmi": 22.0,
        "hba1c_level": 5.0,
        "blood_glucose_level": 90
    }
    response = client.post("/predict", json=invalid_age)
    assert response.status_code == 422
    assert "Validation Error" in response.json()["error"]

    # Excessive BMI (>80)
    invalid_bmi = {
        "gender": "Female",
        "age": 30,
        "hypertension": 0,
        "heart_disease": 0,
        "smoking_history": "never",
        "bmi": 150.0,
        "hba1c_level": 5.0,
        "blood_glucose_level": 90
    }
    response = client.post("/predict", json=invalid_bmi)
    assert response.status_code == 422

    # Invalid smoking category
    invalid_smoking = {
        "gender": "Female",
        "age": 30,
        "hypertension": 0,
        "heart_disease": 0,
        "smoking_history": "heavy_drinker",
        "bmi": 24.0,
        "hba1c_level": 5.0,
        "blood_glucose_level": 90
    }
    response = client.post("/predict", json=invalid_smoking)
    assert response.status_code == 422
