import os
import json
import logging
import joblib
import numpy as np
from typing import Dict, Any, Tuple
from ..schemas import PredictionRequest

logger = logging.getLogger("uvicorn.error")

FEATURE_NAMES = [
    'gender',
    'age',
    'hypertension',
    'heart_disease',
    'smoking_history',
    'bmi',
    'HbA1c_level',
    'blood_glucose_level'
]

GENDER_MAP = {
    'Female': 0,
    'Male': 1,
    'Other': 2
}

SMOKING_MAP = {
    'never': 0,
    'No Info': 1,
    'current': 2,
    'former': 3,
    'ever': 4,
    'not current': 5
}

class MLService:
    _instance = None
    _model = None
    _scaler = None
    _metadata = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
            cls._instance._load_artifacts()
        return cls._instance

    def _load_artifacts(self):
        """Loads model, scaler, and metadata once into memory."""
        backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        ml_dir = os.path.join(backend_dir, 'ml')

        model_path = os.path.join(ml_dir, 'diabetes_model.pkl')
        scaler_path = os.path.join(ml_dir, 'scaler.pkl')
        metadata_path = os.path.join(ml_dir, 'metadata.json')

        try:
            if not os.path.exists(model_path) or not os.path.exists(scaler_path):
                raise FileNotFoundError(
                    f"Model artifacts not found in {ml_dir}. Please run 'python ml/train.py' first."
                )

            self._model = joblib.load(model_path)
            self._scaler = joblib.load(scaler_path)

            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    self._metadata = json.load(f)
            else:
                self._metadata = {}

            logger.info("Successfully loaded Logistic Regression model and StandardScaler.")
        except Exception as e:
            logger.error(f"Failed to load ML artifacts: {e}")
            raise e

    @property
    def is_ready(self) -> bool:
        return self._model is not None and self._scaler is not None

    def preprocess(self, data: PredictionRequest) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Preprocesses patient input exactly as during training:
        - Encodes gender
        - Encodes smoking_history
        - Casts flags to numeric
        - Preserves exact feature order
        - Scales using fitted StandardScaler
        """
        # Encode categorical features
        gender_code = GENDER_MAP.get(str(data.gender), 0)
        smoking_code = SMOKING_MAP.get(str(data.smoking_history), 1)

        ht_val = 1 if data.hypertension in [1, True, "1", "true"] else 0
        hd_val = 1 if data.heart_disease in [1, True, "1", "true"] else 0

        # Preserve exact feature ordering:
        # ['gender', 'age', 'hypertension', 'heart_disease', 'smoking_history', 'bmi', 'HbA1c_level', 'blood_glucose_level']
        raw_features = [
            float(gender_code),
            float(data.age),
            float(ht_val),
            float(hd_val),
            float(smoking_code),
            float(data.bmi),
            float(data.HbA1c_level),
            float(data.blood_glucose_level)
        ]

        import pandas as pd
        feature_df = pd.DataFrame([raw_features], columns=FEATURE_NAMES)
        scaled_features = self._scaler.transform(feature_df)

        transformed_summary = {
            "gender_code": gender_code,
            "smoking_code": smoking_code,
            "hypertension_val": ht_val,
            "heart_disease_val": hd_val,
            "raw_features": raw_features
        }

        return scaled_features, transformed_summary

    def predict(self, data: PredictionRequest) -> Dict[str, Any]:
        """
        Generates diabetes prediction using the loaded model.
        Returns prediction, result status, confidence, and non-diagnostic message.
        """
        if not self.is_ready:
            raise RuntimeError("ML model is not loaded or ready for inference.")

        scaled_features, _ = self.preprocess(data)

        # Generate probabilities: [prob_no_diabetes, prob_diabetes]
        probabilities = self._model.predict_proba(scaled_features)[0]
        prob_neg = float(probabilities[0])
        prob_pos = float(probabilities[1])

        # Binary prediction (0 = No Diabetes, 1 = Diabetes)
        prediction_class = int(self._model.predict(scaled_features)[0])

        if prediction_class == 1:
            result = "Positive"
            confidence = round(prob_pos * 100, 2)
            message = "The model predicts a higher likelihood of diabetes."
        else:
            result = "Negative"
            confidence = round(prob_neg * 100, 2)
            message = "The model predicts a lower likelihood of diabetes."

        return {
            "prediction": prediction_class,
            "result": result,
            "confidence": confidence,
            "message": message,
            "probabilities": {
                "negative": round(prob_neg * 100, 2),
                "positive": round(prob_pos * 100, 2)
            }
        }

# Global singleton accessor
ml_service = MLService()
