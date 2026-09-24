-- AI Health Prediction & Analytics Platform
-- MySQL Database Schema

CREATE DATABASE IF NOT EXISTS health_prediction;
USE health_prediction;

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
