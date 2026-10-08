"""
Data Loader & State Manager for Money Trail Hunter.
Loads synthetic account and transaction data, constructs indexes for instant graph traversal,
and pre-warms ML models to ensure zero cold-start response latency.
Supports active scenario switching for small, responsive hackathon demonstrations.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Any
import logging

from app.config import DATA_DIR
from app.ml.inference import get_risk_model, predict_account_risk
from app.ml.features import extract_account_features
from app.ml.next_hop_inference import get_next_hop_model
from app.scenarios import get_flagship_scenario, get_active_or_next_scenario

logger = logging.getLogger(__name__)


class DataManager:
    """In-memory cache and indexing for accounts, transactions, and risk scores."""
    
    def __init__(self):
        # Reference dataset (keeps the large training dataset safely in memory / disk)
        self.ref_accounts: List[Dict[str, Any]] = []
        self.ref_transactions: List[Dict[str, Any]] = []

        # Active scenario dataset (small, fast, 6–10 accounts for UI / graph)
        self.accounts: List[Dict[str, Any]] = []
        self.transactions: List[Dict[str, Any]] = []
        self.accounts_by_id: Dict[str, Dict[str, Any]] = {}
        self.transactions_by_id: Dict[str, Dict[str, Any]] = {}
        self.transactions_by_sender: Dict[str, List[Dict[str, Any]]] = {}
        self.transactions_by_recipient: Dict[str, List[Dict[str, Any]]] = {}
        self.account_risk_cache: Dict[str, Dict[str, Any]] = {}

        self.active_scenario_info: Dict[str, Any] = {}
        self.is_loaded: bool = False
        self.risk_model_ready: bool = False
        self.next_hop_model_ready: bool = False

    def load(self):
        """Load reference datasets, pre-warm ML models, and initialize active demo scenario."""
        accounts_file = DATA_DIR / "accounts.json"
        transactions_file = DATA_DIR / "transactions.json"

        if accounts_file.exists():
            with open(accounts_file, "r", encoding="utf-8") as f:
                self.ref_accounts = json.load(f)
        if transactions_file.exists():
            with open(transactions_file, "r", encoding="utf-8") as f:
                self.ref_transactions = json.load(f)

        # Pre-warm ML models
        try:
            get_risk_model()
            self.risk_model_ready = True
        except Exception as e:
            logger.error(f"Failed to load risk model: {e}")
            self.risk_model_ready = False

        try:
            get_next_hop_model()
            self.next_hop_model_ready = True
        except Exception as e:
            logger.error(f"Failed to load next-hop model: {e}")
            self.next_hop_model_ready = False

        # Load initial scenario: stable Flagship (TXN-84921)
        self.set_scenario(get_flagship_scenario())
        self.is_loaded = True

    def set_scenario(self, scenario_data: Dict[str, Any]):
        """
        Installs a scenario as the active dataset, rebuilds indexes, and executes
        ML feature extraction + inference across all accounts in the scenario.
        """
        self.accounts = scenario_data.get("accounts", [])
        self.transactions = scenario_data.get("transactions", [])
        self.active_scenario_info = {
            "id": scenario_data.get("id", "scenario-flagship"),
            "name": scenario_data.get("name", "Flagship: Multi-Hop Scam Network"),
            "narrative": scenario_data.get("narrative", ""),
            "starting_transaction_id": scenario_data.get("starting_transaction_id", "TXN-84921"),
            "starting_account_id": scenario_data.get("starting_account_id", "A102"),
            "accounts_count": len(self.accounts),
            "transactions_count": len(self.transactions)
        }

        # Build indexes
        self.accounts_by_id = {str(acc["id"]): acc for acc in self.accounts if "id" in acc}
        self.transactions_by_id = {str(txn["id"]): txn for txn in self.transactions if "id" in txn}

        self.transactions_by_sender = {}
        self.transactions_by_recipient = {}

        for txn in self.transactions:
            sender = str(txn.get("fromAccount", ""))
            recipient = str(txn.get("toAccount", ""))
            
            if sender:
                self.transactions_by_sender.setdefault(sender, []).append(txn)
            if recipient:
                self.transactions_by_recipient.setdefault(recipient, []).append(txn)

        # Sort indexed transactions chronologically by timeEpoch
        for sender in self.transactions_by_sender:
            self.transactions_by_sender[sender].sort(key=lambda t: int(t.get("timeEpoch", 0)))

        for recipient in self.transactions_by_recipient:
            self.transactions_by_recipient[recipient].sort(key=lambda t: int(t.get("timeEpoch", 0)))

        # Invalidate and recompute risk cache using trained Random Forest model
        self.account_risk_cache = {}
        if self.risk_model_ready:
            for acc in self.accounts:
                acc_id = str(acc["id"])
                feats = extract_account_features(acc_id, self.transactions, self.accounts_by_id)
                risk_res = predict_account_risk(feats)
                self.account_risk_cache[acc_id] = {
                    "account_id": acc_id,
                    "account_name": acc.get("name", acc_id),
                    "account_type": acc.get("accountType", "Account"),
                    "predicted_class": risk_res["risk_classification"],
                    "risk_probability": risk_res["risk_probability"],
                    "risk_level": risk_res["risk_level"],
                    "model_name": risk_res["model_name"],
                    "model_version": risk_res["model_version"],
                    "features": risk_res["features_used"]
                }

        # Import invalidate function lazily to avoid circular imports
        try:
            from app.graph.communities import invalidate_graph_cache
            invalidate_graph_cache()
        except ImportError:
            pass

        logger.info(
            f"Active scenario set to '{self.active_scenario_info['name']}': "
            f"{len(self.accounts)} accounts, {len(self.transactions)} transactions."
        )

    def refresh_scenario(self, specific_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Switches to the next synthetic scenario or a specifically requested one.
        Returns the new active scenario summary.
        """
        new_sc = get_active_or_next_scenario(cycle=(specific_id is None), specific_id=specific_id)
        self.set_scenario(new_sc)
        return self.get_active_scenario()

    def get_active_scenario(self) -> Dict[str, Any]:
        """Retrieve current active scenario descriptor and telemetry summary."""
        return {
            **self.active_scenario_info,
            "suspicious_accounts_count": sum(
                1 for r in self.account_risk_cache.values() if r.get("predicted_class") == "SUSPICIOUS"
            )
        }

    def get_account(self, account_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve account metadata by ID from active scenario."""
        return self.accounts_by_id.get(str(account_id))

    def get_transaction(self, txn_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve transaction by ID from active scenario."""
        return self.transactions_by_id.get(str(txn_id))

    def get_outgoing_transactions(self, account_id: str, min_epoch: Optional[int] = None) -> List[Dict[str, Any]]:
        """Retrieve chronologically ordered outgoing transactions from account."""
        txns = self.transactions_by_sender.get(str(account_id), [])
        if min_epoch is not None:
            return [t for t in txns if int(t.get("timeEpoch", 0)) >= min_epoch]
        return txns

    def get_incoming_transactions(self, account_id: str, min_epoch: Optional[int] = None) -> List[Dict[str, Any]]:
        """Retrieve chronologically ordered incoming transactions to account."""
        txns = self.transactions_by_recipient.get(str(account_id), [])
        if min_epoch is not None:
            return [t for t in txns if int(t.get("timeEpoch", 0)) >= min_epoch]
        return txns

    def get_account_risk(self, account_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve or dynamically compute risk score for an account."""
        acc_id = str(account_id)
        if acc_id in self.account_risk_cache:
            return self.account_risk_cache[acc_id]

        acc = self.get_account(acc_id)
        if not acc:
            return None

        feats = extract_account_features(acc_id, self.transactions, self.accounts_by_id)
        risk_res = predict_account_risk(feats)
        risk_data = {
            "account_id": acc_id,
            "account_name": acc.get("name", acc_id),
            "account_type": acc.get("accountType", "Account"),
            "predicted_class": risk_res["risk_classification"],
            "risk_probability": risk_res["risk_probability"],
            "risk_level": risk_res["risk_level"],
            "model_name": risk_res["model_name"],
            "model_version": risk_res["model_version"],
            "features": risk_res["features_used"]
        }
        self.account_risk_cache[acc_id] = risk_data
        return risk_data

    def get_all_accounts(self) -> List[Dict[str, Any]]:
        return self.accounts

    def get_all_transactions(self) -> List[Dict[str, Any]]:
        return self.transactions


# Global singleton instance
data_manager = DataManager()
