"""
Account Risk Model Training and Evaluation Pipeline.
Trains an explainable RandomForestClassifier on behavioral features to detect suspicious accounts
(money mules and structuring rings) without target leakage.
"""

import json
from pathlib import Path
from typing import Dict, Any, List
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    brier_score_loss
)

RANDOM_SEED = 2026
MODEL_DIR = Path(__file__).resolve().parent / "saved_models"
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

# Explicitly verified clean feature list (strictly behavioral/transactional)
FEATURE_COLUMNS: List[str] = [
    "incoming_count",
    "outgoing_count",
    "total_txns",
    "unique_senders",
    "unique_receivers",
    "total_incoming_amount",
    "total_outgoing_amount",
    "net_flow_amount",
    "avg_incoming_amount",
    "avg_outgoing_amount",
    "avg_txn_amount",
    "pass_through_ratio",
    "txn_velocity_per_hour",
    "avg_time_between_txns_min",
    "avg_in_out_delay_min",
    "median_in_out_delay_min",
    "min_in_out_delay_min",
    "structuring_ratio",
    "network_degree",
    "account_age_days"
]


def load_dataset():
    """Load feature matrix and partition strictly by account-level splits."""
    features_df = pd.read_csv(DATA_DIR / "account_features.csv")
    with open(DATA_DIR / "train_val_test_split.json", "r", encoding="utf-8") as f:
        splits = json.load(f)

    train_ids = set(splits["train"])
    val_ids = set(splits["val"])
    test_ids = set(splits["test"])

    train_df = features_df[features_df["account_id"].isin(train_ids)].copy()
    val_df = features_df[features_df["account_id"].isin(val_ids)].copy()
    test_df = features_df[features_df["account_id"].isin(test_ids)].copy()

    return train_df, val_df, test_df


