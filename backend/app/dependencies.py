from typing import Generator
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from .database import SessionLocal, check_db_connection

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a database session.
    Routes handle database operational status gracefully.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.close()
        except Exception:
            pass
