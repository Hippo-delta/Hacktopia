"""
Next-Hop Prediction Model Training and Evaluation Pipeline.
Trains an explainable candidate-ranking classifier (RandomForestClassifier) to predict
the next destination account for an incoming transfer without temporal or future leakage.
"""

import json
import random
from pathlib import Path
from collections import defaultdict
from typing import Dict, Any, List, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, average_precision_score

RANDOM_SEED = 2026
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

MODEL_DIR = Path(__file__).resolve().parent / "saved_models"
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

# Clean causal feature list (strictly known at prediction time t, NO future attributes)
FEATURE_COLUMNS: List[str] = [
    # 1. Current Account & Inbound Transfer Context
    "in_amount",
    "curr_hist_in_count",
    "curr_hist_out_count",
    "curr_hist_total_txns",
    "curr_hist_pass_through",
    "curr_hist_unique_receivers",
    "curr_hist_velocity",
    "curr_account_age_days",
    # 2. Candidate Account Context
    "cand_hist_in_count",
    "cand_hist_out_count",
    "cand_hist_total_txns",
    "cand_hist_pass_through",
    "cand_hist_unique_senders",
    "cand_hist_unique_receivers",
    "cand_hist_velocity",
    "cand_account_age_days",
    # 3. Pairwise Historical Graph Relationship (strictly prior to t)
    "pair_prior_transfer_count",
    "pair_prior_total_amount",
    "pair_has_prior_link",
    "pair_reverse_transfer_count",
    "pair_common_neighbors_count",
    "amt_ratio_to_cand_avg_in",
    "cand_in_out_ratio"
]


