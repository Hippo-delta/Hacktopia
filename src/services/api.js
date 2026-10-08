/**
 * API Service Integration Layer for Money Trail Hunter.
 * Connects React frontend components to the live FastAPI ML/Graph backend at http://localhost:8000.
 * Includes graceful fallbacks and state management for simulated actions.
 */

import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_RISK_ALERTS,
  INITIAL_CASES,
  SUSPICIOUS_COMMUNITIES,
  SYNTHETIC_REGIONS,
  RECENT_ACTIVITIES,
  PREDEFINED_SCENARIOS
} from '../data/syntheticData.js';
import { calculateAccountRisk } from '../utils/riskScoring.js';
import { traceMoneyTrail as localTraceMoneyTrail } from '../utils/moneyTrail.js';

export const API_BASE_URL = 'http://localhost:8000';

// In-memory reactive state for cases, alerts, activities and simulated freezes
let currentAccounts = [...INITIAL_ACCOUNTS];
let currentTransactions = [...INITIAL_TRANSACTIONS];
let currentAlerts = [...INITIAL_RISK_ALERTS];
let currentCases = [...INITIAL_CASES];
let currentActivities = [...RECENT_ACTIVITIES];
let currentCommunities = [...SUSPICIOUS_COMMUNITIES];
let currentRegions = [...SYNTHETIC_REGIONS];
const simulatedFrozenAccounts = new Set();

// Listeners for dataset state changes
const subscribers = new Set();
function notifyStateChanged() {
  subscribers.forEach(cb => cb());
}

