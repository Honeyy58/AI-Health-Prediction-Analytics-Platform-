import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..schemas import PredictionRequest, PredictionResponse
from ..dependencies import get_db
from ..models import Prediction
from ..services.ml_service import ml_service

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
def predict_diabetes(
    request_data: PredictionRequest,
    db: Session = Depends(get_db)
):
    """
    Accepts patient health indicators, generates ML prediction using Logistic Regression,
    saves the prediction and patient inputs to MySQL, and returns non-diagnostic prediction results.
    """
    try:
        # Generate ML prediction
        prediction_result = ml_service.predict(request_data)

        # Map boolean/binary flags
        ht_bool = bool(request_data.hypertension in [1, True, "1", "true"])
        hd_bool = bool(request_data.heart_disease in [1, True, "1", "true"])

        # Attempt persistence to MySQL
        prediction_id = None
        created_at_str = None
        db_warning = None

        try:
            db_record = Prediction(
                gender=str(request_data.gender),
                age=float(request_data.age),
                hypertension=ht_bool,
                heart_disease=hd_bool,
                smoking_history=str(request_data.smoking_history),
                bmi=float(request_data.bmi),
                hba1c_level=float(request_data.HbA1c_level),
                blood_glucose_level=float(request_data.blood_glucose_level),
                prediction=prediction_result["result"],
                confidence=prediction_result["confidence"]
            )

            db.add(db_record)
            db.commit()
            db.refresh(db_record)
            prediction_id = db_record.id
            created_at_str = db_record.created_at.isoformat() if db_record.created_at else None
        except Exception as db_err:
            logger.warning(f"Could not persist prediction to MySQL: {db_err}")
            db.rollback()
            db_warning = "Prediction generated successfully by ML model, but MySQL persistence failed. Please verify DB credentials in backend/.env."

        return PredictionResponse(
            prediction=prediction_result["prediction"],
            result=prediction_result["result"],
            confidence=prediction_result["confidence"],
            message=prediction_result["message"],
            prediction_id=prediction_id,
            created_at=created_at_str
        )

    except HTTPException:
        raise
    except ValueError as ve:
        logger.warning(f"Validation error during prediction: {ve}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Prediction execution failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating the health prediction: {str(e)}"
        )
