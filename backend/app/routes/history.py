import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_
from sqlalchemy.exc import OperationalError
from ..schemas import PredictionHistoryResponse, PredictionHistoryItem
from ..dependencies import get_db
from ..models import Prediction

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/predictions", tags=["History"])

@router.get("", response_model=PredictionHistoryResponse)
def get_prediction_history(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term for ID, gender, or smoking history"),
    prediction: Optional[str] = Query(None, description="Filter by 'Positive' or 'Negative'"),
    sort_by: str = Query("created_at", description="Field to sort by: created_at, age, bmi, confidence"),
    sort_order: str = Query("desc", description="Sort direction: asc or desc"),
    db: Session = Depends(get_db)
):
    """
    Retrieves paginated, searchable, and filterable prediction history from MySQL.
    """
    try:
        query = db.query(Prediction)

        # Apply Prediction filter (Positive / Negative)
        if prediction and prediction.lower() not in ["all", ""]:
            pred_capitalized = prediction.capitalize()
            query = query.filter(Prediction.prediction == pred_capitalized)

        # Apply search term
        if search and search.strip():
            term = f"%{search.strip()}%"
            # Support search by ID or text fields
            if search.strip().isdigit():
                query = query.filter(
                    or_(
                        Prediction.id == int(search.strip()),
                        Prediction.gender.ilike(term),
                        Prediction.smoking_history.ilike(term)
                    )
                )
            else:
                query = query.filter(
                    or_(
                        Prediction.gender.ilike(term),
                        Prediction.smoking_history.ilike(term),
                        Prediction.prediction.ilike(term)
                    )
                )

        total_count = query.count()

        # Sorting
        sort_field = getattr(Prediction, sort_by, Prediction.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_field))
        else:
            query = query.order_by(desc(sort_field))

        # Pagination
        offset = (page - 1) * limit
        records = query.offset(offset).limit(limit).all()

        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

        items = [
            PredictionHistoryItem(
                id=r.id,
                gender=r.gender,
                age=r.age,
                hypertension=r.hypertension,
                heart_disease=r.heart_disease,
                smoking_history=r.smoking_history,
                bmi=r.bmi,
                hba1c_level=r.hba1c_level,
                blood_glucose_level=r.blood_glucose_level,
                prediction=r.prediction,
                confidence=r.confidence,
                created_at=r.created_at.isoformat() if r.created_at else None
            )
            for r in records
        ]

        return PredictionHistoryResponse(
            items=items,
            total=total_count,
            page=page,
            limit=limit,
            total_pages=total_pages
        )

    except HTTPException:
        raise
    except OperationalError as oe:
        logger.warning(f"MySQL connection unavailable in history route: {oe}")
        return PredictionHistoryResponse(
            items=[],
            total=0,
            page=page,
            limit=limit,
            total_pages=1,
            database_connected=False,
            db_notice="MySQL database is currently unreachable. Please set DB_PASSWORD in backend/.env to connect."
        )
    except Exception as e:
        logger.error(f"Error fetching prediction history: {e}", exc_info=True)
        return PredictionHistoryResponse(
            items=[],
            total=0,
            page=page,
            limit=limit,
            total_pages=1,
            database_connected=False,
            db_notice=f"Database query error: {str(e)}"
        )

@router.get("/{prediction_id}", response_model=PredictionHistoryItem)
def get_single_prediction(
    prediction_id: int,
    db: Session = Depends(get_db)
):
    """
    Fetches a specific prediction record by ID.
    """
    record = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record with ID {prediction_id} was not found."
        )

    return PredictionHistoryItem(
        id=record.id,
        gender=record.gender,
        age=record.age,
        hypertension=record.hypertension,
        heart_disease=record.heart_disease,
        smoking_history=record.smoking_history,
        bmi=record.bmi,
        hba1c_level=record.hba1c_level,
        blood_glucose_level=record.blood_glucose_level,
        prediction=record.prediction,
        confidence=record.confidence,
        created_at=record.created_at.isoformat() if record.created_at else None
    )

@router.delete("/{prediction_id}", status_code=status.HTTP_200_OK)
def delete_prediction(
    prediction_id: int,
    db: Session = Depends(get_db)
):
    """
    Deletes a specific prediction record by ID.
    """
    record = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record with ID {prediction_id} was not found."
        )

    db.delete(record)
    db.commit()

    return {
        "success": True,
        "message": f"Prediction record #{prediction_id} was successfully deleted.",
        "id": prediction_id
    }
