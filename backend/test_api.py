"""
Comprehensive Test Suite for Money Trail Hunter FastAPI Backend (Phase 4).
Tests all 7 endpoints, data contracts, status codes, 404 handling, and ML inference outputs.
"""

import sys
import json
import unittest
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from fastapi import HTTPException
from app.main import (
    app,
    health_check,
    get_account_risk,
    get_account_detail,
    investigate_transaction,
    predict_next_hop,
    get_network,
    get_communities
)
from app.data_loader import data_manager
from app.models.schemas import InvestigateRequest, NextHopRequest


class TestMoneyTrailHunterAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n--- Initializing DataManager and ML Models for Tests ---")
        data_manager.load()

    def test_01_health_endpoint(self):
        print("\n[TEST 1] GET /api/health")
        resp = health_check()
        # In async context or direct call
        import asyncio
        if asyncio.iscoroutine(resp):
            resp = asyncio.run(resp)

        self.assertEqual(resp.status, "healthy")
        self.assertTrue(resp.dataset_loaded)
        self.assertTrue(resp.risk_model_loaded)
        self.assertTrue(resp.next_hop_model_loaded)
        self.assertEqual(resp.accounts_count, 218)
        self.assertEqual(resp.transactions_count, 2541)
        print(f"  Status: {resp.status}, Accounts: {resp.accounts_count}, Txns: {resp.transactions_count}")

    def test_02_account_risk_suspicious(self):
        print("\n[TEST 2] GET /api/accounts/A102/risk (Flagged Mule L1)")
        import asyncio
        resp = asyncio.run(get_account_risk("A102"))
        
        self.assertEqual(resp.account_id, "A102")
        self.assertEqual(resp.predicted_class, "SUSPICIOUS")
        self.assertIn(resp.risk_level, ["HIGH", "CRITICAL"])
        self.assertGreaterEqual(resp.risk_probability, 0.70)
        self.assertIn("pass_through_ratio", resp.features)
        self.assertEqual(len(resp.features), 20)
        print(f"  Class: {resp.predicted_class}, Level: {resp.risk_level}, Prob: {resp.risk_probability}")

    def test_03_account_risk_benign(self):
        print("\n[TEST 3] GET /api/accounts/Victim-001/risk (Legitimate Victim)")
        import asyncio
        resp = asyncio.run(get_account_risk("Victim-001"))
        
        self.assertEqual(resp.account_id, "Victim-001")
        self.assertEqual(resp.predicted_class, "BENIGN")
        self.assertIn(resp.risk_level, ["LOW", "MEDIUM"])
        self.assertLess(resp.risk_probability, 0.35)
        print(f"  Class: {resp.predicted_class}, Level: {resp.risk_level}, Prob: {resp.risk_probability}")

    def test_04_account_detail(self):
        print("\n[TEST 4] GET /api/accounts/A102 (Profile & Risk Analysis)")
        import asyncio
        resp = asyncio.run(get_account_detail("A102"))
        
        self.assertEqual(resp.id, "A102")
        self.assertEqual(resp.risk_analysis.account_id, "A102")
        self.assertEqual(resp.risk_analysis.predicted_class, "SUSPICIOUS")
        self.assertEqual(resp.status, "Flagged for Review")
        print(f"  Name: {resp.name}, Type: {resp.accountType}, Status: {resp.status}")

    def test_05_investigate_flagship_scam_trail(self):
        print("\n[TEST 5] POST /api/investigate (TXN-84921 Flagship Chain)")
        import asyncio
        req = InvestigateRequest(transaction_id="TXN-84921", max_hops=6)
        resp = asyncio.run(investigate_transaction(req))
        
        # Verify 5-hop trail
        self.assertEqual(resp.summary.starting_transaction, "TXN-84921")
        self.assertEqual(resp.summary.initial_amount, 75000.0)
        self.assertEqual(resp.summary.terminal_account, "E889")
        self.assertEqual(resp.summary.terminal_amount, 65500.0)
        self.assertEqual(resp.summary.amount_retained, 9500.0)
        self.assertEqual(resp.summary.number_of_hops, 5)
        self.assertEqual(resp.summary.duration_minutes, 13)
        self.assertEqual(len(resp.trail), 5)

        # Verify exact chain sequence
        expected_chain = [
            ("Victim-001", "A102", 75000.0),
            ("A102", "B552", 73500.0),
            ("B552", "C771", 70000.0),
            ("C771", "D334", 68000.0),
            ("D334", "E889", 65500.0)
        ]

        for i, (f_exp, t_exp, amt_exp) in enumerate(expected_chain):
            hop = resp.trail[i]
            self.assertEqual(hop.hop_number, i + 1)
            self.assertEqual(hop.from_account, f_exp)
            self.assertEqual(hop.to_account, t_exp)
            self.assertEqual(hop.amount, amt_exp)
            print(f"  Hop {hop.hop_number}: {hop.from_account} -> {hop.to_account} (INR {hop.amount}) Risk: {hop.to_risk_level} ({hop.to_risk_probability})")

        # Verify terminal next-hop prediction
        self.assertIsNotNone(resp.next_hop_prediction)
        print(f"  Terminal Next-Hop Prediction for E889: {resp.next_hop_prediction.predicted_next_hop} ({resp.next_hop_prediction.confidence}%)")

    def test_06_next_hop_endpoint(self):
        print("\n[TEST 6] POST /api/next-hop (A102 incoming TXN-84921)")
        import asyncio
        req = NextHopRequest(account_id="A102", incoming_transaction_id="TXN-84921")
        resp = asyncio.run(predict_next_hop(req))
        
        self.assertEqual(resp.current_account, "A102")
        self.assertIsNotNone(resp.predicted_next_hop)
        self.assertGreater(resp.confidence, 50.0)
        self.assertEqual(len(resp.top_candidates), 5)
        print(f"  Top predicted next hop from A102: {resp.predicted_next_hop} ({resp.predicted_target_name}) with {resp.confidence}% confidence")

    def test_07_network_graph(self):
        print("\n[TEST 7] GET /api/network")
        import asyncio
        resp = asyncio.run(get_network(refresh=False))
        
        self.assertEqual(resp.total_nodes, 218)
        self.assertEqual(resp.total_edges, 2541)
        self.assertEqual(len(resp.nodes), 218)
        self.assertEqual(len(resp.edges), 2541)
        print(f"  Network Graph: {resp.total_nodes} nodes, {resp.total_edges} edges")

    def test_08_community_detection(self):
        print("\n[TEST 8] GET /api/network/communities")
        import asyncio
        resp = asyncio.run(get_communities(refresh=False))
        
        self.assertGreater(len(resp), 0)
        # Top communities should have detected suspicious clusters
        top_comm = resp[0]
        self.assertGreater(top_comm.suspicious_count, 0)
        self.assertGreater(top_comm.average_risk_score, 0.5)
        print(f"  Top community {top_comm.community_id}: {top_comm.member_count} members, {top_comm.suspicious_count} suspicious, avg risk: {top_comm.average_risk_score}")

    def test_09_error_handling_404s(self):
        print("\n[TEST 9] 404 Error Handling")
        import asyncio
        # Missing account
        with self.assertRaises(HTTPException) as cm:
            asyncio.run(get_account_risk("NON_EXISTENT_ACC"))
        self.assertEqual(cm.exception.status_code, 404)
        print("  Missing account correctly returned 404.")

        # Missing transaction in investigate
        with self.assertRaises(HTTPException) as cm:
            asyncio.run(investigate_transaction(InvestigateRequest(transaction_id="TXN-INVALID")))
        self.assertEqual(cm.exception.status_code, 404)
        print("  Missing transaction correctly returned 404.")

        # Missing transaction in next-hop
        with self.assertRaises(HTTPException) as cm:
            asyncio.run(predict_next_hop(NextHopRequest(account_id="A102", incoming_transaction_id="TXN-INVALID")))
        self.assertEqual(cm.exception.status_code, 404)
        print("  Invalid next-hop request correctly returned 404.")


if __name__ == "__main__":
    unittest.main()
