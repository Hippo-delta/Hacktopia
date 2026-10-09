import React, { useState, useEffect } from 'react';
import { 
  Database, 
  RotateCcw, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Users, 
  RefreshCw,
  GitBranch,
  ArrowRight
} from 'lucide-react';
import { 
  getScenarios, 
  switchScenario, 
  resetDataset, 
  refreshActiveScenario,
  selectActiveScenario,
  generateSyntheticTransactions,
  getDashboardStats,
  subscribeToDataChanges 
} from '../services/api';

export default function DataManagementPage({ onNavigateToTrace, onNavigateToDashboard }) {
  const [scenarios, setScenarios] = useState({});
  const [activeScenarioId, setActiveScenarioId] = useState('scenario-3');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const loadData = async () => {
    try {
      const [sc, st] = await Promise.all([
        getScenarios(),
        getDashboardStats()
      ]);
      setScenarios(sc);
      setStats(st);
    } catch (err) {
      console.error('Error fetching scenarios:', err);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToDataChanges(loadData);
    return () => unsub();
  }, []);

  const handleSwitchScenario = async (scenarioKey, scenarioId) => {
    setLoading(true);
    try {
      if (scenarioId === 'scenario-3' || scenarioKey === 'SCENARIO_3_MULTI_HOP') {
        await selectActiveScenario('scenario-flagship');
      } else {
        await switchScenario(scenarioKey);
      }
      setActiveScenarioId(scenarioId);
      setToastMessage(`Switched active environment to ${scenarioId.toUpperCase()}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to switch scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshNew = async () => {
    setLoading(true);
    try {
      const summary = await refreshActiveScenario();
      setActiveScenarioId(summary.id || 'dynamic-scenario');
      setToastMessage(`Generated new coherent scenario: "${summary.name}" (${summary.accounts_count} accounts, ${summary.transactions_count} txns)`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to generate scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetDataset();
      setActiveScenarioId('scenario-3');
      setToastMessage('Reset demo dataset to Flagship Multi-Hop Scam Network (TXN-84921).');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const newTxns = await generateSyntheticTransactions(5);
      setToastMessage(`Generated ${newTxns.length} new synthetic transactions across mule nodes.`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              Demo Dataset & Scenario Switcher
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              HACKATHON DEMO CONTROLS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Switch forensic scenarios on the fly during judge presentations or generate random synthetic pass-through transactions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-dark-850 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Flagship
          </button>
          <button
            onClick={handleRefreshNew}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            New Investigation
          </button>
        </div>
      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dataset Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="card-investigation p-3.5 bg-dark-850">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Accounts Loaded</span>
            <span className="text-xl font-bold font-mono text-white">{stats.riskDistribution.total} Accounts</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Synthetic nodes pool</p>
          </div>
          <div className="card-investigation p-3.5 bg-dark-850">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Flagged Mules</span>
            <span className="text-xl font-bold font-mono text-red-400">{stats.riskDistribution.critical + stats.riskDistribution.high}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Critical & High risk</p>
          </div>
          <div className="card-investigation p-3.5 bg-dark-850">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Syndicate Clusters</span>
            <span className="text-xl font-bold font-mono text-indigo-300">2 Active Rings</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Community #17 & #09</p>
          </div>
          <div className="card-investigation p-3.5 bg-dark-850">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Active Scenario</span>
            <span className="text-sm font-bold font-mono text-amber-300 truncate block">
              {activeScenarioId === 'scenario-3' ? 'Multi-Hop Scam' : activeScenarioId === 'scenario-2' ? 'Single Mule' : 'Normal Banking'}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Live environment profile</p>
          </div>
        </div>
      )}

      {/* The 3 Predefined Scenarios (Core Hackathon Requirement) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Predefined Hackathon Scenarios
          </h2>
          <span className="text-xs text-slate-400">Select any scenario to load its graph instantly</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Scenario 3: Flagship Multi-Hop Scam Network */}
          <div className={`card-investigation p-5 flex flex-col justify-between transition-all duration-200 ${
            activeScenarioId === 'scenario-3'
              ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              : 'bg-dark-850 hover:border-slate-700'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                  FLAGSHIP DEMO
                </span>
                {activeScenarioId === 'scenario-3' && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ACTIVE
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Scenario 3: Multi-Hop Scam Network
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Full Digital Arrest scam simulation: Victim funds routed across 4 rapid mule hops (Victim → A102 → B552 → C771 → D334) within 9 minutes, with deterministic next-hop prediction to E889 and debit freeze simulator.
                </p>
              </div>

              <div className="bg-dark-950 p-3 rounded-lg border border-slate-800 space-y-1 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>Entry Debit:</span>
                  <span className="text-emerald-400">TXN-84921 (₹75,000)</span>
                </div>
                <div className="flex justify-between">
                  <span>Primary Mule:</span>
                  <span className="text-red-400">A102 (Score 91)</span>
                </div>
                <div className="flex justify-between">
                  <span>Trail Depth:</span>
                  <span className="text-amber-400">4 Hops (3.2m delay)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => handleSwitchScenario('SCENARIO_3_MULTI_HOP', 'scenario-3')}
                disabled={activeScenarioId === 'scenario-3' || loading}
                className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                  activeScenarioId === 'scenario-3'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                }`}
              >
                {activeScenarioId === 'scenario-3' ? 'Active Scenario' : 'Load Multi-Hop Scam Network'}
              </button>
              {activeScenarioId === 'scenario-3' && (
                <button
                  onClick={() => onNavigateToTrace('TXN-84921')}
                  className="p-2 rounded-lg bg-dark-900 hover:bg-slate-800 text-indigo-400 border border-slate-700 transition"
                  title="Trace Flagship Trail"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Scenario 2: Single Mule Account */}
          <div className={`card-investigation p-5 flex flex-col justify-between transition-all duration-200 ${
            activeScenarioId === 'scenario-2'
              ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
              : 'bg-dark-850 hover:border-slate-700'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  ISOLATED MULE
                </span>
                {activeScenarioId === 'scenario-2' && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ACTIVE
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Scenario 2: Single Mule Account
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Classic single pass-through pattern: A newly opened account receives a single large transfer and immediately drains 99% via ATM / cash withdrawal without downstream online layering.
                </p>
              </div>

              <div className="bg-dark-950 p-3 rounded-lg border border-slate-800 space-y-1 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>Mule Node:</span>
                  <span className="text-amber-400">A102 (Isolated)</span>
                </div>
                <div className="flex justify-between">
                  <span>Pass-Through:</span>
                  <span className="text-indigo-400">99% (Immediate Drain)</span>
                </div>
                <div className="flex justify-between">
                  <span>Trail Depth:</span>
                  <span className="text-slate-400">1 Hop</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={() => handleSwitchScenario('SCENARIO_2_SINGLE_MULE', 'scenario-2')}
                disabled={activeScenarioId === 'scenario-2' || loading}
                className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition ${
                  activeScenarioId === 'scenario-2'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                }`}
              >
                {activeScenarioId === 'scenario-2' ? 'Active Scenario' : 'Load Single Mule Scenario'}
              </button>
            </div>
          </div>

          {/* Scenario 1: Normal Banking Activity */}
          <div className={`card-investigation p-5 flex flex-col justify-between transition-all duration-200 ${
            activeScenarioId === 'scenario-1'
              ? 'bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'bg-dark-850 hover:border-slate-700'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  BASELINE LEGITIMATE
                </span>
                {activeScenarioId === 'scenario-1' && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ACTIVE
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Scenario 1: Normal Banking Activity
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clean commercial banking baseline: Legitimate business transactions, high balance retention, normal B2B invoice cycles (24–48 hours delay), and zero rapid pass-through triggers.
                </p>
              </div>

              <div className="bg-dark-950 p-3 rounded-lg border border-slate-800 space-y-1 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>Max Risk Score:</span>
                  <span className="text-emerald-400">24 / 100 (Safe)</span>
                </div>
                <div className="flex justify-between">
                  <span>Pass-Through:</span>
                  <span className="text-slate-400">35% (Normal Retention)</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Alerts:</span>
                  <span className="text-emerald-400">0 Alerts</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={() => handleSwitchScenario('SCENARIO_1_NORMAL', 'scenario-1')}
                disabled={activeScenarioId === 'scenario-1' || loading}
                className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition ${
                  activeScenarioId === 'scenario-1'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                }`}
              >
                {activeScenarioId === 'scenario-1' ? 'Active Scenario' : 'Load Normal Banking Scenario'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
