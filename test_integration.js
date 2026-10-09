/**
 * Integration Test for React Frontend API Layer <-> FastAPI Backend
 * Validates small scenario performance, flagship TXN-84921 trail, and scenario refresh cycling.
 */
import { 
  checkBackendHealth,
  traceTransaction,
  getAccount,
  getNetworkData,
  getCommunities,
  predictNextHop,
  getDashboardStats,
  getActiveScenario,
  refreshActiveScenario,
  selectActiveScenario,
  simulateFreezeAccount
} from './src/services/api.js';

async function runTests() {
  console.log('=== STARTING SMALL & REFRESHABLE SCENARIO INTEGRATION TESTS ===\n');

  // 1. Health
  console.log('[TEST 1] Backend Health Check');
  const health = await checkBackendHealth();
  console.log('  Health response:', health.isOnline ? 'ONLINE' : 'OFFLINE', health.data);
  if (!health.isOnline) {
    throw new Error('Backend is offline! Start FastAPI backend first.');
  }

  // Ensure flagship scenario is active
  await selectActiveScenario('scenario-flagship');

  // 2. Active Scenario Inspection
  console.log('\n[TEST 2] Active Scenario Inspection (Flagship)');
  const sc = await getActiveScenario();
  console.log(`  Scenario Name: ${sc.name}`);
  console.log(`  Accounts: ${sc.accounts_count}, Transactions: ${sc.transactions_count}`);
  if (sc.accounts_count < 6 || sc.accounts_count > 12) {
    throw new Error(`Expected small scenario with 6-12 accounts, got ${sc.accounts_count}`);
  }

  // 3. Trace TXN-84921 (Flagship Scam Trail)
  console.log('\n[TEST 3] Trace TXN-84921 (Flagship Scam Trail)');
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

  // 4. Trace from Account ID
  console.log('\n[TEST 4] Trace from Account ID: A102');
  const traceAcc = await traceTransaction('A102', 6);
  console.log(`  Total Hops from A102: ${traceAcc.totalHops}`);
  if (traceAcc.totalHops !== 5) {
    throw new Error(`Expected 5 hops for A102, got ${traceAcc.totalHops}`);
  }

  // 5. Account Dossier: Suspicious Mule A102
  console.log('\n[TEST 5] Account Dossier: A102 (Flagged Mule L1)');
  const accA102 = await getAccount('A102');
  console.log(`  Name: ${accA102.name}`);
  console.log(`  Type: ${accA102.accountType}`);
  console.log(`  ML Risk Level: ${accA102.riskLevel} (${accA102.riskScore}/100)`);
  console.log(`  Pass-Through Ratio: ${accA102.passThroughRatio}`);
  if (accA102.riskScore < 70) {
    throw new Error(`Expected A102 to have high risk score >= 70, got ${accA102.riskScore}`);
  }

  // 6. Network Graph Data on Flagship (Must be small: 6-10 nodes)
  console.log('\n[TEST 6] Small Network Graph Data');
  const net = await getNetworkData();
  console.log(`  Total Nodes: ${net.nodes.length} (target: 6-10)`);
  console.log(`  Total Edges: ${net.edges.length} (target: 12-25)`);
  if (net.nodes.length > 12) {
    throw new Error(`Network graph has ${net.nodes.length} nodes, which is too large for the new small demo requirement!`);
  }

  // 7. Community Detection (Target: ~3-4 communities)
  console.log('\n[TEST 7] Community Detection');
  const comms = await getCommunities();
  console.log(`  Total Detected Clusters: ${comms.length} (target: 2-4)`);
  comms.forEach(c => {
    console.log(`    - ${c.id}: ${c.name} (${c.memberCount} members: [${c.members.join(', ')}])`);
  });
  if (comms.length > 5) {
    throw new Error(`Detected ${comms.length} communities, expected <= 5!`);
  }

  // 8. Next-Hop Standalone Endpoint
  console.log('\n[TEST 8] Standalone Next-Hop Prediction for A102');
  const nextHopA102 = await predictNextHop('A102', 'TXN-84921');
  console.log(`  Predicted Next Hop: ${nextHopA102.predicted_next_hop} with ${nextHopA102.confidence}% confidence`);
  if (nextHopA102.predicted_next_hop !== 'B552') {
    throw new Error(`Expected predicted next hop to be B552, got ${nextHopA102.predicted_next_hop}`);
  }

  // 9. Dashboard Stats
  console.log('\n[TEST 9] Dashboard Stats');
  const dashStats = await getDashboardStats();
  console.log(`  Total Accounts: ${dashStats.kpis.totalAccounts.formatted}`);
  console.log(`  Suspicious Accounts: ${dashStats.kpis.suspiciousAccounts.formatted}`);
  console.log(`  Transactions: ${dashStats.kpis.transactionsAnalysed.formatted}`);
  console.log(`  Active Scenario: "${dashStats.activeScenarioName}"`);

  // 10. Scenario Refresh 1: Switch to Scenario 2 (Rapid Layering)
  console.log('\n[TEST 10] Scenario Refresh 1 (Rapid Layering)');
  const ref1 = await refreshActiveScenario();
  console.log(`  Refreshed Scenario: "${ref1.name}"`);
  console.log(`  Accounts: ${ref1.accounts_count}, Transactions: ${ref1.transactions_count}`);
  const netRef1 = await getNetworkData();
  const commsRef1 = await getCommunities();
  console.log(`  Refreshed Graph: ${netRef1.nodes.length} nodes, ${netRef1.edges.length} edges, ${commsRef1.length} communities`);
  const traceRef1 = await traceTransaction(ref1.starting_transaction_id);
  console.log(`  Refreshed Trace (${ref1.starting_transaction_id}): ${traceRef1.totalHops} hops`);

  // 11. Scenario Refresh 2: Switch to Scenario 3 (Splitter / Structuring)
  console.log('\n[TEST 11] Scenario Refresh 2 (Splitter / Structuring)');
  const ref2 = await refreshActiveScenario();
  console.log(`  Refreshed Scenario: "${ref2.name}"`);
  console.log(`  Accounts: ${ref2.accounts_count}, Transactions: ${ref2.transactions_count}`);
  const netRef2 = await getNetworkData();
  console.log(`  Refreshed Graph: ${netRef2.nodes.length} nodes, ${netRef2.edges.length} edges`);

  // 12. Scenario Refresh 3: Switch to Scenario 4 (Merchant Front)
  console.log('\n[TEST 12] Scenario Refresh 3 (Merchant Cashout Front)');
  const ref3 = await refreshActiveScenario();
  console.log(`  Refreshed Scenario: "${ref3.name}"`);
  console.log(`  Accounts: ${ref3.accounts_count}, Transactions: ${ref3.transactions_count}`);
  const netRef3 = await getNetworkData();
  console.log(`  Refreshed Graph: ${netRef3.nodes.length} nodes, ${netRef3.edges.length} edges`);

  // 13. Return to Flagship Scenario
  console.log('\n[TEST 13] Return to Flagship Scenario (TXN-84921)');
  const flagReturn = await selectActiveScenario('scenario-flagship');
  console.log(`  Active Scenario Restored: "${flagReturn.name}"`);
  const finalTrace = await traceTransaction('TXN-84921');
  console.log(`  Flagship Restored Trace: ${finalTrace.totalHops} hops (Victim-001 -> A102 -> B552 -> C771 -> D334 -> E889)`);
  if (finalTrace.totalHops !== 5) {
    throw new Error('Failed to restore 5-hop flagship trace!');
  }

  // 14. Simulated Freeze Action
  console.log('\n[TEST 14] Simulated Freeze Action');
  const freezeRes = await simulateFreezeAccount('A102', 'Flagged as Layer 1 Mule in TXN-84921 trail');
  console.log(`  Freeze Result: ${freezeRes.status} - "${freezeRes.message}"`);

  console.log('\n>>> ALL 14 SMALL & REFRESHABLE SCENARIO INTEGRATION TESTS PASSED! <<<');
}

runTests().catch(err => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
