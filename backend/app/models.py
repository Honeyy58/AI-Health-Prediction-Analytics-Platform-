from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, func, Index
from .database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    gender = Column(String(20), nullable=False)
    age = Column(Float, nullable=False)
    hypertension = Column(Boolean, nullable=False, default=False)
    heart_disease = Column(Boolean, nullable=False, default=False)
    smoking_history = Column(String(50), nullable=False)
    bmi = Column(Float, nullable=False)
    hba1c_level = Column(Float, nullable=False)
    blood_glucose_level = Column(Float, nullable=False)
    prediction = Column(String(20), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    __table_args__ = (
        Index("idx_predictions_created_at", "created_at"),
        Index("idx_predictions_prediction", "prediction"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "gender": self.gender,
            "age": self.age,
            "hypertension": self.hypertension,
            "heart_disease": self.heart_disease,
            "smoking_history": self.smoking_history,
            "bmi": self.bmi,
            "hba1c_level": self.hba1c_level,
            "blood_glucose_level": self.blood_glucose_level,
            "prediction": self.prediction,
            "confidence": self.confidence,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
