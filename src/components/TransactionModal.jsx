import React from 'react';
import { X, Layers, ArrowRight, GitBranch, Briefcase, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatExactCurrency, getRiskColorClass } from '../utils/formatters';
import RiskBadge from './RiskBadge';

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  transaction, 
  onTrace, 
  onAddToCase,
  onViewAccount 
}) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-investigation bg-dark-900 border-slate-700 w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-dark-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono">{transaction.id}</h3>
                <RiskBadge level={transaction.riskLevel} size="sm" />
              </div>
              <p className="text-[11px] text-slate-400">Transaction Forensic Record</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Amount Hero */}
          <div className="text-center py-3 bg-dark-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Transfer Value</span>
            <span className="text-2xl font-bold font-mono text-white block">{formatCurrency(transaction.amount)}</span>
            <span className="text-[11px] font-mono text-slate-500">{formatExactCurrency(transaction.amount)}</span>
          </div>

          {/* Transfer Counterparties */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div 
              onClick={() => onViewAccount && onViewAccount(transaction.fromAccount)}
              className="bg-dark-950 p-3 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer transition"
            >
              <span className="text-[10px] text-slate-400 uppercase block">Originating (Debit)</span>
              <span className="font-mono font-bold text-white text-xs block">{transaction.fromAccount}</span>
              <span className="text-[10px] text-indigo-400 mt-1 block hover:underline">Inspect Account →</span>
            </div>

            <div 
              onClick={() => onViewAccount && onViewAccount(transaction.toAccount)}
              className="bg-dark-950 p-3 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer transition"
            >
              <span className="text-[10px] text-slate-400 uppercase block">Beneficiary (Credit)</span>
              <span className="font-mono font-bold text-white text-xs block">{transaction.toAccount}</span>
              <span className="text-[10px] text-indigo-400 mt-1 block hover:underline">Inspect Account →</span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="bg-dark-950/70 p-3.5 rounded-lg border border-slate-800 space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Timestamp:</span>
              <span className="font-mono text-slate-200">{transaction.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Channel / Protocol:</span>
              <span className="font-mono text-indigo-300 font-semibold">{transaction.channel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Settlement Status:</span>
              <span className="font-mono text-emerald-400">{transaction.status}</span>
            </div>
            {transaction.notes && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-0.5 font-semibold">Investigation Notes:</span>
                <p className="text-slate-300 leading-relaxed">{transaction.notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={() => {
                if (onAddToCase) onAddToCase({ type: 'transaction', label: transaction.id, detail: `${formatCurrency(transaction.amount)} via ${transaction.channel}` });
              }}
              className="px-3.5 py-2 rounded-lg bg-dark-800 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium flex items-center gap-1.5 transition text-xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              Add to Case
            </button>
            <button
              onClick={() => {
                onClose();
                if (onTrace) onTrace(transaction.id);
              }}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition text-xs"
            >
              <GitBranch className="w-3.5 h-3.5" />
              Trace Money Trail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
