"""
Pydantic Schemas for Money Trail Hunter API.
Defines clean request/response data contracts for investigation endpoints.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    dataset_loaded: bool
    risk_model_loaded: bool
    next_hop_model_loaded: bool
    accounts_count: int
    transactions_count: int
    service: str
    version: str


class AccountRiskResponse(BaseModel):
    account_id: str
    account_name: str
    account_type: str
    predicted_class: str
    risk_probability: float
    risk_level: str
    model_name: str
    model_version: str
    features: Dict[str, float]


class AccountDetailResponse(BaseModel):
    id: str
    name: str
    accountType: str
    accountAgeDays: int
    currentBalance: float
    behavior_class: str
    region: str
    status: str
    risk_analysis: AccountRiskResponse


class InvestigateRequest(BaseModel):
    transaction_id: Optional[str] = Field(None, description="Starting transaction ID, e.g. TXN-84921")
    account_id: Optional[str] = Field(None, description="Starting account ID, e.g. A102")
    max_hops: Optional[int] = Field(6, ge=1, le=20, description="Maximum hops to traverse")


class HopDetail(BaseModel):
    hop_number: int
    txn_id: str
    from_account: str
    from_account_name: str
    to_account: str
    to_account_name: str
    amount: float
    timestamp: str
    time_epoch: int
    delay_minutes: int
    to_risk_probability: float
    to_risk_level: str
    is_suspicious: bool
    channel: str


class NextHopCandidate(BaseModel):
    rank: int
    account_id: str
    account_name: str
    account_type: str
    confidence_score: float
    has_prior_transfer: bool
    prior_transfer_count: int


class NextHopPredictionResponse(BaseModel):
    current_account: str
    predicted_next_hop: Optional[str]
    predicted_target_name: Optional[str]
    confidence: float
    estimated_onward_amount: float
    model_version: str
    total_candidates_evaluated: int
    top_candidates: List[NextHopCandidate]


class NextHopRequest(BaseModel):
    account_id: str = Field(..., description="Account ID currently holding funds, e.g. A102")
    incoming_transaction_id: str = Field(..., description="Inbound transaction ID, e.g. TXN-84921")


class InvestigationSummary(BaseModel):
    starting_transaction: str
    initial_amount: float
    terminal_account: str
    terminal_amount: float
    amount_retained: float
    number_of_hops: int
    duration_minutes: int


class InvestigationResponse(BaseModel):
    summary: InvestigationSummary
    trail: List[HopDetail]
    next_hop_prediction: Optional[NextHopPredictionResponse]
    metadata: Dict[str, Any]


class NetworkNode(BaseModel):
    id: str
    name: str
    account_type: str
    risk_probability: float
    risk_level: str
    is_suspicious: bool
    region: str


class NetworkEdge(BaseModel):
    id: str
    source: str
    target: str
    amount: float
    timestamp: str
    time_epoch: int
    channel: str
    is_scam_trail: bool


class NetworkGraphResponse(BaseModel):
    nodes: List[NetworkNode]
    edges: List[NetworkEdge]
    total_nodes: int
    total_edges: int


class CommunityDetail(BaseModel):
    community_id: str
    member_count: int
    members: List[str]
    suspicious_count: int
    total_inflow: float
    average_risk_score: float = 0.0
    total_volume: float = 0.0
