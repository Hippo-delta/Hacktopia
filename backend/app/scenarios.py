"""
Small, Coherent Synthetic Scenarios Engine for Money Trail Hunter.
Provides curated and dynamically generated investigation scenarios tailored for hackathon demonstration:
- 6–10 visible accounts
- 12–25 transactions
- 3–4 modularity-based communities
- 1 clear, explainable suspicious money trail (rapid layering, mule chain, or structuring)
- Benign accounts and transactions to provide contrast for the ML classifier.
"""

import copy
import random
from typing import Dict, Any, List

# Stable base epoch: Oct 8, 2026, 09:00:00 AM IST
BASE_EPOCH = 1791430200


def get_flagship_scenario() -> Dict[str, Any]:
    """
    Scenario 1: Flagship Multi-Hop Scam Network (TXN-84921).
    Victim-001 -> A102 -> B552 -> C771 -> D334 -> E889
    Amount: ₹75,000 -> ₹65,500 across 5 hops in 13 minutes.
    Plus 3 benign accounts with legitimate merchant activity.
    Total: 9 accounts, 16 transactions, ~3 communities.
    """
    accounts = [
        # --- Flagship Scam Trail Accounts ---
        {
            "id": "Victim-001",
            "name": "Devendra K. (Reporting Victim)",
            "accountType": "Savings Account",
            "accountAgeDays": 1420,
            "currentBalance": 32400.0,
            "behavior_class": "victim",
            "is_suspicious": 0,
            "communityId": "Community #04",
            "region": "Region C",
            "status": "Active"
        },
        {
            "id": "A102",
            "name": "Aman Deep (Sole Prop / Mule L1)",
            "accountType": "Current / Sole Prop",
            "accountAgeDays": 24,
            "currentBalance": 1500.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #17",
            "region": "Region A",
            "status": "Flagged for Review"
        },
        {
            "id": "B552",
            "name": "Bharat Logix Traders (Mule L2)",
            "accountType": "Current Account",
            "accountAgeDays": 41,
            "currentBalance": 3200.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #17",
            "region": "Region A",
            "status": "Investigating"
        },
        {
            "id": "C771",
            "name": "Chirag Tech Solutions (Mule L3)",
            "accountType": "Current Account",
            "accountAgeDays": 35,
            "currentBalance": 2100.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #17",
            "region": "Region A",
            "status": "Investigating"
        },
        {
            "id": "D334",
            "name": "Dhanraj Bullion Trading (Off-Ramp L4)",
            "accountType": "Commercial Current",
            "accountAgeDays": 180,
            "currentBalance": 18400.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #17",
            "region": "Region A",
            "status": "Critical Review"
        },
        {
            "id": "E889",
            "name": "Everest Remittance Hub (Cashout Terminal)",
            "accountType": "Virtual Escrow",
            "accountAgeDays": 12,
            "currentBalance": 500.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #17",
            "region": "Region B",
            "status": "Under Surveillance"
        },
        # --- Benign Context Accounts ---
        {
            "id": "NORM-01",
            "name": "Sunil Verma (Retail Customer)",
            "accountType": "Savings Account",
            "accountAgeDays": 890,
            "currentBalance": 54200.0,
            "behavior_class": "normal",
            "is_suspicious": 0,
            "communityId": "Community #01",
            "region": "Region C",
            "status": "Active"
        },
        {
            "id": "NORM-02",
            "name": "Pooja Sharma (Salaried Professional)",
            "accountType": "Salary Account",
            "accountAgeDays": 1120,
            "currentBalance": 87300.0,
            "behavior_class": "normal",
            "is_suspicious": 0,
            "communityId": "Community #01",
            "region": "Region C",
            "status": "Active"
        },
        {
            "id": "MERCH-01",
            "name": "Metro Retail Groceries",
            "accountType": "Merchant Current",
            "accountAgeDays": 1540,
            "currentBalance": 214000.0,
            "behavior_class": "merchant",
            "is_suspicious": 0,
            "communityId": "Community #02",
            "region": "Region B",
            "status": "Active"
        }
    ]

    transactions = [
        # --- Flagship 5-Hop Trail ---
        {
            "id": "TXN-84921",
            "fromAccount": "Victim-001",
            "toAccount": "A102",
            "amount": 75000.0,
            "timestamp": "2026-10-08 10:15 AM",
            "timeEpoch": 1791434700,
            "channel": "IMPS",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Reported scam debit: Digital arrest threat payment into mule layer 1",
            "isScamTrail": True
        },
        {
            "id": "TXN-84922",
            "fromAccount": "A102",
            "toAccount": "B552",
            "amount": 73500.0,
            "timestamp": "2026-10-08 10:18 AM",
            "timeEpoch": 1791434880,
            "channel": "IMPS",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Hop 2: 3-minute delay pass-through (INR 1,500 mule commission retained)",
            "isScamTrail": True
        },
        {
            "id": "TXN-84923",
            "fromAccount": "B552",
            "toAccount": "C771",
            "amount": 70000.0,
            "timestamp": "2026-10-08 10:20 AM",
            "timeEpoch": 1791435000,
            "channel": "IMPS",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Hop 3: 2-minute delay onward transfer to tech proxy account",
            "isScamTrail": True
        },
        {
            "id": "TXN-84924",
            "fromAccount": "C771",
            "toAccount": "D334",
            "amount": 68000.0,
            "timestamp": "2026-10-08 10:24 AM",
            "timeEpoch": 1791435240,
            "channel": "RTGS",
            "riskLevel": "HIGH",
            "status": "Completed",
            "notes": "Hop 4: 4-minute delay transfer to Bullion merchant off-ramp",
            "isScamTrail": True
        },
        {
            "id": "TXN-84925",
            "fromAccount": "D334",
            "toAccount": "E889",
            "amount": 65500.0,
            "timestamp": "2026-10-08 10:28 AM",
            "timeEpoch": 1791435480,
            "channel": "NEFT",
            "riskLevel": "HIGH",
            "status": "Completed",
            "notes": "Hop 5: Subsequent transfer to virtual remittance escrow",
            "isScamTrail": True
        },
        # --- Prior historical connections establishing causal graph state for ML ---
        {
            "id": "TXN-HIST-01",
            "fromAccount": "A102",
            "toAccount": "B552",
            "amount": 25000.0,
            "timestamp": "2026-10-08 09:10 AM",
            "timeEpoch": 1791430800,
            "channel": "IMPS",
            "riskLevel": "MEDIUM",
            "status": "Completed",
            "notes": "Historical test transfer establishing A102 -> B552 link",
            "isScamTrail": False
        },
        {
            "id": "TXN-HIST-02",
            "fromAccount": "B552",
            "toAccount": "C771",
            "amount": 30000.0,
            "timestamp": "2026-10-08 09:20 AM",
            "timeEpoch": 1791431400,
            "channel": "IMPS",
            "riskLevel": "MEDIUM",
            "status": "Completed",
            "notes": "Historical channel setup transfer",
            "isScamTrail": False
        },
        {
            "id": "TXN-HIST-03",
            "fromAccount": "C771",
            "toAccount": "D334",
            "amount": 35000.0,
            "timestamp": "2026-10-08 09:30 AM",
            "timeEpoch": 1791432000,
            "channel": "RTGS",
            "riskLevel": "MEDIUM",
            "status": "Completed",
            "notes": "Historical channel setup transfer",
            "isScamTrail": False
        },
        {
            "id": "TXN-HIST-04",
            "fromAccount": "D334",
            "toAccount": "E889",
            "amount": 28000.0,
            "timestamp": "2026-10-08 09:40 AM",
            "timeEpoch": 1791432600,
            "channel": "NEFT",
            "riskLevel": "MEDIUM",
            "status": "Completed",
            "notes": "Historical test remittance link",
            "isScamTrail": False
        },
        # --- Legitimate Transactions (Community #01 and #02) ---
        {
            "id": "TXN-BENIGN-01",
            "fromAccount": "NORM-01",
            "toAccount": "MERCH-01",
            "amount": 2450.0,
            "timestamp": "2026-10-08 09:15 AM",
            "timeEpoch": 1791431100,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Grocery invoice payment",
            "isScamTrail": False
        },
        {
            "id": "TXN-BENIGN-02",
            "fromAccount": "NORM-02",
            "toAccount": "MERCH-01",
            "amount": 3800.0,
            "timestamp": "2026-10-08 09:35 AM",
            "timeEpoch": 1791432300,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Retail merchandise purchase",
            "isScamTrail": False
        },
        {
            "id": "TXN-BENIGN-03",
            "fromAccount": "NORM-01",
            "toAccount": "NORM-02",
            "amount": 5000.0,
            "timestamp": "2026-10-08 09:50 AM",
            "timeEpoch": 1791433200,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Family peer transfer",
            "isScamTrail": False
        },
        {
            "id": "TXN-BENIGN-04",
            "fromAccount": "Victim-001",
            "toAccount": "MERCH-01",
            "amount": 1200.0,
            "timestamp": "2026-10-08 09:05 AM",
            "timeEpoch": 1791430500,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Utility bill settlement",
            "isScamTrail": False
        },
        {
            "id": "TXN-BENIGN-05",
            "fromAccount": "NORM-02",
            "toAccount": "NORM-01",
            "amount": 4500.0,
            "timestamp": "2026-10-08 10:05 AM",
            "timeEpoch": 1791434100,
            "channel": "IMPS",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Reimbursement",
            "isScamTrail": False
        }
    ]

    return {
        "id": "scenario-flagship",
        "name": "Flagship: Multi-Hop Scam Network (TXN-84921)",
        "narrative": "Digital Arrest scam: ₹75,000 victim funds routed across 4 rapid mule hops to virtual escrow within 13 minutes.",
        "starting_transaction_id": "TXN-84921",
        "starting_account_id": "A102",
        "accounts": accounts,
        "transactions": transactions
    }