class TemporalGraphTracker:
    """
    Maintains causal running historical statistics of the transaction multigraph
    strictly as events unfold over time. Ensures zero future transaction leakage.
    """
    def __init__(self, accounts: List[Dict[str, Any]]):
        self.accounts_map = {a["id"]: a for a in accounts}
        self.in_counts = defaultdict(int)
        self.out_counts = defaultdict(int)
        self.in_amounts = defaultdict(float)
        self.out_amounts = defaultdict(float)
        self.first_seen = {}
        self.last_seen = {}
        self.senders = defaultdict(set)
        self.receivers = defaultdict(set)
        # Pairwise relationships: from_acc -> to_acc -> count / amount
        self.pair_count = defaultdict(lambda: defaultdict(int))
        self.pair_amount = defaultdict(lambda: defaultdict(float))
        self.active_accounts = set()

    def update(self, txn: Dict[str, Any]):
        f_acc = str(txn["fromAccount"])
        to_acc = str(txn["toAccount"])
        amt = float(txn.get("amount", 0.0))
        epoch = int(txn.get("timeEpoch", 0))

        self.out_counts[f_acc] += 1
        self.in_counts[to_acc] += 1
        self.out_amounts[f_acc] += amt
        self.in_amounts[to_acc] += amt

        if f_acc not in self.first_seen:
            self.first_seen[f_acc] = epoch
        if to_acc not in self.first_seen:
            self.first_seen[to_acc] = epoch

        self.last_seen[f_acc] = epoch
        self.last_seen[to_acc] = epoch

        self.receivers[f_acc].add(to_acc)
        self.senders[to_acc].add(f_acc)

        self.pair_count[f_acc][to_acc] += 1
        self.pair_amount[f_acc][to_acc] += amt

        self.active_accounts.add(f_acc)
        self.active_accounts.add(to_acc)

    def extract_candidate_features(
        self,
        curr_acc: str,
        cand_acc: str,
        in_amount: float,
        current_epoch: int
    ) -> Dict[str, float]:
        # Current account metrics
        c_in_cnt = self.in_counts[curr_acc]
        c_out_cnt = self.out_counts[curr_acc]
        c_tot_txns = c_in_cnt + c_out_cnt
        c_in_amt = self.in_amounts[curr_acc]
        c_out_amt = self.out_amounts[curr_acc]
        c_pass_through = min(1.0, (c_out_amt / c_in_amt)) if c_in_amt > 0 else 0.0
        c_receivers = len(self.receivers[curr_acc])
        
        c_first = self.first_seen.get(curr_acc, current_epoch)
        c_span_hours = max(0.1, (current_epoch - c_first) / 3600.0)
        c_velocity = c_tot_txns / c_span_hours
        c_age = int(self.accounts_map.get(curr_acc, {}).get("accountAgeDays", 180))

        # Candidate metrics
        cand_in_cnt = self.in_counts[cand_acc]
        cand_out_cnt = self.out_counts[cand_acc]
        cand_tot_txns = cand_in_cnt + cand_out_cnt
        cand_in_amt = self.in_amounts[cand_acc]
        cand_out_amt = self.out_amounts[cand_acc]
        cand_pass_through = min(1.0, (cand_out_amt / cand_in_amt)) if cand_in_amt > 0 else 0.0
        cand_senders = len(self.senders[cand_acc])
        cand_receivers = len(self.receivers[cand_acc])
        
        cand_first = self.first_seen.get(cand_acc, current_epoch)
        cand_span_hours = max(0.1, (current_epoch - cand_first) / 3600.0)
        cand_velocity = cand_tot_txns / cand_span_hours
        cand_age = int(self.accounts_map.get(cand_acc, {}).get("accountAgeDays", 180))

        # Pairwise metrics
        pair_cnt = self.pair_count[curr_acc][cand_acc]
        pair_amt = self.pair_amount[curr_acc][cand_acc]
        pair_rev = self.pair_count[cand_acc][curr_acc]
        
        # Triadic common neighbors
        common_nbrs = len(self.receivers[curr_acc].intersection(self.senders[cand_acc]))

        cand_avg_in = (cand_in_amt / cand_in_cnt) if cand_in_cnt > 0 else in_amount
        amt_ratio = in_amount / (cand_avg_in + 1.0)
        cand_in_out = cand_in_cnt / (cand_out_cnt + 1.0)

        return {
            "in_amount": float(in_amount),
            "curr_hist_in_count": float(c_in_cnt),
            "curr_hist_out_count": float(c_out_cnt),
            "curr_hist_total_txns": float(c_tot_txns),
            "curr_hist_pass_through": float(c_pass_through),
            "curr_hist_unique_receivers": float(c_receivers),
            "curr_hist_velocity": float(c_velocity),
            "curr_account_age_days": float(c_age),
            "cand_hist_in_count": float(cand_in_cnt),
            "cand_hist_out_count": float(cand_out_cnt),
            "cand_hist_total_txns": float(cand_tot_txns),
            "cand_hist_pass_through": float(cand_pass_through),
            "cand_hist_unique_senders": float(cand_senders),
            "cand_hist_unique_receivers": float(cand_receivers),
            "cand_hist_velocity": float(cand_velocity),
            "cand_account_age_days": float(cand_age),
            "pair_prior_transfer_count": float(pair_cnt),
            "pair_prior_total_amount": float(pair_amt),
            "pair_has_prior_link": 1.0 if pair_cnt > 0 else 0.0,
            "pair_reverse_transfer_count": float(pair_rev),
            "pair_common_neighbors_count": float(common_nbrs),
            "amt_ratio_to_cand_avg_in": float(amt_ratio),
            "cand_in_out_ratio": float(cand_in_out)
        }


