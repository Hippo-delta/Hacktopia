# ML Synthetic Dataset Documentation — Money Trail Hunter

## 1. Overview & Disclaimer

> **IMPORTANT DISCLAIMER**: This dataset is entirely **synthetic and simulated** for the **Hackatopia 2026** competition. It contains no real customer identities, actual banking account numbers, live Indian financial rails (UPI/IMPS/NEFT/RTGS), or proprietary bank fraud records. It is designed to demonstrate machine learning-driven graph investigation and tabular fraud modeling without claiming production bank AML deployment.

---

## 2. Synthetic Populations & Behavioral Groups

The synthetic dataset generates 213 distinct accounts across 5 behavioral profiles, reflecting the nuanced topology of retail banking networks:

| Population | Profile | Sample Count | Behavioral Characteristics | Ground-Truth Label |
| :--- | :--- | :--- | :--- | :--- |
| **Normal Consumers** | Retail Individuals | 110 | Stable P2P and merchant transfers, low velocity, normal holding periods (days to weeks), diverse counterparties. | `normal` (is_suspicious=0) |
| **Merchants** | Enterprise / SMBs | 35 | High transaction count and cumulative volume, hundreds of incoming deposits from consumers, regular batch outward supplier settlements. High balance retention. | `merchant` (is_suspicious=0) |
| **Money Mules** | Layering Syndicates | 35 | Rapid fund drainage within minutes (sub-5-minute latencies), pass-through ratios >90%, low residual holding balance, newly opened accounts (<60 days), clustered in dense graph rings. | `mule-like` (is_suspicious=1) |
| **Structuring Rings** | Threshold Splitters | 22 | Receives lump sums, repeatedly disperses amounts between ₹42,000 and ₹49,800 deliberately below the statutory ₹50,000 reporting threshold to avoid KYC triggers. | `structuring` (is_suspicious=1) |
| **Victims** | Duress Complainants | 16 | Normal long-standing consumer baseline interrupted by an anomalous urgent debit under intimidation or scam pretext directly into Layer 1 mules. | `victim` (is_suspicious=0) |

### Overlap & Realism Safeguard
To prevent decision trees from memorizing trivial cutoffs (such as "high volume = fraud"):
* **Merchants** exhibit much higher volume than mules, yet are legitimate.
* **Normal users** occasionally perform legitimate rapid peer-to-peer transfers (e.g. bill splits).
* Fraud classification relies on multi-feature combinations (velocity + pass-through ratio + counterparty entropy) rather than a single feature shortcut.

---

## 3. Preserved Flagship Hackathon Demonstration Scenario

The core demonstration chain from the hackathon problem statement is strictly preserved as the ground-truth anchor:

```text
Victim-001 (Reporting Victim, NCR complaint)
    │  TXN-84921 (₹75,000 IMPS, 10:15 AM)
    ▼
A102 (Aman Deep - Mule Layer 1)
    │  TXN-84922 (₹73,500 IMPS, 10:18 AM | 3 min delay, ₹1,500 retained)
    ▼
B552 (Bharat Logix - Mule Layer 2)
    │  TXN-84923 (₹70,000 IMPS, 10:20 AM | 2 min delay, ₹3,500 retained)
    ▼
C771 (Chirag Tech - Mule Layer 3)
    │  TXN-84924 (₹68,000 RTGS, 10:24 AM | 4 min delay, ₹2,000 retained)
    ▼
D334 (Dhanraj Bullion - Off-Ramp Layer 4)
    │  TXN-84925 (₹65,500 NEFT, 10:28 AM | 4 min delay, ₹2,500 retained)
    ▼
E889 (Everest Remittance - Virtual Escrow Terminal)
```

* **Total Duration**: Approximately 13 minutes (9 minutes across the first 4 hops).
* **Initial Amount Traced**: ₹75,000.
* **Cumulative Retained Siphon**: ₹9,500 (commission deductions across layers).

---

## 4. Feature Engineering Schema

All features are extracted automatically from transaction graphs via `backend/app/ml/features.py`. The identical extraction logic is shared between model training and real-time inference:

1. `incoming_count` — Total inbound transactions.
2. `outgoing_count` — Total outbound transactions.
3. `total_txns` — Cumulative activity volume.
4. `unique_senders` — Distinct origin accounts (inflow counterparty diversity).
5. `unique_receivers` — Distinct destination accounts (outflow counterparty diversity).
6. `total_incoming_amount` — Gross inbound value (INR).
7. `total_outgoing_amount` — Gross outbound value (INR).
8. `net_flow_amount` — Residual balance impact (`in - out`).
9. `avg_incoming_amount` — Mean credit transaction size.
10. `avg_outgoing_amount` — Mean debit transaction size.
11. `avg_txn_amount` — Mean overall transaction size.
12. `pass_through_ratio` — Fraction of inbound funds drained (`total_out / total_in`).
13. `txn_velocity_per_hour` — Rate of transactions per active hour.
14. `avg_time_between_txns_min` — Mean interval between any account events.
15. `avg_in_out_delay_min` — Mean latency between receiving funds and onward debit.
16. `median_in_out_delay_min` — Median transfer delay (identifies rapid pass-through mules).
17. `min_in_out_delay_min` — Fastest onward transfer latency.
18. `structuring_ratio` — Proportion of debits in the ₹40k–₹49.9k statutory threshold corridor.
19. `network_degree` — Number of unique 1-hop graph neighbors.
20. `suspicious_connection_count` — Direct links to known flagged peers or syndicate clusters.
21. `account_age_days` — Account maturity (flags newly opened accounts experiencing transaction bursts).

---

## 5. Next-Hop Sequential Transfer Dataset

For training the Next-Hop Prediction Model, sequential pairwise hops $(T_{\text{in}}, T_{\text{out}})$ are assembled into `next_hop_samples.csv`. Each sample captures:
* Inbound transaction amount and timestamp.
* The delay until the account executed an outbound transfer.
* The current account's topological and velocity profile.
* **Target label**: `target_next_account` (the subsequent node in the money trail).

---

## 6. Train / Validation / Test Splitting Strategy

To prevent **data leakage** across graph transactions:
* Partitioning is performed strictly at the **account level**, not at the transaction level.
* Accounts are stratified across behavioral classes (70% Train, 15% Validation, 15% Test).
* Core demo nodes (`Victim-001`, `A102`, `B552`, `C771`, `D334`, `E889`) are reserved in the evaluation set to ensure an unbiased, un-overfitted test during live hackathon evaluation.
