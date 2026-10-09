import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Filter, 
  Search, 
  Sliders, 
  UserCheck, 
  GitBranch, 
  Layers, 
  Eye, 
  ShieldAlert, 
  Lock, 
  Briefcase, 
  RotateCcw,
  Users,
  Compass,
  ArrowRight
} from 'lucide-react';
import NetworkGraph from '../components/NetworkGraph';
import RiskBadge from '../components/RiskBadge';
import { 
  getNetworkData, 
  getAccount, 
  getCommunities, 
  subscribeToDataChanges 
} from '../services/api';
import { formatCurrency, formatPercent, getRiskColorClass } from '../utils/formatters';

export default function NetworkAnalysisPage({ 
  onNavigateToAccount, 
  onNavigateToTrace, 
  onOpenAccountDrawer,
  onOpenTxnModal,
  onAddToCase 
}) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], summary: {} });
  const [communities, setCommunities] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [minAmount, setMinAmount] = useState(0);
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNetwork = async () => {
    try {
      setLoading(true);
      const [network, commList] = await Promise.all([
        getNetworkData({
          communityId: selectedCommunity !== 'ALL' ? selectedCommunity : null,
          riskLevel: riskFilter,
          minAmount: minAmount > 0 ? minAmount : null,
          suspiciousOnly
        }),
        getCommunities()
      ]);
      setGraphData(network);
      setCommunities(commList);

      // Default selected node if none
      if (!selectedNode && network.nodes.length > 0) {
        const defaultNode = network.nodes.find(n => n.id === 'A102') || network.nodes[0];
        setSelectedNode(defaultNode);
      }
    } catch (err) {
      console.error('Error loading network data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetwork();
    const unsub = subscribeToDataChanges(loadNetwork);
    return () => unsub();
  }, [selectedCommunity, riskFilter, minAmount, suspiciousOnly]);

  const handleNodeClick = async (node) => {
    const fullAcc = await getAccount(node.id);
    setSelectedNode(fullAcc || node);
  };

  const handleSelectCommunityFocus = (commId) => {
    setSelectedCommunity(commId);
  };

  // Find active community metadata if filtered
  const activeCommunityObj = communities.find(c => c.id === selectedCommunity);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-400" />
              Syndicate Network Topology Analysis
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              CLUSTER DETECTION
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Interactive multi-entity graph explorer mapping money movements across mule clusters.
          </p>
        </div>

        {/* Quick Cluster Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Focus Cluster:</span>
          <button
            onClick={() => setSelectedCommunity('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition ${
              selectedCommunity === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-dark-850 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All Clusters
          </button>
          {communities.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCommunity(c.id)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition flex items-center gap-1 ${
                selectedCommunity === c.id ? 'bg-indigo-600 text-white' : 'bg-dark-850 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{c.id}</span>
              {c.riskLevel === 'CRITICAL' && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Feature 4: Focused Suspicious Community Banner (when cluster selected) */}
      {activeCommunityObj && selectedCommunity !== 'ALL' && (
        <div className="card-investigation p-4 bg-red-950/20 border-red-500/40 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{activeCommunityObj.name}</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
                    {activeCommunityObj.id}
                  </span>
                  <RiskBadge level={activeCommunityObj.riskLevel} size="sm" />
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{activeCommunityObj.description}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCommunity('ALL')}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-dark-900 rounded border border-slate-700"
            >
              Reset Cluster Focus ✕
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs pt-2 border-t border-red-500/20">
            <div className="bg-dark-950/80 p-2 rounded">
              <span className="text-[10px] text-slate-400 uppercase block">Total Accounts</span>
              <span className="font-mono font-bold text-white">{activeCommunityObj.accountsCount} Nodes</span>
            </div>
            <div className="bg-dark-950/80 p-2 rounded">
              <span className="text-[10px] text-slate-400 uppercase block">Transactions</span>
              <span className="font-mono font-bold text-indigo-300">{activeCommunityObj.transactionsCount} txns</span>
            </div>
            <div className="bg-dark-950/80 p-2 rounded">
              <span className="text-[10px] text-slate-400 uppercase block">Total Volume</span>
              <span className="font-mono font-bold text-amber-400">{formatCurrency(activeCommunityObj.totalVolume)}</span>
            </div>
            <div className="bg-dark-950/80 p-2 rounded">
              <span className="text-[10px] text-slate-400 uppercase block">High-Risk Nodes</span>
              <span className="font-mono font-bold text-red-400">{activeCommunityObj.highRiskAccounts} Accounts</span>
            </div>
            <div className="bg-dark-950/80 p-2 rounded">
              <span className="text-[10px] text-slate-400 uppercase block">Avg Transfer Delay</span>
              <span className="font-mono font-bold text-cyan-400">{activeCommunityObj.avgTransferDelay} min</span>
            </div>
            <div className="bg-dark-950/80 p-2 rounded">
              <span className="text-[10px] text-slate-400 uppercase block">Highest Risk Mule</span>
              <span className="font-mono font-bold text-red-400">{activeCommunityObj.mostSuspiciousAccount} (Score {activeCommunityObj.highestRiskScore})</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Control Bar */}
      <div className="card-investigation p-3.5 bg-dark-850 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filters:</span>
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-dark-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Mules (Score 80+)</option>
            <option value="HIGH">High Risk (Score 65+)</option>
            <option value="LOW">Low Risk / Safe</option>
          </select>

          <div className="flex items-center gap-2 bg-dark-950 border border-slate-700 px-2.5 py-1 rounded-lg">
            <span className="text-[11px] text-slate-400">Min Amount:</span>
            <input
              type="range"
              min="0"
              max="100000"
              step="10000"
              value={minAmount}
              onChange={(e) => setMinAmount(Number(e.target.value))}
              className="w-24 accent-indigo-500"
            />
            <span className="font-mono text-[11px] text-indigo-300">{minAmount > 0 ? formatCurrency(minAmount) : 'Any'}</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={suspiciousOnly}
              onChange={(e) => setSuspiciousOnly(e.target.checked)}
              className="rounded bg-dark-950 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>Suspicious Only</span>
          </label>
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span>{graphData.nodes.length} Nodes</span>
          <span>•</span>
          <span>{graphData.edges.length} Edges</span>
        </div>
      </div>

      {/* Main Analysis Workspace: Full Graph & Selected Node Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Full Interactive Graph (8 cols) */}
        <div className="lg:col-span-8 card-investigation p-3 bg-dark-900">
          <NetworkGraph
            nodes={graphData.nodes}
            edges={graphData.edges}
            onSelectNode={handleNodeClick}
            onSelectEdge={(edge) => onOpenTxnModal(edge.id)}
            selectedNodeId={selectedNode?.id}
            height="580px"
          />
        </div>

        {/* Selected Node Panel (4 cols) */}
        <div className="lg:col-span-4 card-investigation p-5 bg-dark-850 flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-base font-bold text-white">{selectedNode.id}</span>
                    <RiskBadge level={selectedNode.riskLevel} score={selectedNode.riskScore} size="sm" />
                  </div>
                  <h3 className="text-xs text-slate-300 font-medium">{selectedNode.name}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">{selectedNode.accountType}</span>
                </div>
              </div>

              {/* Forensic Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Balance</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(selectedNode.currentBalance)}</span>
                </div>
                <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Pass-Through</span>
                  <span className="font-mono font-bold text-indigo-400">{formatPercent(selectedNode.passThroughRatio)}</span>
                </div>
                <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Transactions</span>
                  <span className="font-mono font-bold text-slate-200">{selectedNode.txnCount || 14}</span>
                </div>
                <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Syndicate</span>
                  <span className="font-mono font-bold text-indigo-400">{selectedNode.communityId || 'General'}</span>
                </div>
              </div>

              {/* Explainable Reasons */}
              <div className="bg-dark-950 p-3 rounded-lg border border-red-500/20 text-xs space-y-1.5">
                <span className="font-bold text-red-400 uppercase tracking-wider text-[10px] block">
                  Top Mule Risk Signals:
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {(selectedNode.riskReasons || [
                    'High velocity pass-through behaviour detected',
                    'Direct links to flagged syndicate members'
                  ]).slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-red-400 font-bold shrink-0">✓</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onNavigateToAccount(selectedNode.id)}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Investigate Account
                </button>

                <button
                  onClick={() => onNavigateToTrace(selectedNode.id)}
                  className="w-full py-2 px-3 rounded-lg bg-dark-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                  Trace From Here
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenAccountDrawer(selectedNode.id)}
                    className="py-1.5 px-2 rounded-lg bg-dark-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    Quick Drawer
                  </button>
                  <button
                    onClick={() => onAddToCase && onAddToCase({
                      type: 'account',
                      label: selectedNode.id,
                      detail: `Risk Score: ${selectedNode.riskScore}`
                    })}
                    className="py-1.5 px-2 rounded-lg bg-dark-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    Add to Case
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              <Network className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Click any node in the graph to inspect forensic telemetry.</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
            Graph nodes positioned via topological flow
          </div>
        </div>
      </div>
    </div>
  );
}
