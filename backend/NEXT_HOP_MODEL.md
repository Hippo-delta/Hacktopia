# Next-Hop Prediction & Candidate Ranking Model — Money Trail Hunter

## 1. Problem Formulation & Objective

In digital arrest, investment, and task fraud syndicates, stolen money cascades rapidly across multiple layers of rented "mule" bank accounts before exiting via crypto aggregators or bullion merchants. 

Traditional rule-based monitoring examines accounts in isolation *after* funds have already left. **Next-Hop Prediction** reformulates investigation as a proactive temporal ranking problem:

$$\hat{D} = \arg\max_{C \in \mathcal{C}(A, t)} P(C \text{ is next destination} \mid A, T_{\text{in}}, t)$$

Given that account $A$ has just received an incoming suspicious transfer $T_{\text{in}}$ at timestamp $t$, the model scores and ranks plausible candidate destination accounts $C \in \mathcal{C}(A, t)$ based on features known **strictly up to time $t$**.

This enables bank fraud analysts to anticipate and preemptively freeze the destination node **before the funds leave the banking rail**.

---

## 2. Why Next-Hop Prediction Is Critical for Fraud Investigators

1. **Preemptive Debit Freezes**: Rather than chasing funds hop-by-hop after they are siphoned, investigators can simulate and recommend interim debit holds on the predicted destination terminal.
2. **Dynamic Multi-Hop Graph Traversal**: Upgrades deterministic money-trail tracing into an ML-guided path exploration system that identifies likely off-ramps even when transaction networks split.
3. **Syndicate Interdiction**: Reveals high-affinity layering routes and recurring proxy corridors.

---

## 3. Model Architecture & Selection

* **Algorithm**: `RandomForestClassifier` (Scikit-Learn).
* **Formulation**: **Pairwise / Point-wise Candidate Ranking**.
  * For each historical decision point $(A, T_{\text{in}}, t, D^*)$:
    * Exactly one **positive candidate** $D^*$ ($y = 1$, the actual destination).
    * Exactly $K = 9$ **negative candidates** $C_i$ ($y = 0$, alternative plausible accounts in the network at that time).
  * The model outputs a probability score $\hat{s}(C) \in [0, 1]$, and candidates are sorted in descending order.
* **Why Tabular Ranking Instead of GNN or Multiclass on Account IDs?**:
  * **Zero ID Memorization**: The model does not learn account IDs as categorical classes. It learns graph-topological compatibility and behavioral affinity.
  * **Generalizability**: The model can evaluate *any* candidate account for *any* current account on new, unseen transaction graphs.
  * **Explainability**: Decision trees provide transparent feature contributions (pair history, transfer scale ratio, pass-through rates) suitable for bank compliance audits.

---

## 4. Candidate Generation Methodology

At prediction timestamp $t$ when account $A$ receives $T_{\text{in}}$:
1. The ground-truth actual destination $D^*$ forms the positive candidate ($y = 1$).
2. Negative candidates ($y = 0$) are assembled from:
   * Prior counterparties of $A$ up to time $t$ (excluding $D^*$).
   * Active accounts in the network active prior to time $t$.
3. Exactly 10 candidates are scored for each decision event.

---

## 5. Strict Temporal Leakage Prevention

To guarantee zero future information leakage:
1. **Forbidden Features (Excluded)**:
   * `out_amount` — Amount of the future transfer (unknown prior to transfer).
   * `transfer_delay_min` — Latency until future transfer occurs.
   * `amount_retained` — Commission siphoned by $A$.
   * `channel` — Payment rail used for future transfer.
   * `is_scam_trail` — Ground-truth classification of future transfer.
   * `target_next_account` — Target label.
   * `is_mule` / `behavior_class` / `communityId` — Ground-truth entity labels.
   * Account string IDs or Transaction string IDs — Prohibits memorizing node IDs.
2. **Temporal Cutoff Rule**:
   All metrics are extracted strictly from transactions where `timeEpoch` $\le t$ (and outgoing transactions from $A$ where `timeEpoch` $< t$).

