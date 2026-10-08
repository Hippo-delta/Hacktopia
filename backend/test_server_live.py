"""
Live HTTP Integration Test for Money Trail Hunter API.
Spins up FastAPI on http://127.0.0.1:8000 in a thread, tests all endpoints via real HTTP requests,
checks CORS headers, OpenAPI /docs, and cleanly terminates.
"""

import sys
import time
import threading
import requests
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

import uvicorn
from app.main import app

PORT = 8000
BASE_URL = f"http://127.0.0.1:{PORT}"


class UvicornThread(threading.Thread):
    def __init__(self):
        super().__init__()
        config = uvicorn.Config(app, host="127.0.0.1", port=PORT, log_level="warning")
        self.server = uvicorn.Server(config)

    def run(self):
        self.server.run()

    def stop(self):
        self.server.should_exit = True


def run_live_tests():
    server_thread = UvicornThread()
    server_thread.daemon = True
    server_thread.start()

    # Wait for server startup
    max_wait = 10
    started = False
    for _ in range(max_wait * 10):
        try:
            r = requests.get(f"{BASE_URL}/api/health", timeout=1)
            if r.status_code == 200:
                started = True
                break
        except Exception:
            time.sleep(0.1)

    if not started:
        print("ERROR: Server failed to start within timeout.")
        server_thread.stop()
        sys.exit(1)

    print(">>> Live server started on", BASE_URL)

    try:
        # 1. Test Docs
        r = requests.get(f"{BASE_URL}/docs")
        assert r.status_code == 200, f"Expected 200 for /docs, got {r.status_code}"
        print("[PASS] GET /docs returned 200")

        # 2. Test OpenAPI spec
        r = requests.get(f"{BASE_URL}/openapi.json")
        assert r.status_code == 200
        print("[PASS] GET /openapi.json returned 200")

        # 3. Test CORS preflight
        cors_headers = {
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"
        }
        r = requests.options(f"{BASE_URL}/api/investigate", headers=cors_headers)
        assert r.status_code == 200, f"CORS preflight failed: {r.status_code}"
        assert r.headers.get("access-control-allow-origin") == "http://localhost:5173"
        print("[PASS] CORS preflight OPTIONS returned 200 with Allow-Origin header")

        # 4. GET /api/health
        r = requests.get(f"{BASE_URL}/api/health")
        data = r.json()
        assert r.status_code == 200
        assert data["status"] == "healthy"
        assert data["accounts_count"] == 218
        assert data["transactions_count"] == 2541
        print(f"[PASS] GET /api/health: {data['status']}, accounts: {data['accounts_count']}")

        # 5. GET /api/accounts/A102/risk
        r = requests.get(f"{BASE_URL}/api/accounts/A102/risk")
        data = r.json()
        assert r.status_code == 200
        assert data["predicted_class"] == "SUSPICIOUS"
        assert data["risk_level"] in ("HIGH", "CRITICAL")
        print(f"[PASS] GET /api/accounts/A102/risk: {data['predicted_class']} ({data['risk_level']}) - prob {data['risk_probability']}")

        # 6. GET /api/accounts/Victim-001/risk
        r = requests.get(f"{BASE_URL}/api/accounts/Victim-001/risk")
        data = r.json()
        assert r.status_code == 200
        assert data["predicted_class"] == "BENIGN"
        assert data["risk_level"] in ("LOW", "MEDIUM")
        print(f"[PASS] GET /api/accounts/Victim-001/risk: {data['predicted_class']} ({data['risk_level']}) - prob {data['risk_probability']}")

        # 7. GET /api/accounts/A102 (Detail)
        r = requests.get(f"{BASE_URL}/api/accounts/A102")
        data = r.json()
        assert r.status_code == 200
        assert data["id"] == "A102"
        assert "risk_analysis" in data
        print(f"[PASS] GET /api/accounts/A102: {data['name']} ({data['accountType']})")

        # 8. POST /api/investigate (TXN-84921)
        payload = {"transaction_id": "TXN-84921", "max_hops": 6}
        r = requests.post(f"{BASE_URL}/api/investigate", json=payload)
        data = r.json()
        assert r.status_code == 200
        assert data["summary"]["number_of_hops"] == 5
        assert data["summary"]["terminal_account"] == "E889"
        assert data["summary"]["initial_amount"] == 75000.0
        assert data["summary"]["terminal_amount"] == 65500.0
        assert data["summary"]["amount_retained"] == 9500.0
        assert data["summary"]["duration_minutes"] == 13
        assert len(data["trail"]) == 5
        assert data["next_hop_prediction"] is not None
        print(f"[PASS] POST /api/investigate: 5 hops traced, terminal {data['summary']['terminal_account']}, next hop predicted: {data['next_hop_prediction']['predicted_next_hop']}")

        # 9. POST /api/next-hop (A102)
        payload = {"account_id": "A102", "incoming_transaction_id": "TXN-84921"}
        r = requests.post(f"{BASE_URL}/api/next-hop", json=payload)
        data = r.json()
        assert r.status_code == 200
        assert data["predicted_next_hop"] == "B552"
        print(f"[PASS] POST /api/next-hop: predicted {data['predicted_next_hop']} with {data['confidence']}% confidence")

        # 10. GET /api/network
        r = requests.get(f"{BASE_URL}/api/network")
        data = r.json()
        assert r.status_code == 200
        assert data["total_nodes"] == 218
        assert data["total_edges"] == 2541
        print(f"[PASS] GET /api/network: {data['total_nodes']} nodes, {data['total_edges']} edges")

        # 11. GET /api/network/communities
        r = requests.get(f"{BASE_URL}/api/network/communities")
        data = r.json()
        assert r.status_code == 200
        assert len(data) > 0
        print(f"[PASS] GET /api/network/communities: {len(data)} communities detected")

        # 12. 404 Tests
        r = requests.get(f"{BASE_URL}/api/accounts/UNKNOWN-999")
        assert r.status_code == 404
        r = requests.post(f"{BASE_URL}/api/investigate", json={"transaction_id": "UNKNOWN-TXN"})
        assert r.status_code == 404
        print("[PASS] 404 Error handling verified for missing resources")

        print("\n>>> ALL LIVE HTTP ENDPOINT TESTS PASSED SUCCESSFULLY! <<<")

    finally:
        server_thread.stop()


if __name__ == "__main__":
    run_live_tests()
