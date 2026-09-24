import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from ..schemas import AnalyticsResponse
from ..dependencies import get_db
from ..services.analytics_service import AnalyticsService

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    """
    Computes and returns comprehensive statistics for the analytics dashboard.
    """
    try:
        analytics_data = AnalyticsService.get_dashboard_analytics(db)
        return AnalyticsResponse(**analytics_data)
    except HTTPException:
        raise
    except OperationalError as oe:
        logger.warning(f"MySQL connection unavailable in analytics route: {oe}")
        return AnalyticsResponse(
            total_predictions=0,
            positive_predictions=0,
            negative_predictions=0,
            positive_percentage=0.0,
            negative_percentage=0.0,
            average_age=0.0,
            average_bmi=0.0,
            average_glucose=0.0,
            predictions_by_date=[],
            prediction_distribution=[
                {"name": "Positive", "count": 0, "percentage": 0.0},
                {"name": "Negative", "count": 0, "percentage": 0.0}
            ],
            age_distribution=[],
            glucose_vs_prediction=[],
            database_connected=False,
            db_notice="MySQL database is currently unreachable. Please set DB_PASSWORD in backend/.env to connect."
        )
    except Exception as e:
        logger.error(f"Error computing dashboard analytics: {e}", exc_info=True)
        return AnalyticsResponse(
            total_predictions=0,
            positive_predictions=0,
            negative_predictions=0,
            positive_percentage=0.0,
            negative_percentage=0.0,
            average_age=0.0,
            average_bmi=0.0,
            average_glucose=0.0,
            predictions_by_date=[],
            prediction_distribution=[],
            age_distribution=[],
            glucose_vs_prediction=[],
            database_connected=False,
            db_notice=f"Database query notice: {str(e)}"
        )
