from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, case, desc
from ..models import Prediction
from ..schemas import (
    AnalyticsResponse,
    TimelinePoint,
    DistributionItem,
    AgeGroupItem,
    GlucosePredictionItem
)

class AnalyticsService:
    @staticmethod
    def get_dashboard_analytics(db: Session) -> Dict[str, Any]:
        """
        Calculates aggregate health prediction metrics from MySQL.
        """
        total_predictions = db.query(func.count(Prediction.id)).scalar() or 0

        if total_predictions == 0:
            return {
                "total_predictions": 0,
                "positive_predictions": 0,
                "negative_predictions": 0,
                "positive_percentage": 0.0,
                "negative_percentage": 0.0,
                "average_age": 0.0,
                "average_bmi": 0.0,
                "average_glucose": 0.0,
                "predictions_by_date": [],
                "prediction_distribution": [
                    {"name": "Positive", "count": 0, "percentage": 0.0},
                    {"name": "Negative", "count": 0, "percentage": 0.0}
                ],
                "age_distribution": [],
                "glucose_vs_prediction": []
            }

        positive_count = db.query(func.count(Prediction.id)).filter(
            Prediction.prediction == "Positive"
        ).scalar() or 0

        negative_count = total_predictions - positive_count

        positive_pct = round((positive_count / total_predictions) * 100, 2)
        negative_pct = round((negative_count / total_predictions) * 100, 2)

        # Averages
        avg_age = db.query(func.avg(Prediction.age)).scalar() or 0.0
        avg_bmi = db.query(func.avg(Prediction.bmi)).scalar() or 0.0
        avg_glucose = db.query(func.avg(Prediction.blood_glucose_level)).scalar() or 0.0

        # Timeline: Group by date (YYYY-MM-DD)
        date_col = func.date(Prediction.created_at)
        timeline_query = db.query(
            date_col.label("date"),
            func.sum(case((Prediction.prediction == "Positive", 1), else_=0)).label("pos_count"),
            func.sum(case((Prediction.prediction == "Negative", 1), else_=0)).label("neg_count"),
            func.count(Prediction.id).label("total_count")
        ).group_by(date_col).order_by(date_col).limit(30).all()

        predictions_by_date = [
            TimelinePoint(
                date=str(row.date),
                positive=int(row.pos_count or 0),
                negative=int(row.neg_count or 0),
                total=int(row.total_count or 0)
            )
            for row in timeline_query
        ]

        # Prediction Distribution (Donut / Pie)
        prediction_distribution = [
            DistributionItem(name="Positive", count=positive_count, percentage=positive_pct),
            DistributionItem(name="Negative", count=negative_count, percentage=negative_pct)
        ]

        # Age Group Distribution
        # <30, 30-45, 46-60, 60+
        age_ranges = [
            ("< 30", Prediction.age < 30),
            ("30 - 45", (Prediction.age >= 30) & (Prediction.age <= 45)),
            ("46 - 60", (Prediction.age > 45) & (Prediction.age <= 60)),
            ("> 60", Prediction.age > 60),
        ]

        age_distribution = []
        for label, condition in age_ranges:
            pos_sub = db.query(func.count(Prediction.id)).filter(condition, Prediction.prediction == "Positive").scalar() or 0
            neg_sub = db.query(func.count(Prediction.id)).filter(condition, Prediction.prediction == "Negative").scalar() or 0
            tot_sub = pos_sub + neg_sub
            age_distribution.append(
                AgeGroupItem(
                    group=label,
                    positive=pos_sub,
                    negative=neg_sub,
                    total=tot_sub
                )
            )

        # Glucose vs Prediction Samples (up to 50 recent records for scatter/distribution plot)
        recent_records = db.query(Prediction).order_by(desc(Prediction.created_at)).limit(50).all()
        glucose_vs_prediction = [
            GlucosePredictionItem(
                glucose=r.blood_glucose_level,
                bmi=r.bmi,
                age=r.age,
                prediction=r.prediction,
                confidence=r.confidence
            )
            for r in recent_records
        ]

        return {
            "total_predictions": total_predictions,
            "positive_predictions": positive_count,
            "negative_predictions": negative_count,
            "positive_percentage": positive_pct,
            "negative_percentage": negative_pct,
            "average_age": round(float(avg_age), 1),
            "average_bmi": round(float(avg_bmi), 1),
            "average_glucose": round(float(avg_glucose), 1),
            "predictions_by_date": predictions_by_date,
            "prediction_distribution": prediction_distribution,
            "age_distribution": age_distribution,
            "glucose_vs_prediction": glucose_vs_prediction
        }
