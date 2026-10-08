"""
Deterministic Synthetic Dataset Generator for Money Trail Hunter.
Produces realistic financial transactions across 5 distinct behavioral populations:
1. Normal retail consumers
2. Legitimate merchants / businesses
3. High-velocity money mules
4. Structuring / layering rings
5. Scam victims

Preserves the flagship Hackatopia 2026 demonstration scenario:
Victim-001 -> A102 -> B552 -> C771 -> D334 -> E889 (TXN-84921 to TXN-84925).
"""

import json
import random
from pathlib import Path
from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np

from app.ml.features import (
    extract_all_account_features,
    extract_next_hop_sequence_samples
)

RANDOM_SEED = 2026
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

BASE_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

# Reference base timestamp: Oct 8, 2026, 09:00:00 AM IST (Epoch 1791430200)
BASE_EPOCH = 1791430200


def generate_synthetic_dataset(
    num_normal: int = 110,
    num_merchants: int = 35,
    num_mules: int = 30,
    num_structuring: int = 20,
    num_victims: int = 15
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Generates synthetic accounts and transactions with realistic behavioral overlap.
    """
    accounts: List[Dict[str, Any]] = []
    transactions: List[Dict[str, Any]] = []
    
    # Track created accounts map
    accounts_by_id: Dict[str, Dict[str, Any]] = {}
    
    # -------------------------------------------------------------
    # 1. CORE HACKATHON DEMONSTRATION ACCOUNTS & TRANSACTIONS
    # -------------------------------------------------------------
    demo_accounts = [
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
        }
    ]
    
    for da in demo_accounts:
        accounts.append(da)
        accounts_by_id[da["id"]] = da
        
    demo_txns = [
        {
            "id": "TXN-84921",
            "fromAccount": "Victim-001",
            "toAccount": "A102",
            "amount": 75000.0,
            "timestamp": "2026-10-08 10:15 AM",
            "timeEpoch": 1791434700, # 10:15 AM
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
            "timeEpoch": 1791434880, # 10:18 AM (3 min delay)
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
            "timeEpoch": 1791435000, # 10:20 AM (2 min delay)
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
            "timeEpoch": 1791435240, # 10:24 AM (4 min delay)
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
            "timeEpoch": 1791435480, # 10:28 AM (4 min delay)
            "channel": "NEFT",
            "riskLevel": "HIGH",
            "status": "Completed",
            "notes": "Hop 5: Subsequent transfer to virtual remittance escrow",
            "isScamTrail": True
        }
    ]
    transactions.extend(demo_txns)

    # -------------------------------------------------------------
    # 2. POPULATION GENERATION: NORMAL CONSUMERS (INCLUDING HIGH-ACTIVITY INDIVIDUALS)
    # -------------------------------------------------------------
    normal_ids = []
    for i in range(1, num_normal + 1):
        acc_id = f"NORM-{1000 + i}"
        normal_ids.append(acc_id)
        # 15% are high-activity legitimate individuals (salaried, consultants, landlords)
        is_high_activity = (i <= 18)
        acc_type = "Salary Account" if is_high_activity else "Savings Account"
        acc_age = random.randint(400, 2400) if is_high_activity else random.randint(180, 2000)
        
        acc = {
            "id": acc_id,
            "name": f"Retail Customer {i}" if not is_high_activity else f"High-Activity Professional {i}",
            "accountType": acc_type,
            "accountAgeDays": acc_age,
            "currentBalance": round(random.uniform(25000.0, 250000.0) if is_high_activity else random.uniform(5000.0, 95000.0), 2),
            "behavior_class": "normal",
            "is_suspicious": 0,
            "communityId": f"Community #0{random.randint(1, 8)}",
            "region": random.choice(["Region A", "Region B", "Region C", "Region D"]),
            "status": "Active",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": "professional_consulting" if is_high_activity else None,
            "identity_verification_status": "VERIFIED_INDIVIDUAL",
            "expected_activity_profile": "Consulting income, rental receipts, and personal household expenditures" if is_high_activity else "Personal retail savings",
            "entity_id": None
        }
        accounts.append(acc)
        accounts_by_id[acc_id] = acc

    # -------------------------------------------------------------
    # 3. POPULATION GENERATION: MERCHANTS & BUSINESSES (INCLUDING MULTI-ACCOUNT ENTITIES)
    # -------------------------------------------------------------
    merchant_ids = []
    # Create several multi-account enterprise entities sharing entity_id
    enterprise_entities = [f"ENTITY-CORP-0{k}" for k in range(1, 8)]

    for i in range(1, num_merchants + 1):
        acc_id = f"MCH-{2000 + i}"
        merchant_ids.append(acc_id)
        
        # 40% belong to multi-account corporate entities
        assigned_entity = enterprise_entities[i % len(enterprise_entities)] if (i <= 16) else f"ENTITY-SOLE-{i}"
        is_collections = (i % 2 == 1)
        acc_type = "Commercial Current" if is_collections else "Operating Treasury"
        
        acc = {
            "id": acc_id,
            "name": f"Enterprise Merchant {i} ({'Collections' if is_collections else 'Treasury'})",
            "accountType": acc_type,
            "accountAgeDays": random.randint(300, 3000),
            "currentBalance": round(random.uniform(50000.0, 850000.0), 2),
            "behavior_class": "merchant",
            "is_suspicious": 0,
            "communityId": f"Community #0{random.randint(1, 5)}",
            "region": random.choice(["Region A", "Region B", "Region C"]),
            "status": "Active",
            "business_registered": True,
            "gstin_present": True,
            "gstin_number": f"{random.randint(10,35)}AABCE{random.randint(1000,9999)}F1Z{random.randint(1,9)}",
            "business_category": random.choice(["retail_distribution", "consumer_electronics", "agro_products", "apparel_logistics"]),
            "identity_verification_status": "VERIFIED_BUSINESS",
            "expected_activity_profile": "Commercial sales receipts, internal treasury sweeps, and supplier vendor settlements",
            "entity_id": assigned_entity
        }
        accounts.append(acc)
        accounts_by_id[acc_id] = acc

    # -------------------------------------------------------------
    # 4. POPULATION GENERATION: MULE ACCOUNTS (SYNDICATES & ISOLATED MULES)
    # -------------------------------------------------------------
    mule_ids = ["A102", "B552", "C771", "D334", "E889"]
    for i in range(1, num_mules + 1):
        acc_id = f"MULE-{3000 + i}"
        mule_ids.append(acc_id)
        is_isolated = (i % 3 == 0)
        acc = {
            "id": acc_id,
            "name": f"Layering Proxy {i}" if not is_isolated else f"Isolated Cashout Mule {i}",
            "accountType": random.choice(["Current / Sole Prop", "Savings Account"]),
            "accountAgeDays": random.randint(10, 40) if is_isolated else random.randint(10, 60), # newly opened
            "currentBalance": round(random.uniform(200.0, 1500.0) if is_isolated else random.uniform(500.0, 4500.0), 2),
            "behavior_class": "mule-like",
            "is_suspicious": 1,
            "communityId": "Community #17" if (i % 2 == 0) else "Community #21",
            "region": random.choice(["Region A", "Region B"]),
            "status": "Flagged for Review",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": "unregistered_intermediary",
            "identity_verification_status": "HIGH_RISK_UNVERIFIED",
            "expected_activity_profile": "Rapid fund drainage with minimal balance holding",
            "entity_id": None
        }
        accounts.append(acc)
        accounts_by_id[acc_id] = acc

    # -------------------------------------------------------------
    # 5. POPULATION GENERATION: STRUCTURING / SPLITTING ACCOUNTS
    # -------------------------------------------------------------
    structuring_ids = ["G443", "M901"]
    for sid in structuring_ids:
        acc = {
            "id": sid,
            "name": f"Structuring Aggregator {sid}",
            "accountType": "Current Account",
            "accountAgeDays": random.randint(15, 90),
            "currentBalance": round(random.uniform(1000.0, 12000.0), 2),
            "behavior_class": "structuring",
            "is_suspicious": 1,
            "communityId": "Community #09",
            "region": "Region B",
            "status": "Escalated",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": "unregistered_shell",
            "identity_verification_status": "PENDING_KYC",
            "expected_activity_profile": "Layering transfers structured below reporting thresholds",
            "entity_id": None
        }
        accounts.append(acc)
        accounts_by_id[sid] = acc

    for i in range(1, num_structuring + 1):
        acc_id = f"STR-{4000 + i}"
        structuring_ids.append(acc_id)
        acc = {
            "id": acc_id,
            "name": f"Threshold Splitter {i}",
            "accountType": "Savings Account",
            "accountAgeDays": random.randint(15, 80),
            "currentBalance": round(random.uniform(800.0, 9500.0), 2),
            "behavior_class": "structuring",
            "is_suspicious": 1,
            "communityId": "Community #09",
            "region": "Region B",
            "status": "Investigating",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": "unregistered_shell",
            "identity_verification_status": "PENDING_KYC",
            "expected_activity_profile": "Structuring disbursements near ₹50,000 threshold",
            "entity_id": None
        }
        accounts.append(acc)
        accounts_by_id[acc_id] = acc

    # -------------------------------------------------------------
    # 6. POPULATION GENERATION: VICTIM ACCOUNTS
    # -------------------------------------------------------------
    victim_ids = ["Victim-001"]
    for i in range(1, num_victims + 1):
        acc_id = f"VCT-{5000 + i}"
        victim_ids.append(acc_id)
        acc = {
            "id": acc_id,
            "name": f"Complainant {i}",
            "accountType": "Savings Account",
            "accountAgeDays": random.randint(500, 2500),
            "currentBalance": round(random.uniform(8000.0, 75000.0), 2),
            "behavior_class": "victim",
            "is_suspicious": 0,
            "communityId": "Community #04",
            "region": random.choice(["Region C", "Region D"]),
            "status": "Active",
            "business_registered": False,
            "gstin_present": False,
            "gstin_number": None,
            "business_category": None,
            "identity_verification_status": "VERIFIED_INDIVIDUAL",
            "expected_activity_profile": "Personal savings and retail lifestyle spending",
            "entity_id": None
        }
        accounts.append(acc)
        accounts_by_id[acc_id] = acc

    # -------------------------------------------------------------
    # 7. GENERATING REALISTIC TRANSACTIONS (2,000–4,000 TRANSACTIONS)
    # -------------------------------------------------------------
    txn_counter = 10000

    def create_txn(from_acc: str, to_acc: str, amt: float, epoch: int, channel: str = "IMPS", is_scam: bool = False, notes: str = "") -> Dict[str, Any]:
        nonlocal txn_counter
        txn_counter += 1
        t_id = f"TXN-SYN-{txn_counter}"
        hours = (epoch % 86400) // 3600
        mins = (epoch % 3600) // 60
        ampm = "AM" if hours < 12 else "PM"
        display_h = hours if hours <= 12 else hours - 12
        if display_h == 0:
            display_h = 12
        ts_str = f"2026-10-08 {display_h:02d}:{mins:02d} {ampm}"
        
        return {
            "id": t_id,
            "fromAccount": from_acc,
            "toAccount": to_acc,
            "amount": round(float(amt), 2),
            "timestamp": ts_str,
            "timeEpoch": int(epoch),
            "channel": channel,
            "riskLevel": "CRITICAL" if is_scam or amt > 70000 else ("HIGH" if amt > 40000 else "LOW"),
            "status": "Completed",
            "notes": notes,
            "isScamTrail": is_scam
        }

    # A. Normal retail transactions (peer-to-peer and salary)
    # Include both high-activity and low-activity normal retail consumers (1 to 40 txns)
    # 35 normal accounts have 1-5 transactions with long delays (dormant / low-frequency users)
    low_activity_normal = normal_ids[30:65]
    for low_acc in low_activity_normal:
        partner = random.choice(normal_ids)
        if partner != low_acc:
            amt = random.uniform(800.0, 12000.0)
            epoch = BASE_EPOCH + random.randint(1000, 150000)
            transactions.append(create_txn(partner, low_acc, amt, epoch, channel="UPI", notes="Infrequent retail credit"))
            if random.random() < 0.6:
                # low pass-through (partial spend, days later)
                out_amt = round(amt * random.uniform(0.15, 0.45), 2)
                transactions.append(create_txn(low_acc, random.choice(merchant_ids), out_amt, epoch + 86400, channel="UPI", notes="Grocery spend days later"))

    # Bulk of normal retail transactions (with realistic clustering into localized communities)
    active_normal_ids = normal_ids[:30] + normal_ids[65:]
    for _ in range(650):
        sender = random.choice(active_normal_ids)
        receiver = random.choice(active_normal_ids)
        if sender == receiver:
            continue
        amt = random.uniform(500.0, 18000.0)
        # Distributed across 48 hours
        epoch = BASE_EPOCH + random.randint(0, 172800)
        transactions.append(create_txn(sender, receiver, amt, epoch, channel="UPI", notes="Retail P2P settlement"))

    # B. Merchant commerce transactions (customers paying merchants, merchants paying suppliers)
    for _ in range(800):
        # 70% consumer paying merchant, 30% high-value B2B supplier invoices
        if random.random() < 0.70:
            sender = random.choice(normal_ids)
            receiver = random.choice(merchant_ids)
            amt = random.uniform(500.0, 35000.0)
            channel = "UPI" if amt < 2000 else "NEFT"
            notes = "Point of sale / digital checkout payment"
        else:
            # Merchant paying supplier (batch settlements / high value B2B)
            sender = random.choice(merchant_ids)
            receiver = random.choice(merchant_ids)
            if sender == receiver:
                continue
            amt = random.uniform(45000.0, 250000.0)
            channel = "RTGS"
            notes = "Commercial invoice reconciliation & B2B procurement"
            
        epoch = BASE_EPOCH + random.randint(0, 172800)
        transactions.append(create_txn(sender, receiver, amt, epoch, channel=channel, notes=notes))

    # B2. Same-Entity Internal Treasury Sweeps (Legitimate Multi-Account Enterprise Movements)
    # Accounts sharing the same entity_id transfer liquidity back and forth without mule intent
    merchants_by_entity = {}
    for m_id in merchant_ids:
        ent = accounts_by_id[m_id].get("entity_id")
        if ent:
            merchants_by_entity.setdefault(ent, []).append(m_id)

    for ent, member_accs in merchants_by_entity.items():
        if len(member_accs) >= 2:
            for _ in range(random.randint(4, 8)):
                from_a = member_accs[0] # e.g. Collections
                to_a = member_accs[1]   # e.g. Treasury
                amt = random.uniform(35000.0, 120000.0)
                epoch = BASE_EPOCH + random.randint(3600, 160000)
                transactions.append(create_txn(
                    from_a, to_a, amt, epoch, channel="NEFT",
                    notes=f"Internal treasury liquidity sweep under {ent}"
                ))

    # B3. High-activity legitimate individuals with recurring salary, rental, and family transfers
    high_activity_ids = normal_ids[:18]
    corporate_payers = merchant_ids[:10]
    for ha_id in high_activity_ids:
        # Recurring monthly retainer/salary
        employer = random.choice(corporate_payers)
        salary_amt = random.uniform(75000.0, 160000.0)
        transactions.append(create_txn(
            employer, ha_id, salary_amt, BASE_EPOCH + 3600,
            channel="NEFT", notes="Monthly professional consulting retainer / salary"
        ))
        # Recurring rental inflow
        tenant = random.choice(normal_ids[20:])
        rent_amt = random.uniform(25000.0, 45000.0)
        transactions.append(create_txn(
            tenant, ha_id, rent_amt, BASE_EPOCH + 7200,
            channel="UPI", notes="Monthly residential rental payment"
        ))
        # Normal recurring family/savings outflows
        recipient = random.choice(normal_ids[20:])
        out_amt = random.uniform(10000.0, 30000.0)
        transactions.append(create_txn(
            ha_id, recipient, out_amt, BASE_EPOCH + 86400,
            channel="UPI", notes="Family maintenance & utility reimbursement"
        ))

    # C. Mule pass-through syndicate chains
    # Rapid sequential hops with short delays (sub-5-minute latencies, high pass-through)
    mule_rings = [
        mule_ids[i:i+4] for i in range(0, len(mule_ids), 4) if len(mule_ids[i:i+4]) >= 3
    ]
    for ring in mule_rings:
        # Ring has 3-4 hops
        ring_start_epoch = BASE_EPOCH + random.randint(3600, 86400)
        incoming_amt = random.uniform(45000.0, 95000.0)
        
        # Funding source is an unsuspecting victim or sub-feeder
        victim = random.choice(victim_ids)
        current_epoch = ring_start_epoch
        
        # Victim to mule 0
        transactions.append(create_txn(
            victim, ring[0], incoming_amt, current_epoch,
            channel="IMPS", is_scam=True, notes="Victim initial duress deposit"
        ))
        
        curr_amt = incoming_amt
        for h in range(len(ring) - 1):
            curr_acc = ring[h]
            next_acc = ring[h + 1]
            delay_sec = random.randint(100, 300) # 1.6 to 5 minutes delay! Extreme velocity
            current_epoch += delay_sec
            siphon_pct = random.uniform(0.02, 0.05) # 2% to 5% commission retained
            curr_amt = round(curr_amt * (1.0 - siphon_pct), 2)
            
            transactions.append(create_txn(
                curr_acc, next_acc, curr_amt, current_epoch,
                channel="IMPS", is_scam=True, notes=f"Syndicate hop {h+2}: Rapid {delay_sec//60}m pass-through"
            ))

    # D. Structuring / splitting behavior
    # Multiple outgoing payments kept deliberately below INR 50k threshold (INR 42k–49.5k)
    for struct_acc in structuring_ids:
        # Received a large lump sum
        lump_in = random.uniform(150000.0, 300000.0)
        lump_epoch = BASE_EPOCH + random.randint(7200, 100000)
        funder = random.choice(normal_ids)
        transactions.append(create_txn(
            funder, struct_acc, lump_in, lump_epoch,
            channel="NEFT", notes="Lump sum aggregator credit"
        ))
        
        # Split into 3 to 6 structured outbound transfers just below 50,000
        split_count = random.randint(3, 6)
        remaining = lump_in
        struct_epoch = lump_epoch + random.randint(300, 1800)
        
        for _ in range(split_count):
            split_amt = random.uniform(42000.0, 49800.0)
            if remaining < split_amt:
                split_amt = max(10000.0, remaining * 0.95)
            remaining -= split_amt
            struct_epoch += random.randint(180, 900) # 3-15 min delay
            target_proxy = random.choice(mule_ids)
            transactions.append(create_txn(
                struct_acc, target_proxy, split_amt, struct_epoch,
                channel="IMPS", is_scam=True, notes="Structuring: Outward transfer deliberately beneath statutory threshold"
            ))

    # E. Normal overlap noise (legitimate fast transfers and occasional large business purchases)
    # Prevents trivial decision tree cutoffs
    for _ in range(250):
        # Legitimate fast transfers between normal users (e.g. split bill, urgent friend help)
        n1 = random.choice(normal_ids)
        n2 = random.choice(normal_ids)
        if n1 != n2:
            amt = random.uniform(1000.0, 12000.0)
            fast_epoch = BASE_EPOCH + random.randint(0, 172800)
            transactions.append(create_txn(n1, n2, amt, fast_epoch, channel="UPI", notes="Legitimate quick transfer"))

    # Sort all transactions chronologically
    transactions.sort(key=lambda t: t["timeEpoch"])

    return accounts, transactions


def validate_dataset(accounts: List[Dict[str, Any]], transactions: List[Dict[str, Any]]) -> List[str]:
    """
    Validates dataset integrity and confirms all Hackatopia constraints are met.
    """
    errors = []
    account_ids = set(a["id"] for a in accounts)
    
    # 1. Unique transaction IDs
    txn_ids = [t["id"] for t in transactions]
    if len(txn_ids) != len(set(txn_ids)):
        errors.append(f"Duplicate transaction IDs found: {len(txn_ids) - len(set(txn_ids))} duplicates")
        
    # 2. Account ID uniqueness
    if len(accounts) != len(account_ids):
        errors.append(f"Duplicate account IDs found: {len(accounts) - len(account_ids)} duplicates")
        
    # 3. Referenced accounts exist
    for t in transactions:
        f = t.get("fromAccount")
        to = t.get("toAccount")
        if f not in account_ids:
            errors.append(f"Transaction {t['id']} references unknown fromAccount: {f}")
        if to not in account_ids:
            errors.append(f"Transaction {t['id']} references unknown toAccount: {to}")
        if f == to:
            errors.append(f"Transaction {t['id']} has identical sender and receiver: {f}")
        if float(t.get("amount", 0.0)) <= 0:
            errors.append(f"Transaction {t['id']} has non-positive amount: {t.get('amount')}")
        if int(t.get("timeEpoch", 0)) <= 0:
            errors.append(f"Transaction {t['id']} has invalid timeEpoch: {t.get('timeEpoch')}")

    # 4. Verify main demo chain TXN-84921 -> TXN-84924 exists exactly
    required_demo_txns = ["TXN-84921", "TXN-84922", "TXN-84923", "TXN-84924", "TXN-84925"]
    txn_map = {t["id"]: t for t in transactions}
    for req_id in required_demo_txns:
        if req_id not in txn_map:
            errors.append(f"Missing core hackathon demo transaction: {req_id}")
            
    # Check chain ordering and amounts
    if all(r in txn_map for r in required_demo_txns):
        t1 = txn_map["TXN-84921"]
        t2 = txn_map["TXN-84922"]
        t3 = txn_map["TXN-84923"]
        t4 = txn_map["TXN-84924"]
        t5 = txn_map["TXN-84925"]
        
        if not (t1["timeEpoch"] < t2["timeEpoch"] < t3["timeEpoch"] < t4["timeEpoch"] < t5["timeEpoch"]):
            errors.append("Core demo transaction sequence timestamps are not monotonically strictly increasing")
            
        if t1["amount"] != 75000.0 or t2["amount"] != 73500.0 or t3["amount"] != 70000.0 or t4["amount"] != 68000.0:
            errors.append("Core demo transaction amounts do not match hackathon spec")
            
    # 5. Check behavioral classes existence
    classes = set(a.get("behavior_class") for a in accounts)
    expected_classes = {"normal", "merchant", "mule-like", "structuring", "victim"}
    missing = expected_classes - classes
    if missing:
        errors.append(f"Missing expected behavioral classes: {missing}")

    return errors


def partition_train_val_test(
    accounts: List[Dict[str, Any]],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15
) -> Dict[str, List[str]]:
    """
    Performs stratified account-level splitting to prevent data leakage.
    Ensures the core hackathon demonstration accounts (Victim-001, A102..D334) are explicitly placed
    in the test/demo set for rigorous, uncompromised live demonstration evaluation.
    """
    by_class: Dict[str, List[str]] = {}
    for a in accounts:
        by_class.setdefault(a["behavior_class"], []).append(a["id"])
        
    train_ids = []
    val_ids = []
    test_ids = []
    
    # Reserve core demo accounts for test/demo evaluation
    reserved_demo_ids = {"Victim-001", "A102", "B552", "C771", "D334", "E889"}
    test_ids.extend(list(reserved_demo_ids))
    
    for cls_name, ids in by_class.items():
        # Exclude reserved demo IDs from splitting pool
        pool = [x for x in ids if x not in reserved_demo_ids]
        random.shuffle(pool)
        
        n = len(pool)
        n_train = int(n * train_ratio)
        n_val = int(n * val_ratio)
        
        train_ids.extend(pool[:n_train])
        val_ids.extend(pool[n_train:n_train + n_val])
        test_ids.extend(pool[n_train + n_val:])
        
    return {
        "train": sorted(train_ids),
        "val": sorted(val_ids),
        "test": sorted(test_ids),
        "strategy": "Stratified account-level split with core demo nodes reserved in test set to avoid leakage"
    }


def main():
    """
    Generate dataset, extract features, validate, and persist artifacts.
    """
    BASE_DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    print("[1/5] Generating synthetic accounts and transactions...")
    accounts, transactions = generate_synthetic_dataset()
    
    print("[2/5] Running validation checks...")
    validation_errors = validate_dataset(accounts, transactions)
    if validation_errors:
        print("VALIDATION FAILED:")
        for err in validation_errors:
            print(f"  - {err}")
        raise ValueError("Dataset validation failed!")
    else:
        print("[PASS] All validation checks passed (0 errors)")

    print("[3/5] Extracting forensic account features...")
    features_df = extract_all_account_features(accounts, transactions)
    
    print("[4/5] Extracting sequential next-hop transfer samples...")
    account_features_map = {row["account_id"]: row for row in features_df.to_dict(orient="records")}
    next_hop_df = extract_next_hop_sequence_samples(transactions, account_features_map)

    print("[5/5] Generating train/val/test split and saving artifacts...")
    split_info = partition_train_val_test(accounts)

    # Save artifacts
    with open(BASE_DATA_DIR / "accounts.json", "w", encoding="utf-8") as f:
        json.dump(accounts, f, indent=2)

    with open(BASE_DATA_DIR / "transactions.json", "w", encoding="utf-8") as f:
        json.dump(transactions, f, indent=2)

    with open(BASE_DATA_DIR / "train_val_test_split.json", "w", encoding="utf-8") as f:
        json.dump(split_info, f, indent=2)

    features_df.to_csv(BASE_DATA_DIR / "account_features.csv", index=False)
    next_hop_df.to_csv(BASE_DATA_DIR / "next_hop_samples.csv", index=False)

    # Summary
    class_counts = pd.Series([a["behavior_class"] for a in accounts]).value_counts().to_dict()
    summary = {
        "total_accounts": len(accounts),
        "total_transactions": len(transactions),
        "account_class_breakdown": class_counts,
        "features_count": len(features_df.columns),
        "next_hop_samples_count": len(next_hop_df),
        "split_counts": {
            "train": len(split_info["train"]),
            "val": len(split_info["val"]),
            "test": len(split_info["test"])
        },
        "demo_chain_verified": True
    }

    with open(BASE_DATA_DIR / "dataset_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print("\n================ DATASET GENERATION COMPLETE ================")
    print(f"Total Accounts:             {len(accounts)}")
    print(f"Total Transactions:         {len(transactions)}")
    print(f"Behavioral Class Breakdown: {class_counts}")
    print(f"Account Features Count:     {len(features_df.columns)} features")
    print(f"Next-Hop Samples Count:     {len(next_hop_df)} sequential samples")
    print(f"Train / Val / Test Splits:  {summary['split_counts']}")
    print(f"Core Demo Chain Verified:   Victim-001 -> A102 -> B552 -> C771 -> D334 -> E889")
    print("=============================================================\n")


if __name__ == "__main__":
    main()
