from typing import Optional, List, Union, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict

class PredictionRequest(BaseModel):
    """
    Patient health input data for ML diabetes prediction.
    Accepts string numbers, various casings, aliases, and integer codes.
    """
    gender: Union[str, int] = Field(
        ...,
        description="Gender: 'Female', 'Male', 'Other' or 0, 1, 2"
    )
    age: float = Field(
        ...,
        ge=0.0,
        le=130.0,
        description="Patient age in years (0 to 130)"
    )
    hypertension: Any = Field(
        ...,
        description="Hypertension diagnosis: 0 (No) or 1 (Yes)"
    )
    heart_disease: Any = Field(
        ...,
        description="Heart disease diagnosis: 0 (No) or 1 (Yes)"
    )
    smoking_history: Union[str, int] = Field(
        ...,
        description="Smoking history category ('never', 'No Info', 'current', 'former', 'ever', 'not current') or encoded int"
    )
    bmi: float = Field(
        ...,
        ge=5.0,
        le=120.0,
        description="Body Mass Index in kg/m² (5.0 to 120.0)"
    )
    HbA1c_level: float = Field(
        ...,
        ge=1.0,
        le=30.0,
        description="Glycated hemoglobin level in % (1.0 to 30.0)",
        alias="hba1c_level"
    )
    blood_glucose_level: float = Field(
        ...,
        ge=20.0,
        le=1000.0,
        description="Blood glucose level in mg/dL (20 to 1000)"
    )

    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
        json_schema_extra={
            "example": {
                "gender": "Female",
                "age": 52.0,
                "hypertension": 0,
                "heart_disease": 0,
                "smoking_history": "never",
                "bmi": 28.5,
                "HbA1c_level": 6.5,
                "blood_glucose_level": 155.0
            }
        }
    )

    @field_validator("age", "bmi", "HbA1c_level", "blood_glucose_level", mode="before")
    @classmethod
    def coerce_numeric(cls, v):
        if v is None or v == "":
            raise ValueError("Field cannot be empty")
        if isinstance(v, str):
            # Support European comma decimal notation: "24,5" -> "24.5"
            v = v.strip().replace(",", ".")
        try:
            return float(v)
        except (ValueError, TypeError):
            raise ValueError(f"Value '{v}' must be a valid number")

    @field_validator("hypertension", "heart_disease", mode="before")
    @classmethod
    def normalize_binary_flags(cls, v):
        if isinstance(v, bool):
            return 1 if v else 0
        if isinstance(v, (int, float)):
            return 1 if int(v) > 0 else 0
        if isinstance(v, str):
            v_lower = v.strip().lower()
            return 1 if v_lower in ["1", "true", "yes", "y", "positive"] else 0
        return 0

    @field_validator("age")
    @classmethod
    def validate_age(cls, v):
        if v <= 0:
            raise ValueError("Age must be greater than 0")
        if v > 120:
            raise ValueError("Age must be 120 or less")
        return v

    @field_validator("bmi")
    @classmethod
    def validate_bmi(cls, v):
        if v < 10.0:
            raise ValueError("BMI must be at least 10.0")
        if v > 90.0:
            raise ValueError("BMI must be 90.0 or less")
        return v

    @field_validator("HbA1c_level")
    @classmethod
    def validate_hba1c(cls, v):
        if v < 3.0:
            raise ValueError("HbA1c level must be at least 3.0%")
        if v > 20.0:
            raise ValueError("HbA1c level must be 20.0% or less")
        return v

    @field_validator("blood_glucose_level")
    @classmethod
    def validate_glucose(cls, v):
        if v < 40.0:
            raise ValueError("Blood glucose level must be at least 40 mg/dL")
        if v > 600.0:
            raise ValueError("Blood glucose level must be 600 mg/dL or less")
        return v

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v):
        if isinstance(v, str):
            val_title = v.strip().title()
            if val_title in ["Female", "Male", "Other"]:
                return val_title
            if val_title.lower() in ["f", "woman"]:
                return "Female"
            if val_title.lower() in ["m", "man"]:
                return "Male"
            raise ValueError(f"Gender must be 'Female', 'Male', or 'Other', got '{v}'")
        elif isinstance(v, (int, float)):
            idx = int(v)
            if idx in [0, 1, 2]:
                return ["Female", "Male", "Other"][idx]
            raise ValueError(f"Numeric gender must be 0 (Female), 1 (Male), or 2 (Other), got {v}")
        raise ValueError(f"Invalid gender format: {v}")

    @field_validator("smoking_history")
    @classmethod
    def validate_smoking(cls, v):
        valid_cats = ["never", "No Info", "current", "former", "ever", "not current"]
        if isinstance(v, str):
            v_clean = v.strip()
            for cat in valid_cats:
                if cat.lower() == v_clean.lower():
                    return cat
            v_lower = v_clean.lower()
            if v_lower in ["no", "non-smoker", "none"]:
                return "never"
            if v_lower in ["yes", "smoker"]:
                return "current"
            if v_lower in ["past", "ex-smoker"]:
                return "former"
            raise ValueError(f"Smoking history must be one of: {', '.join(valid_cats)}, got '{v}'")
        elif isinstance(v, (int, float)):
            idx = int(v)
            if 0 <= idx < len(valid_cats):
                return valid_cats[idx]
            raise ValueError(f"Numeric smoking history must be an integer between 0 and {len(valid_cats)-1}, got {v}")
        raise ValueError(f"Invalid smoking history format: {v}")

class PredictionResponse(BaseModel):
    prediction: int = Field(..., description="0 for Negative (lower risk), 1 for Positive (higher risk)")
    result: str = Field(..., description="'Positive' or 'Negative'")
    confidence: float = Field(..., description="Model confidence probability percentage (e.g. 92.44)")
    message: str = Field(..., description="Educational explanation of model output")
    prediction_id: Optional[int] = Field(None, description="Database record ID if stored")
    created_at: Optional[str] = Field(None, description="ISO timestamp")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "prediction": 1,
                "result": "Positive",
                "confidence": 92.44,
                "message": "The model predicts a higher likelihood of diabetes.",
                "prediction_id": 123,
                "created_at": "2026-09-24T01:50:00"
            }
        }
    )

class PredictionHistoryItem(BaseModel):
    id: int
    gender: str
    age: float
    hypertension: bool
    heart_disease: bool
    smoking_history: str
    bmi: float
    hba1c_level: float
    blood_glucose_level: float
    prediction: str
    confidence: float
    created_at: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class PredictionHistoryResponse(BaseModel):
    items: List[PredictionHistoryItem]
    total: int
    page: int
    limit: int
    total_pages: int
    database_connected: bool = True
    db_notice: Optional[str] = None

class TimelinePoint(BaseModel):
    date: str
    positive: int
    negative: int
    total: int

class DistributionItem(BaseModel):
    name: str
    count: int
    percentage: float

class AgeGroupItem(BaseModel):
    group: str
    positive: int
    negative: int
    total: int

class GlucosePredictionItem(BaseModel):
    glucose: float
    bmi: float
    age: float
    prediction: str
    confidence: float

class AnalyticsResponse(BaseModel):
    total_predictions: int
    positive_predictions: int
    negative_predictions: int
    positive_percentage: float
    negative_percentage: float
    average_age: float
    average_bmi: float
    average_glucose: float
    predictions_by_date: List[TimelinePoint]
    prediction_distribution: List[DistributionItem]
    age_distribution: List[AgeGroupItem]
    glucose_vs_prediction: List[GlucosePredictionItem]
    database_connected: bool = True
    db_notice: Optional[str] = None