---

## 6. Exact Feature List (23 Causal Features)

| # | Feature Name | Category | Description |
| :--- | :--- | :--- | :--- |
| 1 | `in_amount` | Current Context | Amount of inbound transaction $T_{\text{in}}$ (INR). |
| 2 | `curr_hist_in_count` | Current Account | Inbound transfer count of $A$ up to $t$. |
| 3 | `curr_hist_out_count` | Current Account | Outbound transfer count of $A$ strictly before $t$. |
| 4 | `curr_hist_total_txns` | Current Account | Total activity volume of $A$ up to $t$. |
| 5 | `curr_hist_pass_through` | Current Account | Historical pass-through ratio of $A$ before $t$. |
| 6 | `curr_hist_unique_receivers`| Current Account | Distinct historical receivers from $A$ before $t$. |
| 7 | `curr_hist_velocity` | Current Account | Transactions per active hour of $A$ before $t$. |
| 8 | `curr_account_age_days` | Current Account | Account age of $A$ in days. |
| 9 | `cand_hist_in_count` | Candidate Account | Inbound transfer count of candidate $C$ before $t$. |
| 10| `cand_hist_out_count` | Candidate Account | Outbound transfer count of candidate $C$ before $t$. |
| 11| `cand_hist_total_txns` | Candidate Account | Total activity volume of candidate $C$ before $t$. |
| 12| `cand_hist_pass_through` | Candidate Account | Historical pass-through ratio of candidate $C$ before $t$. |
| 13| `cand_hist_unique_senders`| Candidate Account | Distinct historical senders to $C$ before $t$. |
| 14| `cand_hist_unique_receivers`| Candidate Account | Distinct historical receivers from $C$ before $t$. |
| 15| `cand_hist_velocity` | Candidate Account | Transactions per active hour of $C$ before $t$. |
| 16| `cand_account_age_days` | Candidate Account | Account age of candidate $C$ in days. |
| 17| `pair_prior_transfer_count`| Pairwise History | Prior transfers from $A \to C$ strictly before $t$. |
| 18| `pair_prior_total_amount` | Pairwise History | Cumulative volume from $A \to C$ before $t$. |
| 19| `pair_has_prior_link` | Pairwise History | Binary indicator (1 if $A$ ever paid $C$ before $t$, else 0). |
| 20| `pair_reverse_transfer_count`| Pairwise History | Reverse transfers from $C \to A$ before $t$ (affinity). |
| 21| `pair_common_neighbors_count`| Pairwise History | Mutual counterparties between $A$ and $C$ (triadic closure). |
| 22| `amt_ratio_to_cand_avg_in`| Compatibility | Scale ratio of $T_{\text{in}}.\text{amount}$ to $C$'s typical inflow. |
| 23| `cand_in_out_ratio` | Candidate Account | Ratio of candidate inbound to outbound transactions. |

---

## 7. Chain / Ring-Level Splitting Strategy

To prevent data leakage across correlated multi-hop paths:
* Rows are **NOT** randomly split.
* All 2,217 decision instances are partitioned into **77 distinct chain/network groups**.
* **Flagship Demo Group (`group_demo_flagship`)**:
  * Contains all events involving `Victim-001`, `A102`, `B552`, `C771`, `D334`, and `E889`.
  * **Strictly held out in the Test Partition**.
* **Split Allocation**:
  * **Train Groups**: 53 groups (1,512 decision instances, 15,120 candidate pairs)
  * **Validation Groups**: 11 groups (278 decision instances, 2,780 candidate pairs)
  * **Test / Demo Groups**: 13 groups (427 decision instances, 4,270 candidate pairs)

---

## 8. Evaluation Metrics & Performance

Evaluated against the completely held-out test groups (10 candidates per decision point):