def train_and_evaluate():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    train_df, val_df, test_df = load_dataset()

    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df["is_suspicious"]

    X_val = val_df[FEATURE_COLUMNS]
    y_val = val_df["is_suspicious"]

    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df["is_suspicious"]

    print("=" * 65)
    print("      MONEY TRAIL HUNTER - ACCOUNT RISK MODEL TRAINING")
    print("=" * 65)
    print(f"Features Count:       {len(FEATURE_COLUMNS)}")
    print(f"Train Set Size:       {len(train_df)} accounts ({y_train.sum()} suspicious, {len(y_train) - y_train.sum()} benign)")
    print(f"Validation Set Size:  {len(val_df)} accounts ({y_val.sum()} suspicious, {len(y_val) - y_val.sum()} benign)")
    print(f"Test / Demo Set Size: {len(test_df)} accounts ({y_test.sum()} suspicious, {len(y_test) - y_test.sum()} benign)")
    print("-" * 65)

    # 1. Base Model: RandomForest with class-balanced weighting
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=RANDOM_SEED
    )
    rf.fit(X_train, y_train)

    # 2. Probability Calibration (using Platt scaling / sigmoid on validation fold)
    # Check calibration improvement
    val_raw_probs = rf.predict_proba(X_val)[:, 1]
    raw_brier = brier_score_loss(y_val, val_raw_probs)

    calibrated_clf = CalibratedClassifierCV(estimator=rf, method="sigmoid", cv=3)
    calibrated_clf.fit(X_train, y_train)
    val_cal_probs = calibrated_clf.predict_proba(X_val)[:, 1]
    cal_brier = brier_score_loss(y_val, val_cal_probs)

    print(f"Validation Brier Score (Raw RF):        {raw_brier:.4f}")
    print(f"Validation Brier Score (Calibrated):    {cal_brier:.4f}")
    # Use calibrated model if better, else keep robust base RF
    active_model = calibrated_clf if cal_brier <= raw_brier else rf
    is_calibrated = (cal_brier <= raw_brier)

    # 3. Validation Evaluation
    val_preds = active_model.predict(X_val)
    val_probs = active_model.predict_proba(X_val)[:, 1]

    val_metrics = {
        "accuracy": float(accuracy_score(y_val, val_preds)),
        "precision": float(precision_score(y_val, val_preds, zero_division=0)),
        "recall": float(recall_score(y_val, val_preds)),
        "f1": float(f1_score(y_val, val_preds)),
        "roc_auc": float(roc_auc_score(y_val, val_probs)),
        "confusion_matrix": confusion_matrix(y_val, val_preds).tolist()
    }

    # 4. Test Evaluation
    test_preds = active_model.predict(X_test)
    test_probs = active_model.predict_proba(X_test)[:, 1]

    test_metrics = {
        "accuracy": float(accuracy_score(y_test, test_preds)),
        "precision": float(precision_score(y_test, test_preds, zero_division=0)),
        "recall": float(recall_score(y_test, test_preds)),
        "f1": float(f1_score(y_test, test_preds)),
        "roc_auc": float(roc_auc_score(y_test, test_probs)),
        "confusion_matrix": confusion_matrix(y_test, test_preds).tolist()
    }

    # 5. Per-Behavioral-Class Performance Breakdown on Test Set
    test_df_eval = test_df.copy()
    test_df_eval["pred"] = test_preds
    test_df_eval["prob"] = test_probs

    per_class_results = {}
    for b_class, group in test_df_eval.groupby("behavior_class"):
        total = len(group)
        pred_suspicious = int((group["pred"] == 1).sum())
        avg_prob = float(group["prob"].mean())
        per_class_results[b_class] = {
            "total_accounts": total,
            "predicted_suspicious": pred_suspicious,
            "predicted_benign": total - pred_suspicious,
            "detection_rate": round(pred_suspicious / total, 4) if total > 0 else 0.0,
            "mean_risk_probability": round(avg_prob, 4)
        }

    # 6. Feature Importances
    importances = rf.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    top_features = []
    for rank, idx in enumerate(sorted_idx[:10], 1):
        top_features.append({
            "rank": rank,
            "feature": FEATURE_COLUMNS[idx],
            "importance": round(float(importances[idx]), 4)
        })

    # 7. Demo Predictions on Held-Out Scenario Nodes
    demo_node_ids = ["A102", "B552", "C771", "D334", "E889", "Victim-001"]
    demo_rows = test_df_eval[test_df_eval["account_id"].isin(demo_node_ids)].copy()
    demo_predictions = {}
    for _, row in demo_rows.iterrows():
        acc_id = row["account_id"]
        demo_predictions[acc_id] = {
            "account_id": acc_id,
            "behavior_class": row["behavior_class"],
            "ground_truth_suspicious": int(row["is_suspicious"]),
            "predicted_class": "SUSPICIOUS" if row["pred"] == 1 else "BENIGN",
            "model_risk_probability": round(float(row["prob"]), 4),
            "key_factors": {
                "velocity": round(float(row["txn_velocity_per_hour"]), 2),
                "pass_through": round(float(row["pass_through_ratio"]), 2),
                "structuring_ratio": round(float(row["structuring_ratio"]), 2),
                "median_delay_min": round(float(row["median_in_out_delay_min"]), 1)
            }
        }

    # 8. Save Artifacts
    model_save_path = MODEL_DIR / "account_risk_model.joblib"
    joblib.dump(active_model, model_save_path)

    metadata = {
        "model_name": "AccountRiskRandomForest",
        "model_version": "1.0.0",
        "model_type": "RandomForestClassifier",
        "is_calibrated": is_calibrated,
        "calibration_method": "sigmoid (Platt scaling)" if is_calibrated else "none",
        "random_seed": RANDOM_SEED,
        "hyperparameters": {
            "n_estimators": 100,
            "max_depth": 6,
            "min_samples_split": 4,
            "min_samples_leaf": 2,
            "class_weight": "balanced"
        },
        "features": FEATURE_COLUMNS,
        "decision_threshold": 0.50,
        "validation_metrics": val_metrics,
        "test_metrics": test_metrics,
        "per_class_test_results": per_class_results,
        "top_features": top_features,
        "demo_predictions": demo_predictions
    }

    with open(MODEL_DIR / "risk_model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # Print Report
    print("\n[VALIDATION SET EVALUATION]")
    print(f"Accuracy:  {val_metrics['accuracy']:.4f}")
    print(f"Precision: {val_metrics['precision']:.4f}")
    print(f"Recall:    {val_metrics['recall']:.4f}")
    print(f"F1 Score:  {val_metrics['f1']:.4f}")
    print(f"ROC-AUC:   {val_metrics['roc_auc']:.4f}")
    print(f"Confusion Matrix (TN, FP / FN, TP):\n{val_metrics['confusion_matrix']}")

    print("\n[TEST / DEMO SET EVALUATION]")
    print(f"Accuracy:  {test_metrics['accuracy']:.4f}")
    print(f"Precision: {test_metrics['precision']:.4f}")
    print(f"Recall:    {test_metrics['recall']:.4f}")
    print(f"F1 Score:  {test_metrics['f1']:.4f}")
    print(f"ROC-AUC:   {test_metrics['roc_auc']:.4f}")
    print(f"Confusion Matrix (TN, FP / FN, TP):\n{test_metrics['confusion_matrix']}")

    print("\n[PER-BEHAVIORAL-CLASS BREAKDOWN ON TEST SET]")
    for b_cls, res in per_class_results.items():
        print(f"  - {b_cls:<12} (n={res['total_accounts']}): "
              f"Flagged Suspicious = {res['predicted_suspicious']}/{res['total_accounts']} "
              f"({res['detection_rate']*100:.1f}%), Mean Risk Prob = {res['mean_risk_probability']:.4f}")

    print("\n[TOP 10 FEATURE IMPORTANCES]")
    for tf in top_features:
        print(f"  {tf['rank']:>2}. {tf['feature']:<28} : {tf['importance']:.4f}")

    print("\n[HELD-OUT DEMO ACCOUNTS PREDICTIONS]")
    for acc_id in demo_node_ids:
        dp = demo_predictions.get(acc_id, {})
        print(f"  {acc_id:<12} (Archetype: {dp.get('behavior_class', 'N/A'):<9}) -> "
              f"Pred: {dp.get('predicted_class', 'N/A'):<10} | Risk Prob: {dp.get('model_risk_probability', 0.0):.4f}")

    print(f"\nModel artifact saved to: {model_save_path}")
    print("=" * 65)


if __name__ == "__main__":
    train_and_evaluate()
