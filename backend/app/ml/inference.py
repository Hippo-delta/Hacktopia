"""
Inference Module for Account Risk Model.
Loads the trained Random Forest artifact and scores accounts using forensic features.
"""

import json
from pathlib import Path
from typing import Dict, Any, Optional
import joblib
import pandas as pd

MODEL_DIR = Path(__file__).resolve().parent / "saved_models"
MODEL_PATH = MODEL_DIR / "account_risk_model.joblib"
METADATA_PATH = MODEL_DIR / "risk_model_metadata.json"

_CACHED_MODEL = None
_CACHED_METADATA = None


def get_risk_model():
    """Load or retrieve cached model artifact."""
    global _CACHED_MODEL, _CACHED_METADATA
    if _CACHED_MODEL is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        _CACHED_MODEL = joblib.load(MODEL_PATH)
        
        if METADATA_PATH.exists():
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                _CACHED_METADATA = json.load(f)
        else:
            _CACHED_METADATA = {}
            
    return _CACHED_MODEL, _CACHED_METADATA


def predict_account_risk(features_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Score an account given its extracted tabular feature dictionary.
    
    Args:
        features_dict: Dictionary containing the 20 forensic feature values.
        
    Returns:
        Dict containing:
            - risk_probability: float [0.0, 1.0]
            - risk_classification: "SUSPICIOUS" or "BENIGN"
            - risk_level: "CRITICAL", "HIGH", "MEDIUM", or "LOW"
            - model_version: str
            - features_used: Dict of exact feature values evaluated
    """
    model, metadata = get_risk_model()
    feature_cols = metadata.get("features", [])
    
    # Extract features in exact trained order, defaulting to 0.0 if missing
    row_values = {}
    for col in feature_cols:
        row_values[col] = float(features_dict.get(col, 0.0))
        
    input_df = pd.DataFrame([row_values])
    
    # Compute probability and prediction
    probs = model.predict_proba(input_df)[0]
    suspicious_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
    
    # Classification with standard 0.50 decision threshold
    is_suspicious = bool(suspicious_prob >= metadata.get("decision_threshold", 0.50))
    classification = "SUSPICIOUS" if is_suspicious else "BENIGN"
    
    # Calibrated risk level categorization for UI display
    if suspicious_prob >= 0.80:
        level = "CRITICAL"
    elif suspicious_prob >= 0.60:
        level = "HIGH"
    elif suspicious_prob >= 0.35:
        level = "MEDIUM"
    else:
        level = "LOW"
        
    return {
        "risk_probability": round(suspicious_prob, 4),
        "risk_classification": classification,
        "risk_level": level,
        "model_name": metadata.get("model_name", "AccountRiskRandomForest"),
        "model_version": metadata.get("model_version", "1.0.0"),
        "features_used": row_values
    }