def generate_scenario_rapid_layering(seed_offset: int = 1) -> Dict[str, Any]:
    """
    Scenario 2: Rapid Mule Layering Syndicate (INR 1,20,000).
    Victim-201 -> MULE-X1 -> MULE-X2 -> MULE-X3 -> CASHOUT-99
    High velocity pass-through (2–3 min latency per hop).
    Total: 8 accounts, 14 transactions, ~3 communities.
    """
    base_t = BASE_EPOCH + seed_offset * 7200
    accounts = [
        # Victim
        {
            "id": "Victim-201",
            "name": "Kavita Rao (Reporting Complainant)",
            "accountType": "Savings Account",
            "accountAgeDays": 1250,
            "currentBalance": 45000.0,
            "behavior_class": "victim",
            "is_suspicious": 0,
            "communityId": "Community #01",
            "region": "Region C",
            "status": "Active"
        },
        # Layer 1
        {
            "id": "MULE-X1",
            "name": "QuickPay Enterprise (Layer 1 Mule)",
            "accountType": "Sole Proprietorship",
            "accountAgeDays": 19,
            "currentBalance": 1200.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #02",
            "region": "Region A",
            "status": "Flagged for Review"
        },
        # Layer 2
        {
            "id": "MULE-X2",
            "name": "Apex Logistics Services (Layer 2 Mule)",
            "accountType": "Current Account",
            "accountAgeDays": 28,
            "currentBalance": 2100.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #02",
            "region": "Region A",
            "status": "Investigating"
        },
        # Layer 3
        {
            "id": "MULE-X3",
            "name": "Nexus Trading Co. (Layer 3 Mule)",
            "accountType": "Current Account",
            "accountAgeDays": 33,
            "currentBalance": 1800.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #02",
            "region": "Region B",
            "status": "Investigating"
        },
        # Exit
        {
            "id": "CASHOUT-99",
            "name": "Global Gold & Bullion (Exit Vault)",
            "accountType": "Commercial Current",
            "accountAgeDays": 95,
            "currentBalance": 8500.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #02",
            "region": "Region B",
            "status": "Critical Review"
        },
        # Benign accounts
        {
            "id": "BENIGN-21",
            "name": "Rajesh Kumar (Teacher)",
            "accountType": "Savings Account",
            "accountAgeDays": 920,
            "currentBalance": 62000.0,
            "behavior_class": "normal",
            "is_suspicious": 0,
            "communityId": "Community #03",
            "region": "Region C",
            "status": "Active"
        },
        {
            "id": "BENIGN-22",
            "name": "Meera Joshi (Consultant)",
            "accountType": "Savings Account",
            "accountAgeDays": 740,
            "currentBalance": 110000.0,
            "behavior_class": "normal",
            "is_suspicious": 0,
            "communityId": "Community #03",
            "region": "Region C",
            "status": "Active"
        },
        {
            "id": "MERCH-20",
            "name": "City Mart Supermarket",
            "accountType": "Merchant Current",
            "accountAgeDays": 1400,
            "currentBalance": 185000.0,
            "behavior_class": "merchant",
            "is_suspicious": 0,
            "communityId": "Community #03",
            "region": "Region C",
            "status": "Active"
        }
    ]

    start_txn_id = f"TXN-RL-{seed_offset:02d}01"
    transactions = [
        # Scam money trail: ₹1,20,000 -> ₹1,12,000
        {
            "id": start_txn_id,
            "fromAccount": "Victim-201",
            "toAccount": "MULE-X1",
            "amount": 120000.0,
            "timestamp": "2026-10-08 11:00 AM",
            "timeEpoch": base_t,
            "channel": "RTGS",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Phishing fraud debit: Urgent wire into L1 mule account",
            "isScamTrail": True
        },
        {
            "id": f"TXN-RL-{seed_offset:02d}02",
            "fromAccount": "MULE-X1",
            "toAccount": "MULE-X2",
            "amount": 117500.0,
            "timestamp": "2026-10-08 11:03 AM",
            "timeEpoch": base_t + 180,
            "channel": "IMPS",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Hop 2: 3-minute rapid transfer (₹2,500 retained)",
            "isScamTrail": True
        },
        {
            "id": f"TXN-RL-{seed_offset:02d}03",
            "fromAccount": "MULE-X2",
            "toAccount": "MULE-X3",
            "amount": 115000.0,
            "timestamp": "2026-10-08 11:05 AM",
            "timeEpoch": base_t + 300,
            "channel": "IMPS",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Hop 3: 2-minute rapid transfer (₹2,500 retained)",
            "isScamTrail": True
        },
        {
            "id": f"TXN-RL-{seed_offset:02d}04",
            "fromAccount": "MULE-X3",
            "toAccount": "CASHOUT-99",
            "amount": 112000.0,
            "timestamp": "2026-10-08 11:08 AM",
            "timeEpoch": base_t + 480,
            "channel": "RTGS",
            "riskLevel": "HIGH",
            "status": "Completed",
            "notes": "Hop 4: 3-minute transfer to physical bullion OTC desk",
            "isScamTrail": True
        },
        # Historical ties between mules
        {
            "id": f"TXN-RL-H01",
            "fromAccount": "MULE-X1",
            "toAccount": "MULE-X2",
            "amount": 40000.0,
            "timestamp": "2026-10-08 09:30 AM",
            "timeEpoch": base_t - 3600,
            "channel": "IMPS",
            "riskLevel": "MEDIUM",
            "status": "Completed",
            "notes": "Historical route setup",
            "isScamTrail": False
        },
        {
            "id": f"TXN-RL-H02",
            "fromAccount": "MULE-X2",
            "toAccount": "MULE-X3",
            "amount": 35000.0,
            "timestamp": "2026-10-08 09:40 AM",
            "timeEpoch": base_t - 3000,
            "channel": "IMPS",
            "riskLevel": "MEDIUM",
            "status": "Completed",
            "notes": "Historical route setup",
            "isScamTrail": False
        },
        {
            "id": f"TXN-RL-H03",
            "fromAccount": "MULE-X3",
            "toAccount": "CASHOUT-99",
            "amount": 50000.0,
            "timestamp": "2026-10-08 09:50 AM",
            "timeEpoch": base_t - 2400,
            "channel": "RTGS",
            "riskLevel": "MEDIUM",
            "status": "Completed",
            "notes": "Historical cashout trial",
            "isScamTrail": False
        },
        # Benign retail transactions
        {
            "id": f"TXN-RL-B01",
            "fromAccount": "BENIGN-21",
            "toAccount": "MERCH-20",
            "amount": 1500.0,
            "timestamp": "2026-10-08 10:10 AM",
            "timeEpoch": base_t - 1800,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Daily purchase",
            "isScamTrail": False
        },
        {
            "id": f"TXN-RL-B02",
            "fromAccount": "BENIGN-22",
            "toAccount": "MERCH-20",
            "amount": 4200.0,
            "timestamp": "2026-10-08 10:20 AM",
            "timeEpoch": base_t - 1200,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Office supplies",
            "isScamTrail": False
        },
        {
            "id": f"TXN-RL-B03",
            "fromAccount": "BENIGN-21",
            "toAccount": "BENIGN-22",
            "amount": 8000.0,
            "timestamp": "2026-10-08 10:30 AM",
            "timeEpoch": base_t - 600,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "P2P transfer",
            "isScamTrail": False
        },
        {
            "id": f"TXN-RL-B04",
            "fromAccount": "Victim-201",
            "toAccount": "MERCH-20",
            "amount": 950.0,
            "timestamp": "2026-10-08 09:15 AM",
            "timeEpoch": base_t - 4500,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Baseline merchant payment",
            "isScamTrail": False
        }
    ]

    return {
        "id": f"scenario-rapid-{seed_offset}",
        "name": "Rapid 4-Hop Layering Syndicate",
        "narrative": "High-velocity pass-through: ₹1,20,000 drained through 3 mule intermediaries to bullion cashout in under 8 minutes.",
        "starting_transaction_id": start_txn_id,
        "starting_account_id": "MULE-X1",
        "accounts": accounts,
        "transactions": transactions
    }