| Metric | Validation Set ($n=278$) | Held-Out Test Set ($n=427$) | Forensic Benchmark |
| :--- | :--- | :--- | :--- |
| **Top-1 Accuracy** | **85.61%** | **84.07%** | Expected next account ranked #1 across 10 candidates. |
| **Top-3 Accuracy** | **94.24%** | **90.16%** | Correct destination appears within Top 3 recommendations. |
| **Mean Reciprocal Rank (MRR)** | **0.9019** | **0.8820** | High reciprocal ranking confidence across all queries. |
| **ROC-AUC (Pairwise Link)** | **0.9494** | **0.9383** | Discriminative power separating true hops from false leads. |

---

## 9. Held-Out Flagship Demo Scenario Evaluation

Evaluating the held-out hackathon digital arrest chain ($T_{\text{in}} \to \text{Expected Next}$):

| Hop | Current Account | Inbound Txn | Inbound Amount | Expected Target | Actual Model Rank | Model Confidence Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2 | **A102** | `TXN-84922` | ₹73,500 | **B552** | **Rank #1** | **97.7%** (Top Candidate) |
| 3 | **B552** | `TXN-84923` | ₹70,000 | **C771** | **Rank #1** | **97.7%** (Top Candidate) |
| 4 | **C771** | `TXN-84924` | ₹68,000 | **D334** | **Rank #1** | **97.7%** (Top Candidate) |
| 5 | **D334** | `TXN-84925` | ₹65,500 | **E889** | **Rank #1** | **97.7%** (Top Candidate) |

---

## 10. Comparison with Legacy Deterministic Logic

In the original prototype (`src/utils/moneyTrail.js`, `calculateNextHopPrediction()`):
* The code hardcoded:
  ```javascript
  const bestTarget = candidateAccounts.find(a => a.id === 'E889') || 
                     candidateAccounts.find(a => a.id === 'D334') || ...
  ```
* It literally searched for the hardcoded strings `'E889'` and `'D334'`, and synthesized a fake confidence formula: `75 + (riskScore) * 0.15`.

**Why the ML Model Is Substantially Superior**:
1. **No Hardcoded Targets**: The ML model scores candidates dynamically based on topological affinity, volume compatibility, and temporal graph features.
2. **Evaluates Real Network Candidates**: Can rank any candidate account in arbitrary subgraphs.
3. **Calibrated Forensic Probabilities**: Output represents an empirical ensemble vote probability, not a hardcoded string match.

---

## 11. Top 10 Forensic Feature Importances

1. `pair_prior_total_amount` (0.1867) — Cumulative historical flow between the pair establishes established money laundering corridors.
2. `pair_has_prior_link` (0.1624) — Prior link existence is a strong structural prior for recurring layering hops.
3. `pair_prior_transfer_count` (0.1386) — Frequency of prior interaction indicates preferred pass-through conduits.
4. `curr_hist_unique_receivers` (0.0711) — Fan-out degree of the source node.
5. `cand_account_age_days` (0.0693) — Newly opened proxy accounts (<60 days) attract rapid onward layering deposits.
6. `cand_in_out_ratio` (0.0671) — Destination node's capacity to absorb incoming transfers relative to existing outflows.
7. `curr_hist_out_count` (0.0397) — Activity cadence of the intermediate mule.
8. `cand_hist_total_txns` (0.0373) — Total activity scale of the destination entity.
9. `cand_hist_velocity` (0.0356) — Operating velocity of the target node.
10. `cand_hist_unique_senders` (0.0265) — Candidate's counterparty concentration.

---

## 12. Synthetic Limitations & Future FastAPI Integration

* **Synthetic Data Artifact**: Synthetic transaction graphs have denser repeated flows than real-world cold-start accounts. Real-world banks face zero-history mules where pairwise features may be zero, shifting importance toward candidate activity and topological degree.
* **FastAPI Hook**:
  In Phase 4, `POST /api/trace` will invoke `rank_next_hop_candidates()` from `app.ml.next_hop_inference` to dynamically predict and rank the next hop at the money trail endpoint.
