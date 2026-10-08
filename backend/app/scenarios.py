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
            "status": "Active",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": None,
            "identity_verification_status": "VERIFIED_INDIVIDUAL",
            "expected_activity_profile": "Personal savings & household retail payments",
            "entity_id": None
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
            "status": "Flagged for Review",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": "unregistered_intermediary",
            "identity_verification_status": "HIGH_RISK_UNVERIFIED",
            "expected_activity_profile": "Recently opened account with sudden high-velocity volume spike",
            "entity_id": None
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
            "status": "Investigating",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": "unregistered_trader",
            "identity_verification_status": "PENDING_KYC",
            "expected_activity_profile": "Layer 2 conduit account with negligible balance retention",
            "entity_id": None
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
            "status": "Investigating",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": "unregistered_proxy",
            "identity_verification_status": "PENDING_KYC",
            "expected_activity_profile": "Layer 3 shell entity with rapid turnaround transfers",
            "entity_id": None
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
            "status": "Critical Review",
            "business_registered": True,
            "gstin_present": True,
            "gstin_number": "07AAACD9981F1Z2",
            "business_category": "bullion_precious_metals",
            "identity_verification_status": "VERIFIED_BUSINESS",
            "expected_activity_profile": "High-value bullion trading with sudden suspicious incoming layering deposits",
            "entity_id": "ENTITY-BULLION-01"
        },
        {
            "id": "E889",
            "name": "Everest Remittance Hub (Cashout Terminal)",
            "accountType": "Virtual Escrow",
            "accountAgeDays": 12,
            "currentBalance": 500.0,
            "behavior_class": "cashout",
            "is_suspicious": 1,
            "communityId": "Community #17",
            "region": "Region B",
            "status": "Under Surveillance",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": "remittance_offramp",
            "identity_verification_status": "HIGH_RISK_UNVERIFIED",
            "expected_activity_profile": "Terminal cashout aggregator with offshore wire dispersal",
            "entity_id": None
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
            "status": "Active",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": None,
            "identity_verification_status": "VERIFIED_INDIVIDUAL",
            "expected_activity_profile": "Individual retail banking & domestic utility payments",
            "entity_id": None
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
            "status": "Active",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": None,
            "identity_verification_status": "VERIFIED_INDIVIDUAL",
            "expected_activity_profile": "Monthly payroll receipts & household discretionary spending",
            "entity_id": None
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
            "status": "Active",
            "business_registered": True,
            "gstin_present": True,
            "gstin_number": "27AABCM8890A1Z5",
            "business_category": "retail_groceries",
            "identity_verification_status": "VERIFIED_BUSINESS",
            "expected_activity_profile": "Continuous micro-collections with bulk supplier reconciliations",
            "entity_id": "ENTITY-METRO-01"
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


def get_baseline_legitimate_scenario() -> Dict[str, Any]:
    """
    Scenario 1: Baseline Legitimate Commercial & Individual Banking.
    Demonstrates:
    1. High-activity legitimate individual (salary + freelance + rental) -> personal spending.
       HIGH TRANSACTION ACTIVITY != AUTOMATIC MULE.
    2. Legitimate multi-account merchant (Entity ID: ENTITY-APEX-01) with internal treasury sweeps.
    3. Normal business B2B invoice reconciliations with established counterparties and 24-48h delays.
    Total: 8 accounts, 12 transactions, ~2-3 modular communities.
    """
    base_t = BASE_EPOCH

    accounts = [
        # --- Legitimate Multi-Account Merchant (Entity: ENTITY-APEX-01) ---
        {
            "id": "MCH-APEX-01",
            "name": "Apex Electronics Ltd (Primary Collections)",
            "accountType": "Commercial Current",
            "accountAgeDays": 920,
            "currentBalance": 345000.0,
            "behavior_class": "merchant",
            "is_suspicious": 0,
            "communityId": "Community #11",
            "region": "Region B",
            "status": "Active",
            "business_registered": True,
            "gstin_present": True,
            "gstin_number": "29AABCA1234F1Z5",
            "business_category": "consumer_electronics",
            "identity_verification_status": "VERIFIED_BUSINESS",
            "expected_activity_profile": "High volume retail customer sales with batch sweeps to operating treasury",
            "entity_id": "ENTITY-APEX-01"
        },
        {
            "id": "MCH-APEX-02",
            "name": "Apex Electronics Ltd (Operating Treasury)",
            "accountType": "Corporate Current",
            "accountAgeDays": 915,
            "currentBalance": 620000.0,
            "behavior_class": "merchant",
            "is_suspicious": 0,
            "communityId": "Community #11",
            "region": "Region B",
            "status": "Active",
            "business_registered": True,
            "gstin_present": True,
            "gstin_number": "29AABCA1234F1Z5",
            "business_category": "consumer_electronics",
            "identity_verification_status": "VERIFIED_BUSINESS",
            "expected_activity_profile": "Internal corporate treasury sweeps, supplier NEFTs & payroll",
            "entity_id": "ENTITY-APEX-01"
        },
        # --- High-Activity Legitimate Individual Edge Case ---
        {
            "id": "INDIV-01",
            "name": "Dr. Vikram Malhotra (Consultant & Landlord)",
            "accountType": "Savings Account",
            "accountAgeDays": 1450,
            "currentBalance": 182000.0,
            "behavior_class": "normal",
            "is_suspicious": 0,
            "communityId": "Community #12",
            "region": "Region A",
            "status": "Active",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": "consultant_individual",
            "identity_verification_status": "VERIFIED_INDIVIDUAL",
            "expected_activity_profile": "Multiple inflows (Hospital retainer + rental income + consulting) with domestic outflows",
            "entity_id": None
        },
        # --- Corporate Counterparties & Customers ---
        {
            "id": "SUPP-01",
            "name": "Silicon Semiconductor Wholesalers",
            "accountType": "Commercial Current",
            "accountAgeDays": 1200,
            "currentBalance": 490000.0,
            "behavior_class": "normal",
            "communityId": "Community #11",
            "region": "Region B",
            "status": "Active",
            "business_registered": True,
            "gstin_present": True,
            "gstin_number": "27AAACW5566K1Z9",
            "business_category": "wholesale_components",
            "identity_verification_status": "VERIFIED_BUSINESS",
            "expected_activity_profile": "B2B vendor billing and raw material consignments",
            "entity_id": "ENTITY-SILICON-01"
        },
        {
            "id": "CUST-01",
            "name": "Ananya Roy (Retail Customer)",
            "accountType": "Savings Account",
            "accountAgeDays": 680,
            "currentBalance": 42000.0,
            "behavior_class": "normal",
            "communityId": "Community #11",
            "region": "Region B",
            "status": "Active",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": None,
            "identity_verification_status": "VERIFIED_INDIVIDUAL",
            "expected_activity_profile": "Household consumer purchases",
            "entity_id": None
        },
        {
            "id": "CUST-02",
            "name": "Rohan Deshmukh (Retail Customer)",
            "accountType": "Savings Account",
            "accountAgeDays": 510,
            "currentBalance": 31500.0,
            "behavior_class": "normal",
            "communityId": "Community #11",
            "region": "Region B",
            "status": "Active",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": None,
            "identity_verification_status": "VERIFIED_INDIVIDUAL",
            "expected_activity_profile": "Household consumer purchases",
            "entity_id": None
        },
        {
            "id": "PAYER-01",
            "name": "Apollo Healthcare Group (Employer)",
            "accountType": "Corporate Current",
            "accountAgeDays": 2200,
            "currentBalance": 2400000.0,
            "behavior_class": "normal",
            "communityId": "Community #12",
            "region": "Region A",
            "status": "Active",
            "business_registered": True,
            "gstin_present": True,
            "gstin_number": "06AAACA1122D1Z4",
            "business_category": "healthcare_provider",
            "identity_verification_status": "VERIFIED_BUSINESS",
            "expected_activity_profile": "Corporate payroll and professional doctor disbursements",
            "entity_id": "ENTITY-APOLLO-01"
        },
        {
            "id": "TENANT-01",
            "name": "Kavita Nair (Tenant)",
            "accountType": "Salary Account",
            "accountAgeDays": 740,
            "currentBalance": 56000.0,
            "behavior_class": "normal",
            "communityId": "Community #12",
            "region": "Region A",
            "status": "Active",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": None,
            "identity_verification_status": "VERIFIED_INDIVIDUAL",
            "expected_activity_profile": "Monthly rent and domestic living expenses",
            "entity_id": None
        }
    ]

    transactions = [
        # Customer retail purchases to Primary Collections
        {
            "id": "TXN-LEG-01",
            "fromAccount": "CUST-01",
            "toAccount": "MCH-APEX-01",
            "amount": 28500.0,
            "timestamp": "2026-10-08 09:30 AM",
            "timeEpoch": base_t - 7200,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Retail electronics purchase invoice #INV-4401",
            "isScamTrail": False
        },
        {
            "id": "TXN-LEG-02",
            "fromAccount": "CUST-02",
            "toAccount": "MCH-APEX-01",
            "amount": 42000.0,
            "timestamp": "2026-10-08 10:15 AM",
            "timeEpoch": base_t - 5400,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Home appliance purchase invoice #INV-4402",
            "isScamTrail": False
        },
        # Same-Entity Treasury Sweep (Internal Liquidity Transfer)
        {
            "id": "TXN-LEG-03",
            "fromAccount": "MCH-APEX-01",
            "toAccount": "MCH-APEX-02",
            "amount": 65000.0,
            "timestamp": "2026-10-08 11:30 AM",
            "timeEpoch": base_t - 1800,
            "channel": "NEFT",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Internal treasury sweep: daily collections consolidated to operating account (ENTITY-APEX-01)",
            "isScamTrail": False
        },
        # Supplier B2B settlement with 24-48h natural commercial turnaround
        {
            "id": "TXN-LEG-04",
            "fromAccount": "MCH-APEX-02",
            "toAccount": "SUPP-01",
            "amount": 125000.0,
            "timestamp": "2026-10-08 01:00 PM",
            "timeEpoch": base_t + 3600,
            "channel": "RTGS",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "B2B invoice settlement PO-88902 with verified GSTIN counterparty",
            "isScamTrail": False
        },
        # Dr. Vikram Malhotra: Inflow 1 - Hospital Professional Consultation
        {
            "id": "TXN-LEG-05",
            "fromAccount": "PAYER-01",
            "toAccount": "INDIV-01",
            "amount": 85000.0,
            "timestamp": "2026-10-08 08:30 AM",
            "timeEpoch": base_t - 9000,
            "channel": "NEFT",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Monthly clinical consulting retainer fee",
            "isScamTrail": False
        },
        # Dr. Vikram Malhotra: Inflow 2 - Apartment Rental Inflow
        {
            "id": "TXN-LEG-06",
            "fromAccount": "TENANT-01",
            "toAccount": "INDIV-01",
            "amount": 32000.0,
            "timestamp": "2026-10-08 09:00 AM",
            "timeEpoch": base_t - 7800,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Monthly residential apartment rent for flat 4B",
            "isScamTrail": False
        },
        # Dr. Vikram Malhotra: Personal Outflow - Family & Household Support
        {
            "id": "TXN-LEG-07",
            "fromAccount": "INDIV-01",
            "toAccount": "CUST-01",
            "amount": 15000.0,
            "timestamp": "2026-10-08 02:30 PM",
            "timeEpoch": base_t + 9000,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Reimbursement for family medical diagnostic tests",
            "isScamTrail": False
        },
        # Additional historical business transactions establishing low-risk graph topology
        {
            "id": "TXN-LEG-08",
            "fromAccount": "MCH-APEX-01",
            "toAccount": "MCH-APEX-02",
            "amount": 55000.0,
            "timestamp": "2026-10-07 05:00 PM",
            "timeEpoch": base_t - 64800,
            "channel": "NEFT",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Previous day collections sweep",
            "isScamTrail": False
        },
        {
            "id": "TXN-LEG-09",
            "fromAccount": "SUPP-01",
            "toAccount": "MCH-APEX-01",
            "amount": 12000.0,
            "timestamp": "2026-10-07 02:00 PM",
            "timeEpoch": base_t - 75600,
            "channel": "NEFT",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Supplier credit note adjustment",
            "isScamTrail": False
        },
        {
            "id": "TXN-LEG-10",
            "fromAccount": "CUST-01",
            "toAccount": "TENANT-01",
            "amount": 5000.0,
            "timestamp": "2026-10-08 03:00 PM",
            "timeEpoch": base_t + 10800,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Peer personal transfer",
            "isScamTrail": False
        },
        {
            "id": "TXN-LEG-11",
            "fromAccount": "INDIV-01",
            "toAccount": "MCH-APEX-01",
            "amount": 8400.0,
            "timestamp": "2026-10-08 04:00 PM",
            "timeEpoch": base_t + 14400,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Personal electronics purchase by Dr. Vikram",
            "isScamTrail": False
        },
        {
            "id": "TXN-LEG-12",
            "fromAccount": "PAYER-01",
            "toAccount": "CUST-02",
            "amount": 35000.0,
            "timestamp": "2026-10-08 08:45 AM",
            "timeEpoch": base_t - 8100,
            "channel": "NEFT",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Hospital staff bi-weekly stipend",
            "isScamTrail": False
        }
    ]

    return {
        "id": "scenario-1",
        "name": "Scenario 1: Baseline Legitimate Banking",
        "narrative": "Legitimate enterprise and individual activity: High-turnover merchant with same-entity treasury sweeps (ENTITY-APEX-01) and high-activity individual (Dr. Vikram Malhotra) receiving multiple legitimate incomes without mule behaviour.",
        "starting_transaction_id": "TXN-LEG-03",
        "starting_account_id": "MCH-APEX-01",
        "accounts": accounts,
        "transactions": transactions
    }


def get_isolated_mule_scenario() -> Dict[str, Any]:
    """
    Scenario 2: Isolated Single Mule Account.
    Pattern:
    Victim -> Newly opened mule account -> Immediate ATM / OTC Cash-Out
    Demonstrates:
    - Mule detection does NOT require a long graph chain.
    - Extreme pass-through ratio (99%) within 4 minutes.
    - Terminal cashout node: Next-hop model reports No reliable downstream account (terminal cashout).
    - Unregistered newly opened account (<30 days old).
    Total: 6 accounts, 6 transactions, ~2 communities.
    """
    base_t = BASE_EPOCH

    accounts = [
        # --- Victim ---
        {
            "id": "VIC-ISO-01",
            "name": "Rajeshwari Devi (Senior Citizen / Victim)",
            "accountType": "Pension Savings",
            "accountAgeDays": 2100,
            "currentBalance": 12800.0,
            "behavior_class": "victim",
            "is_suspicious": 0,
            "communityId": "Community #21",
            "region": "Region C",
            "status": "Active",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": None,
            "identity_verification_status": "VERIFIED_INDIVIDUAL",
            "expected_activity_profile": "Monthly government pension credits and local grocery spend",
            "entity_id": None
        },
        # --- Isolated Mule Account ---
        {
            "id": "MULE-ISO",
            "name": "Karan Mehra (Freshly Opened Mule Account)",
            "accountType": "Savings Basic / Jan Dhan",
            "accountAgeDays": 14,
            "currentBalance": 950.0,
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #22",
            "region": "Region A",
            "status": "Flagged for Review",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": "unregistered_individual",
            "identity_verification_status": "HIGH_RISK_UNVERIFIED",
            "expected_activity_profile": "Dormant newly opened account; sudden single large credit with instantaneous drain",
            "entity_id": None
        },
        # --- Cashout Terminal (No downstream online hops) ---
        {
            "id": "ATM-CASHOUT",
            "name": "ATM Terminal #4402 / Cash Withdrawal",
            "accountType": "Cashout Terminal",
            "accountAgeDays": 1800,
            "currentBalance": 0.0,
            "behavior_class": "cashout",
            "is_suspicious": 1,
            "communityId": "Community #22",
            "region": "Region A",
            "status": "Terminal Point",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": "physical_cash_drain",
            "identity_verification_status": "UNVERIFIED",
            "expected_activity_profile": "Terminal physical cash drainage point with no downstream electronic accounts",
            "entity_id": None
        },
        # --- Benign Normal Accounts for context ---
        {
            "id": "NORM-ISO-01",
            "name": "Alok Kumar (Teacher)",
            "accountType": "Salary Account",
            "accountAgeDays": 840,
            "currentBalance": 62000.0,
            "behavior_class": "normal",
            "is_suspicious": 0,
            "communityId": "Community #21",
            "region": "Region C",
            "status": "Active",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": None,
            "identity_verification_status": "VERIFIED_INDIVIDUAL",
            "expected_activity_profile": "Salary deposit and household retail shopping",
            "entity_id": None
        },
        {
            "id": "NORM-ISO-02",
            "name": "Kiran Dairy Farm",
            "accountType": "Current Account",
            "accountAgeDays": 1100,
            "currentBalance": 115000.0,
            "behavior_class": "merchant",
            "is_suspicious": 0,
            "communityId": "Community #21",
            "region": "Region C",
            "status": "Active",
            "business_registered": True,
            "gstin_present": True,
            "gstin_number": "09AAACD4433E1Z1",
            "business_category": "dairy_farming",
            "identity_verification_status": "VERIFIED_BUSINESS",
            "expected_activity_profile": "Daily dairy supply collections",
            "entity_id": "ENTITY-KIRAN-01"
        },
        {
            "id": "NORM-ISO-03",
            "name": "Suresh Patel (Electrician)",
            "accountType": "Savings Account",
            "accountAgeDays": 620,
            "currentBalance": 24000.0,
            "behavior_class": "normal",
            "is_suspicious": 0,
            "communityId": "Community #21",
            "region": "Region C",
            "status": "Active",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": None,
            "identity_verification_status": "VERIFIED_INDIVIDUAL",
            "expected_activity_profile": "Small service payments and bills",
            "entity_id": None
        }
    ]

    transactions = [
        # Victim extortion debit into isolated mule
        {
            "id": "TXN-ISO-01",
            "fromAccount": "VIC-ISO-01",
            "toAccount": "MULE-ISO",
            "amount": 95000.0,
            "timestamp": "2026-10-08 10:30 AM",
            "timeEpoch": base_t + 1800,
            "channel": "IMPS",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Extortion scam transfer into newly opened Jan Dhan mule account",
            "isScamTrail": True
        },
        # Immediate physical cashout within 4 minutes (99% drained)
        {
            "id": "TXN-ISO-02",
            "fromAccount": "MULE-ISO",
            "toAccount": "ATM-CASHOUT",
            "amount": 94050.0,
            "timestamp": "2026-10-08 10:34 AM",
            "timeEpoch": base_t + 2040,
            "channel": "ATM",
            "riskLevel": "CRITICAL",
            "status": "Completed",
            "notes": "Rapid 4-minute ATM withdrawal draining 99% of credited funds. Terminal cashout.",
            "isScamTrail": True
        },
        # Benign retail transactions in Community #21
        {
            "id": "TXN-ISO-B01",
            "fromAccount": "VIC-ISO-01",
            "toAccount": "NORM-ISO-02",
            "amount": 1400.0,
            "timestamp": "2026-10-08 08:30 AM",
            "timeEpoch": base_t - 5400,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Monthly milk supply payment",
            "isScamTrail": False
        },
        {
            "id": "TXN-ISO-B02",
            "fromAccount": "NORM-ISO-01",
            "toAccount": "NORM-ISO-02",
            "amount": 2200.0,
            "timestamp": "2026-10-08 09:15 AM",
            "timeEpoch": base_t - 2700,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Grocery and dairy purchase",
            "isScamTrail": False
        },
        {
            "id": "TXN-ISO-B03",
            "fromAccount": "NORM-ISO-01",
            "toAccount": "NORM-ISO-03",
            "amount": 3500.0,
            "timestamp": "2026-10-08 09:45 AM",
            "timeEpoch": base_t - 900,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Home electrical repair fee",
            "isScamTrail": False
        },
        {
            "id": "TXN-ISO-B04",
            "fromAccount": "NORM-ISO-03",
            "toAccount": "NORM-ISO-02",
            "amount": 800.0,
            "timestamp": "2026-10-08 10:00 AM",
            "timeEpoch": base_t,
            "channel": "UPI",
            "riskLevel": "LOW",
            "status": "Completed",
            "notes": "Morning milk and curd",
            "isScamTrail": False
        }
    ]

    return {
        "id": "scenario-2",
        "name": "Scenario 2: Isolated Mule Account",
        "narrative": "Isolated mule pattern: Newly opened unverified account receives ₹95,000 victim deposit and drains 99% (₹94,050) at an ATM within 4 minutes without downstream electronic layering.",
        "starting_transaction_id": "TXN-ISO-01",
        "starting_account_id": "MULE-ISO",
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
    ("baseline_legitimate", get_baseline_legitimate_scenario),
    ("isolated_mule", get_isolated_mule_scenario),
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
        {"id": "scenario-1", "name": "Scenario 1: Baseline Legitimate Banking", "category": "baseline_legitimate"},
        {"id": "scenario-2", "name": "Scenario 2: Isolated Mule Account", "category": "isolated_mule"},
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
        sid = specific_id.lower()
        if sid in ("scenario-flagship", "scenario-3", "flagship"):
            _CURRENT_SCENARIO_INDEX = 0
            return get_flagship_scenario()
        elif sid in ("scenario-1", "scenario_1", "baseline", "normal"):
            _CURRENT_SCENARIO_INDEX = 1
            return get_baseline_legitimate_scenario()
        elif sid in ("scenario-2", "scenario_2", "mule", "isolated"):
            _CURRENT_SCENARIO_INDEX = 2
            return get_isolated_mule_scenario()
        elif "rapid" in sid:
            _CURRENT_SCENARIO_INDEX = 3
            return generate_scenario_rapid_layering(_DYNAMIC_SEED_COUNTER)
        elif "structuring" in sid:
            _CURRENT_SCENARIO_INDEX = 4
            return generate_scenario_splitter_structuring(_DYNAMIC_SEED_COUNTER)
        elif "merchant" in sid:
            _CURRENT_SCENARIO_INDEX = 5
            return generate_scenario_merchant_cashout(_DYNAMIC_SEED_COUNTER)

    if cycle:
        _CURRENT_SCENARIO_INDEX = (_CURRENT_SCENARIO_INDEX + 1) % len(_SCENARIO_GENERATORS)
        _DYNAMIC_SEED_COUNTER += 1

    generator_type, gen_func = _SCENARIO_GENERATORS[_CURRENT_SCENARIO_INDEX]
    if generator_type in ("flagship", "baseline_legitimate", "isolated_mule"):
        return gen_func()
    else:
        return gen_func(_DYNAMIC_SEED_COUNTER)
