import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Search, 
  Clock, 
  Network,
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  Briefcase, 
  Layers, 
  RefreshCw,
  Sliders,
  Compass,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import MoneyTrailTimeline from '../components/MoneyTrailTimeline';
import MoneyFlowWaterfall from '../components/MoneyFlowWaterfall';
import FreezeSimulatorModal from '../components/FreezeSimulatorModal';
import WhatIfModal from '../components/WhatIfModal';
import NetworkGraph from '../components/NetworkGraph';
import RiskBadge from '../components/RiskBadge';
import { traceTransaction, getAccount, simulateFreezeAccount, addEvidenceToCase } from '../services/api';
import { formatCurrency, formatExactCurrency, getRiskColorClass } from '../utils/formatters';

export default function TraceTransactionPage({ 
  initialQuery = 'TXN-84921',
  onNavigateToAccount,
  onOpenAccountDrawer,
  onOpenTxnModal,
  onAddToCase
}) {
  const [query, setQuery] = useState(initialQuery);
  const [isTracing, setIsTracing] = useState(false);
  const [trailResult, setTrailResult] = useState(null);
  const [maxHops, setMaxHops] = useState(5);
  const [selectedView, setSelectedView] = useState('both'); // 'timeline', 'graph', 'both'

  // Modal states
  const [freezeTargetAccount, setFreezeTargetAccount] = useState(null);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
  const [freezeSuccessAlert, setFreezeSuccessAlert] = useState(null);

  const executeTrace = async (searchTarget = query, hopsCount = maxHops) => {
    setIsTracing(true);
    try {
      const result = await traceTransaction(searchTarget, hopsCount);
      setTrailResult(result);
    } catch (err) {
      console.error('Trace error:', err);
    } finally {
      setIsTracing(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      executeTrace(initialQuery, maxHops);
    }
  }, [initialQuery]);

  const handleContinueTrace = () => {
    const nextHops = maxHops + 2;
    setMaxHops(nextHops);
    executeTrace(query, nextHops);
  };

  const handleOpenFreeze = async (accountId) => {
    const acc = await getAccount(accountId);
    if (acc) {
      setFreezeTargetAccount(acc);
      setIsFreezeModalOpen(true);
    }
  };

  const handleConfirmFreeze = async (accountId, reason) => {
    const res = await simulateFreezeAccount(accountId, reason);
    setFreezeSuccessAlert(res);
    executeTrace(query, maxHops);
    setTimeout(() => setFreezeSuccessAlert(null), 6000);
  };

  // Convert hops to mini graph nodes/edges for visual sub-graph
  const trailGraphData = trailResult?.hops?.length ? {
    nodes: Array.from(new Set([
      ...trailResult.hops.map(h => h.fromAccount),
      ...trailResult.hops.map(h => h.toAccount)
    ])).map(id => {
      const hopMatch = trailResult.hops.find(h => h.toAccount === id || h.fromAccount === id);
      const isEnd = id === trailResult.hops[trailResult.hops.length - 1].toAccount;
      return {
        id,
        name: hopMatch ? (id === hopMatch.toAccount ? hopMatch.toAccountName : hopMatch.fromAccountName) : id,
        riskScore: hopMatch?.toRiskScore || 75,
        riskLevel: hopMatch?.toRiskLevel || 'HIGH',
        isMule: id !== 'Victim-001'
      };
    }),
    edges: trailResult.hops.map(h => ({
      id: h.txnId,
      source: h.fromAccount,
      target: h.toAccount,
      amount: h.amount,
      riskLevel: h.isSuspicious ? 'CRITICAL' : 'LOW',
      isScamTrail: true
    }))
  } : { nodes: [], edges: [] };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Multi-Hop Money Trail Tracer</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
              TEMPORAL GRAPH BFS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Trace funds moving rapidly across connected mule bank accounts following scam execution.
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium text-[11px]">Demo Presets:</span>
          <button
            onClick={() => { setQuery('TXN-84921'); executeTrace('TXN-84921'); }}
            className="px-2.5 py-1 rounded bg-dark-850 hover:bg-slate-800 border border-slate-700 text-indigo-300 font-mono text-[11px] transition"
          >
            TXN-84921 (₹75k Digital Arrest)
          </button>
          <button
            onClick={() => { setQuery('TXN-91024'); executeTrace('TXN-91024'); }}
            className="px-2.5 py-1 rounded bg-dark-850 hover:bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[11px] transition"
          >
            TXN-91024 (Structuring Ring)
          </button>
          <button
            onClick={() => { setQuery('A102'); executeTrace('A102'); }}
            className="px-2.5 py-1 rounded bg-dark-850 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px] transition"
          >
            Account A102
          </button>
        </div>
      </div>

      {/* Simulated Freeze Banner Notification */}
      {freezeSuccessAlert && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white uppercase tracking-wider">{freezeSuccessAlert.message}</p>
              <p className="text-slate-300">{freezeSuccessAlert.disclaimer}</p>
            </div>
          </div>
          <button 
            onClick={() => setFreezeSuccessAlert(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="card-investigation p-4 bg-dark-850">
        <form 
          onSubmit={(e) => { e.preventDefault(); executeTrace(); }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Transaction ID (e.g. TXN-84921) or Account ID (e.g. A102, Victim-001)..."
              className="w-full bg-dark-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={isTracing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isTracing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Tracing Graph...
                </>
              ) : (
                <>
                  <GitBranch className="w-4 h-4" />
                  TRACE MONEY
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Traced Result Header KPI Box */}
      {trailResult && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card-investigation p-3.5 bg-dark-850">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">TOTAL HOPS</span>
            <span className="text-xl font-bold font-mono text-white flex items-center gap-2">
              {trailResult.totalHops} Hops
              <span className="text-[10px] text-red-400 bg-red-500/10 px-1 rounded font-normal">Layered</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Inter-account transfers</p>
          </div>

          <div className="card-investigation p-3.5 bg-dark-850">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">TOTAL AMOUNT TRACED</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {formatCurrency(trailResult.totalAmountTraced)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Initial fraudulent debit</p>
          </div>

          <div className="card-investigation p-3.5 bg-dark-850">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">TRACE DURATION</span>
            <span className="text-xl font-bold font-mono text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {trailResult.durationMinutes} Minutes
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Extreme velocity pass-through</p>
          </div>

          <div className="card-investigation p-3.5 bg-dark-850">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">AMOUNT RETAINED (SIPHON)</span>
            <span className="text-xl font-bold font-mono text-red-400">
              {formatCurrency(trailResult.amountRetained)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Mule commission deductions</p>
          </div>
        </div>
      )}

      {/* Feature 2: Next Hop Prediction & Feature 3: Recommended Freeze Action */}
      {trailResult?.nextHopPrediction && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Next-Hop Prediction (7 cols) */}
          <div className="md:col-span-7 card-investigation p-4 bg-dark-900 border-indigo-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Potential Next Hop (Prediction Engine)
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    PROTOTYPE PREDICTION (DETERMINISTIC)
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {trailResult.nextHopPrediction.confidence}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
              <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Current Hop</span>
                <span className="font-mono font-bold text-white">{trailResult.nextHopPrediction.currentAccount}</span>
              </div>
              <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Likely Target</span>
                <span className="font-mono font-bold text-indigo-400">{trailResult.nextHopPrediction.potentialNextHop}</span>
              </div>
              <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Est. Amount</span>
                <span className="font-mono font-bold text-amber-400">{formatCurrency(trailResult.nextHopPrediction.estimatedAmount)}</span>
              </div>
              <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Transfer Window</span>
                <span className="font-mono font-bold text-cyan-400">{trailResult.nextHopPrediction.estimatedWindow}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
              <p className="text-[11px] text-slate-400 italic">
                {trailResult.nextHopPrediction.rationale}
              </p>
              <button
                onClick={() => setIsWhatIfModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-slate-700 text-indigo-300 font-medium flex items-center gap-1.5 text-xs transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Simulate Next Hop (What-If)
              </button>
            </div>
          </div>

          {/* Feature 3: Recommended Freeze Action (5 cols) */}
          <div className="md:col-span-5 card-investigation p-4 bg-red-950/20 border-red-500/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Recommended Action: Preemptive Freeze
                </h3>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug mb-3">
                Account <strong className="font-mono text-red-400">{trailResult.hops[trailResult.hops.length - 1]?.toAccount}</strong> currently holds the active money trail terminal before bullion cashout.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleOpenFreeze(trailResult.hops[trailResult.hops.length - 1]?.toAccount)}
                className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                Simulate Freeze Recommendation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature 8: Money Flow Analytics Waterfall */}
      {trailResult?.flowAnalytics && (
        <MoneyFlowWaterfall 
          analytics={trailResult.flowAnalytics} 
          hops={trailResult.hops} 
        />
      )}

      {/* Main Trail Visualization: Timeline AND Visual Sub-Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Timeline View (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Chronological Hop Progression
            </h2>
            <span className="text-xs text-slate-400 font-mono">{trailResult?.hops?.length || 0} Traced Hops</span>
          </div>

          <MoneyTrailTimeline
            hops={trailResult?.hops || []}
            onViewAccount={(id) => onOpenAccountDrawer(id)}
            onViewTransaction={(id) => onOpenTxnModal(id)}
            onContinueTrace={handleContinueTrace}
            isLoading={isTracing}
          />
        </div>

        {/* Trail Graph Representation (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-400" />
              Sub-Graph Trail Topology
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">Isolated Trail Nodes</span>
          </div>

          <div className="card-investigation p-3 bg-dark-900">
            <NetworkGraph
              nodes={trailGraphData.nodes}
              edges={trailGraphData.edges}
              onSelectNode={(node) => onOpenAccountDrawer(node.id)}
              onSelectEdge={(edge) => onOpenTxnModal(edge.id)}
              height="480px"
            />
          </div>
        </div>
      </div>

      {/* Freeze Recommendation Simulator Modal */}
      <FreezeSimulatorModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        account={freezeTargetAccount}
        estimatedAmount={trailResult?.flowAnalytics?.lastHopAmount}
        onConfirmFreeze={handleConfirmFreeze}
      />

      {/* What-If Simulation Modal */}
      <WhatIfModal
        isOpen={isWhatIfModalOpen}
        onClose={() => setIsWhatIfModalOpen(false)}
        simulationData={trailResult?.hypotheticalSimulation}
        onAddToCase={onAddToCase}
      />
    </div>
  );
}
