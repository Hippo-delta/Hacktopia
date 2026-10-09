"""
FastAPI Entry Point for Money Trail Hunter.
Serves graph-based fraud, mule account investigation, ML prediction, and dynamic scenario endpoints.
"""

from contextlib import asynccontextmanager
from typing import List, Optional
import logging

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from app.config import APP_NAME, APP_VERSION
from app.data_loader import data_manager
from app.graph.temporal_bfs import trace_money_trail
from app.graph.communities import detect_fraud_communities, get_network_graph
from app.ml.next_hop_inference import rank_next_hop_candidates
from app.models.schemas import (
    HealthResponse,
    AccountRiskResponse,
    AccountDetailResponse,
    InvestigateRequest,
    InvestigationResponse,
    NextHopRequest,
    NextHopPredictionResponse,
    NetworkGraphResponse,
    CommunityDetail,
    ScenarioResponse,
    ScenarioSelectRequest
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("money_trail_api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler: loads datasets and pre-warms ML models on startup."""
    logger.info("Initializing Money Trail Hunter dataset and ML models...")
    data_manager.load()
    logger.info(
        f"Initialization complete: {len(data_manager.accounts)} accounts, "
        f"{len(data_manager.transactions)} transactions loaded in active scenario."
    )
    yield
    logger.info("Shutting down Money Trail Hunter API.")


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Graph-based Fraud & Mule Account Investigation Platform API with ML inference",
    lifespan=lifespan
)

# CORS configuration for React frontend development servers
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):(5173|3000)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint info."""
    return {
        "service": APP_NAME,
        "version": APP_VERSION,
        "docs_url": "/docs",
        "health_url": "/api/health"
    }


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
@app.get("/health", response_model=HealthResponse, include_in_schema=False)
async def health_check():
    """Health check endpoint to inspect loaded models and dataset stats."""
    return HealthResponse(
        status="healthy" if data_manager.is_loaded else "initializing",
        dataset_loaded=data_manager.is_loaded,
        risk_model_loaded=data_manager.risk_model_ready,
        next_hop_model_loaded=data_manager.next_hop_model_ready,
        accounts_count=len(data_manager.accounts),
        transactions_count=len(data_manager.transactions),
        active_scenario=data_manager.active_scenario_info.get("name"),
        service=APP_NAME,
        version=APP_VERSION
    )


# -------------------------------------------------------------
# SCENARIO ENDPOINTS (Small, Coherent, Refreshable Demo Scenarios)
# -------------------------------------------------------------
@app.get("/api/scenario", response_model=ScenarioResponse, tags=["Scenario"])
async def get_active_scenario():
    """Retrieve metadata and telemetry for the currently active investigation scenario."""
    return ScenarioResponse(**data_manager.get_active_scenario())


@app.post("/api/scenario/refresh", response_model=ScenarioResponse, tags=["Scenario"])
async def refresh_scenario():
    """
    Generate or switch to a new coherent investigation scenario.
    Re-extracts features, re-runs ML models, recomputes network graph and communities.
    """
    summary = data_manager.refresh_scenario()
    return ScenarioResponse(**summary)


@app.post("/api/scenario/select", response_model=ScenarioResponse, tags=["Scenario"])
async def select_scenario(request: ScenarioSelectRequest):
    """
    Select a specific scenario by ID (e.g. 'scenario-flagship' for TXN-84921).
    """
    summary = data_manager.refresh_scenario(specific_id=request.scenario_id)
    return ScenarioResponse(**summary)


# -------------------------------------------------------------
# ACCOUNTS & RISK ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/accounts/{account_id}/risk", response_model=AccountRiskResponse, tags=["Accounts"])
async def get_account_risk(account_id: str):
    """Retrieve ML-driven risk evaluation and extracted forensic features for a specific account."""
    acc = data_manager.get_account(account_id)
    if not acc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account '{account_id}' not found in registry."
        )

    risk_info = data_manager.get_account_risk(account_id)
    if not risk_info:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not compute risk scoring for account '{account_id}'."
        )

    return AccountRiskResponse(**risk_info)


@app.get("/api/accounts/{account_id}", response_model=AccountDetailResponse, tags=["Accounts"])
async def get_account_detail(account_id: str):
    """Retrieve complete account profile with integrated real-time risk assessment."""
    acc = data_manager.get_account(account_id)
    if not acc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account '{account_id}' not found in registry."
        )

    risk_info = data_manager.get_account_risk(account_id)

    return AccountDetailResponse(
        id=str(acc["id"]),
        name=str(acc.get("name", acc["id"])),
        accountType=str(acc.get("accountType", "Savings Account")),
        accountAgeDays=int(acc.get("accountAgeDays", 0)),
        currentBalance=float(acc.get("currentBalance", 0.0)),
        behavior_class=str(acc.get("behavior_class", "unknown")),
        region=str(acc.get("region", "National")),
        status=str(acc.get("status", "Active")),
        business_registered=bool(acc.get("business_registered", False)),
        gstin_present=bool(acc.get("gstin_present", False)),
        gstin_number=acc.get("gstin_number"),
        business_category=acc.get("business_category"),
        identity_verification_status=acc.get("identity_verification_status", "VERIFIED_INDIVIDUAL"),
        expected_activity_profile=acc.get("expected_activity_profile"),
        entity_id=acc.get("entity_id"),
        risk_analysis=AccountRiskResponse(**risk_info)
    )


# -------------------------------------------------------------
# INVESTIGATION & GRAPH TRACING ENDPOINTS
# -------------------------------------------------------------
@app.post("/api/investigate", response_model=InvestigationResponse, tags=["Investigation"])
async def investigate_transaction(request: InvestigateRequest):
    """
    Execute temporal BFS money trail tracing starting from a reported fraudulent transaction.
    Traces downstream hops, measures commission dissipation, assesses hop risk, and predicts next hop at terminal account.
    """
    try:
        result = trace_money_trail(
            transaction_id=request.transaction_id,
            account_id=request.account_id,
            max_hops=request.max_hops or 6
        )
        return InvestigationResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        logger.exception(f"Error during investigation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Investigation failed: {str(e)}"
        )


@app.post("/api/next-hop", response_model=NextHopPredictionResponse, tags=["ML Inference"])
async def predict_next_hop(request: NextHopRequest):
    """
    Predict next destination accounts for funds arriving at a specific account via an inbound transfer.
    """
    acc = data_manager.get_account(request.account_id)
    if not acc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account '{request.account_id}' not found in database."
        )

    txn = data_manager.get_transaction(request.incoming_transaction_id)
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incoming transaction '{request.incoming_transaction_id}' not found."
        )

    in_amount = float(txn.get("amount", 0.0))
    current_epoch = int(txn.get("timeEpoch", 0))

    candidate_ids = [
        str(a["id"]) for a in data_manager.get_all_accounts()
        if str(a["id"]) != str(request.account_id)
    ]

    try:
        prediction = rank_next_hop_candidates(
            current_account_id=str(request.account_id),
            in_amount=in_amount,
            current_epoch=current_epoch,
            candidate_account_ids=candidate_ids,
            history_transactions=data_manager.get_all_transactions(),
            accounts=data_manager.get_all_accounts(),
            top_k=5
        )
        return NextHopPredictionResponse(**prediction)
    except Exception as e:
        logger.exception(f"Next-hop prediction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Next-hop inference failed: {str(e)}"
        )


@app.get("/api/network", response_model=NetworkGraphResponse, tags=["Network Graph"])
async def get_network(
    refresh: bool = Query(False, description="Force recalculation of network cache")
):
    """
    Retrieve active transaction network graph (nodes and edges) formatted for graph visualization.
    """
    graph_data = get_network_graph(force_refresh=refresh)
    return NetworkGraphResponse(**graph_data)


@app.get("/api/network/communities", response_model=List[CommunityDetail], tags=["Network Graph"])
async def get_communities(
    refresh: bool = Query(False, description="Force recomputation of communities")
):
    """
    Run algorithmic community detection (modularity-based) to identify organized mule syndicates.
    """
    communities = detect_fraud_communities(force_refresh=refresh)
    return [CommunityDetail(**c) for c in communities]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