def generate_scenario_splitter_structuring(seed_offset: int = 1) -> Dict[str, Any]:
    """
    Scenario 3: Structuring / Splitter Laundering Syndicate (INR 95,000).
    Victim-301 -> MULE-SPLIT -> MULE-Y1 (₹48,000) & MULE-Y2 (₹45,000) -> CRYPTO-ESCROW
    Layering just below statutory reporting limit of INR 50,000.
    Total: 8 accounts, 15 transactions, ~3 communities.
    """
    base_t = BASE_EPOCH + seed_offset * 14400
    accounts = [
        # Victim
        {
            "id": "Victim-301",
            "name": "Ananya Sen (Elderly Complainant)",
            "accountType": "Savings Account",
            "accountAgeDays": 1600,
            "currentBalance": 28000.0,
            "behavior_class": "victim",
            "is_suspicious": 0,
            "communityId": "Community #01",
            "region": "Region B",
            "status": "Active"
        },
        # Splitter Mule
        {
            "id": "MULE-SPLIT",
            "name": "Falcon Financial Services (Splitter Mule)",
            "accountType": "Current / Sole Prop",
            "accountAgeDays": 22,
            "currentBalance": 1100.0,
            "behavior_class": "structuring",
            "is_suspicious": 1,
            "communityId": "Community #02",
            "region": "Region A",
            "status": "Flagged for Review"
        },
        # Split Branch A
        {
            "id": "MULE-Y1",
            "name": "Yash Express Courier (Branch A)",
            "accountType": "Current Account",
            "accountAgeDays": 31,
            "currentBalance": 1900.0,
            "behavior_class": "structuring",
            "is_suspicious": 1,
            "communityId": "Community #02",
            "region": "Region A",
            "status": "Investigating"
        },
        # Split Branch B
        {
            "id": "MULE-Y2",
            "name": "Zenith Hardware Supplies (Branch B)",
            "accountType": "Current Account",
            "accountAgeDays": 27,
            "currentBalance": 1400.0,
            "behavior_class": "structuring",
            "is_suspicious": 1,
            "communityId": "Community #02",
            "region": "Region A",
            "status": "Investigating"
        },
        # Reconverge / Exit
        {
            "id": "CRYPTO-ESCROW",
            "name": "BitGateway Settlement Escrow",
            "accountType": "Virtual Escrow",
            "accountAgeDays": 15,
            "currentBalance": 600.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #02",
            "region": "Region B",
            "status": "Critical Review"
        },
        # Benign accounts
        {
            "id": "BENIGN-31",
            "name": "Alok Mishra (Doctor)",
            "accountType": "Savings Account",
            "accountAgeDays": 1050,
            "currentBalance": 94000.0,
            "behavior_class": "normal",
            "is_suspicious": 0,
            "communityId": "Community #03",
            "region": "Region C",
            "status": "Active"
        },
        {
            "id": "BENIGN-32",
            "name": "Sangeeta Nair (Architect)",
            "accountType": "Savings Account",
            "accountAgeDays": 810,
            "currentBalance": 125000.0,
            "behavior_class": "normal",
            "is_suspicious": 0,
            "communityId": "Community #03",
            "region": "Region C",
            "status": "Active"
        },
        {
            "id": "MERCH-30",
            "name": "National Pharmacy & Medical",
            "accountType": "Merchant Current",
            "accountAgeDays": 1650,
            "currentBalance": 310000.0,
            "behavior_class": "merchant",
            "is_suspicious": 0,
            "communityId": "Community #03",
            "region": "Region C",
            "status": "Active"
        }
    ]

    start_txn_id = f"TXN-ST-{seed_offset:02d}01"
    transactions = [
        # Scam deposit
        {
            "id": start_txn_id,
            "fromAccount": "Victim-301",
            "toAccount": "MULE-SPLIT",
            "amount": 95000.0,
            "timestamp": "2026-10-08 12:00 PM",
            "timeEpoch": base_t,
            "channel": "IMPS",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Impersonation scam deposit into splitter mule account",
            "isScamTrail": True
        },
        # Split hop A (structured beneath ₹50,000)
        {
            "id": f"TXN-ST-{seed_offset:02d}02",
            "fromAccount": "MULE-SPLIT",
            "toAccount": "MULE-Y1",
            "amount": 48000.0,
            "timestamp": "2026-10-08 12:03 PM",
            "timeEpoch": base_t + 180,
            "channel": "IMPS",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Structuring split A: ₹48,000 beneath statutory reporting threshold",
            "isScamTrail": True
        },
        # Split hop B (structured beneath ₹50,000)
        {
            "id": f"TXN-ST-{seed_offset:02d}03",
            "fromAccount": "MULE-SPLIT",
            "toAccount": "MULE-Y2",
            "amount": 45000.0,
            "timestamp": "2026-10-08 12:04 PM",
            "timeEpoch": base_t + 240,
            "channel": "IMPS",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Structuring split B: ₹45,000 beneath statutory reporting threshold",
            "isScamTrail": True
        },
        # Reconverge to escrow
        {
            "id": f"TXN-ST-{seed_offset:02d}04",
            "fromAccount": "MULE-Y1",
            "toAccount": "CRYPTO-ESCROW",
            "amount": 46500.0,
            "timestamp": "2026-10-08 12:07 PM",
            "timeEpoch": base_t + 420,
            "channel": "RTGS",
            "riskLevel": "HIGH",
            "status": "Completed",
            "notes": "Hop 3A: Rapid exit into virtual crypto escrow",
            "isScamTrail": True
        },
        {
            "id": f"TXN-ST-{seed_offset:02d}05",
            "fromAccount": "MULE-Y2",
            "toAccount": "CRYPTO-ESCROW",
            "amount": 43800.0,
            "timestamp": "2026-10-08 12:08 PM",
            "timeEpoch": base_t + 480,
            "channel": "NEFT",
            "riskLevel": "HIGH",
            "status": "Completed",
            "notes": "Hop 3B: Rapid exit into virtual crypto escrow",
            "isScamTrail": True
        },
        # Historical ties
        {
            "id": f"TXN-ST-H01",
            "fromAccount": "MULE-SPLIT",
            "toAccount": "MULE-Y1",
            "amount": 45000.0,
            "timestamp": "2026-10-08 10:10 AM",
            "timeEpoch": base_t - 3600,
            "channel": "IMPS",
            "riskLevel": "HIGH",
            "status": "Completed",
            "notes": "Historical structuring setup",
            "isScamTrail": False
        },
        {
            "id": f"TXN-ST-H02",
            "fromAccount": "MULE-SPLIT",
            "toAccount": "MULE-Y2",
            "amount": 42000.0,
            "timestamp": "2026-10-08 10:15 AM",
            "timeEpoch": base_t - 3300,
            "channel": "IMPS",
            "riskLevel": "HIGH",
            "status": "Completed",
            "notes": "Historical structuring setup",
            "isScamTrail": False
        },
        {
            "id": f"TXN-ST-H03",
            "fromAccount": "MULE-Y1",
            "toAccount": "CRYPTO-ESCROW",
            "amount": 40000.0,
            "timestamp": "2026-10-08 10:25 AM",
            "timeEpoch": base_t - 2700,
            "channel": "RTGS",
            "riskLevel": "MEDIUM",
            "status": "Completed",
            "notes": "Historical trial transfer",
            "isScamTrail": False
        },
        # Benign retail transactions
        {
            "id": f"TXN-ST-B01",
            "fromAccount": "BENIGN-31",
            "toAccount": "MERCH-30",
            "amount": 1800.0,
            "timestamp": "2026-10-08 11:15 AM",
            "timeEpoch": base_t - 1500,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Pharmacy billing",
            "isScamTrail": False
        },
        {
            "id": f"TXN-ST-B02",
            "fromAccount": "BENIGN-32",
            "toAccount": "MERCH-30",
            "amount": 3400.0,
            "timestamp": "2026-10-08 11:30 AM",
            "timeEpoch": base_t - 1000,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Medical supplies",
            "isScamTrail": False
        },
        {
            "id": f"TXN-ST-B03",
            "fromAccount": "BENIGN-31",
            "toAccount": "BENIGN-32",
            "amount": 6500.0,
            "timestamp": "2026-10-08 11:45 AM",
            "timeEpoch": base_t - 500,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Consulting reimbursement",
            "isScamTrail": False
        }
    ]

    return {
        "id": f"scenario-structuring-{seed_offset}",
        "name": "Splitter & Structuring Syndicate",
        "narrative": "Structuring ring: ₹95,000 split across two mule branches just below the statutory ₹50k threshold and reconverged in virtual escrow.",
        "starting_transaction_id": start_txn_id,
        "starting_account_id": "MULE-SPLIT",
        "accounts": accounts,
        "transactions": transactions
    }


