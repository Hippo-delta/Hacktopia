import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  ExternalLink, 
  UserCheck, 
  GitBranch, 
  Layers, 
  ShieldAlert, 
  Clock, 
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import CaseCreateModal from '../components/CaseCreateModal';
import { getCases, getCaseById, removeEvidenceFromCase, getNetworkData, subscribeToDataChanges } from '../services/api';
import { formatCurrency, getStatusBadgeClass } from '../utils/formatters';

export default function CaseManagementPage({ 
  onNavigateToAccount, 
  onNavigateToTrace, 
  onOpenCaseModal 
}) {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('CASE-2026-0142');
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeGraphNodes, setActiveGraphNodes] = useState(new Set());
  const [activeGraphEdges, setActiveGraphEdges] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const loadCases = async () => {
    try {
      setLoading(true);
      const [list, network] = await Promise.all([
        getCases(),
        getNetworkData().catch(() => ({ nodes: [], edges: [] }))
      ]);
      setCases(list);
      
      const nodeIds = new Set((network.nodes || []).map(n => n.id.toLowerCase()));
      const edgeIds = new Set((network.edges || []).map(e => e.id.toLowerCase()));
      setActiveGraphNodes(nodeIds);
      setActiveGraphEdges(edgeIds);

      if (list.length > 0) {
        const found = list.find(c => c.id === selectedCaseId) || list[0];
        setSelectedCase(found);
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
    const unsub = subscribeToDataChanges(loadCases);
    return () => unsub();
  }, [selectedCaseId]);

  const handleSelectCase = async (caseId) => {
    setSelectedCaseId(caseId);
    const c = await getCaseById(caseId);
    setSelectedCase(c);
  };

  const handleRemoveEvidence = async (evId) => {
    if (!selectedCase) return;
    await removeEvidenceFromCase(selectedCase.id, evId);
    loadCases();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Investigation Case Management & Evidence Board
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              FEATURE 1 & FEATURE 7
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Consolidate flagged mule accounts, suspicious payment chains, and simulated debit freezes into formal forensic case dossiers.
          </p>
        </div>

        <button
          onClick={onOpenCaseModal}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Case Dossier
        </button>
      </div>

      {/* Main Grid: Cases List & Selected Case Evidence Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Cases Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Active Case Dossiers ({cases.length})
            </h2>
            <span className="text-[10px] font-mono text-slate-500">AML Desk</span>
          </div>

          <div className="space-y-2.5">
            {cases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCase(c.id)}
                  className={`card-investigation p-3.5 cursor-pointer transition text-xs ${
                    isSelected 
                      ? 'bg-dark-900 border-indigo-500 shadow-md shadow-indigo-500/10' 
                      : 'bg-dark-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-indigo-400 text-xs">{c.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeClass(c.status)}`}>
                      {c.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-xs mb-1 line-clamp-1">{c.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{c.summary}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                    <span>Priority: <strong className="text-red-400">{c.priority}</strong></span>
                    <span>{c.evidenceList?.length || 0} Evidence items</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Case Workspace (8 cols) */}
        <div className="lg:col-span-8 card-investigation p-6 bg-dark-900 border-slate-700/80 space-y-6">
          {selectedCase ? (
            <>
              {/* Case Metadata Banner */}
              <div className="border-b border-slate-800 pb-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-base text-indigo-400">{selectedCase.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadgeClass(selectedCase.status)}`}>
                        {selectedCase.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                        {selectedCase.priority} Priority
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white">{selectedCase.title}</h2>
                  </div>

                  <div className="text-right text-xs text-slate-400">
                    <div>Assigned: <strong className="text-slate-200">{selectedCase.assignedAnalyst}</strong></div>
                    <div className="font-mono text-[11px] text-slate-500">Created: {selectedCase.createdAt}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-dark-950 p-3 rounded-lg border border-slate-800">
                  {selectedCase.summary}
                </p>

                {/* Case Stats Row */}
                <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                  <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Under Investigation</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {formatCurrency(selectedCase.amountUnderInvestigation || 75000)}
                    </span>
                  </div>
                  <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Linked Mule Nodes</span>
                    <span className="font-mono text-xs font-bold text-red-400">
                      {selectedCase.suspiciousAccounts?.length || 0} Accounts
                    </span>
                  </div>
                  <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Transactions</span>
                    <span className="font-mono text-xs font-bold text-indigo-300">
                      {selectedCase.transactions?.length || 0} Tranches
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature 7: Evidence Board */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Pinned Forensic Evidence Board
                  </h3>
                  <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {selectedCase.evidenceList?.length || 0} Items Pinned
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedCase.evidenceList || []).map((ev) => {
                    // Extract primary entity ID from label (e.g. 'Mule Layer 1 (A102)' -> 'A102' or 'TXN-84921')
                    const match = ev.label.match(/\b([A-Za-z0-9_-]+)\b/g);
                    let targetId = null;
                    if (ev.type === 'account') {
                      const parenMatch = ev.label.match(/\(([^)]+)\)/);
                      targetId = parenMatch ? parenMatch[1].trim() : (match ? match[match.length - 1] : ev.label);
                    } else if (ev.type === 'transaction') {
                      const txnMatch = ev.label.match(/(TXN-[A-Za-z0-9-]+)/i);
                      targetId = txnMatch ? txnMatch[1].trim() : (match ? match[0] : ev.label);
                    }

                    const isAccountValid = ev.type === 'account' && targetId && activeGraphNodes.has(targetId.toLowerCase());
                    const isTransactionValid = ev.type === 'transaction' && targetId && activeGraphEdges.has(targetId.toLowerCase());
                    const isAvailableInGraph = isAccountValid || isTransactionValid || (ev.type !== 'account' && ev.type !== 'transaction');
                    const isHistoricalUnavailable = (ev.type === 'account' || ev.type === 'transaction') && !isAvailableInGraph;

                    return (
                      <div 
                        key={ev.id}
                        className={`p-3.5 rounded-xl bg-dark-950 border transition space-y-2 relative group ${
                          isHistoricalUnavailable ? 'border-amber-500/30 bg-dark-950/80' : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 px-1.5 py-0.2 bg-indigo-500/10 rounded border border-indigo-500/20">
                              [EVIDENCE: {ev.type}]
                            </span>
                            {isHistoricalUnavailable && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Info className="w-2.5 h-2.5" />
                                Historical Reference — Not in Current Graph
                              </span>
                            )}
                            {!isHistoricalUnavailable && (ev.type === 'account' || ev.type === 'transaction') && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                Live Active Graph
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-slate-500">{ev.timestamp}</span>
                            <button
                              onClick={() => handleRemoveEvidence(ev.id)}
                              className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition"
                              title="Remove from board"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="font-mono font-bold text-white text-xs">{ev.label}</div>
                        <p className="text-[11px] text-slate-300 leading-snug">{ev.detail}</p>

                        {/* Quick Navigation links based on evidence type */}
                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-end gap-2 text-[10px]">
                          {ev.type === 'account' && (
                            isAccountValid ? (
                              <button
                                onClick={() => onNavigateToAccount(targetId)}
                                className="text-indigo-400 hover:underline flex items-center gap-0.5 font-medium"
                              >
                                Open Account <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <span 
                                className="text-slate-500 cursor-not-allowed flex items-center gap-0.5" 
                                title="This referenced account belongs to another investigation scenario and is not in the active graph."
                              >
                                Open Account (Not in Current Graph)
                              </span>
                            )
                          )}
                          {ev.type === 'transaction' && (
                            isTransactionValid ? (
                              <button
                                onClick={() => onNavigateToTrace(targetId)}
                                className="text-indigo-400 hover:underline flex items-center gap-0.5 font-medium"
                              >
                                Trace Flow <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <span 
                                className="text-slate-500 cursor-not-allowed flex items-center gap-0.5"
                                title="This referenced transaction belongs to another investigation scenario and is not in the active graph."
                              >
                                Trace Flow (Not in Current Graph)
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Select a case dossier from the left to view attached evidence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
