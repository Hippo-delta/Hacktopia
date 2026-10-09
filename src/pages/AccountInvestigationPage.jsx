import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  GitBranch, 
  Lock, 
  Briefcase, 
  Scale, 
  Clock, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Eye, 
  Sliders,
  DollarSign,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import FreezeSimulatorModal from '../components/FreezeSimulatorModal';
import { 
  getAccount, 
  getAllAccounts, 
  getTransactions, 
  simulateFreezeAccount, 
  addEvidenceToCase,
  subscribeToDataChanges 
} from '../services/api';
import { formatCurrency, formatExactCurrency, formatPercent, getRiskColorClass } from '../utils/formatters';

export default function AccountInvestigationPage({ 
  initialAccountId = 'A102', 
  onNavigateToTrace, 
  onOpenTxnModal,
  onOpenCompare,
  onAddToCase
}) {
  const [selectedAccountId, setSelectedAccountId] = useState(initialAccountId);
  const [account, setAccount] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Table filters
  const [txnSearch, setTxnSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Freeze Modal State
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [freezeBanner, setFreezeBanner] = useState(null);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      const [acc, accList] = await Promise.all([
        getAccount(selectedAccountId),
        getAllAccounts()
      ]);
      setAccount(acc);
      setAllAccounts(accList);

      if (acc) {
        const txns = await getTransactions({ accountId: acc.id });
        setTransactions(txns);
      }
    } catch (err) {
      console.error('Error fetching account data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountData();
    const unsub = subscribeToDataChanges(loadAccountData);
    return () => unsub();
  }, [selectedAccountId]);

  const handleSimulateFreeze = async (accId, reason) => {
    const res = await simulateFreezeAccount(accId, reason);
    setFreezeBanner(res);
    loadAccountData();
    setTimeout(() => setFreezeBanner(null), 6000);
  };

  // Filtered transactions for the table
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = !txnSearch || 
      t.id.toLowerCase().includes(txnSearch.toLowerCase()) ||
      t.fromAccount.toLowerCase().includes(txnSearch.toLowerCase()) ||
      t.toAccount.toLowerCase().includes(txnSearch.toLowerCase());
    
    const isIncoming = t.toAccount.toLowerCase() === account?.id.toLowerCase();
    const isOutgoing = t.fromAccount.toLowerCase() === account?.id.toLowerCase();

    const matchesDirection = directionFilter === 'ALL' || 
      (directionFilter === 'INCOMING' && isIncoming) || 
      (directionFilter === 'OUTGOING' && isOutgoing);

    const matchesRisk = riskFilter === 'ALL' || t.riskLevel.toUpperCase() === riskFilter.toUpperCase();

    return matchesSearch && matchesDirection && matchesRisk;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;

  if (loading && !account) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-6 text-center text-slate-400">
        Account not found.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar / Account Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Account Dossier:</span>
              <span className="font-mono text-indigo-400">{account.id}</span>
            </h1>
            <RiskBadge level={account.riskLevel} score={account.riskScore} size="md" />
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
              account.status === 'Simulated Frozen' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-slate-800 text-slate-300'
            }`}>
              {account.status}
            </span>
          </div>
          <p className="text-xs text-slate-400">{account.name} — {account.accountType}</p>
        </div>

        {/* Switch Account Quick Dropdown */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="bg-dark-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-indigo-500"
          >
            {allAccounts.map(a => (
              <option key={a.id} value={a.id}>
                {a.id} — {a.name} ({a.riskLevel} {a.riskScore})
              </option>
            ))}
          </select>

          <button
            onClick={() => onNavigateToTrace(account.id)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <GitBranch className="w-3.5 h-3.5" />
            Trace Money Trail
          </button>
        </div>
      </div>

      {/* Freeze Action Banner */}
      {freezeBanner && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex justify-between items-center animate-in fade-in">
          <div>
            <strong className="uppercase tracking-wider">{freezeBanner.message}</strong>
            <p className="text-slate-300 text-[11px]">{freezeBanner.disclaimer}</p>
          </div>
          <button onClick={() => setFreezeBanner(null)} className="text-slate-400 hover:text-white px-2 py-1">Dismiss</button>
        </div>
      )}

      {/* Key Forensic Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="card-investigation p-3.5 bg-dark-850">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Current Balance</span>
          <span className="text-lg font-bold font-mono text-white">{formatCurrency(account.currentBalance)}</span>
          <p className="text-[10px] text-slate-400 mt-0.5">Low residual holding</p>
        </div>

        <div className="card-investigation p-3.5 bg-dark-850">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Pass-Through Ratio</span>
          <span className="text-lg font-bold font-mono text-indigo-400">{formatPercent(account.passThroughRatio)}</span>
          <p className="text-[10px] text-slate-400 mt-0.5">Fund drainage metric</p>
        </div>

        <div className="card-investigation p-3.5 bg-dark-850">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Total Inflow</span>
          <span className="text-lg font-bold font-mono text-emerald-400">{formatCurrency(account.totalIncoming)}</span>
          <p className="text-[10px] text-slate-400 mt-0.5">{account.uniqueSenders} unique senders</p>
        </div>

        <div className="card-investigation p-3.5 bg-dark-850">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Total Outflow</span>
          <span className="text-lg font-bold font-mono text-amber-400">{formatCurrency(account.totalOutgoing)}</span>
          <p className="text-[10px] text-slate-400 mt-0.5">{account.uniqueReceivers} unique receivers</p>
        </div>

        <div className="card-investigation p-3.5 bg-dark-850">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Median Transfer Delay</span>
          <span className="text-lg font-bold font-mono text-red-400">{account.medianTransferDelayMinutes} mins</span>
          <p className="text-[10px] text-slate-400 mt-0.5">Extreme velocity</p>
        </div>

        <div className="card-investigation p-3.5 bg-dark-850">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Account Age</span>
          <span className="text-lg font-bold font-mono text-slate-200">{account.accountAgeDays} Days</span>
          <p className="text-[10px] text-slate-400 mt-0.5">{account.accountAgeDays < 60 ? 'Recently Registered' : 'Established'}</p>
        </div>
      </div>

      {/* Indian Identity & Business Context Row */}
      {(account.identity_verification_status || account.business_category || account.entity_id) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-dark-900 border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Identity Verification</span>
            <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
              account.identity_verification_status?.includes('VERIFIED')
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {account.identity_verification_status || '—'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Business Registration</span>
            <span className="text-xs font-mono text-slate-200">
              {account.business_registered ? '✅ Registered Entity' : '⚪ Individual / Unregistered'}
            </span>
            {account.gstin_present && account.gstin_number && (
              <span className="text-[10px] font-mono text-indigo-400 block mt-0.5">GSTIN: {account.gstin_number}</span>
            )}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Business Category</span>
            <span className="text-xs font-mono text-slate-200 capitalize">
              {account.business_category ? account.business_category.replace(/_/g, ' ') : '—'}
            </span>
            {account.entity_id && (
              <span className="text-[10px] font-mono text-purple-400 block mt-0.5">Entity: {account.entity_id}</span>
            )}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Expected Activity Profile</span>
            <span className="text-[11px] text-slate-300 leading-snug">
              {account.expected_activity_profile || '—'}
            </span>
          </div>
        </div>
      )}

      {/* Explainable Risk Panel (Why this account is high risk) & Action Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Risk Explainability (7 cols) */}
        <div className="lg:col-span-7 card-investigation p-5 bg-dark-900 border-red-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Why This Account Is High Risk
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded">
              Score: {account.riskScore} / 100
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {(account.riskReasons || []).map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-dark-950/70 border border-slate-800/80">
                <span className="text-red-400 font-bold text-sm shrink-0 leading-none mt-0.5">✓</span>
                <span className="text-slate-200 leading-snug">{reason}</span>
              </div>
            ))}
          </div>

          {/* Transparent Score Breakdown */}
          {account.riskBreakdown && (
            <div className="pt-3 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Transparent Risk Score Composition
              </span>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono">
                <div className="bg-dark-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Diversity</span>
                  <span className="font-bold text-indigo-400">{account.riskBreakdown.incomingDiversityScore} / 20</span>
                </div>
                <div className="bg-dark-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Velocity</span>
                  <span className="font-bold text-red-400">{account.riskBreakdown.velocityScore} / 25</span>
                </div>
                <div className="bg-dark-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Pass-Thru</span>
                  <span className="font-bold text-amber-400">{account.riskBreakdown.passThroughScore} / 25</span>
                </div>
                <div className="bg-dark-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Network</span>
                  <span className="font-bold text-purple-400">{account.riskBreakdown.networkScore} / 20</span>
                </div>
                <div className="bg-dark-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Frequency</span>
                  <span className="font-bold text-cyan-400">{account.riskBreakdown.frequencyScore} / 10</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Panel & Secondary Stats (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="card-investigation p-4 bg-dark-850 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Investigator Actions
            </h3>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setIsFreezeModalOpen(true)}
                className="p-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Lock className="w-4 h-4 text-red-400" />
                Simulate Freeze
              </button>

              <button
                onClick={() => onAddToCase && onAddToCase({
                  type: 'account',
                  label: account.id,
                  detail: `Score: ${account.riskScore} | ${account.name}`
                })}
                className="p-2.5 rounded-lg bg-dark-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Add to Case
              </button>

              <button
                onClick={() => onOpenCompare && onOpenCompare(account.id, 'F221')}
                className="p-2.5 rounded-lg bg-dark-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Scale className="w-4 h-4 text-amber-400" />
                Compare Account
              </button>

              <button
                onClick={() => onNavigateToTrace(account.id)}
                className="p-2.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <GitBranch className="w-4 h-4" />
                Trace Flows
              </button>
            </div>
          </div>

          {/* Feature 5: Chronological Account Risk Timeline */}
          <div className="card-investigation p-4 bg-dark-850 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Chronological Risk Timeline
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Today</span>
            </div>

            <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
              {(account.timeline || []).map((event, idx) => (
                <div key={idx} className="relative text-xs">
                  <div className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full ${
                    event.severity === 'CRITICAL' ? 'bg-red-500' : event.severity === 'HIGH' ? 'bg-orange-500' : 'bg-slate-500'
                  }`} />
                  <div className="flex items-baseline justify-between mb-0.5">
                    <span className="font-mono text-[10px] text-indigo-300 font-bold">{event.time}</span>
                    <span className={`text-[9px] uppercase px-1 rounded font-semibold ${getRiskColorClass(event.severity).badge}`}>
                      {event.severity}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-snug">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Account Transaction History Table */}
      <div className="card-investigation p-5 bg-dark-850 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Account Transaction History
            </h3>
            <p className="text-xs text-slate-400">Forensic ledger for {account.id} ({filteredTransactions.length} transactions)</p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search txns..."
                value={txnSearch}
                onChange={(e) => { setTxnSearch(e.target.value); setCurrentPage(1); }}
                className="bg-dark-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-36 font-mono"
              />
            </div>

            <select
              value={directionFilter}
              onChange={(e) => { setDirectionFilter(e.target.value); setCurrentPage(1); }}
              className="bg-dark-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Directions</option>
              <option value="INCOMING">Incoming (Credits)</option>
              <option value="OUTGOING">Outgoing (Debits)</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
              className="bg-dark-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Risks</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-dark-950 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                <th className="p-3">Txn ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Direction</th>
                <th className="p-3">Counterparty</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Risk</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((txn) => {
                  const isIncoming = txn.toAccount.toLowerCase() === account.id.toLowerCase();
                  const counterparty = isIncoming ? txn.fromAccount : txn.toAccount;

                  return (
                    <tr key={txn.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-semibold text-indigo-400">{txn.id}</td>
                      <td className="p-3 text-slate-400 font-sans text-[11px]">{txn.timestamp}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          isIncoming ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {isIncoming ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {isIncoming ? 'IN' : 'OUT'}
                        </span>
                      </td>
                      <td className="p-3 text-white font-semibold">
                        <button
                          onClick={() => setSelectedAccountId(counterparty)}
                          className="hover:underline hover:text-indigo-300"
                        >
                          {counterparty}
                        </button>
                      </td>
                      <td className="p-3 text-right font-bold text-white font-sans text-xs">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="p-3 font-sans text-[11px] text-slate-400">{txn.status}</td>
                      <td className="p-3">
                        <RiskBadge level={txn.riskLevel} size="sm" />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onOpenTxnModal(txn.id)}
                          className="p-1 rounded bg-dark-900 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Inspect Transaction"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-dark-950 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-dark-950 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Freeze Simulator Modal */}
      <FreezeSimulatorModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        account={account}
        estimatedAmount={account.currentBalance || 70000}
        onConfirmFreeze={handleSimulateFreeze}
      />
    </div>
  );
}
