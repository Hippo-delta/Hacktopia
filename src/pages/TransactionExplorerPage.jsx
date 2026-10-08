import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  ArrowRight, 
  GitBranch, 
  Eye, 
  Download, 
  Briefcase,
  DollarSign
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { getTransactions, exportTransactionsCsv, subscribeToDataChanges } from '../services/api';
import { formatCurrency, formatExactCurrency } from '../utils/formatters';

export default function TransactionExplorerPage({ 
  onNavigateToTrace, 
  onNavigateToAccount, 
  onOpenTxnModal,
  onAddToCase 
}) {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [minAmount, setMinAmount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions({
        search,
        riskLevel: riskFilter,
        channel: channelFilter,
        minAmount: minAmount > 0 ? minAmount : null
      });
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    const unsub = subscribeToDataChanges(loadTransactions);
    return () => unsub();
  }, [search, riskFilter, channelFilter, minAmount]);

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(transactions.length / pageSize) || 1;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Forensic Transaction Explorer
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {transactions.length} RECORDS INDEXED
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Search, filter, and inspect inter-bank payments and rapid mule pass-through tranches.
          </p>
        </div>

        <button
          onClick={() => exportTransactionsCsv()}
          className="px-3.5 py-1.5 rounded-lg bg-dark-850 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          Export Ledger (CSV)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card-investigation p-4 bg-dark-850 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search TXN ID, accounts..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="bg-dark-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono w-52"
            />
          </div>

          {/* Risk Level */}
          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
            className="bg-dark-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="LOW">Low</option>
          </select>

          {/* Channel */}
          <select
            value={channelFilter}
            onChange={(e) => { setChannelFilter(e.target.value); setCurrentPage(1); }}
            className="bg-dark-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Payment Rails</option>
            <option value="IMPS">IMPS (Instant)</option>
            <option value="NEFT">NEFT (Batch)</option>
            <option value="RTGS">RTGS (High Value)</option>
          </select>

          {/* Min Amount */}
          <div className="flex items-center gap-2 bg-dark-950 border border-slate-700 px-2.5 py-1 rounded-lg">
            <span className="text-[11px] text-slate-400">Min:</span>
            <input
              type="range"
              min="0"
              max="100000"
              step="10000"
              value={minAmount}
              onChange={(e) => { setMinAmount(Number(e.target.value)); setCurrentPage(1); }}
              className="w-20 accent-indigo-500"
            />
            <span className="font-mono text-[11px] text-indigo-300">{minAmount > 0 ? formatCurrency(minAmount) : '₹0'}</span>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          Showing {transactions.length} transactions
        </div>
      </div>

      {/* Transaction Table */}
      <div className="card-investigation overflow-hidden bg-dark-900 border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-dark-950 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                <th className="p-3.5">Transaction ID</th>
                <th className="p-3.5">Origin (Debit)</th>
                <th className="p-3.5">Beneficiary (Credit)</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Channel</th>
                <th className="p-3.5">Risk Level</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 font-sans">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-indigo-400">
                      <button 
                        onClick={() => onOpenTxnModal(txn.id)}
                        className="hover:underline flex items-center gap-1"
                      >
                        {txn.id}
                      </button>
                    </td>
                    <td className="p-3.5">
                      <button 
                        onClick={() => onNavigateToAccount(txn.fromAccount)}
                        className="font-bold text-white hover:text-indigo-300 hover:underline"
                      >
                        {txn.fromAccount}
                      </button>
                    </td>
                    <td className="p-3.5">
                      <button 
                        onClick={() => onNavigateToAccount(txn.toAccount)}
                        className="font-bold text-white hover:text-indigo-300 hover:underline"
                      >
                        {txn.toAccount}
                      </button>
                    </td>
                    <td className="p-3.5 text-right font-bold text-white font-sans text-xs">
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="p-3.5 text-slate-400 font-sans text-[11px]">{txn.timestamp}</td>
                    <td className="p-3.5 font-sans font-medium text-slate-300">{txn.channel}</td>
                    <td className="p-3.5">
                      <RiskBadge level={txn.riskLevel} size="sm" />
                    </td>
                    <td className="p-3.5 font-sans text-[11px] text-slate-400">{txn.status}</td>
                    <td className="p-3.5 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigateToTrace(txn.id)}
                          className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium flex items-center gap-1 transition"
                          title="Trace Money Flow"
                        >
                          <GitBranch className="w-3 h-3" />
                          Trace
                        </button>
                        <button
                          onClick={() => onOpenTxnModal(txn.id)}
                          className="p-1 rounded bg-dark-950 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Full Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onAddToCase && onAddToCase({
                            type: 'transaction',
                            label: txn.id,
                            detail: `${formatCurrency(txn.amount)} from ${txn.fromAccount}`
                          })}
                          className="p-1 rounded bg-dark-950 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Add to Case"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-800 bg-dark-950 flex items-center justify-between text-xs text-slate-400">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded bg-dark-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded bg-dark-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