def build_next_hop_dataset(
    accounts: List[Dict[str, Any]],
    transactions: List[Dict[str, Any]],
    num_negatives: int = 9
) -> Tuple[List[Dict[str, Any]], Dict[str, str]]:
    """
    Constructs candidate-ranking decision instances respecting strict temporal ordering.
    Partitions instances by chain/ring group.
    """
    txns = sorted(transactions, key=lambda t: t["timeEpoch"])
    all_account_ids = [a["id"] for a in accounts]
    demo_accounts = {"Victim-001", "A102", "B552", "C771", "D334", "E889"}

    # Map outgoing candidates
    by_from = defaultdict(list)
    for t in txns:
        by_from[t["fromAccount"]].append(t)

    tracker = TemporalGraphTracker(accounts)
    decision_instances = []
    rng = random.Random(RANDOM_SEED)

    # Process transactions in strict chronological order
    for t_in in txns:
        curr_acc = str(t_in["toAccount"])
        in_epoch = int(t_in["timeEpoch"])
        in_amt = float(t_in.get("amount", 0.0))

        # Check for immediate next outgoing transfer from curr_acc
        future_outs = [t for t in by_from.get(curr_acc, []) if int(t["timeEpoch"]) >= in_epoch]
        if future_outs:
            future_outs.sort(key=lambda x: int(x["timeEpoch"]))
            actual_next_txn = future_outs[0]
            true_dest = str(actual_next_txn["toAccount"])

            if curr_acc != true_dest:
                # Determine chain/network group
                if curr_acc in demo_accounts or true_dest in demo_accounts:
                    group_id = "group_demo_flagship"
                elif curr_acc.startswith("MULE-") or true_dest.startswith("MULE-"):
                    m_id = curr_acc if curr_acc.startswith("MULE-") else true_dest
                    num = int(m_id.replace("MULE-", ""))
                    group_id = f"group_mule_ring_{(num - 3001) // 4}"
                elif curr_acc.startswith("STR-") or true_dest.startswith("STR-") or curr_acc in ("G443", "M901"):
                    s_id = curr_acc if curr_acc.startswith("STR-") else true_dest
                    group_id = f"group_structuring_{s_id}"
                elif curr_acc.startswith("MCH-") or true_dest.startswith("MCH-"):
                    mch_id = curr_acc if curr_acc.startswith("MCH-") else true_dest
                    group_id = f"group_merchant_{mch_id}"
                else:
                    bucket = in_epoch // 7200
                    group_id = f"group_retail_p2p_{bucket}"

                # Construct negative candidates available at this time
                # Negative pool: prior counterparties of curr_acc plus active accounts
                prior_peers = list(tracker.receivers[curr_acc])
                eligible_negatives = [
                    a for a in (prior_peers + list(tracker.active_accounts) + all_account_ids)
                    if a != curr_acc and a != true_dest
                ]

                # Deduplicate while preserving order
                seen_neg = set()
                dedup_neg = []
                for neg in eligible_negatives:
                    if neg not in seen_neg:
                        seen_neg.add(neg)
                        dedup_neg.append(neg)

                # Sample negatives
                selected_negatives = dedup_neg[:num_negatives]
                if len(selected_negatives) < num_negatives:
                    fallback_pool = [a for a in all_account_ids if a != curr_acc and a != true_dest and a not in selected_negatives]
                    selected_negatives.extend(fallback_pool[:(num_negatives - len(selected_negatives))])

                # Assemble candidates: True destination (y=1) + Negatives (y=0)
                candidates = []
                # 1. Positive candidate
                pos_feats = tracker.extract_candidate_features(curr_acc, true_dest, in_amt, in_epoch)
                pos_feats["candidate_account"] = true_dest
                pos_feats["is_next_hop"] = 1
                candidates.append(pos_feats)

                # 2. Negative candidates
                for neg_acc in selected_negatives:
                    neg_feats = tracker.extract_candidate_features(curr_acc, neg_acc, in_amt, in_epoch)
                    neg_feats["candidate_account"] = neg_acc
                    neg_feats["is_next_hop"] = 0
                    candidates.append(neg_feats)

                decision_instances.append({
                    "decision_id": f"DEC-{t_in['id']}-{curr_acc}",
                    "in_txn_id": t_in["id"],
                    "curr_acc": curr_acc,
                    "true_dest": true_dest,
                    "in_amount": in_amt,
                    "in_epoch": in_epoch,
                    "group_id": group_id,
                    "candidates": candidates
                })

        # Advance temporal tracker with current incoming transaction
        tracker.update(t_in)

    return decision_instances, tracker