def generate_scenario_merchant_cashout(seed_offset: int = 1) -> Dict[str, Any]:
    """
    Scenario 4: Merchant Front Cashout (INR 85,000).
    Victim-401 -> MULE-M1 -> MULE-M2 -> SHELL-MERCHANT -> OFFSHORE-WIRE
    Mules laundering through a shell e-commerce entity.
    Total: 8 accounts, 14 transactions, ~3 communities.
    """
    base_t = BASE_EPOCH + seed_offset * 21600
    accounts = [
        # Victim
        {
            "id": "Victim-401",
            "name": "Vikram Seth (Retired Official)",
            "accountType": "Pension Account",
            "accountAgeDays": 1800,
            "currentBalance": 38000.0,
            "behavior_class": "victim",
            "is_suspicious": 0,
            "communityId": "Community #01",
            "region": "Region B",
            "status": "Active"
        },
        # Mule L1
        {
            "id": "MULE-M1",
            "name": "Prism Digital Solutions (Mule L1)",
            "accountType": "Current Account",
            "accountAgeDays": 20,
            "currentBalance": 1500.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #02",
            "region": "Region A",
            "status": "Flagged for Review"
        },
        # Mule L2
        {
            "id": "MULE-M2",
            "name": "Silverline Logistics (Mule L2)",
            "accountType": "Current Account",
            "accountAgeDays": 36,
            "currentBalance": 2400.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #02",
            "region": "Region A",
            "status": "Investigating"
        },
        # Shell Merchant Front
        {
            "id": "SHELL-MERCHANT",
            "name": "Zen E-Commerce Front (Shell Corp)",
            "accountType": "Merchant Current",
            "accountAgeDays": 55,
            "currentBalance": 4500.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #02",
            "region": "Region A",
            "status": "Critical Review"
        },
        # Offshore Wire Terminal
        {
            "id": "OFFSHORE-WIRE",
            "name": "Pacific Trade Remittance (Offshore Terminal)",
            "accountType": "Foreign Exchange Escrow",
            "accountAgeDays": 14,
            "currentBalance": 800.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #02",
            "region": "Region B",
            "status": "Critical Review"
        },
        # Benign accounts
        {
            "id": "BENIGN-41",
            "name": "Rohit Kapoor (Finance Analyst)",
            "accountType": "Salary Account",
            "accountAgeDays": 850,
            "currentBalance": 76000.0,
            "behavior_class": "normal",
            "is_suspicious": 0,
            "communityId": "Community #03",
            "region": "Region C",
            "status": "Active"
        },
        {
            "id": "BENIGN-42",
            "name": "Neha Gupta (Senior Developer)",
            "accountType": "Savings Account",
            "accountAgeDays": 980,
            "currentBalance": 115000.0,
            "behavior_class": "normal",
            "is_suspicious": 0,
            "communityId": "Community #03",
            "region": "Region C",
            "status": "Active"
        },
        {
            "id": "MERCH-40",
            "name": "GreenLeaf Organic Foods",
            "accountType": "Merchant Current",
            "accountAgeDays": 1300,
            "currentBalance": 160000.0,
            "behavior_class": "merchant",
            "is_suspicious": 0,
            "communityId": "Community #03",
            "region": "Region C",
            "status": "Active"
        }
    ]

    start_txn_id = f"TXN-MC-{seed_offset:02d}01"
    transactions = [
        # Scam deposit: ₹85,000 -> ₹78,000
        {
            "id": start_txn_id,
            "fromAccount": "Victim-401",
            "toAccount": "MULE-M1",
            "amount": 85000.0,
            "timestamp": "2026-10-08 01:10 PM",
            "timeEpoch": base_t,
            "channel": "IMPS",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Pension extortion transfer into Layer 1 mule account",
            "isScamTrail": True
        },
        {
            "id": f"TXN-MC-{seed_offset:02d}02",
            "fromAccount": "MULE-M1",
            "toAccount": "MULE-M2",
            "amount": 83000.0,
            "timestamp": "2026-10-08 01:13 PM",
            "timeEpoch": base_t + 180,
            "channel": "IMPS",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Hop 2: 3-minute velocity transfer to secondary mule",
            "isScamTrail": True
        },
        {
            "id": f"TXN-MC-{seed_offset:02d}03",
            "fromAccount": "MULE-M2",
            "toAccount": "SHELL-MERCHANT",
            "amount": 81000.0,
            "timestamp": "2026-10-08 01:16 PM",
            "timeEpoch": base_t + 360,
            "channel": "RTGS",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Hop 3: Infiltration through shell merchant front",
            "isScamTrail": True
        },
        {
            "id": f"TXN-MC-{seed_offset:02d}04",
            "fromAccount": "SHELL-MERCHANT",
            "toAccount": "OFFSHORE-WIRE",
            "amount": 78000.0,
            "timestamp": "2026-10-08 01:20 PM",
            "timeEpoch": base_t + 600,
            "channel": "NEFT",
            "riskLevel": "HIGH",
            "status": "Completed",
            "notes": "Hop 4: Offshore wire remittance exit",
            "isScamTrail": True
        },
        # Historical ties
        {
            "id": f"TXN-MC-H01",
            "fromAccount": "MULE-M1",
            "toAccount": "MULE-M2",
            "amount": 30000.0,
            "timestamp": "2026-10-08 11:30 AM",
            "timeEpoch": base_t - 3600,
            "channel": "IMPS",
            "riskLevel": "MEDIUM",
            "status": "Completed",
            "notes": "Historical route setup",
            "isScamTrail": False
        },
        {
            "id": f"TXN-MC-H02",
            "fromAccount": "MULE-M2",
            "toAccount": "SHELL-MERCHANT",
            "amount": 35000.0,
            "timestamp": "2026-10-08 11:45 AM",
            "timeEpoch": base_t - 2700,
            "channel": "RTGS",
            "riskLevel": "MEDIUM",
            "status": "Completed",
            "notes": "Historical settlement test",
            "isScamTrail": False
        },
        {
            "id": f"TXN-MC-H03",
            "fromAccount": "SHELL-MERCHANT",
            "toAccount": "OFFSHORE-WIRE",
            "amount": 40000.0,
            "timestamp": "2026-10-08 12:00 PM",
            "timeEpoch": base_t - 1800,
            "channel": "NEFT",
            "riskLevel": "MEDIUM",
            "status": "Completed",
            "notes": "Historical FX test",
            "isScamTrail": False
        },
        # Benign retail transactions
        {
            "id": f"TXN-MC-B01",
            "fromAccount": "BENIGN-41",
            "toAccount": "MERCH-40",
            "amount": 2100.0,
            "timestamp": "2026-10-08 12:30 PM",
            "timeEpoch": base_t - 1200,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Food grocery order",
            "isScamTrail": False
        },
        {
            "id": f"TXN-MC-B02",
            "fromAccount": "BENIGN-42",
            "toAccount": "MERCH-40",
            "amount": 3500.0,
            "timestamp": "2026-10-08 12:45 PM",
            "timeEpoch": base_t - 600,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Supermarket billing",
            "isScamTrail": False
        },
        {
            "id": f"TXN-MC-B03",
            "fromAccount": "BENIGN-41",
            "toAccount": "BENIGN-42",
            "amount": 5000.0,
            "timestamp": "2026-10-08 01:00 PM",
            "timeEpoch": base_t - 200,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Dinner bill split",
            "isScamTrail": False
        }
    ]

    return {
        "id": f"scenario-merchant-{seed_offset}",
        "name": "Shell Merchant Cashout Syndicate",
        "narrative": "Merchant infiltration: ₹85,000 extortion funds layered through 2 mules and washed as e-commerce billing before offshore wire remittance.",
        "starting_transaction_id": start_txn_id,
        "starting_account_id": "MULE-M1",
        "accounts": accounts,
        "transactions": transactions
    }


