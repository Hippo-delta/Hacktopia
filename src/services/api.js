/**
 * API Service Abstraction Layer
 * Provides clean async endpoints simulating a FastAPI backend.
 * Future migration path: Replace these synthetic responses with fetch('/api/v1/...')
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
} from '../data/syntheticData';
import { calculateAccountRisk } from '../utils/riskScoring';
import { traceMoneyTrail } from '../utils/moneyTrail';

// In-memory reactive state
let currentScenarioId = 'scenario-3';
let currentAccounts = [...INITIAL_ACCOUNTS];
let currentTransactions = [...INITIAL_TRANSACTIONS];
let currentAlerts = [...INITIAL_RISK_ALERTS];
let currentCases = [...INITIAL_CASES];
let currentActivities = [...RECENT_ACTIVITIES];
let currentCommunities = [...SUSPICIOUS_COMMUNITIES];
let currentRegions = [...SYNTHETIC_REGIONS];

// Listeners for dataset state changes
const subscribers = new Set();
function notifyStateChanged() {
  subscribers.forEach(cb => cb());
}

export function subscribeToDataChanges(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------
export async function getDashboardStats() {
  // Artificial micro-delay for realistic investigator feel
  await new Promise(r => setTimeout(r, 60));

  const totalAccounts = 10248; // Synthetically scaled representative population
  const suspiciousAccounts = currentAccounts.filter(a => a.riskScore >= 60).length + 132;
  const transactionsAnalysed = 82491;
  const highRiskVolume = 247000000; // ₹24.7 Cr synthetic volume
  const activeAlerts = currentAlerts.filter(a => a.status === 'New' || a.status === 'Investigating').length + 6;
  const suspiciousCommunities = 17;

  // Calculate local risk distribution
  const criticalCount = currentAccounts.filter(a => a.riskLevel === 'CRITICAL').length;
  const highCount = currentAccounts.filter(a => a.riskLevel === 'HIGH').length;
  const mediumCount = currentAccounts.filter(a => a.riskLevel === 'MEDIUM').length;
  const lowCount = currentAccounts.filter(a => a.riskLevel === 'LOW').length;

  return {
    kpis: {
      totalAccounts: { value: 10248, formatted: '10,248', trend: '+4.2%', note: 'Synthetic sample pool' },
      suspiciousAccounts: { value: suspiciousAccounts, formatted: String(suspiciousAccounts), trend: '+12%', note: 'Accounts with risk > 60' },
      transactionsAnalysed: { value: 82491, formatted: '82,491', trend: '+18.5%', note: 'Scanned in 24h window' },
      highRiskVolume: { value: highRiskVolume, formatted: '₹24.7 Cr', trend: '+9.1%', note: 'Mule network transit' },
      activeAlerts: { value: activeAlerts, formatted: String(activeAlerts), trend: '-2', note: 'Requires L1/L2 action' },
      suspiciousCommunities: { value: suspiciousCommunities, formatted: String(suspiciousCommunities), trend: '+3', note: 'Graph cluster density' }
    },
    riskDistribution: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      total: currentAccounts.length
    },
    recentActivities: currentActivities,
    activeScenario: PREDEFINED_SCENARIOS.SCENARIO_3_MULTI_HOP.id
  };
}

// -------------------------------------------------------------
// ACCOUNT INVESTIGATION
// -------------------------------------------------------------
export async function getAccount(accountId) {
  await new Promise(r => setTimeout(r, 50));
  if (!accountId) return null;
  const acc = currentAccounts.find(a => a.id.toLowerCase() === accountId.toLowerCase());
  if (!acc) return null;

  // Re-calculate live explainable risk
  const riskAnalysis = calculateAccountRisk(acc);
  return {
    ...acc,
    riskScore: riskAnalysis.score,
    riskLevel: riskAnalysis.level,
    riskBreakdown: riskAnalysis.breakdown,
    riskReasons: riskAnalysis.reasons
  };
}

export async function getAllAccounts(filters = {}) {
  await new Promise(r => setTimeout(r, 40));
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

// -------------------------------------------------------------
// TRANSACTION EXPLORER & DETAILS
// -------------------------------------------------------------
export async function getTransaction(transactionId) {
  await new Promise(r => setTimeout(r, 50));
  return currentTransactions.find(t => t.id.toLowerCase() === transactionId.toLowerCase()) || null;
}

export async function getTransactions(filters = {}) {
  await new Promise(r => setTimeout(r, 50));
  let result = [...currentTransactions];

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
// TRACE TRANSACTION / MONEY TRAIL
// -------------------------------------------------------------
export async function traceTransaction(query, maxHops = 6) {
  // Realistic graph traversal calculation delay
  await new Promise(r => setTimeout(r, 120));

  const isTxn = query?.toUpperCase().startsWith('TXN');
  const result = traceMoneyTrail({
    startTxnId: isTxn ? query : null,
    startAccountId: !isTxn ? query : null,
    transactions: currentTransactions,
    accounts: currentAccounts,
    maxHops
  });

  return result;
}

// -------------------------------------------------------------
// RISK ALERTS
// -------------------------------------------------------------
export async function getRiskAlerts(filters = {}) {
  await new Promise(r => setTimeout(r, 40));
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
  await new Promise(r => setTimeout(r, 30));
  const alert = currentAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.status = newStatus;
    if (analyst) alert.assignedAnalyst = analyst;
    notifyStateChanged();
  }
  return alert;
}

// -------------------------------------------------------------
// NETWORK GRAPH DATA
// -------------------------------------------------------------
export async function getNetworkData(filters = {}) {
  await new Promise(r => setTimeout(r, 60));

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
    txnCount: acc.txnCount,
    passThroughRatio: acc.passThroughRatio,
    uniqueSenders: acc.uniqueSenders,
    uniqueReceivers: acc.uniqueReceivers,
    status: acc.status
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

  // Filtering
  if (filters.communityId && filters.communityId !== 'ALL') {
    nodes = nodes.filter(n => n.communityId === filters.communityId);
    const nodeIds = new Set(nodes.map(n => n.id));
    edges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
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
      suspiciousClusters: 2,
      maxPathDepth: 5
    }
  };
}

// -------------------------------------------------------------
// CASE MANAGEMENT (Feature 1 & Feature 7)
// -------------------------------------------------------------
export async function getCases() {
  await new Promise(r => setTimeout(r, 40));
  return [...currentCases];
}

export async function getCaseById(caseId) {
  await new Promise(r => setTimeout(r, 30));
  return currentCases.find(c => c.id.toLowerCase() === caseId.toLowerCase()) || currentCases[0];
}

export async function createCase(caseData) {
  await new Promise(r => setTimeout(r, 60));
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
  await new Promise(r => setTimeout(r, 40));
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
  await new Promise(r => setTimeout(r, 30));
  const targetCase = currentCases.find(c => c.id.toLowerCase() === caseId.toLowerCase());
  if (targetCase) {
    targetCase.evidenceList = targetCase.evidenceList.filter(e => e.id !== evidenceId);
    notifyStateChanged();
    return targetCase;
  }
  return null;
}

// -------------------------------------------------------------
// SIMULATED ACTIONS (Feature 3: Freeze Simulator)
// -------------------------------------------------------------
export async function simulateFreezeAccount(accountId, reason = 'Automated Mule Pass-Through Detection') {
  await new Promise(r => setTimeout(r, 100));
  const acc = currentAccounts.find(a => a.id.toLowerCase() === accountId.toLowerCase());
  if (acc) {
    acc.status = 'Simulated Frozen';
    acc.timeline.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: `ACTION SIMULATED — ACCOUNT FLAGGED FOR REVIEW (Debit Freeze Simulated)`,
      severity: 'CRITICAL'
    });
  }

  // Add activity log
  currentActivities.unshift({
    id: `ACT-${Date.now()}`,
    time: 'Just now',
    type: 'freeze',
    description: `ACTION SIMULATED — Account ${accountId} flagged for debit freeze review`,
    severity: 'CRITICAL',
    icon: 'ShieldAlert'
  });

  // Attach evidence to current active case
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
// SUSPICIOUS COMMUNITIES (Feature 4)
// -------------------------------------------------------------
export async function getCommunities() {
  await new Promise(r => setTimeout(r, 30));
  return [...currentCommunities];
}

export async function getCommunityById(communityId) {
  await new Promise(r => setTimeout(r, 30));
  return currentCommunities.find(c => c.id === communityId) || currentCommunities[0];
}

// -------------------------------------------------------------
// REGIONAL HEATMAP (Feature 10)
// -------------------------------------------------------------
export async function getRegionalData() {
  await new Promise(r => setTimeout(r, 30));
  return [...currentRegions];
}

// -------------------------------------------------------------
// DEMO SCENARIO MANAGEMENT (Page 8)
// -------------------------------------------------------------
export async function getScenarios() {
  await new Promise(r => setTimeout(r, 20));
  return PREDEFINED_SCENARIOS;
}

export async function switchScenario(scenarioKey) {
  await new Promise(r => setTimeout(r, 80));
  const scenario = PREDEFINED_SCENARIOS[scenarioKey] || PREDEFINED_SCENARIOS.SCENARIO_3_MULTI_HOP;
  currentScenarioId = scenario.id;
  currentAccounts = JSON.parse(JSON.stringify(scenario.accounts));
  currentTransactions = JSON.parse(JSON.stringify(scenario.transactions));
  currentAlerts = JSON.parse(JSON.stringify(scenario.alerts));

  currentActivities.unshift({
    id: `ACT-${Date.now()}`,
    time: 'Just now',
    type: 'scenario',
    description: `Switched dataset to "${scenario.name}"`,
    severity: 'MEDIUM',
    icon: 'Database'
  });

  notifyStateChanged();
  return scenario;
}

export async function resetDataset() {
  return switchScenario('SCENARIO_3_MULTI_HOP');
}

export async function generateSyntheticTransactions(count = 5) {
  await new Promise(r => setTimeout(r, 90));
  const newTxns = [];
  const senderPool = ['A102', 'B552', 'C771', 'D334', 'G443', 'M901'];
  const receiverPool = ['B552', 'C771', 'D334', 'E889', 'M901'];

  for (let i = 0; i < count; i++) {
    const from = senderPool[Math.floor(Math.random() * senderPool.length)];
    let to = receiverPool[Math.floor(Math.random() * receiverPool.length)];
    while (to === from) {
      to = receiverPool[Math.floor(Math.random() * receiverPool.length)];
    }
    const amt = Math.floor(25000 + Math.random() * 55000);
    const id = `TXN-SYN-${Math.floor(10000 + Math.random() * 90000)}`;

    const txn = {
      id,
      fromAccount: from,
      toAccount: to,
      amount: amt,
      timestamp: 'Just now',
      timeEpoch: Math.floor(Date.now() / 1000),
      channel: 'IMPS',
      riskLevel: amt > 45000 ? 'HIGH' : 'MEDIUM',
      status: 'Completed',
      notes: 'Generated synthetic pass-through transaction',
      isScamTrail: false
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
// REPORTS (Page 7)
// -------------------------------------------------------------
export async function getReports() {
  await new Promise(r => setTimeout(r, 60));
  return {
    title: 'Digital Arrest Scam & Mule Network Forensic Investigation Report',
    reportId: 'REP-2026-FT03-MULE',
    generatedAt: new Date().toLocaleString(),
    classification: 'CONFIDENTIAL — BANK AML / CYBER FRAUD UNIT',
    author: 'Lead Investigator R. Sharma (Fraud Risk Operations)',
    executiveSummary: 'Automated graph intelligence detected a rapid 4-hop pass-through syndicate routing ₹75,000 from reporting victim Devendra K. to bullion conversion nodes within 9 minutes. The syndicate exhibits characteristic mule indicators including 94%+ pass-through ratios, sub-5-minute transfer latencies, and concentrated clustering in Community #17.',
    keyMetrics: {
      totalAccountsInvolved: currentAccounts.filter(a => a.riskScore >= 60).length,
      scamAmountTraced: 75000,
      velocityRating: 'Extreme (Median 3.2m transfer delay)',
      primarySyndicate: 'Community #17',
      recommendedFreezeTarget: 'C771 / D334'
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
      { hop: 4, flow: 'C771 → D334', amount: 68000, delay: '4 mins' }
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
