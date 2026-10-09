"""
Feature Engineering Module for Money Trail Hunter.
Provides unified feature extraction used for both model training and real-time inference.
"""
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd


def extract_account_features(
    account_id: str,
    transactions: List[Dict[str, Any]],
    accounts_metadata: Optional[Dict[str, Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Extract forensic tabular features for a single account from transaction history.
    This exact function is used for both dataset generation/training and live inference.
    """
    acc_id = str(account_id)
    
    # Filter incoming and outgoing transactions
    in_txns = [t for t in transactions if str(t.get("toAccount")) == acc_id]
    out_txns = [t for t in transactions if str(t.get("fromAccount")) == acc_id]
    
    in_count = len(in_txns)
    out_count = len(out_txns)
    total_txns = in_count + out_count
    
    unique_senders = len(set(t.get("fromAccount") for t in in_txns if t.get("fromAccount")))
    unique_receivers = len(set(t.get("toAccount") for t in out_txns if t.get("toAccount")))
    
    in_amounts = [float(t.get("amount", 0.0)) for t in in_txns]
    out_amounts = [float(t.get("amount", 0.0)) for t in out_txns]
    
    total_in_amt = sum(in_amounts)
    total_out_amt = sum(out_amounts)
    avg_in_amt = (total_in_amt / in_count) if in_count > 0 else 0.0
    avg_out_amt = (total_out_amt / out_count) if out_count > 0 else 0.0
    avg_txn_amt = ((total_in_amt + total_out_amt) / total_txns) if total_txns > 0 else 0.0
    
    # Pass-through ratio (proportion of incoming funds drained immediately)
    pass_through_ratio = min(1.0, (total_out_amt / total_in_amt)) if total_in_amt > 0 else 0.0
    
    # Timing and velocity calculations
    all_epochs = sorted([int(t.get("timeEpoch", 0)) for t in (in_txns + out_txns) if t.get("timeEpoch")])
    if len(all_epochs) >= 2:
        active_duration_hours = max(0.1, (all_epochs[-1] - all_epochs[0]) / 3600.0)
        time_diffs_min = [(all_epochs[i] - all_epochs[i-1]) / 60.0 for i in range(1, len(all_epochs))]
        avg_time_between_txns_min = float(np.mean(time_diffs_min))
    else:
        active_duration_hours = 1.0
        avg_time_between_txns_min = 1440.0 # default to 24 hrs
    
    txn_velocity_per_hour = total_txns / active_duration_hours
    
    # Delay between incoming deposits and subsequent outgoing transfers
    # Key indicator of rapid mule layering (sub-5-minute transfers)
    in_epochs = sorted([int(t.get("timeEpoch", 0)) for t in in_txns if t.get("timeEpoch")])
    out_epochs = sorted([int(t.get("timeEpoch", 0)) for t in out_txns if t.get("timeEpoch")])
    
    in_out_delays = []
    for in_ep in in_epochs:
        # find the earliest outgoing transfer that occurred after or at this incoming transfer
        future_outs = [out_ep for out_ep in out_epochs if out_ep >= in_ep]
        if future_outs:
            delay_min = (future_outs[0] - in_ep) / 60.0
            in_out_delays.append(delay_min)
            
    if in_out_delays:
        avg_in_out_delay_min = float(np.mean(in_out_delays))
        median_in_out_delay_min = float(np.median(in_out_delays))
        min_in_out_delay_min = float(np.min(in_out_delays))
    else:
        avg_in_out_delay_min = 1440.0
        median_in_out_delay_min = 1440.0
        min_in_out_delay_min = 1440.0
        
    # Structuring pattern indicator: transactions clustered just below statutory INR 50k reporting threshold
    structuring_txns = [a for a in out_amounts if 40000.0 <= a < 50000.0]
    structuring_ratio = (len(structuring_txns) / out_count) if out_count > 0 else 0.0
    
    # Network metrics
    all_counterparties = set([t.get("fromAccount") for t in in_txns] + [t.get("toAccount") for t in out_txns])
    all_counterparties.discard(acc_id)
    all_counterparties.discard(None)
    network_degree = len(all_counterparties)
    
    # Suspicious peer connections (if metadata is provided)
    suspicious_connections = 0
    if accounts_metadata:
        for peer_id in all_counterparties:
            peer_meta = accounts_metadata.get(peer_id, {})
            if peer_meta.get("isMule") or peer_meta.get("behavior_class") in ("mule-like", "structuring"):
                suspicious_connections += 1
                
    # Account identity context if available (defaults to individual/unregistered)
    account_age_days = 180
    business_registered = 0
    gstin_present = 0
    identity_verified = 0
    curr_entity_id = None
    
    if accounts_metadata and acc_id in accounts_metadata:
        meta = accounts_metadata[acc_id]
        account_age_days = int(meta.get("accountAgeDays", 180))
        business_registered = int(bool(meta.get("business_registered", False)))
        gstin_present = int(bool(meta.get("gstin_present", False)))
        
        status_str = str(meta.get("identity_verification_status", "")).upper()
        if "VERIFIED" in status_str:
            identity_verified = 1
        curr_entity_id = meta.get("entity_id")

    # Ratio of transactions that are internal treasury sweeps under the same entity_id
    same_entity_txns = 0
    if curr_entity_id and accounts_metadata:
        for t in in_txns:
            sender_id = str(t.get("fromAccount"))
            if accounts_metadata.get(sender_id, {}).get("entity_id") == curr_entity_id:
                same_entity_txns += 1
        for t in out_txns:
            recv_id = str(t.get("toAccount"))
            if accounts_metadata.get(recv_id, {}).get("entity_id") == curr_entity_id:
                same_entity_txns += 1

    same_entity_ratio = (same_entity_txns / total_txns) if total_txns > 0 else 0.0

    # Recurring counterparties ratio (legitimate businesses and individuals have recurring counterparties)
    counterparty_counts = {}
    for t in (in_txns + out_txns):
        other = str(t.get("fromAccount") if str(t.get("toAccount")) == acc_id else t.get("toAccount"))
        if other and other != acc_id:
            counterparty_counts[other] = counterparty_counts.get(other, 0) + 1

    recurring_parties = sum(1 for c in counterparty_counts.values() if c >= 2)
    recurring_counterparty_ratio = (recurring_parties / len(counterparty_counts)) if counterparty_counts else 0.0

    return {
        "account_id": acc_id,
        "incoming_count": in_count,
        "outgoing_count": out_count,
        "total_txns": total_txns,
        "unique_senders": unique_senders,
        "unique_receivers": unique_receivers,
        "total_incoming_amount": total_in_amt,
        "total_outgoing_amount": total_out_amt,
        "net_flow_amount": total_in_amt - total_out_amt,
        "avg_incoming_amount": avg_in_amt,
        "avg_outgoing_amount": avg_out_amt,
        "avg_txn_amount": avg_txn_amt,
        "pass_through_ratio": pass_through_ratio,
        "txn_velocity_per_hour": txn_velocity_per_hour,
        "avg_time_between_txns_min": avg_time_between_txns_min,
        "avg_in_out_delay_min": avg_in_out_delay_min,
        "median_in_out_delay_min": median_in_out_delay_min,
        "min_in_out_delay_min": min_in_out_delay_min,
        "structuring_ratio": structuring_ratio,
        "network_degree": network_degree,
        "suspicious_connection_count": suspicious_connections,
        "account_age_days": account_age_days,
        "business_registered": business_registered,
        "gstin_present": gstin_present,
        "identity_verified": identity_verified,
        "same_entity_transfer_ratio": round(same_entity_ratio, 4),
        "recurring_counterparty_ratio": round(recurring_counterparty_ratio, 4)
    }


def extract_all_account_features(
    accounts: List[Dict[str, Any]],
    transactions: List[Dict[str, Any]]
) -> pd.DataFrame:
    """
    Extract feature DataFrame for all accounts.
    """
    metadata_map = {str(a["id"]): a for a in accounts if "id" in a}
    feature_rows = []
    for acc in accounts:
        acc_id = str(acc["id"])
        feats = extract_account_features(acc_id, transactions, metadata_map)
        if "behavior_class" in acc:
            feats["behavior_class"] = acc["behavior_class"]
        if "is_suspicious" in acc:
            feats["is_suspicious"] = int(acc["is_suspicious"])
        feature_rows.append(feats)
        
    return pd.DataFrame(feature_rows)


def extract_next_hop_sequence_samples(
    transactions: List[Dict[str, Any]],
    account_features_map: Dict[str, Dict[str, Any]]
) -> pd.DataFrame:
    """
    Generate sequential hop transfer samples for next-hop destination prediction.
    Given an incoming transaction into Account A, predict the destination of Account A's next outgoing transaction.
    """
    # Sort transactions chronologically
    sorted_txns = sorted(transactions, key=lambda t: t.get("timeEpoch", 0))
    
    samples = []
    # Index transactions by account
    by_from = {}
    by_to = {}
    for t in sorted_txns:
        f = str(t.get("fromAccount"))
        to = str(t.get("toAccount"))
        by_from.setdefault(f, []).append(t)
        by_to.setdefault(to, []).append(t)
        
    for in_txn in sorted_txns:
        current_acc = str(in_txn.get("toAccount"))
        in_epoch = in_txn.get("timeEpoch", 0)
        in_amt = float(in_txn.get("amount", 0.0))
        
        # Look for the immediate next outgoing transaction from current_acc
        out_candidates = [
            t for t in by_from.get(current_acc, [])
            if t.get("timeEpoch", 0) >= in_epoch
        ]
        
        if out_candidates:
            next_txn = out_candidates[0]
            delay_min = max(0.5, (next_txn.get("timeEpoch", 0) - in_epoch) / 60.0)
            target_dest = str(next_txn.get("toAccount"))
            out_amt = float(next_txn.get("amount", 0.0))
            
            acc_feats = account_features_map.get(current_acc, {})
            
            sample = {
                "in_txn_id": in_txn.get("id"),
                "out_txn_id": next_txn.get("id"),
                "current_account": current_acc,
                "in_amount": in_amt,
                "out_amount": out_amt,
                "amount_retained": max(0.0, in_amt - out_amt),
                "transfer_delay_min": delay_min,
                "channel": next_txn.get("channel", "IMPS"),
                "is_scam_trail": int(bool(in_txn.get("isScamTrail") or next_txn.get("isScamTrail"))),
                # Account topological context
                "current_acc_incoming_count": acc_feats.get("incoming_count", 0),
                "current_acc_outgoing_count": acc_feats.get("outgoing_count", 0),
                "current_acc_unique_senders": acc_feats.get("unique_senders", 0),
                "current_acc_unique_receivers": acc_feats.get("unique_receivers", 0),
                "current_acc_pass_through": acc_feats.get("pass_through_ratio", 0.0),
                "current_acc_velocity": acc_feats.get("txn_velocity_per_hour", 0.0),
                "current_acc_degree": acc_feats.get("network_degree", 0),
                "current_acc_avg_delay": acc_feats.get("avg_in_out_delay_min", 0.0),
                # Prediction target
                "target_next_account": target_dest
            }
            samples.append(sample)
            
    return pd.DataFrame(samples)
