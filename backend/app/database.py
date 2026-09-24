import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError, SQLAlchemyError

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

logger = logging.getLogger("uvicorn.error")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "health_prediction")

# MySQL Connection URL with PyMySQL
# URL encoding if password has special characters handled via string formatting
if DB_PASSWORD:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
else:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

Base = declarative_base()

# Configure SQLAlchemy engine with connection pool
engine = create_engine(
    DATABASE_URL,
    pool_recycle=3600,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_db_connection() -> bool:
    """Verifies whether MySQL is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.warning(f"MySQL connection check failed: {e}")
        return False

def init_db():
    """Initializes tables in MySQL if reachable."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("MySQL database tables verified/created successfully.")
    except OperationalError as e:
        logger.warning(f"Could not connect to MySQL server during table initialization: {e}")
    except Exception as e:
        logger.error(f"Error initializing MySQL database: {e}")