export function subscribeToDataChanges(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

/**
 * Generic fetch wrapper for FastAPI backend endpoints with JSON parsing and error handling.
 */
async function fetchFromBackend(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    let detail = `Request to ${endpoint} failed with HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.detail) detail = parsed.detail;
    } catch (_) {}
    throw new Error(detail);
  }

  return await response.json();
}

/**
 * Inspect backend connectivity and model readiness.
 */
export async function checkBackendHealth() {
  try {
    const data = await fetchFromBackend('/api/health');
    return { isOnline: true, data };
  } catch (err) {
    return { isOnline: false, error: err.message };
  }
}

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------
export async function getDashboardStats() {
  try {
    const [network, scenarioData, comms] = await Promise.all([
      fetchFromBackend('/api/network'),
      fetchFromBackend('/api/scenario').catch(() => null),
      fetchFromBackend('/api/network/communities').catch(() => [])
    ]);

    const nodes = network.nodes || [];
    const edges = network.edges || [];

    const criticalCount = nodes.filter(n => n.risk_level === 'CRITICAL').length;
    const highCount = nodes.filter(n => n.risk_level === 'HIGH').length;
    const mediumCount = nodes.filter(n => n.risk_level === 'MEDIUM').length;
    const lowCount = nodes.filter(n => n.risk_level === 'LOW').length;
    const suspiciousAccounts = criticalCount + highCount;

    // Calculate total high-risk volume from active edges
    const totalVolume = edges.reduce((sum, e) => sum + (e.amount || 0), 0);
    const highRiskVol = edges
      .filter(e => e.is_scam_trail || e.riskLevel === 'CRITICAL')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const volFormatted = highRiskVol > 100000 
      ? `₹${(highRiskVol / 100000).toFixed(1)} Lakh` 
      : `₹${highRiskVol.toLocaleString()}`;

    const numCommunities = comms.length || 3;

    return {
      kpis: {
        totalAccounts: { 
          value: nodes.length, 
          formatted: String(nodes.length), 
          trend: '+1 active', 
          note: scenarioData ? scenarioData.name : 'Monitored scenario accounts' 
        },
        suspiciousAccounts: { 
          value: suspiciousAccounts, 
          formatted: String(suspiciousAccounts), 
          trend: 'Flagged', 
          note: 'ML risk probability > 60%' 
        },
        transactionsAnalysed: { 
          value: edges.length, 
          formatted: String(edges.length), 
          trend: 'Layered', 
          note: 'Chronological money flow edges' 
        },
        highRiskVolume: { 
          value: highRiskVol, 
          formatted: volFormatted, 
          trend: 'Traced', 
          note: 'Scam & mule pass-through volume' 
        },
        activeAlerts: { 
          value: currentAlerts.filter(a => a.status === 'New' || a.status === 'Investigating').length, 
          formatted: String(currentAlerts.length), 
          trend: '-1', 
          note: 'Analyst action items' 
        },
        suspiciousCommunities: { 
          value: numCommunities, 
          formatted: String(numCommunities), 
          trend: 'Active', 
          note: 'NetworkX detected rings' 
        }
      },
      riskDistribution: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        total: nodes.length
      },
      recentActivities: currentActivities,
      activeScenario: scenarioData ? scenarioData.id : PREDEFINED_SCENARIOS.SCENARIO_3_MULTI_HOP.id,
      activeScenarioName: scenarioData ? scenarioData.name : 'Flagship Multi-Hop Network'
    };
  } catch (err) {
    console.warn('[Dashboard] Backend unavailable, using local cache:', err.message);
    const criticalCount = currentAccounts.filter(a => a.riskLevel === 'CRITICAL').length;
    const highCount = currentAccounts.filter(a => a.riskLevel === 'HIGH').length;
    const mediumCount = currentAccounts.filter(a => a.riskLevel === 'MEDIUM').length;
    const lowCount = currentAccounts.filter(a => a.riskLevel === 'LOW').length;

    return {
      kpis: {
        totalAccounts: { value: currentAccounts.length, formatted: String(currentAccounts.length), trend: '+4.2%', note: 'Active accounts' },
        suspiciousAccounts: { value: criticalCount + highCount, formatted: String(criticalCount + highCount), trend: '+12%', note: 'Risk > 60%' },
        transactionsAnalysed: { value: currentTransactions.length, formatted: String(currentTransactions.length), trend: '+18.5%', note: 'Layering edges' },
        highRiskVolume: { value: 75000, formatted: '₹75,000', trend: '+9.1%', note: 'Flagship scam' },
        activeAlerts: { value: currentAlerts.length, formatted: String(currentAlerts.length), trend: '-2', note: 'Active alerts' },
        suspiciousCommunities: { value: 3, formatted: '3', trend: '+1', note: 'Cluster density' }
      },
      riskDistribution: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        total: currentAccounts.length
      },
      recentActivities: currentActivities,
      activeScenario: PREDEFINED_SCENARIOS.SCENARIO_3_MULTI_HOP.id,
      activeScenarioName: 'Flagship Multi-Hop Network'
    };
  }
}

// -------------------------------------------------------------
// ACCOUNT INVESTIGATION
// -------------------------------------------------------------
export async function getAccount(accountId) {
  if (!accountId) return null;

  try {
    const data = await fetchFromBackend(`/api/accounts/${encodeURIComponent(accountId)}`);
    const feats = data.risk_analysis?.features || {};
    const riskProb = data.risk_analysis?.risk_probability || 0.0;
    const riskScore = Math.round(riskProb * 100);
    const riskLevel = data.risk_analysis?.risk_level || 'LOW';
    const isFrozen = simulatedFrozenAccounts.has(data.id);

    // Explainable risk reasons derived directly from trained tabular forensic features
    const riskReasons = [];
    if (feats.pass_through_ratio >= 0.8) {
      riskReasons.push(`Extremely high pass-through ratio (${(feats.pass_through_ratio * 100).toFixed(0)}% funds drained within minutes)`);
    }
    if (feats.median_in_out_delay_min <= 5) {
      riskReasons.push(`Rapid layering turnaround: outgoing transfer initiated within ${Math.round(feats.median_in_out_delay_min)} mins`);
    }
    if (feats.structuring_ratio > 0) {
      riskReasons.push(`Structuring pattern detected: transactions clustered near statutory ₹50k reporting threshold`);
    }
    if (feats.suspicious_connection_count > 0) {
      riskReasons.push(`Topological link: direct transfers with ${feats.suspicious_connection_count} flagged mule accounts`);
    }
    if (data.accountAgeDays < 60) {
      riskReasons.push(`New account velocity: registered ${data.accountAgeDays} days ago with sudden high turnover`);
    }
    // Positive legitimacy context signals (mentor feedback: high activity != automatic mule)
    if (data.business_registered) {
      riskReasons.push(`✅ Contextual signal: Formally registered business entity — high transaction volume may reflect legitimate commercial activity`);
    }
    if (data.gstin_present && data.gstin_number) {
      riskReasons.push(`✅ GSTIN on record (${data.gstin_number}): Indicates registered taxpayer with government-visible supply chain transactions`);
    }
    if (data.entity_id) {
      riskReasons.push(`✅ Same-entity link (${data.entity_id}): Inter-account transfers may represent internal treasury sweeps under common ownership`);
    }
    if (data.identity_verification_status === 'VERIFIED_INDIVIDUAL' || data.identity_verification_status === 'VERIFIED_BUSINESS') {
      riskReasons.push(`✅ Identity verified: KYC documentation on record — account holder identity confirmed`);
    }
    if (riskReasons.length === 0) {
      riskReasons.push(`Normal transactional baseline: low velocity and balanced residual holding`);
    }

    // Transparent breakdown matching frontend radar/progress displays
    const riskBreakdown = {
      incomingDiversityScore: Math.min(20, Math.round((feats.unique_senders || 1) * 4)),
      velocityScore: Math.min(25, Math.round((feats.txn_velocity_per_hour || 0.5) * 8)),
      passThroughScore: Math.min(25, Math.round((feats.pass_through_ratio || 0.1) * 25)),
      networkScore: Math.min(20, Math.round((feats.suspicious_connection_count || 0) * 6)),
      frequencyScore: Math.min(10, Math.round((feats.total_txns || 2) * 2))
    };

    return {
      id: data.id,
      name: data.name,
      accountType: data.accountType,
      accountAgeDays: data.accountAgeDays,
      currentBalance: data.currentBalance,
      status: isFrozen ? 'Simulated Frozen' : data.status,
      behavior_class: data.behavior_class,
      region: data.region,
      // Indian Identity Context
      business_registered: data.business_registered ?? false,
      gstin_present: data.gstin_present ?? false,
      gstin_number: data.gstin_number ?? null,
      business_category: data.business_category ?? null,
      identity_verification_status: data.identity_verification_status ?? 'VERIFIED_INDIVIDUAL',
      expected_activity_profile: data.expected_activity_profile ?? null,
      entity_id: data.entity_id ?? null,
      riskScore,
      riskLevel,
      riskProbability: riskProb,
      predictedClass: data.risk_analysis?.predicted_class,
      passThroughRatio: feats.pass_through_ratio || 0.0,
      totalIncoming: feats.total_incoming_amount || 0.0,
      totalOutgoing: feats.total_outgoing_amount || 0.0,
      medianTransferDelayMinutes: Math.round(feats.median_in_out_delay_min || 0),
      uniqueSenders: feats.unique_senders || 0,
      uniqueReceivers: feats.unique_receivers || 0,
      txnCount: feats.total_txns || 0,
      riskBreakdown,
      riskReasons,
      timeline: [
        { time: '10:15 AM', description: 'Real-time ML risk inference evaluated', severity: riskLevel }
      ]
    };
  } catch (err) {
    console.warn(`[Account] Backend lookup failed for ${accountId}, falling back to local dataset:`, err.message);
    const acc = currentAccounts.find(a => a.id.toLowerCase() === accountId.toLowerCase());
    if (!acc) return null;
    const isFrozen = simulatedFrozenAccounts.has(acc.id);
    const riskAnalysis = calculateAccountRisk(acc);
    return {
      ...acc,
      status: isFrozen ? 'Simulated Frozen' : acc.status,
      riskScore: riskAnalysis.score,
      riskLevel: riskAnalysis.level,
      riskBreakdown: riskAnalysis.breakdown,
      riskReasons: riskAnalysis.reasons
    };
  }
}

export async function getAllAccounts(filters = {}) {
  try {
    const network = await fetchFromBackend('/api/network');
    let accountsList = (network.nodes || []).map(n => ({
      id: n.id,
      name: n.name,
      accountType: n.account_type,
      riskScore: Math.round(n.risk_probability * 100),
      riskLevel: n.risk_level,
      isMule: n.is_suspicious,
      region: n.region,
      status: simulatedFrozenAccounts.has(n.id) ? 'Simulated Frozen' : (n.is_suspicious ? 'Flagged for Review' : 'Active')
    }));

    if (filters.riskLevel && filters.riskLevel !== 'ALL') {
      accountsList = accountsList.filter(a => a.riskLevel.toUpperCase() === filters.riskLevel.toUpperCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      accountsList = accountsList.filter(a => a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
    }
    return accountsList;
  } catch (err) {
    console.warn('[Accounts] Backend unavailable, using local accounts:', err.message);
    let result = [...currentAccounts];
    if (filters.riskLevel && filters.riskLevel !== 'ALL') {
      result = result.filter(a => a.riskLevel.toUpperCase() === filters.riskLevel.toUpperCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(a => a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
    }
    return result;
  }
}

// -------------------------------------------------------------
// TRANSACTION EXPLORER & DETAILS
// -------------------------------------------------------------
export async function getTransaction(transactionId) {
  if (!transactionId) return null;
  const tid = transactionId.toLowerCase();
  
  // Try network edges first
  try {
    const network = await fetchFromBackend('/api/network');
    const edge = (network.edges || []).find(e => e.id.toLowerCase() === tid);
    if (edge) {
      return {
        id: edge.id,
        fromAccount: edge.source,
        toAccount: edge.target,
        amount: edge.amount,
        timestamp: edge.timestamp,
        timeEpoch: edge.time_epoch,
        channel: edge.channel,
        riskLevel: edge.is_scam_trail ? 'CRITICAL' : 'LOW',
        isScamTrail: edge.is_scam_trail,
        status: 'Completed',
        notes: edge.is_scam_trail ? 'Mule layer transfer in active investigation' : 'Standard bank transfer'
      };
    }
  } catch (_) {}

  const match = currentTransactions.find(t => t.id.toLowerCase() === tid);
  return match || null;
}

export async function getTransactions(filters = {}) {
  let txns = [];
  try {
    const network = await fetchFromBackend('/api/network');
    txns = (network.edges || []).map(e => ({
      id: e.id,
      fromAccount: e.source,
      toAccount: e.target,
      amount: e.amount,
      timestamp: e.timestamp,
      timeEpoch: e.time_epoch,
      channel: e.channel,
      riskLevel: e.is_scam_trail ? 'CRITICAL' : 'LOW',
      isScamTrail: e.is_scam_trail,
      status: 'Completed',
      notes: e.is_scam_trail ? 'Scam money trail hop' : 'Commercial transfer'
    }));
  } catch (err) {
    txns = [...currentTransactions];
  }

  let result = txns;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(t => 
      t.id.toLowerCase().includes(q) ||
      t.fromAccount.toLowerCase().includes(q) ||
      t.toAccount.toLowerCase().includes(q)
    );
  }
  if (filters.accountId) {
    const aid = filters.accountId.toLowerCase();
    result = result.filter(t => t.fromAccount.toLowerCase() === aid || t.toAccount.toLowerCase() === aid);
  }
  if (filters.direction && filters.direction !== 'ALL' && filters.accountId) {
    const aid = filters.accountId.toLowerCase();
    if (filters.direction === 'INCOMING') {
      result = result.filter(t => t.toAccount.toLowerCase() === aid);
    } else if (filters.direction === 'OUTGOING') {
      result = result.filter(t => t.fromAccount.toLowerCase() === aid);
    }
  }
  if (filters.riskLevel && filters.riskLevel !== 'ALL') {
    result = result.filter(t => t.riskLevel.toUpperCase() === filters.riskLevel.toUpperCase());
  }
  if (filters.minAmount) {
    result = result.filter(t => t.amount >= Number(filters.minAmount));
  }
  if (filters.channel && filters.channel !== 'ALL') {
    result = result.filter(t => t.channel.toUpperCase() === filters.channel.toUpperCase());
  }

  return result.sort((a, b) => b.timeEpoch - a.timeEpoch);
}

// -------------------------------------------------------------
// TRACE TRANSACTION / MONEY TRAIL (Core Investigation Integration)
// -------------------------------------------------------------
export async function traceTransaction(query, maxHops = 6) {
  const cleanQuery = (query || 'TXN-84921').trim();

  try {
    // Send to FastAPI Temporal BFS endpoint
    const data = await fetchFromBackend('/api/investigate', {
      method: 'POST',
      body: JSON.stringify({
        transaction_id: cleanQuery,
        max_hops: maxHops
      })
    });

    // Format trail hops from FastAPI response
    const hops = (data.trail || []).map(h => ({
      hopNumber: h.hop_number,
      txnId: h.txn_id,
      fromAccount: h.from_account,
      fromAccountName: h.from_account_name,
      fromRiskLevel: h.hop_number === 1 ? 'LOW' : 'CRITICAL',
      toAccount: h.to_account,
      toAccountName: h.to_account_name,
      toRiskScore: Math.round(h.to_risk_probability * 100),
      toRiskLevel: h.to_risk_level,
      amount: h.amount,
      timestamp: h.timestamp,
      timeEpoch: h.time_epoch,
      delayMinutes: h.delay_minutes,
      isSuspicious: h.is_suspicious,
      channel: h.channel,
      flagReason: h.delay_minutes <= 5 
        ? (h.delay_minutes === 0 ? 'Primary scam debit' : `Extreme velocity transfer (${h.delay_minutes} min delay)`)
        : 'Layering transfer'
    }));

    const initialAmount = data.summary?.initial_amount || hops[0]?.amount || 75000;
    const terminalAmount = data.summary?.terminal_amount || hops[hops.length - 1]?.amount || 65500;
    const totalAmountTraced = initialAmount;
    const amountRetained = data.summary?.amount_retained || Math.max(0, initialAmount - terminalAmount);
    const durationMinutes = data.summary?.duration_minutes || 13;
    const amounts = hops.map(h => h.amount);
    const highestTxn = Math.max(...amounts, 0);
    const avgTxn = amounts.length ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length) : 0;
    const nonZeroDelays = hops.filter(h => h.delayMinutes > 0).map(h => h.delayMinutes);
    const fastestTransferMin = nonZeroDelays.length ? Math.min(...nonZeroDelays) : 2;
    const passThroughRatio = initialAmount > 0 ? Number((terminalAmount / initialAmount).toFixed(2)) : 0.87;

    const flowAnalytics = {
      initialAmount,
      lastHopAmount: terminalAmount,
      totalIncoming: initialAmount,
      totalOutgoing: hops.slice(1).reduce((sum, h) => sum + h.amount, 0),
      highestTxn,
      avgTxn,
      fastestTransferMin,
      amountRetained,
      passThroughRatio,
      sequenceSummary: hops.map(h => ({
        account: h.toAccount,
        amount: h.amount,
        hop: h.hopNumber
      }))
    };

    // Format ML next-hop prediction from FastAPI response
    const nextHop = data.next_hop_prediction;
    const nextHopPrediction = nextHop ? {
      currentAccount: nextHop.current_account,
      potentialNextHop: nextHop.predicted_next_hop,
      targetName: nextHop.predicted_target_name,
      targetRiskScore: 85,
      targetRiskLevel: 'HIGH',
      estimatedAmount: nextHop.estimated_onward_amount,
      estimatedWindow: '2–5 minutes',
      confidence: nextHop.confidence,
      rationale: `Random Forest ML model evaluated causal graph topology, historical volume, and velocity features across ${nextHop.total_candidates_evaluated} candidates.`
    } : {
      currentAccount: data.summary?.terminal_account || 'E889',
      potentialNextHop: 'NORM-1019',
      targetName: 'Retail Customer 19',
      targetRiskScore: 85,
      targetRiskLevel: 'HIGH',
      estimatedAmount: Math.round(terminalAmount * 0.96),
      estimatedWindow: '2–5 minutes',
      confidence: 96.9,
      rationale: 'Random Forest next-hop model predicted onward destination.'
    };

    const hypotheticalSimulation = {
      sourceAccount: data.summary?.terminal_account || 'E889',
      hypotheticalDestination: nextHopPrediction.potentialNextHop,
      destinationName: nextHopPrediction.targetName,
      estimatedAmount: nextHopPrediction.estimatedAmount,
      estimatedDelay: '2–4 minutes',
      destinationRisk: 'HIGH',
      impactSummary: 'Money will exit banking rails to OTC Bullion / crypto escrow if not halted within window.',
      recommendedAction: 'Apply simulated interim debit freeze on destination account.'
    };

    return {
      hops,
      totalHops: data.summary?.number_of_hops || hops.length,
      totalAmountTraced,
      durationMinutes,
      amountRetained,
      flowAnalytics,
      nextHopPrediction,
      hypotheticalSimulation
    };
  } catch (err) {
    console.warn(`[Trace] FastAPI /api/investigate failed for ${cleanQuery}, falling back to local tracer:`, err.message);
    const isTxn = cleanQuery.toUpperCase().startsWith('TXN');
    return localTraceMoneyTrail({
      startTxnId: isTxn ? cleanQuery : null,
      startAccountId: !isTxn ? cleanQuery : null,
      transactions: currentTransactions,
      accounts: currentAccounts,
      maxHops
    });
  }
}

// -------------------------------------------------------------
// NEXT-HOP PREDICTION STANDALONE ENDPOINT
// -------------------------------------------------------------
export async function predictNextHop(accountId, incomingTxnId) {
  try {
    const data = await fetchFromBackend('/api/next-hop', {
      method: 'POST',
      body: JSON.stringify({
        account_id: accountId,
        incoming_transaction_id: incomingTxnId
      })
    });
    return data;
  } catch (err) {
    console.warn('[NextHop] Standalone next-hop API failed:', err.message);
    return null;
  }
}

// -------------------------------------------------------------
// RISK ALERTS
// -------------------------------------------------------------
export async function getRiskAlerts(filters = {}) {
  let result = [...currentAlerts];

  if (filters.severity && filters.severity !== 'ALL') {
    result = result.filter(a => a.severity.toUpperCase() === filters.severity.toUpperCase());
  }
  if (filters.status && filters.status !== 'ALL') {
    result = result.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
  }
  if (filters.alertType && filters.alertType !== 'ALL') {
    result = result.filter(a => a.alertType.toLowerCase() === filters.alertType.toLowerCase());
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(a => 
      a.id.toLowerCase().includes(q) || 
      a.accountId.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  }

  return result;
}

export async function updateAlertStatus(alertId, newStatus, analyst = 'Agent R. Sharma') {
  const alert = currentAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.status = newStatus;
    if (analyst) alert.assignedAnalyst = analyst;
    notifyStateChanged();
  }
  return alert;
}

// -------------------------------------------------------------
// NETWORK GRAPH DATA (Backend Graph Visualization)
// -------------------------------------------------------------
export async function getNetworkData(filters = {}) {
  try {
    const data = await fetchFromBackend('/api/network');
    let nodes = (data.nodes || []).map(n => ({
      id: n.id,
      name: n.name,
      accountType: n.account_type,
      riskScore: Math.round(n.risk_probability * 100),
      riskLevel: n.risk_level,
      isMule: n.is_suspicious,
      region: n.region,
      status: simulatedFrozenAccounts.has(n.id) ? 'Simulated Frozen' : (n.is_suspicious ? 'Flagged for Review' : 'Active'),
      currentBalance: 1500,
      passThroughRatio: n.is_suspicious ? 0.95 : 0.2
    }));

    let edges = (data.edges || []).map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      amount: e.amount,
      timestamp: e.timestamp,
      timeEpoch: e.time_epoch,
      riskLevel: e.is_scam_trail ? 'CRITICAL' : 'LOW',
      channel: e.channel,
      isScamTrail: e.is_scam_trail
    }));

    // Apply filtering
    if (filters.communityId && filters.communityId !== 'ALL') {
      // Look up community members
      const comms = await getCommunities();
      const matchComm = comms.find(c => c.id === filters.communityId);
      if (matchComm && matchComm.members) {
        const memberSet = new Set(matchComm.members);
        nodes = nodes.filter(n => memberSet.has(n.id));
        edges = edges.filter(e => memberSet.has(e.source) && memberSet.has(e.target));
      }
    }
    if (filters.riskLevel && filters.riskLevel !== 'ALL') {
      const validRiskNodes = new Set(nodes.filter(n => n.riskLevel.toUpperCase() === filters.riskLevel.toUpperCase()).map(n => n.id));
      nodes = nodes.filter(n => validRiskNodes.has(n.id));
      edges = edges.filter(e => validRiskNodes.has(e.source) || validRiskNodes.has(e.target));
    }
    if (filters.minAmount) {
      edges = edges.filter(e => e.amount >= Number(filters.minAmount));
      const activeNodeIds = new Set([...edges.map(e => e.source), ...edges.map(e => e.target)]);
      nodes = nodes.filter(n => activeNodeIds.has(n.id));
    }
    if (filters.suspiciousOnly) {
      nodes = nodes.filter(n => n.riskScore >= 60 || n.isMule);
      const nodeIds = new Set(nodes.map(n => n.id));
      edges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    }

    return {
      nodes,
      edges,
      summary: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        suspiciousNodes: nodes.filter(n => n.riskScore >= 60).length,
        suspiciousClusters: 3,
        maxPathDepth: 5
      }
    };
  } catch (err) {
    console.warn('[Network] Backend /api/network failed, using local graph:', err.message);
    let nodes = currentAccounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      accountType: acc.accountType,
      riskScore: acc.riskScore,
      riskLevel: acc.riskLevel,
      isMule: acc.isMule,
      communityId: acc.communityId,
      region: acc.region,
      currentBalance: acc.currentBalance,
      status: simulatedFrozenAccounts.has(acc.id) ? 'Simulated Frozen' : acc.status
    }));

    let edges = currentTransactions.map(txn => ({
      id: txn.id,
      source: txn.fromAccount,
      target: txn.toAccount,
      amount: txn.amount,
      timestamp: txn.timestamp,
      timeEpoch: txn.timeEpoch,
      riskLevel: txn.riskLevel,
      channel: txn.channel,
      isScamTrail: txn.isScamTrail
    }));

    return {
      nodes,
      edges,
      summary: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        suspiciousNodes: nodes.filter(n => n.riskScore >= 60).length,
        suspiciousClusters: 2,
        maxPathDepth: 5
      }
    };
  }
}

// -------------------------------------------------------------
// SUSPICIOUS COMMUNITIES (NetworkX Graph Community Detection)
// -------------------------------------------------------------
export async function getCommunities() {
  try {
    const rawComms = await fetchFromBackend('/api/network/communities');
    return rawComms.map(c => ({
      id: c.community_id,
      name: `Syndicate Cluster ${c.community_id}`,
      memberCount: c.member_count,
      members: c.members,
      suspiciousCount: c.suspicious_count,
      totalVolume: c.total_volume || c.total_inflow,
      totalInflow: c.total_inflow,
      averageRiskScore: Math.round((c.average_risk_score || 0) * 100),
      riskLevel: (c.average_risk_score || 0) >= 0.60 ? 'CRITICAL' : ((c.average_risk_score || 0) >= 0.35 ? 'HIGH' : 'LOW'),
      density: c.member_count > 0 ? `${Math.round((c.suspicious_count / c.member_count) * 100)}%` : '0%',
      description: `${c.suspicious_count} flagged suspicious accounts clustered via NetworkX modularity optimization.`
    }));
  } catch (err) {
    console.warn('[Communities] Backend community detection failed, using local:', err.message);
    return [...currentCommunities];
  }
}

export async function getCommunityById(communityId) {
  const comms = await getCommunities();
  return comms.find(c => c.id === communityId) || comms[0];
}

// -------------------------------------------------------------
// CASE MANAGEMENT (In-Memory Audit Tracking)
// -------------------------------------------------------------
export async function getCases() {
  return [...currentCases];
}

export async function getCaseById(caseId) {
  return currentCases.find(c => c.id.toLowerCase() === caseId.toLowerCase()) || currentCases[0];
}

export async function createCase(caseData) {
  const newCaseId = `CASE-2026-0${Math.floor(100 + Math.random() * 900)}`;
  const newCase = {
    id: newCaseId,
    title: caseData.title || 'New Fraud Investigation',
    priority: caseData.priority || 'High',
    assignedAnalyst: caseData.assignedAnalyst || 'Agent R. Sharma',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Open',
    suspiciousAccounts: caseData.accounts || [],
    transactions: caseData.transactions || [],
    amountUnderInvestigation: caseData.amount || 0,
    summary: caseData.summary || 'Created from analyst workstation.',
    evidenceList: caseData.evidenceList || []
  };

  currentCases.unshift(newCase);
  currentActivities.unshift({
    id: `ACT-${Date.now()}`,
    time: 'Just now',
    type: 'case',
    description: `Investigation case ${newCaseId} initialized: "${newCase.title}"`,
    severity: 'LOW',
    icon: 'Briefcase'
  });

  notifyStateChanged();
  return newCase;
}

export async function addEvidenceToCase(caseId, evidenceItem) {
  const targetCase = currentCases.find(c => c.id.toLowerCase() === caseId.toLowerCase());
  if (targetCase) {
    const item = {
      id: `EV-${Date.now()}`,
      ...evidenceItem,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    targetCase.evidenceList.push(item);
    if (evidenceItem.type === 'account' && !targetCase.suspiciousAccounts.includes(evidenceItem.label)) {
      targetCase.suspiciousAccounts.push(evidenceItem.label);
    }
    if (evidenceItem.type === 'transaction' && !targetCase.transactions.includes(evidenceItem.label)) {
      targetCase.transactions.push(evidenceItem.label);
    }
    notifyStateChanged();
    return targetCase;
  }
  return null;
}

export async function removeEvidenceFromCase(caseId, evidenceId) {
  const targetCase = currentCases.find(c => c.id.toLowerCase() === caseId.toLowerCase());
  if (targetCase) {
    targetCase.evidenceList = targetCase.evidenceList.filter(e => e.id !== evidenceId);
    notifyStateChanged();
    return targetCase;
  }
  return null;
}

// -------------------------------------------------------------
// SIMULATED ACTIONS (Explicitly Simulated Freeze Functionality)
// -------------------------------------------------------------
export async function simulateFreezeAccount(accountId, reason = 'Automated Mule Pass-Through Detection') {
  simulatedFrozenAccounts.add(accountId);

  const acc = currentAccounts.find(a => a.id.toLowerCase() === accountId.toLowerCase());
  if (acc) {
    acc.status = 'Simulated Frozen';
    acc.timeline.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: `ACTION SIMULATED — ACCOUNT FLAGGED FOR REVIEW (Debit Freeze Simulated)`,
      severity: 'CRITICAL'
    });
  }

  currentActivities.unshift({
    id: `ACT-${Date.now()}`,
    time: 'Just now',
    type: 'freeze',
    description: `ACTION SIMULATED — Account ${accountId} flagged for debit freeze review`,
    severity: 'CRITICAL',
    icon: 'ShieldAlert'
  });

  if (currentCases.length > 0) {
    currentCases[0].evidenceList.push({
      id: `EV-${Date.now()}`,
      type: 'action',
      label: `Simulated Freeze: ${accountId}`,
      detail: `Account marked for review. Reason: ${reason}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  notifyStateChanged();
  return {
    success: true,
    accountId,
    status: 'Simulated Frozen',
    message: 'ACTION SIMULATED — ACCOUNT FLAGGED FOR REVIEW',
    disclaimer: 'This is a simulation prototype. No live banking systems or debit rails were modified.'
  };
}

// -------------------------------------------------------------
// REGIONAL HEATMAP
// -------------------------------------------------------------
export async function getRegionalData() {
  return [...currentRegions];
}

// -------------------------------------------------------------
// DEMO SCENARIO MANAGEMENT
// -------------------------------------------------------------
// DEMO SCENARIO MANAGEMENT (Backend-Powered Coherent Scenarios)
// -------------------------------------------------------------
export async function getActiveScenario() {
  try {
    return await fetchFromBackend('/api/scenario');
  } catch (err) {
    return {
      id: 'scenario-flagship',
      name: 'Flagship: Multi-Hop Scam Network (TXN-84921)',
      narrative: 'Digital arrest multi-hop trail',
      starting_transaction_id: 'TXN-84921',
      starting_account_id: 'A102',
      accounts_count: currentAccounts.length,
      transactions_count: currentTransactions.length,
      suspicious_accounts_count: 5
    };
  }
}

export async function refreshActiveScenario() {
  try {
    const summary = await fetchFromBackend('/api/scenario/refresh', {
      method: 'POST'
    });

    currentActivities.unshift({
      id: `ACT-${Date.now()}`,
      time: 'Just now',
      type: 'scenario',
      description: `Loaded new coherent investigation: "${summary.name}"`,
      severity: 'LOW',
      icon: 'Sparkles'
    });

    notifyStateChanged();
    return summary;
  } catch (err) {
    console.warn('[Scenario] Backend refresh failed, cycling local scenario:', err.message);
    const keys = Object.keys(PREDEFINED_SCENARIOS);
    const nextKey = keys[Math.floor(Math.random() * keys.length)];
    return await switchScenario(nextKey);
  }
}

export async function selectActiveScenario(scenarioId) {
  try {
    const summary = await fetchFromBackend('/api/scenario/select', {
      method: 'POST',
      body: JSON.stringify({ scenario_id: scenarioId })
    });

    currentActivities.unshift({
      id: `ACT-${Date.now()}`,
      time: 'Just now',
      type: 'scenario',
      description: `Selected investigation scenario: "${summary.name}"`,
      severity: 'LOW',
      icon: 'Sparkles'
    });

    notifyStateChanged();
    return summary;
  } catch (err) {
    console.warn('[Scenario] Backend select failed:', err.message);
    return null;
  }
}

export async function getScenarios() {
  return PREDEFINED_SCENARIOS;
}

export async function switchScenario(scenarioKey) {
  // Map UI key to backend scenario ID
  let backendScenarioId = 'scenario-flagship';
  if (scenarioKey === 'SCENARIO_1_NORMAL' || scenarioKey === 'scenario-1') {
    backendScenarioId = 'scenario-1';
  } else if (scenarioKey === 'SCENARIO_2_SINGLE_MULE' || scenarioKey === 'scenario-2') {
    backendScenarioId = 'scenario-2';
  } else if (scenarioKey === 'SCENARIO_3_MULTI_HOP' || scenarioKey === 'scenario-3' || scenarioKey === 'scenario-flagship') {
    backendScenarioId = 'scenario-flagship';
  }

  try {
    await fetchFromBackend('/api/scenario/select', {
      method: 'POST',
      body: JSON.stringify({ scenario_id: backendScenarioId })
    });
  } catch (err) {
    console.warn('[Scenario] Backend select failed during switchScenario:', err.message);
  }

  const scenario = PREDEFINED_SCENARIOS[scenarioKey] || PREDEFINED_SCENARIOS.SCENARIO_3_MULTI_HOP;
  currentAccounts = JSON.parse(JSON.stringify(scenario.accounts));
  currentTransactions = JSON.parse(JSON.stringify(scenario.transactions));
  currentAlerts = JSON.parse(JSON.stringify(scenario.alerts));

  currentActivities.unshift({
    id: `ACT-${Date.now()}`,
    time: 'Just now',
    type: 'scenario',
    description: `Switched demo scenario to: "${scenario.name}"`,
    severity: 'LOW',
    icon: 'Sparkles'
  });

  notifyStateChanged();
  return scenario;
}

export async function resetDataset() {
  try {
    await fetchFromBackend('/api/scenario/select', {
      method: 'POST',
      body: JSON.stringify({ scenario_id: 'scenario-flagship' })
    });
  } catch (_) {}

  currentAccounts = [...INITIAL_ACCOUNTS];
  currentTransactions = [...INITIAL_TRANSACTIONS];
  currentAlerts = [...INITIAL_RISK_ALERTS];
  currentCases = [...INITIAL_CASES];
  currentActivities = [...RECENT_ACTIVITIES];
  currentCommunities = [...SUSPICIOUS_COMMUNITIES];
  currentRegions = [...SYNTHETIC_REGIONS];
  simulatedFrozenAccounts.clear();
  notifyStateChanged();
  return true;
}

export async function generateSyntheticTransactions(count = 5) {
  const newTxns = [];
  const channels = ['UPI', 'IMPS', 'RTGS', 'NEFT'];
  for (let i = 0; i < count; i++) {
    const fromAcc = currentAccounts[Math.floor(Math.random() * currentAccounts.length)];
    let toAcc = currentAccounts[Math.floor(Math.random() * currentAccounts.length)];
    while (toAcc.id === fromAcc.id) {
      toAcc = currentAccounts[Math.floor(Math.random() * currentAccounts.length)];
    }
    const amt = Math.floor(5000 + Math.random() * 85000);
    const txn = {
      id: `TXN-SYN-${Date.now().toString().slice(-4)}${i}`,
      fromAccount: fromAcc.id,
      toAccount: toAcc.id,
      amount: amt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeEpoch: Math.floor(Date.now() / 1000),
      channel: channels[Math.floor(Math.random() * channels.length)],
      riskLevel: amt > 60000 ? 'CRITICAL' : (amt > 30000 ? 'HIGH' : 'LOW'),
      status: 'Completed',
      notes: 'Dynamically generated synthetic transaction'
    };
    newTxns.push(txn);
    currentTransactions.unshift(txn);
  }

  currentActivities.unshift({
    id: `ACT-${Date.now()}`,
    time: 'Just now',
    type: 'generate',
    description: `Synthesized ${count} new demo transactions into active graph`,
    severity: 'LOW',
    icon: 'PlusCircle'
  });

  notifyStateChanged();
  return newTxns;
}

// -------------------------------------------------------------
// REPORTS
// -------------------------------------------------------------
export async function getReports() {
  return {
    title: 'Digital Arrest Scam & Mule Network Forensic Investigation Report',
    reportId: 'REP-2026-FT03-MULE',
    generatedAt: new Date().toLocaleString(),
    classification: 'CONFIDENTIAL — BANK AML / CYBER FRAUD UNIT',
    author: 'Lead Investigator R. Sharma (Fraud Risk Operations)',
    executiveSummary: 'Automated graph intelligence detected a rapid 5-hop pass-through syndicate routing ₹75,000 from reporting victim Devendra K. (Victim-001) to virtual remittance escrow E889 within 13 minutes. The syndicate exhibits characteristic mule indicators including 87%+ pass-through ratios, sub-5-minute transfer latencies, and concentrated clustering in Community #17.',
    keyMetrics: {
      totalAccountsInvolved: currentAccounts.filter(a => a.riskScore >= 60).length,
      scamAmountTraced: 75000,
      velocityRating: 'Extreme (Median 3.2m transfer delay)',
      primarySyndicate: 'Community #17',
      recommendedFreezeTarget: 'E889 (Terminal Escrow)'
    },
    flaggedMules: currentAccounts.filter(a => a.isMule).map(a => ({
      id: a.id,
      name: a.name,
      score: a.riskScore,
      level: a.riskLevel,
      passThrough: `${(a.passThroughRatio * 100).toFixed(0)}%`,
      delay: `${a.medianTransferDelayMinutes}m`,
      status: a.status
    })),
    moneyTrailSummary: [
      { hop: 1, flow: 'Victim-001 → A102', amount: 75000, delay: 'Entry Point' },
      { hop: 2, flow: 'A102 → B552', amount: 73500, delay: '3 mins' },
      { hop: 3, flow: 'B552 → C771', amount: 70000, delay: '2 mins' },
      { hop: 4, flow: 'C771 → D334', amount: 68000, delay: '4 mins' },
      { hop: 5, flow: 'D334 → E889', amount: 65500, delay: '4 mins' }
    ]
  };
}

// -------------------------------------------------------------
// CSV EXPORTERS
// -------------------------------------------------------------
export function exportTransactionsCsv() {
  const headers = ['Transaction ID', 'From Account', 'To Account', 'Amount (INR)', 'Timestamp', 'Channel', 'Risk Level', 'Status', 'Notes'];
  const rows = currentTransactions.map(t => [
    t.id,
    t.fromAccount,
    t.toAccount,
    t.amount,
    `"${t.timestamp}"`,
    t.channel,
    t.riskLevel,
    t.status,
    `"${t.notes?.replace(/"/g, '""') || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `money_trail_transactions_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

export function exportAccountsCsv() {
  const headers = ['Account ID', 'Account Name', 'Type', 'Risk Score', 'Risk Level', 'Current Balance', 'Incoming Total', 'Outgoing Total', 'Pass-Through Ratio', 'Status', 'Community'];
  const rows = currentAccounts.map(a => [
    a.id,
    `"${a.name}"`,
    a.accountType,
    a.riskScore,
    a.riskLevel,
    a.currentBalance,
    a.totalIncoming,
    a.totalOutgoing,
    a.passThroughRatio,
    a.status,
    a.communityId
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `mule_accounts_registry_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}
