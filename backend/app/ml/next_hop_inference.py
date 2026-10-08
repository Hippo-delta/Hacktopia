"""
Inference Module for Next-Hop Prediction Model.
Loads the trained candidate-ranking Random Forest model to rank potential next destination accounts
given an incoming suspicious transfer context.
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import joblib
import pandas as pd
from app.ml.train_next_hop_model import TemporalGraphTracker, FEATURE_COLUMNS

MODEL_DIR = Path(__file__).resolve().parent / "saved_models"
MODEL_PATH = MODEL_DIR / "next_hop_model.joblib"
METADATA_PATH = MODEL_DIR / "next_hop_model_metadata.json"

_CACHED_NEXT_HOP_MODEL = None
_CACHED_METADATA = None


def get_next_hop_model():
    """Load or retrieve cached model artifact."""
    global _CACHED_NEXT_HOP_MODEL, _CACHED_METADATA
    if _CACHED_NEXT_HOP_MODEL is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Next-hop model file not found at: {MODEL_PATH}")
        _CACHED_NEXT_HOP_MODEL = joblib.load(MODEL_PATH)
        if METADATA_PATH.exists():
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                _CACHED_METADATA = json.load(f)
        else:
            _CACHED_METADATA = {}

    return _CACHED_NEXT_HOP_MODEL, _CACHED_METADATA


def rank_next_hop_candidates(
    current_account_id: str,
    in_amount: float,
    current_epoch: int,
    candidate_account_ids: List[str],
    history_transactions: List[Dict[str, Any]],
    accounts: List[Dict[str, Any]],
    top_k: int = 5
) -> Dict[str, Any]:
    """
    Ranks candidate destination accounts for an incoming transfer into current_account_id.
    
    Args:
        current_account_id: Account ID that received the money.
        in_amount: Inbound transaction amount.
        current_epoch: Unix epoch timestamp of incoming transfer.
        candidate_account_ids: Plausible candidate destination account IDs.
        history_transactions: List of historical transactions up to current_epoch.
        accounts: List of account metadata dictionaries.
        top_k: Number of top ranked predictions to return.
        
    Returns:
        Dict containing top predicted destination, full ranked candidate list, and feature context.
    """
    model, metadata = get_next_hop_model()
    curr_acc = str(current_account_id)

    # Replay historical transactions up to current_epoch to establish causal graph state
    # Filter strictly to transactions that occurred prior to current_epoch
    prior_txns = [t for t in history_transactions if int(t.get("timeEpoch", 0)) <= current_epoch]
    prior_txns.sort(key=lambda t: int(t.get("timeEpoch", 0)))

    tracker = TemporalGraphTracker(accounts)
    for t in prior_txns:
        tracker.update(t)

    # Filter out current account from candidate pool
    valid_candidates = [c for c in candidate_account_ids if c != curr_acc]
    if not valid_candidates:
        return {
            "current_account": curr_acc,
            "predicted_next_hop": None,
            "confidence": 0.0,
            "ranked_candidates": [],
            "error": "No valid candidate destination accounts provided."
        }

    # Extract clean causal features for each candidate
    feature_rows = []
    for cand_id in valid_candidates:
        feats = tracker.extract_candidate_features(curr_acc, cand_id, in_amount, current_epoch)
        feature_rows.append(feats)

    cand_df = pd.DataFrame(feature_rows)[FEATURE_COLUMNS]
    probs = model.predict_proba(cand_df)[:, 1]

    # Assemble ranked candidates
    ranked_candidates = []
    for i, cand_id in enumerate(valid_candidates):
        cand_meta = tracker.accounts_map.get(cand_id, {})
        score = float(probs[i])
        ranked_candidates.append({
            "account_id": cand_id,
            "account_name": cand_meta.get("name", cand_id),
            "account_type": cand_meta.get("accountType", "Account"),
            "confidence_score": round(score, 4),
            "has_prior_transfer": bool(feature_rows[i]["pair_has_prior_link"] > 0),
            "prior_transfer_count": int(feature_rows[i]["pair_prior_transfer_count"])
        })

    # Sort descending by predicted probability
    ranked_candidates.sort(key=lambda x: x["confidence_score"], reverse=True)

    # Assign 1-indexed ranks
    for r_idx, c_data in enumerate(ranked_candidates, 1):
        c_data["rank"] = r_idx

    best_candidate = ranked_candidates[0] if ranked_candidates else None
    confidence_pct = round(best_candidate["confidence_score"] * 100, 1) if best_candidate else 0.0

    return {
        "current_account": curr_acc,
        "predicted_next_hop": best_candidate["account_id"] if best_candidate else None,
        "predicted_target_name": best_candidate["account_name"] if best_candidate else None,
        "confidence": confidence_pct,
        "estimated_onward_amount": round(in_amount * 0.96, 2),
        "model_version": metadata.get("model_version", "1.0.0"),
        "total_candidates_evaluated": len(valid_candidates),
        "top_candidates": ranked_candidates[:top_k]
    }