def split_by_chain_groups(
    decision_instances: List[Dict[str, Any]],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]], Dict[str, Any]]:
    """
    Partitions decision instances strictly by chain/ring group.
    Ensures group_demo_flagship is reserved 100% in the test partition.
    """
    groups = sorted(list(set(d["group_id"] for d in decision_instances)))
    rng = random.Random(RANDOM_SEED)

    # Reserve flagship demo group for test partition
    test_groups = {"group_demo_flagship"}
    non_demo_groups = [g for g in groups if g != "group_demo_flagship"]
    rng.shuffle(non_demo_groups)

    n = len(non_demo_groups)
    n_train = int(n * train_ratio)
    n_val = int(n * val_ratio)

    train_groups = set(non_demo_groups[:n_train])
    val_groups = set(non_demo_groups[n_train:n_train + n_val])
    test_groups.update(non_demo_groups[n_train + n_val:])

    train_instances = [d for d in decision_instances if d["group_id"] in train_groups]
    val_instances = [d for d in decision_instances if d["group_id"] in val_groups]
    test_instances = [d for d in decision_instances if d["group_id"] in test_groups]

    split_metadata = {
        "strategy": "Chain/ring-level group partition with group_demo_flagship strictly held out in test",
        "total_groups": len(groups),
        "train_groups_count": len(train_groups),
        "val_groups_count": len(val_groups),
        "test_groups_count": len(test_groups),
        "train_instances_count": len(train_instances),
        "val_instances_count": len(val_instances),
        "test_instances_count": len(test_instances)
    }

    return train_instances, val_instances, test_instances, split_metadata


def flatten_instances_to_tabular(
    instances: List[Dict[str, Any]]
) -> Tuple[pd.DataFrame, pd.Series]:
    """Flattens candidate lists into tabular features X and binary target y."""
    rows = []
    for inst in instances:
        dec_id = inst["decision_id"]
        grp = inst["group_id"]
        for cand in inst["candidates"]:
            row = {k: cand[k] for k in FEATURE_COLUMNS}
            row["decision_id"] = dec_id
            row["group_id"] = grp
            row["candidate_account"] = cand["candidate_account"]
            row["is_next_hop"] = cand["is_next_hop"]
            rows.append(row)

    df = pd.DataFrame(rows)
    X = df[FEATURE_COLUMNS]
    y = df["is_next_hop"]
    return df, X, y


def evaluate_ranking(
    model: Any,
    instances: List[Dict[str, Any]]
) -> Dict[str, float]:
    """
    Evaluates Top-1 Accuracy, Top-3 Accuracy, and Mean Reciprocal Rank (MRR)
    across all decision points.
    """
    if not instances:
        return {"top1": 0.0, "top3": 0.0, "mrr": 0.0, "cases": 0}

    ranks = []
    top1_count = 0
    top3_count = 0

    for inst in instances:
        cands = inst["candidates"]
        true_dest = inst["true_dest"]

        cand_df = pd.DataFrame([{k: c[k] for k in FEATURE_COLUMNS} for c in cands])
        probs = model.predict_proba(cand_df)[:, 1]

        # Pair candidates with predicted scores
        scored_cands = []
        for i, c in enumerate(cands):
            scored_cands.append({
                "account": c["candidate_account"],
                "score": float(probs[i]),
                "is_true": bool(c["candidate_account"] == true_dest)
            })

        # Rank descending by predicted score
        scored_cands.sort(key=lambda x: x["score"], reverse=True)

        # Find rank of true destination (1-indexed)
        true_rank = 10 # default fallback
        for rank_idx, sc in enumerate(scored_cands, 1):
            if sc["is_true"]:
                true_rank = rank_idx
                break

        ranks.append(true_rank)
        if true_rank == 1:
            top1_count += 1
        if true_rank <= 3:
            top3_count += 1

    total_cases = len(instances)
    mrr = float(np.mean([1.0 / r for r in ranks]))

    return {
        "top1_accuracy": round(top1_count / total_cases, 4),
        "top3_accuracy": round(top3_count / total_cases, 4),
        "mrr": round(mrr, 4),
        "total_cases": total_cases
    }