# Catalog of available scenario generator functions
_SCENARIO_GENERATORS = [
    ("flagship", get_flagship_scenario),
    ("rapid_layering", generate_scenario_rapid_layering),
    ("splitter_structuring", generate_scenario_splitter_structuring),
    ("merchant_cashout", generate_scenario_merchant_cashout)
]

_CURRENT_SCENARIO_INDEX = 0
_DYNAMIC_SEED_COUNTER = 1


def get_scenario_catalog() -> List[Dict[str, str]]:
    """List predefined scenario titles and IDs."""
    return [
        {"id": "scenario-flagship", "name": "Flagship: Multi-Hop Scam Network (TXN-84921)", "category": "flagship"},
        {"id": "scenario-rapid", "name": "Rapid 4-Hop Layering Syndicate", "category": "rapid"},
        {"id": "scenario-structuring", "name": "Splitter & Structuring Syndicate", "category": "structuring"},
        {"id": "scenario-merchant", "name": "Shell Merchant Cashout Syndicate", "category": "merchant"}
    ]


def get_active_or_next_scenario(cycle: bool = False, specific_id: str = None) -> Dict[str, Any]:
    """
    Selects scenario. If cycle=True, cycles deterministically to the next scenario in catalog.
    If specific_id is provided, loads that specific scenario.
    """
    global _CURRENT_SCENARIO_INDEX, _DYNAMIC_SEED_COUNTER

    if specific_id:
        if specific_id == "scenario-flagship":
            _CURRENT_SCENARIO_INDEX = 0
            return get_flagship_scenario()
        elif "rapid" in specific_id:
            _CURRENT_SCENARIO_INDEX = 1
            return generate_scenario_rapid_layering(_DYNAMIC_SEED_COUNTER)
        elif "structuring" in specific_id:
            _CURRENT_SCENARIO_INDEX = 2
            return generate_scenario_splitter_structuring(_DYNAMIC_SEED_COUNTER)
        elif "merchant" in specific_id:
            _CURRENT_SCENARIO_INDEX = 3
            return generate_scenario_merchant_cashout(_DYNAMIC_SEED_COUNTER)

    if cycle:
        _CURRENT_SCENARIO_INDEX = (_CURRENT_SCENARIO_INDEX + 1) % len(_SCENARIO_GENERATORS)
        _DYNAMIC_SEED_COUNTER += 1

    generator_type, gen_func = _SCENARIO_GENERATORS[_CURRENT_SCENARIO_INDEX]
    if generator_type == "flagship":
        return gen_func()
    else:
        return gen_func(_DYNAMIC_SEED_COUNTER)
