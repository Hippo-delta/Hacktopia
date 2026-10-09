import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldAlert, 
  Layers, 
  DollarSign, 
  Bell, 
  Network, 
  ArrowRight, 
  ExternalLink, 
  Activity, 
  GitBranch, 
  Zap, 
  Compass, 
  Briefcase, 
  MapPin, 
  Scale, 
  Filter 
} from 'lucide-react';
import KpiCard from '../components/KpiCard';
import NetworkGraph from '../components/NetworkGraph';
import RiskBadge from '../components/RiskBadge';
import { 
  getDashboardStats, 
  getNetworkData, 
  getRiskAlerts, 
  getRegionalData, 
  subscribeToDataChanges 
} from '../services/api';
import { formatCurrency, getRiskColorClass } from '../utils/formatters';

export default function DashboardPage({ 
  onNavigateToAccount, 
  onNavigateToTrace, 
  onNavigateToAlerts, 
  onNavigateToNetwork,
  onOpenAccountDrawer,
  onOpenTxnModal,
  onOpenCompare
}) {
  const [stats, setStats] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], summary: {} });
  const [alerts, setAlerts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const loadData = async () => {
    try {
      const [s, g, a, r] = await Promise.all([
        getDashboardStats(),
        getNetworkData(),
        getRiskAlerts(),
        getRegionalData()
      ]);
      setStats(s);
      setGraphData(g);
      setAlerts(a);
      setRegions(r);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDataChanges(loadData);
    return () => unsubscribe();
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Initializing Mule Network Intelligence Engine...</p>
        </div>
      </div>
    );
  }

  const { kpis, riskDistribution, recentActivities } = stats;

  // Donut chart calculations
  const totalRiskCount = riskDistribution.total || 1;
  const segments = [
    { label: 'Critical', count: riskDistribution.critical, color: '#ef4444', percent: Math.round((riskDistribution.critical / totalRiskCount) * 100) },
    { label: 'High', count: riskDistribution.high, color: '#f97316', percent: Math.round((riskDistribution.high / totalRiskCount) * 100) },
    { label: 'Medium', count: riskDistribution.medium, color: '#eab308', percent: Math.round((riskDistribution.medium / totalRiskCount) * 100) },
    { label: 'Low', count: riskDistribution.low, color: '#10b981', percent: Math.round((riskDistribution.low / totalRiskCount) * 100) },
  ];

  const circumference = 2 * Math.PI * 40;
  let accumulatedOffset = 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Fraud & Mule Investigation Dashboard</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              LIVE GRAPH TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time graph intelligence detecting multi-hop pass-through scams and mule rental rings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenCompare && onOpenCompare('A102', 'B552')}
            className="px-3 py-1.5 rounded-lg bg-dark-850 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            Compare Accounts
          </button>
          <button
            onClick={() => onNavigateToTrace('TXN-84921')}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
          >
            <GitBranch className="w-3.5 h-3.5" />
            Trace Flagship Scam (TXN-84921)
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard
          title="Total Accounts"
          value={kpis.totalAccounts.formatted}
          trend={kpis.totalAccounts.trend}
          note={kpis.totalAccounts.note}
          icon={Users}
        />
        <KpiCard
          title="Suspicious Accounts"
          value={kpis.suspiciousAccounts.formatted}
          trend={kpis.suspiciousAccounts.trend}
          note={kpis.suspiciousAccounts.note}
          icon={ShieldAlert}
          alert={true}
          onClick={() => onNavigateToAccount('A102')}
        />
        <KpiCard
          title="Transactions Analysed"
          value={kpis.transactionsAnalysed.formatted}
          trend={kpis.transactionsAnalysed.trend}
          note={kpis.transactionsAnalysed.note}
          icon={Layers}
        />
        <KpiCard
          title="High-Risk Volume"
          value={kpis.highRiskVolume.formatted}
          trend={kpis.highRiskVolume.trend}
          note={kpis.highRiskVolume.note}
          icon={DollarSign}
          alert={true}
        />
        <KpiCard
          title="Active Risk Alerts"
          value={kpis.activeAlerts.formatted}
          trend={kpis.activeAlerts.trend}
          note={kpis.activeAlerts.note}
          icon={Bell}
          alert={true}
          onClick={onNavigateToAlerts}
        />
        <KpiCard
          title="Suspicious Communities"
          value={kpis.suspiciousCommunities.formatted}
          trend={kpis.suspiciousCommunities.trend}
          note={kpis.suspiciousCommunities.note}
          icon={Network}
          onClick={onNavigateToNetwork}
        />
      </div>

      {/* Main Section: Transaction Network Graph & Network Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Graph Area (8 cols) */}
        <div className="lg:col-span-8 card-investigation p-4 bg-dark-900 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                Transaction Network Topology
              </h2>
              <p className="text-[11px] text-slate-400">
                Directional money flow across synthetic accounts. Drag nodes or click for forensic details.
              </p>
            </div>
            <button
              onClick={onNavigateToNetwork}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 hover:underline"
            >
              Full Screen Analysis <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <NetworkGraph
            nodes={graphData.nodes}
            edges={graphData.edges}
            onSelectNode={(node) => onOpenAccountDrawer(node.id)}
            onSelectEdge={(edge) => onOpenTxnModal(edge.id)}
            height="460px"
          />
        </div>

        {/* Network Summary & Top Alerts (4 cols) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          {/* Network Summary Box */}
          <div className="card-investigation p-4 bg-dark-850">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Network Graph Summary
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Active Nodes</span>
                <span className="font-mono text-sm font-bold text-white">{graphData.summary.totalNodes || 12}</span>
              </div>
              <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Connections</span>
                <span className="font-mono text-sm font-bold text-indigo-300">{graphData.summary.totalEdges || 14}</span>
              </div>
              <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Suspicious Nodes</span>
                <span className="font-mono text-sm font-bold text-red-400">{graphData.summary.suspiciousNodes || 6}</span>
              </div>
              <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Max Trail Depth</span>
                <span className="font-mono text-sm font-bold text-amber-400">5 Hops</span>
              </div>
            </div>
          </div>

          {/* Top Risk Alerts List */}
          <div className="card-investigation p-4 bg-dark-850 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  Top Risk Alerts
                </h3>
                <button
                  onClick={onNavigateToAlerts}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  View All Alerts →
                </button>
              </div>

              <div className="space-y-2">
                {alerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => onNavigateToAccount(alert.accountId)}
                    className="p-2.5 rounded-lg bg-dark-950 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white text-[11px]">{alert.accountId}</span>
                        <RiskBadge level={alert.severity} score={alert.riskScore} size="sm" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{alert.detectedTime}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-1">{alert.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-slate-800">
              <button
                onClick={onNavigateToAlerts}
                className="w-full py-2 rounded-lg bg-dark-950 hover:bg-slate-800 text-slate-300 font-medium text-xs border border-slate-800 transition flex items-center justify-center gap-1.5"
              >
                <span>Review All {alerts.length} Flagged Alerts</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Risk Distribution Donut + Activity Feed + Regional Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Risk Distribution Chart (4 cols) */}
        <div className="md:col-span-4 card-investigation p-4 bg-dark-850">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Account Risk Distribution
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">{totalRiskCount} Accounts</span>
          </div>

          <div className="flex items-center justify-center my-2 relative">
            <svg width="150" height="150" viewBox="0 0 100 100" className="transform -rotate-90">
              {segments.map((s, idx) => {
                const strokeDasharray = `${(s.percent / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedOffset;
                accumulatedOffset += (s.percent / 100) * circumference;

                return (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer hover:opacity-80"
                    onMouseEnter={() => setHoveredSlice(s)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                );
              })}
            </svg>

            {/* Inner text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-bold font-mono text-white">
                {hoveredSlice ? `${hoveredSlice.count}` : `${riskDistribution.critical}`}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400">
                {hoveredSlice ? hoveredSlice.label : 'Critical Mules'}
              </span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px]">
            {segments.map((s, idx) => (
              <div 
                key={idx}
                onMouseEnter={() => setHoveredSlice(s)}
                onMouseLeave={() => setHoveredSlice(null)}
                className="flex items-center justify-between p-1.5 rounded hover:bg-dark-900 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-300">{s.label}</span>
                </div>
                <span className="font-mono text-slate-400">{s.count} ({s.percent}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed (4 cols) */}
        <div className="md:col-span-4 card-investigation p-4 bg-dark-850 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Recent Investigation Activity
              </h3>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE FEED
              </span>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {recentActivities.slice(0, 5).map((act) => (
                <div key={act.id} className="p-2 rounded-lg bg-dark-950 border border-slate-800/60 text-xs">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1">
                    <span>{act.time}</span>
                    <span className={`px-1 rounded text-[9px] font-semibold uppercase ${getRiskColorClass(act.severity).badge}`}>
                      {act.severity}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-snug">{act.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
            Feed synchronized with graph anomaly engine
          </div>
        </div>

        {/* Feature 10: Investigation Heatmap / Synthetic Network Regions (4 cols) */}
        <div className="md:col-span-4 card-investigation p-4 bg-dark-850">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Regional Network Risk
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              SYNTHETIC REGIONS
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mb-2.5">
            Geographic risk concentration for law enforcement coordination (demo regions):
          </p>

          <div className="space-y-2">
            {regions.map((reg) => {
              const isSelected = selectedRegion === reg.id;
              const hasCritical = reg.suspiciousAccounts >= 4;

              return (
                <div
                  key={reg.id}
                  onClick={() => setSelectedRegion(isSelected ? null : reg.id)}
                  className={`p-2.5 rounded-lg border transition cursor-pointer text-xs ${
                    isSelected 
                      ? 'bg-indigo-950/40 border-indigo-500' 
                      : hasCritical 
                      ? 'bg-dark-950 border-red-500/30 hover:border-red-500/60' 
                      : 'bg-dark-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{reg.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {reg.suspiciousAccounts} mules / {reg.highRiskTxns} txns
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Anchor: <strong className="text-indigo-400">{reg.anchorCommunity}</strong></span>
                    {hasCritical && (
                      <span className="text-red-400 font-semibold">High Concentration</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
