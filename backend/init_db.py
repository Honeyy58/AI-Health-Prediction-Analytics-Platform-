"""
Helper script to verify MySQL connectivity and initialize the health_prediction schema.
Usage: python backend/init_db.py
"""

import os
import sys
import pymysql
from dotenv import load_dotenv

# Load .env
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "health_prediction")

def init_mysql():
    print("=" * 60)
    print("MySQL Health Platform Database Initializer")
    print(f"Connecting to MySQL at {DB_HOST}:{DB_PORT} as user '{DB_USER}'...")
    print("=" * 60)

    try:
        # Step 1: Connect to server without specific database to create DB if needed
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            charset='utf8mb4'
        )
        print("Connected to MySQL server.")

        with conn.cursor() as cursor:
            # Create database
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            print(f"Database `{DB_NAME}` is ready.")

            # Select database
            cursor.execute(f"USE `{DB_NAME}`;")

            # Create table
            create_table_sql = """
            CREATE TABLE IF NOT EXISTS predictions (
                id INT PRIMARY KEY AUTO_INCREMENT,
                gender VARCHAR(20) NOT NULL,
                age FLOAT NOT NULL,
                hypertension BOOLEAN NOT NULL,
                heart_disease BOOLEAN NOT NULL,
                smoking_history VARCHAR(50) NOT NULL,
                bmi FLOAT NOT NULL,
                hba1c_level FLOAT NOT NULL,
                blood_glucose_level FLOAT NOT NULL,
                prediction VARCHAR(20) NOT NULL,
                confidence FLOAT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_created_at (created_at),
                INDEX idx_prediction (prediction)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
            cursor.execute(create_table_sql)
            print("Table `predictions` and indexes are verified/created.")

        conn.commit()
        conn.close()
        print("=" * 60)
        print("SUCCESS: MySQL Database initialized successfully!")
        print("=" * 60)
        return True

    except pymysql.err.OperationalError as e:
        code, msg = e.args
        print(f"\n[ERROR {code}]: {msg}")
        if code == 1045:
            print("\n-> Access Denied: The password or user for MySQL in 'backend/.env' is incorrect.")
            print("-> Please edit 'backend/.env' with your MySQL root password (e.g., DB_PASSWORD=your_password).")
        elif code == 2003:
            print("\n-> Cannot connect to MySQL server. Ensure MySQL is running on port 3306.")
            print("-> On macOS, you can start MySQL from System Settings > MySQL, or run: brew services start mysql")
        return False
    except Exception as e:
        print(f"\nUnexpected error initializing database: {e}")
        return False

if __name__ == '__main__':
    success = init_mysql()
    sys.exit(0 if success else 1)
