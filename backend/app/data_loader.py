"""
Data Loader & State Manager for Money Trail Hunter.
Loads synthetic account and transaction data, constructs indexes for instant graph traversal,
and pre-warms ML models to ensure zero cold-start response latency.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Any
import logging

from app.config import DATA_DIR
from app.ml.inference import get_risk_model, predict_account_risk
from app.ml.features import extract_account_features
from app.ml.next_hop_inference import get_next_hop_model

logger = logging.getLogger(__name__)


class DataManager:
    """In-memory cache and indexing for accounts, transactions, and risk scores."""
    
    def __init__(self):
        self.accounts: List[Dict[str, Any]] = []
        self.transactions: List[Dict[str, Any]] = []
        self.accounts_by_id: Dict[str, Dict[str, Any]] = {}
        self.transactions_by_id: Dict[str, Dict[str, Any]] = {}
        self.transactions_by_sender: Dict[str, List[Dict[str, Any]]] = {}
        self.transactions_by_recipient: Dict[str, List[Dict[str, Any]]] = {}
        self.account_risk_cache: Dict[str, Dict[str, Any]] = {}
        self.is_loaded: bool = False
        self.risk_model_ready: bool = False
        self.next_hop_model_ready: bool = False

    def load(self):
        """Load datasets, build fast indexes, and pre-warm ML models."""
        accounts_file = DATA_DIR / "accounts.json"
        transactions_file = DATA_DIR / "transactions.json"

        if not accounts_file.exists():
            raise FileNotFoundError(f"Accounts file not found at: {accounts_file}")
        if not transactions_file.exists():
            raise FileNotFoundError(f"Transactions file not found at: {transactions_file}")

        logger.info(f"Loading accounts from {accounts_file}")
        with open(accounts_file, "r", encoding="utf-8") as f:
            self.accounts = json.load(f)

        logger.info(f"Loading transactions from {transactions_file}")
        with open(transactions_file, "r", encoding="utf-8") as f:
            self.transactions = json.load(f)

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

        # Precompute risk scores for all accounts for instantaneous API performance
        if self.risk_model_ready:
            logger.info("Precomputing account risk scores...")
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
            logger.info(f"Precomputed risk scores for {len(self.account_risk_cache)} accounts.")

        self.is_loaded = True

    def get_account(self, account_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve account metadata by ID."""
        return self.accounts_by_id.get(str(account_id))

    def get_transaction(self, txn_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve transaction by ID."""
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
