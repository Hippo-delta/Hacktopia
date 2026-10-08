"""
Community Detection and Network Graph Construction Module.
Builds transaction graphs and detects fraud rings/mule communities using NetworkX.
Operates on the active small scenario dataset for rapid, responsive visualization.
"""

from typing import Dict, Any, List, Optional
import networkx as nx
import logging

from app.data_loader import data_manager

logger = logging.getLogger(__name__)

_CACHED_COMMUNITIES = None
_CACHED_NETWORK_GRAPH = None


def invalidate_graph_cache():
    """Clear cached communities and graph representations upon scenario refresh."""
    global _CACHED_COMMUNITIES, _CACHED_NETWORK_GRAPH
    _CACHED_COMMUNITIES = None
    _CACHED_NETWORK_GRAPH = None


def detect_fraud_communities(force_refresh: bool = False) -> List[Dict[str, Any]]:
    """
    Run algorithmic modularity-based community detection on the active transaction graph.
    Computes forensic metrics for each detected cluster.
    Returns targeted, understandable communities (typically 2–4).
    """
    global _CACHED_COMMUNITIES
    if _CACHED_COMMUNITIES is not None and not force_refresh:
        return _CACHED_COMMUNITIES

    accounts = data_manager.get_all_accounts()
    transactions = data_manager.get_all_transactions()

    # Build undirected weighted graph for modularity optimization
    G = nx.Graph()
    for acc in accounts:
        G.add_node(str(acc["id"]))

    for txn in transactions:
        u = str(txn.get("fromAccount", ""))
        v = str(txn.get("toAccount", ""))
        amt = float(txn.get("amount", 0.0))
        if u and v:
            if G.has_edge(u, v):
                G[u][v]["weight"] += amt
                G[u][v]["count"] += 1
            else:
                G.add_edge(u, v, weight=amt, count=1)

    # Detect communities using greedy modularity maximization
    # If the graph has isolated components, find connected components first or greedy modularity
    if len(G.nodes) == 0:
        _CACHED_COMMUNITIES = []
        return []

    try:
        raw_communities = list(nx.community.greedy_modularity_communities(G, weight="weight"))
    except Exception:
        # Fallback to connected components if modularity fails on very small disjoint graphs
        raw_communities = list(nx.connected_components(G))

    community_results = []
    for idx, member_set in enumerate(raw_communities, 1):
        members = sorted(list(member_set))
        
        # Calculate cluster metrics
        suspicious_count = 0
        risk_probs = []
        for m in members:
            r = data_manager.get_account_risk(m)
            if r:
                if r.get("predicted_class") == "SUSPICIOUS":
                    suspicious_count += 1
                risk_probs.append(float(r.get("risk_probability", 0.0)))
            else:
                risk_probs.append(0.0)

        avg_risk = round(sum(risk_probs) / len(risk_probs), 4) if risk_probs else 0.0

        # Calculate total inbound volume to community members
        total_inflow = 0.0
        total_volume = 0.0
        for txn in transactions:
            from_m = str(txn.get("fromAccount")) in member_set
            to_m = str(txn.get("toAccount")) in member_set
            amt = float(txn.get("amount", 0.0))
            if to_m:
                total_inflow += amt
            if from_m or to_m:
                total_volume += amt

        # Label syndicate cluster vs retail commerce cluster
        comm_name = f"Syndicate Cluster COMM-{idx:02d}" if suspicious_count > 0 else f"Commercial Commerce Ring COMM-{idx:02d}"

        community_results.append({
            "community_id": f"COMM-{idx:02d}",
            "name": comm_name,
            "member_count": len(members),
            "members": members,
            "suspicious_count": suspicious_count,
            "total_inflow": round(total_inflow, 2),
            "average_risk_score": avg_risk,
            "total_volume": round(total_volume, 2)
        })

    # Sort communities: highest suspicious concentration first, then by member count
    community_results.sort(
        key=lambda c: (c["suspicious_count"], c["average_risk_score"], c["member_count"]),
        reverse=True
    )

    # Re-assign sequential rank IDs for clean presentation
    for rank, comm in enumerate(community_results, 1):
        comm["community_id"] = f"COMM-{rank:02d}"
        if comm["suspicious_count"] > 0:
            comm["name"] = f"Suspicious Mule Syndicate #{rank}"
        else:
            comm["name"] = f"Merchant Commerce Cluster #{rank}"

    _CACHED_COMMUNITIES = community_results
    return community_results


def get_network_graph(force_refresh: bool = False) -> Dict[str, Any]:
    """
    Format network nodes and edges for visualization in graph dashboards.
    Matches active scenario nodes and transactions.
    """
    global _CACHED_NETWORK_GRAPH
    if _CACHED_NETWORK_GRAPH is not None and not force_refresh:
        return _CACHED_NETWORK_GRAPH

    accounts = data_manager.get_all_accounts()
    transactions = data_manager.get_all_transactions()
    communities = detect_fraud_communities(force_refresh=False)

    # Build account to community mapping
    acc_to_comm = {}
    for c in communities:
        for m in c.get("members", []):
            acc_to_comm[m] = c["community_id"]

    nodes = []
    for acc in accounts:
        acc_id = str(acc["id"])
        risk_info = data_manager.get_account_risk(acc_id) or {}
        nodes.append({
            "id": acc_id,
            "name": acc.get("name", acc_id),
            "account_type": acc.get("accountType", "Account"),
            "risk_probability": float(risk_info.get("risk_probability", 0.0)),
            "risk_level": str(risk_info.get("risk_level", "LOW")),
            "is_suspicious": bool(risk_info.get("predicted_class") == "SUSPICIOUS"),
            "community_id": acc_to_comm.get(acc_id, "COMM-01"),
            "region": acc.get("region", "National")
        })

    edges = []
    for txn in transactions:
        edges.append({
            "id": str(txn.get("id")),
            "source": str(txn.get("fromAccount")),
            "target": str(txn.get("toAccount")),
            "amount": float(txn.get("amount", 0.0)),
            "timestamp": str(txn.get("timestamp", "")),
            "time_epoch": int(txn.get("timeEpoch", 0)),
            "channel": str(txn.get("channel", "UPI")),
            "is_scam_trail": bool(txn.get("isScamTrail", False))
        })

    _CACHED_NETWORK_GRAPH = {
        "nodes": nodes,
        "edges": edges,
        "total_nodes": len(nodes),
        "total_edges": len(edges)
    }
    return _CACHED_NETWORK_GRAPH
