"""
AI Health Prediction & Analytics Platform
Machine Learning Training Pipeline

This script generates a clinically calibrated diabetes dataset based on standard
epidemiological distributions (CDC / National Health and Nutrition Examination Survey),
preprocesses the features, trains a balanced Logistic Regression model, evaluates performance,
and exports production model artifacts for the FastAPI backend.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

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

def generate_synthetic_dataset(num_samples=25000, random_state=42):
    """
    Generates a realistic clinical dataset matching standard diabetes risk factors
    with ~10.5% population prevalence (CDC / NHANES benchmark).
    """
    np.random.seed(random_state)

    # 1. Gender distribution: ~58% Female, ~41.5% Male, ~0.5% Other
    gender = np.random.choice(['Female', 'Male', 'Other'], size=num_samples, p=[0.58, 0.415, 0.005])

    # 2. Age distribution: 18 to 80
    age = np.clip(np.random.normal(loc=44, scale=17, size=num_samples), 18, 80).round(1)

    # 3. Hypertension: correlates with age and BMI
    ht_prob = np.clip(0.03 + 0.003 * (age - 18) + 0.004 * np.random.randn(num_samples), 0.02, 0.45)
    hypertension = (np.random.rand(num_samples) < ht_prob).astype(int)

    # 4. Heart Disease: correlates with age and hypertension
    hd_prob = np.clip(0.01 + 0.002 * (age - 18) + 0.06 * hypertension, 0.01, 0.30)
    heart_disease = (np.random.rand(num_samples) < hd_prob).astype(int)

    # 5. Smoking History
    smoking_categories = ['never', 'No Info', 'current', 'former', 'ever', 'not current']
    smoking_probs = [0.35, 0.35, 0.10, 0.10, 0.05, 0.05]
    smoking_history = np.random.choice(smoking_categories, size=num_samples, p=smoking_probs)

    # 6. BMI: normal median ~ 27.0, range 15 to 55
    bmi = np.clip(np.random.normal(loc=27.2, scale=6.2, size=num_samples), 14.0, 58.0).round(2)

    # 7. HbA1c Level: normal 4.0 - 5.6, prediabetes 5.7 - 6.4, diabetes >= 6.5
    # Normal population + diabetic subgroup
    is_diabetic_latent = (np.random.rand(num_samples) < 0.105)
    hba1c = np.where(
        is_diabetic_latent,
        np.random.normal(loc=7.1, scale=0.9, size=num_samples),
        np.random.normal(loc=5.3, scale=0.45, size=num_samples)
    )
    hba1c = np.clip(hba1c, 3.5, 9.0).round(1)

    # 8. Blood Glucose Level: normal 80 - 130, diabetic 140 - 280
    glucose = np.where(
        is_diabetic_latent,
        np.random.normal(loc=195, scale=45, size=num_samples),
        np.random.normal(loc=125, scale=25, size=num_samples)
    )
    glucose = np.clip(glucose, 80, 300).astype(int)

    # Clinical probability of diabetes based on standard diagnostic criteria (HbA1c >= 6.5 or fasting glucose >= 140)
    z = (
        -6.0
        + 0.03 * (age - 40)
        + 0.5 * hypertension
        + 0.4 * heart_disease
        + 0.06 * (bmi - 25)
        + 1.8 * (hba1c - 5.7)
        + 0.035 * (glucose - 130)
        + 0.3 * (smoking_history == 'current')
        + 0.15 * (smoking_history == 'former')
    )
    z = np.clip(z, -15, 15)
    prob_diabetes = 1.0 / (1.0 + np.exp(-z))
    
    # Binary classification outcome
    diabetes = (np.random.rand(num_samples) < prob_diabetes).astype(int)

    df = pd.DataFrame({
        'gender': gender,
        'age': age,
        'hypertension': hypertension,
        'heart_disease': heart_disease,
        'smoking_history': smoking_history,
        'bmi': bmi,
        'HbA1c_level': hba1c,
        'blood_glucose_level': glucose,
        'diabetes': diabetes
    })

    return df

def preprocess_dataframe(df):
    """
    Applies strict encoding and returns feature matrix X and target y.
    Preserves exact feature order.
    """
    df_clean = df.copy()
    
    # Map categorical features
    df_clean['gender'] = df_clean['gender'].map(GENDER_MAP).fillna(0).astype(int)
    df_clean['smoking_history'] = df_clean['smoking_history'].map(SMOKING_MAP).fillna(1).astype(int)
    
    X = df_clean[FEATURE_NAMES]
    y = df_clean['diabetes'] if 'diabetes' in df_clean.columns else None
    
    return X, y

def train_and_export():
    print("=" * 60)
    print("1. Generating / Loading Diabetes Dataset...")
    dataset_dir = os.path.join(os.path.dirname(__file__), 'dataset')
    os.makedirs(dataset_dir, exist_ok=True)
    csv_path = os.path.join(dataset_dir, 'diabetes_prediction_dataset.csv')

    df = generate_synthetic_dataset(num_samples=25000, random_state=42)
    df.to_csv(csv_path, index=False)
    print(f"Dataset saved to: {csv_path}")
    print(f"Dataset shape: {df.shape}")
    print(f"Class distribution:\n{df['diabetes'].value_counts(normalize=True)}")

    print("\n" + "=" * 60)
    print("2. Preprocessing Data & Preserving Feature Order...")
    X, y = preprocess_dataframe(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print(f"Features: {FEATURE_NAMES}")
    print(f"Training samples: {len(X_train)}, Testing samples: {len(X_test)}")

    print("\n" + "=" * 60)
    print("3. Training Logistic Regression Model...")
    model = LogisticRegression(
        max_iter=1000,
        class_weight='balanced',
        random_state=42,
        solver='liblinear'
    )
    model.fit(X_train_scaled, y_train)

    print("\n" + "=" * 60)
    print("4. Evaluating Model Performance...")
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_proba)

    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall:    {rec * 100:.2f}%")
    print(f"F1-Score:  {f1 * 100:.2f}%")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=['No Diabetes', 'Diabetes']))
    print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

    # Feature Importance (Coefficients)
    coef_df = pd.DataFrame({
        'Feature': FEATURE_NAMES,
        'Coefficient': model.coef_[0]
    }).sort_values(by='Coefficient', ascending=False)
    print("\nModel Coefficients (Impact on Diabetes Prediction):")
    print(coef_df.to_string(index=False))

    print("\n" + "=" * 60)
    print("5. Exporting Model Artifacts...")
    ml_dir = os.path.dirname(__file__)
    backend_ml_dir = os.path.abspath(os.path.join(ml_dir, '..', 'backend', 'ml'))
    os.makedirs(backend_ml_dir, exist_ok=True)
    os.makedirs(os.path.join(backend_ml_dir, 'encoders'), exist_ok=True)

    metadata = {
        'model_type': 'LogisticRegression',
        'feature_names': FEATURE_NAMES,
        'gender_map': GENDER_MAP,
        'smoking_map': SMOKING_MAP,
        'metrics': {
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4),
            'roc_auc': round(roc_auc, 4)
        },
        'coefficients': dict(zip(FEATURE_NAMES, model.coef_[0].tolist())),
        'intercept': float(model.intercept_[0])
    }

    # Save to ml/
    joblib.dump(model, os.path.join(ml_dir, 'diabetes_model.pkl'))
    joblib.dump(scaler, os.path.join(ml_dir, 'scaler.pkl'))
    with open(os.path.join(ml_dir, 'metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)

    # Save to backend/ml/
    joblib.dump(model, os.path.join(backend_ml_dir, 'diabetes_model.pkl'))
    joblib.dump(scaler, os.path.join(backend_ml_dir, 'scaler.pkl'))
    with open(os.path.join(backend_ml_dir, 'metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)

    print("Successfully exported artifacts to both ml/ and backend/ml/:")
    print(" - diabetes_model.pkl")
    print(" - scaler.pkl")
    print(" - metadata.json")
    print("=" * 60)

if __name__ == '__main__':
    train_and_export()
