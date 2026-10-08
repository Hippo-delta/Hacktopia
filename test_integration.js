/**
 * Integration Test for React Frontend API Layer <-> FastAPI Backend
 */
import { 
  checkBackendHealth,
  traceTransaction,
  getAccount,
  getNetworkData,
  getCommunities,
  predictNextHop,
  getDashboardStats,
  simulateFreezeAccount
} from './src/services/api.js';

async function runTests() {
  console.log('=== STARTING PHASE 5 FRONTEND-BACKEND INTEGRATION TESTS ===\n');

  // 1. Health
  console.log('[TEST 1] Backend Health Check');
  const health = await checkBackendHealth();
  console.log('  Health response:', health.isOnline ? 'ONLINE' : 'OFFLINE', health.data);
  if (!health.isOnline) {
    throw new Error('Backend is offline! Start FastAPI backend first.');
  }

  // 2. Trace TXN-84921
  console.log('\n[TEST 2] Trace TXN-84921 (Flagship Scam Trail)');
  const trace = await traceTransaction('TXN-84921', 6);
  console.log(`  Total Hops: ${trace.totalHops}`);
  console.log(`  Total Amount: INR ${trace.totalAmountTraced}`);
  console.log(`  Duration: ${trace.durationMinutes} minutes`);
  console.log(`  Amount Retained: INR ${trace.amountRetained}`);
  
  if (trace.totalHops !== 5) {
    throw new Error(`Expected exactly 5 hops, but got ${trace.totalHops}!`);
  }

  const expectedSequence = ['A102', 'B552', 'C771', 'D334', 'E889'];
  trace.hops.forEach((h, idx) => {
    console.log(`  Hop ${h.hopNumber}: ${h.fromAccount} -> ${h.toAccount} (INR ${h.amount}) [Risk: ${h.toRiskLevel} ${h.toRiskScore}/100]`);
    if (h.toAccount !== expectedSequence[idx]) {
      throw new Error(`Mismatch at hop ${idx + 1}: expected toAccount ${expectedSequence[idx]}, got ${h.toAccount}`);
    }
  });

  console.log(`  Terminal Account: ${trace.hops[trace.hops.length - 1].toAccount}`);
  console.log(`  Next-Hop Prediction at Terminal: ${trace.nextHopPrediction.potentialNextHop} (${trace.nextHopPrediction.targetName}) - ${trace.nextHopPrediction.confidence}% confidence`);
  console.log(`  Flow Analytics: Pass-Through Ratio ${trace.flowAnalytics.passThroughRatio}, Fastest Transfer ${trace.flowAnalytics.fastestTransferMin} min`);

  // 3. Trace from Account ID
  console.log('\n[TEST 3] Trace from Account ID: A102');
  const traceAcc = await traceTransaction('A102', 6);
  console.log(`  Total Hops from A102: ${traceAcc.totalHops}`);
  if (traceAcc.totalHops !== 5) {
    throw new Error(`Expected 5 hops for A102, got ${traceAcc.totalHops}`);
  }

  // 4. Account Dossier: Suspicious Mule A102
  console.log('\n[TEST 4] Account Dossier: A102 (Flagged Mule L1)');
  const accA102 = await getAccount('A102');
  console.log(`  Name: ${accA102.name}`);
  console.log(`  Type: ${accA102.accountType}`);
  console.log(`  ML Risk Level: ${accA102.riskLevel} (${accA102.riskScore}/100)`);
  console.log(`  Pass-Through Ratio: ${accA102.passThroughRatio}`);
  console.log(`  Median Transfer Delay: ${accA102.medianTransferDelayMinutes} min`);
  console.log('  Explainable Reasons:');
  accA102.riskReasons.forEach(r => console.log(`    - ${r}`));
  if (accA102.riskScore < 70) {
    throw new Error(`Expected A102 to have high risk score >= 70, got ${accA102.riskScore}`);
  }

  // 5. Account Dossier: Victim-001
  console.log('\n[TEST 5] Account Dossier: Victim-001 (Reporting Victim)');
  const accVictim = await getAccount('Victim-001');
  console.log(`  Name: ${accVictim.name}`);
  console.log(`  ML Risk Level: ${accVictim.riskLevel} (${accVictim.riskScore}/100)`);
  if (accVictim.riskScore >= 35) {
    throw new Error(`Expected Victim-001 to have low risk score < 35, got ${accVictim.riskScore}`);
  }

  // 6. Network Graph Data
  console.log('\n[TEST 6] Network Graph Data');
  const net = await getNetworkData();
  console.log(`  Total Nodes: ${net.nodes.length}`);
  console.log(`  Total Edges: ${net.edges.length}`);
  console.log(`  Summary: ${JSON.stringify(net.summary)}`);
  if (net.nodes.length !== 218) {
    throw new Error(`Expected 218 network nodes from backend, got ${net.nodes.length}`);
  }
  if (net.edges.length !== 2541) {
    throw new Error(`Expected 2541 network edges from backend, got ${net.edges.length}`);
  }

  // 7. Community Detection Data
  console.log('\n[TEST 7] Community Detection');
  const comms = await getCommunities();
  console.log(`  Total Detected Clusters: ${comms.length}`);
  const topComm = comms[0];
  console.log(`  Top Cluster: ${topComm.id} (${topComm.memberCount} members, ${topComm.suspiciousCount} suspicious, ${topComm.density} fraud density, avg risk: ${topComm.averageRiskScore}%)`);
  if (comms.length === 0 || topComm.suspiciousCount === 0) {
    throw new Error('Community detection failed to return fraud clusters');
  }

  // 8. Standalone Next-Hop Endpoint
  console.log('\n[TEST 8] Standalone Next-Hop Prediction for A102');
  const nextHopA102 = await predictNextHop('A102', 'TXN-84921');
  console.log(`  Predicted Next Hop from A102: ${nextHopA102.predicted_next_hop} (${nextHopA102.predicted_target_name}) with ${nextHopA102.confidence}% confidence`);
  if (nextHopA102.predicted_next_hop !== 'B552') {
    throw new Error(`Expected predicted next hop from A102 to be B552, got ${nextHopA102.predicted_next_hop}`);
  }

  // 9. Dashboard Stats
  console.log('\n[TEST 9] Dashboard Stats Calculation');
  const dashStats = await getDashboardStats();
  console.log(`  Total Accounts KPI: ${dashStats.kpis.totalAccounts.formatted}`);
  console.log(`  Suspicious Accounts KPI: ${dashStats.kpis.suspiciousAccounts.formatted}`);
  console.log(`  Transactions KPI: ${dashStats.kpis.transactionsAnalysed.formatted}`);
  console.log(`  Risk Distribution: Critical=${dashStats.riskDistribution.critical}, High=${dashStats.riskDistribution.high}, Medium=${dashStats.riskDistribution.medium}, Low=${dashStats.riskDistribution.low}`);

  // 10. Simulated Freeze Action
  console.log('\n[TEST 10] Simulated Freeze Action');
  const freezeRes = await simulateFreezeAccount('A102', 'Flagged as Layer 1 Mule in TXN-84921 trail');
  console.log(`  Freeze Result: ${freezeRes.status} - "${freezeRes.message}"`);
  console.log(`  Disclaimer: "${freezeRes.disclaimer}"`);
  const updatedA102 = await getAccount('A102');
  console.log(`  Updated A102 Status: ${updatedA102.status}`);
  if (updatedA102.status !== 'Simulated Frozen') {
    throw new Error(`Expected status 'Simulated Frozen', got ${updatedA102.status}`);
  }

  console.log('\n>>> ALL 10 INTEGRATION TESTS COMPLETED SUCCESSFULLY! <<<');
}

runTests().catch(err => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