def train_and_evaluate():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 65)
    print("      MONEY TRAIL HUNTER - NEXT-HOP PREDICTION MODEL")
    print("=" * 65)

    with open(DATA_DIR / "accounts.json", "r", encoding="utf-8") as f:
        accounts = json.load(f)
    with open(DATA_DIR / "transactions.json", "r", encoding="utf-8") as f:
        transactions = json.load(f)

    print(f"[1/5] Building causal temporal candidate dataset (K=10 candidates/decision)...")
    instances, final_tracker = build_next_hop_dataset(accounts, transactions, num_negatives=9)
    print(f"Total Decision Points Generated: {len(instances)}")

    print(f"[2/5] Performing chain/ring-level group partition...")
    train_inst, val_inst, test_inst, split_meta = split_by_chain_groups(instances)

    print(f"  - Train Groups: {split_meta['train_groups_count']} (Instances: {len(train_inst)})")
    print(f"  - Val Groups:   {split_meta['val_groups_count']} (Instances: {len(val_inst)})")
    print(f"  - Test Groups:  {split_meta['test_groups_count']} (Instances: {len(test_inst)}, Flagship Held-Out: YES)")

    # Flatten to tabular
    train_df, X_train, y_train = flatten_instances_to_tabular(train_inst)
    val_df, X_val, y_val = flatten_instances_to_tabular(val_inst)
    test_df, X_test, y_test = flatten_instances_to_tabular(test_inst)

    print(f"  - Training Pairs:   {len(X_train)} rows (Positives: {int(y_train.sum())})")
    print(f"  - Validation Pairs: {len(X_val)} rows (Positives: {int(y_val.sum())})")
    print(f"  - Test Pairs:       {len(X_test)} rows (Positives: {int(y_test.sum())})")

    print(f"[3/5] Fitting candidate-ranking RandomForestClassifier...")
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=RANDOM_SEED
    )
    rf.fit(X_train, y_train)

    print(f"[4/5] Evaluating ranking metrics (Top-1, Top-3, MRR)...")
    val_ranking = evaluate_ranking(rf, val_inst)
    test_ranking = evaluate_ranking(rf, test_inst)

    val_probs = rf.predict_proba(X_val)[:, 1]
    test_probs = rf.predict_proba(X_test)[:, 1]

    val_auc = float(roc_auc_score(y_val, val_probs))
    test_auc = float(roc_auc_score(y_test, test_probs))

    print("\n--- VALIDATION SET RANKING PERFORMANCE ---")
    print(f"Top-1 Accuracy:  {val_ranking['top1_accuracy']*100:.2f}%")
    print(f"Top-3 Accuracy:  {val_ranking['top3_accuracy']*100:.2f}%")
    print(f"Mean Reciprocal Rank (MRR): {val_ranking['mrr']:.4f}")
    print(f"ROC-AUC (Pairwise Link):    {val_auc:.4f}")
    print(f"Total Cases:     {val_ranking['total_cases']}")

    print("\n--- TEST / DEMO SET RANKING PERFORMANCE (HELD-OUT CHAINS) ---")
    print(f"Top-1 Accuracy:  {test_ranking['top1_accuracy']*100:.2f}%")
    print(f"Top-3 Accuracy:  {test_ranking['top3_accuracy']*100:.2f}%")
    print(f"Mean Reciprocal Rank (MRR): {test_ranking['mrr']:.4f}")
    print(f"ROC-AUC (Pairwise Link):    {test_auc:.4f}")
    print(f"Total Cases:     {test_ranking['total_cases']}")

    # Feature Importance
    importances = rf.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    top_features = []
    print("\n--- TOP 10 FORENSIC FEATURE IMPORTANCES ---")
    for rank, idx in enumerate(sorted_idx[:10], 1):
        feat_name = FEATURE_COLUMNS[idx]
        imp_val = round(float(importances[idx]), 4)
        top_features.append({"rank": rank, "feature": feat_name, "importance": imp_val})
        print(f"  {rank:>2}. {feat_name:<28} : {imp_val:.4f}")

    # Flagship Demo Scenario Evaluation
    print("\n[5/5] Evaluating Held-Out Flagship Demo Scenario Predictions...")
    demo_inst = [d for d in test_inst if d["group_id"] == "group_demo_flagship"]
    flagship_hops = [
        ("Victim-001", "A102", "TXN-84921", 75000.0),
        ("A102", "B552", "TXN-84922", 73500.0),
        ("B552", "C771", "TXN-84923", 70000.0),
        ("C771", "D334", "TXN-84924", 68000.0),
        ("D334", "E889", "TXN-84925", 65500.0)
    ]

    demo_results = []
    for curr_acc, expected_next, txn_id, amt in flagship_hops:
        match = next((d for d in demo_inst if d["curr_acc"] == curr_acc and d["true_dest"] == expected_next), None)
        if match:
            cands = match["candidates"]
            cand_df = pd.DataFrame([{k: c[k] for k in FEATURE_COLUMNS} for c in cands])
            probs = rf.predict_proba(cand_df)[:, 1]

            ranked = []
            for i, c in enumerate(cands):
                ranked.append({
                    "account": c["candidate_account"],
                    "score": round(float(probs[i]), 4),
                    "is_expected": bool(c["candidate_account"] == expected_next)
                })
            ranked.sort(key=lambda x: x["score"], reverse=True)

            true_rank = next((r for r, sc in enumerate(ranked, 1) if sc["is_expected"]), -1)
            demo_results.append({
                "current_account": curr_acc,
                "expected_next": expected_next,
                "txn_id": txn_id,
                "amount": amt,
                "predicted_rank": true_rank,
                "top_candidates": ranked[:3]
            })

            print(f"\nCurrent: {curr_acc:<10} | Inbound Txn: {txn_id} (INR {amt:,.0f})")
            print(f"  -> Expected Next: {expected_next:<8} | Actual Model Rank: #{true_rank}")
            print(f"  Top Ranked Candidates:")
            for r_i, c_info in enumerate(ranked[:3], 1):
                marker = " [CORRECT TARGET]" if c_info["is_expected"] else ""
                print(f"    #{r_i}: {c_info['account']:<12} (Score: {c_info['score']*100:.1f}%){marker}")

    # Save artifacts
    model_save_path = MODEL_DIR / "next_hop_model.joblib"
    joblib.dump(rf, model_save_path)

    metadata = {
        "model_name": "NextHopRankingRandomForest",
        "model_version": "1.0.0",
        "model_type": "RandomForestClassifier (Pairwise Candidate Ranking)",
        "random_seed": RANDOM_SEED,
        "hyperparameters": {
            "n_estimators": 100,
            "max_depth": 6,
            "min_samples_split": 4,
            "min_samples_leaf": 2,
            "class_weight": "balanced"
        },
        "features": FEATURE_COLUMNS,
        "split_metadata": split_meta,
        "validation_metrics": val_ranking,
        "test_metrics": test_ranking,
        "top_features": top_features,
        "demo_results": demo_results
    }

    with open(MODEL_DIR / "next_hop_model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nModel artifact saved to: {model_save_path}")
    print(f"Metadata saved to:       {MODEL_DIR / 'next_hop_model_metadata.json'}")
    print("=" * 65)


if __name__ == "__main__":
    train_and_evaluate()
