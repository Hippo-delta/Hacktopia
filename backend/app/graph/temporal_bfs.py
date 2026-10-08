"""
Temporal BFS Money Trail Tracing Module.
Performs deterministic, chronological money trail analysis across the banking transaction graph.
Identifies rapid layering hops, commission dissipation, cycle avoidance, and terminal accounts.
"""

from typing import Dict, Any, List, Optional
import logging

from app.data_loader import data_manager
from app.ml.next_hop_inference import rank_next_hop_candidates

logger = logging.getLogger(__name__)

# Maximum permissible time gap between consecutive hops in rapid mule laundering (6 hours)
MAX_HOP_WINDOW_SECONDS = 6 * 3600


def trace_money_trail(
    transaction_id: Optional[str] = None,
    account_id: Optional[str] = None,
    max_hops: int = 6
) -> Dict[str, Any]:
    """
    Traverse money trail chronologically starting from a specific transaction ID or account ID.
    
    Args:
        transaction_id: Starting transaction ID (e.g. TXN-84921)
        account_id: Starting account ID (e.g. Victim-001 or A102)
        max_hops: Maximum number of hops to traverse
        
    Returns:
        Dict adhering to InvestigationResponse schema containing summary, trail hops,
        and terminal next-hop prediction.
    """
    start_txn = None
    target_query = (transaction_id or account_id or "").strip()

    if transaction_id:
        start_txn = data_manager.get_transaction(transaction_id)

    # If transaction not found by ID, check if target_query matches an account
    if not start_txn and target_query:
        if target_query in data_manager.accounts_by_id:
            # Check incoming transactions for scam trail or highest amount
            incomings = data_manager.get_incoming_transactions(target_query)
            scam_in = [t for t in incomings if t.get("isScamTrail")]
            if scam_in:
                start_txn = scam_in[0]
            elif incomings:
                start_txn = incomings[0]
            else:
                outgoings = data_manager.get_outgoing_transactions(target_query)
                if outgoings:
                    start_txn = outgoings[0]

    if not start_txn:
        raise ValueError(f"Transaction or starting account '{target_query}' not found in database.")

    accounts_map = data_manager.accounts_by_id

    # Hop 1: The reported initiating transfer
    from_acc_id = str(start_txn.get("fromAccount"))
    to_acc_id = str(start_txn.get("toAccount"))

    from_meta = accounts_map.get(from_acc_id, {})
    to_meta = accounts_map.get(to_acc_id, {})

    to_risk = data_manager.get_account_risk(to_acc_id) or {
        "risk_probability": 0.5,
        "risk_level": "MEDIUM",
        "predicted_class": "BENIGN"
    }

    hop1 = {
        "hop_number": 1,
        "txn_id": str(start_txn.get("id")),
        "from_account": from_acc_id,
        "from_account_name": from_meta.get("name", from_acc_id),
        "to_account": to_acc_id,
        "to_account_name": to_meta.get("name", to_acc_id),
        "amount": float(start_txn.get("amount", 0.0)),
        "timestamp": str(start_txn.get("timestamp", "")),
        "time_epoch": int(start_txn.get("timeEpoch", 0)),
        "delay_minutes": 0,
        "to_risk_probability": float(to_risk["risk_probability"]),
        "to_risk_level": str(to_risk["risk_level"]),
        "is_suspicious": bool(to_risk["predicted_class"] == "SUSPICIOUS"),
        "channel": str(start_txn.get("channel", "IMPS"))
    }

    trail = [hop1]
    visited_accounts = {from_acc_id, to_acc_id}

    curr_account = to_acc_id
    curr_epoch = int(start_txn.get("timeEpoch", 0))
    curr_amount = float(start_txn.get("amount", 0.0))

    # Downstream chronological BFS traversal
    while len(trail) < max_hops:
        outgoing = data_manager.get_outgoing_transactions(curr_account, min_epoch=curr_epoch)

        # Filter: strictly forward in time, within rapid window, and cycle prevention
        candidates = [
            t for t in outgoing
            if int(t.get("timeEpoch", 0)) >= curr_epoch
            and (int(t.get("timeEpoch", 0)) - curr_epoch) <= MAX_HOP_WINDOW_SECONDS
            and str(t.get("toAccount")) not in visited_accounts
        ]

        if not candidates:
            # Reached terminal account in the current trail
            break

        # Rank candidates by:
        # 1. Minimum temporal delay (rapid pass-through)
        # 2. Closeness to incoming amount (dissipation match)
        candidates.sort(
            key=lambda t: (
                int(t.get("timeEpoch", 0)) - curr_epoch,
                abs(float(t.get("amount", 0.0)) - curr_amount)
            )
        )

        next_txn = candidates[0]
        next_to_acc = str(next_txn.get("toAccount"))
        next_to_meta = accounts_map.get(next_to_acc, {})
        next_epoch = int(next_txn.get("timeEpoch", 0))
        next_amount = float(next_txn.get("amount", 0.0))
        delay_min = int(round(max(0, next_epoch - curr_epoch) / 60.0))

        next_risk = data_manager.get_account_risk(next_to_acc) or {
            "risk_probability": 0.5,
            "risk_level": "MEDIUM",
            "predicted_class": "BENIGN"
        }

        hop = {
            "hop_number": len(trail) + 1,
            "txn_id": str(next_txn.get("id")),
            "from_account": curr_account,
            "from_account_name": accounts_map.get(curr_account, {}).get("name", curr_account),
            "to_account": next_to_acc,
            "to_account_name": next_to_meta.get("name", next_to_acc),
            "amount": next_amount,
            "timestamp": str(next_txn.get("timestamp", "")),
            "time_epoch": next_epoch,
            "delay_minutes": delay_min,
            "to_risk_probability": float(next_risk["risk_probability"]),
            "to_risk_level": str(next_risk["risk_level"]),
            "is_suspicious": bool(next_risk["predicted_class"] == "SUSPICIOUS"),
            "channel": str(next_txn.get("channel", "IMPS"))
        }

        trail.append(hop)
        visited_accounts.add(next_to_acc)
        curr_account = next_to_acc
        curr_epoch = next_epoch
        curr_amount = next_amount

    # Build investigation summary
    initial_amount = trail[0]["amount"]
    terminal_amount = trail[-1]["amount"]
    amount_retained = round(max(0.0, initial_amount - terminal_amount), 2)
    duration_minutes = int(round((trail[-1]["time_epoch"] - trail[0]["time_epoch"]) / 60.0))

    summary = {
        "starting_transaction": str(start_txn.get("id")),
        "initial_amount": initial_amount,
        "terminal_account": trail[-1]["to_account"],
        "terminal_amount": terminal_amount,
        "amount_retained": amount_retained,
        "number_of_hops": len(trail),
        "duration_minutes": duration_minutes
    }

    # Next-hop prediction at the terminal account
    terminal_acc = trail[-1]["to_account"]
    terminal_epoch = trail[-1]["time_epoch"]
    terminal_amt = trail[-1]["amount"]

    candidate_ids = [
        str(a["id"]) for a in data_manager.get_all_accounts()
        if str(a["id"]) not in visited_accounts and str(a["id"]) != terminal_acc
    ]

    next_hop_result = None
    try:
        next_hop_result = rank_next_hop_candidates(
            current_account_id=terminal_acc,
            in_amount=terminal_amt,
            current_epoch=terminal_epoch,
            candidate_account_ids=candidate_ids,
            history_transactions=data_manager.get_all_transactions(),
            accounts=data_manager.get_all_accounts(),
            top_k=5
        )
    except Exception as e:
        logger.warning(f"Next-hop prediction failed for terminal account {terminal_acc}: {e}")

    return {
        "summary": summary,
        "trail": trail,
        "next_hop_prediction": next_hop_result,
        "metadata": {
            "algorithm": "Temporal Chronological BFS",
            "cycle_avoidance": True,
            "max_window_hours": MAX_HOP_WINDOW_SECONDS / 3600.0,
            "hops_evaluated": len(trail)
        }
    }
