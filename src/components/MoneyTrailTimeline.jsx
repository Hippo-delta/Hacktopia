import React from 'react';
import { 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  ExternalLink, 
  Zap, 
  CheckCircle2, 
  Eye, 
  PlusCircle 
} from 'lucide-react';
import { formatCurrency, formatExactCurrency, getRiskColorClass } from '../utils/formatters';
import RiskBadge from './RiskBadge';

export default function MoneyTrailTimeline({ 
  hops = [], 
  onViewAccount, 
  onViewTransaction, 
  onContinueTrace, 
  isLoading = false 
}) {
  if (!hops || hops.length === 0) {
    return (
      <div className="card-investigation p-8 text-center text-slate-400">
        <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2 animate-spin" />
        <p className="text-sm">No transaction trail loaded. Enter a Transaction ID or Account ID above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-indigo-500 before:via-red-500 before:to-orange-500">
        {hops.map((hop, index) => {
          const isSuspicious = hop.isSuspicious;
          const isFirstHop = index === 0;
          const isLastHop = index === hops.length - 1;

          return (
            <div 
              key={hop.txnId || index}
              className={`relative card-investigation p-4 transition-all duration-200 ${
                isSuspicious ? 'border-red-500/40 bg-red-950/10' : 'bg-dark-850'
              }`}
            >
              {/* Timeline Node Pin */}
              <div 
                className={`absolute -left-[30px] top-5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono border-2 ${
                  isSuspicious 
                    ? 'bg-red-500 text-white border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.6)]' 
                    : 'bg-dark-900 text-indigo-400 border-indigo-500'
                }`}
              >
                {hop.hopNumber}
              </div>

              {/* Hop Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">
                    HOP {hop.hopNumber}
                  </span>
                  <span className="font-mono text-xs font-medium text-slate-300">
                    {hop.txnId}
                  </span>
                  {isSuspicious && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      Suspicious Pass-Through
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {hop.timestamp}
                  </span>
                  {hop.delayMinutes > 0 && (
                    <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      <Zap className="w-3 h-3 text-amber-400" />
                      {hop.delayMinutes} min delay
                    </span>
                  )}
                </div>
              </div>

              {/* Hop Money Flow Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Sender Account */}
                <div className="md:col-span-4 bg-dark-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-medium mb-1">Sender</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-white text-xs block">{hop.fromAccount}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[150px] block">{hop.fromAccountName}</span>
                    </div>
                    <RiskBadge level={hop.fromRiskLevel || 'LOW'} size="sm" />
                  </div>
                </div>

                {/* Arrow & Amount Center */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center py-1">
                  <div className="text-base font-bold font-mono text-white tracking-tight flex items-center gap-1">
                    {formatCurrency(hop.amount)}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 my-0.5">
                    <div className="h-[1px] w-8 bg-slate-700" />
                    <ArrowRight className={`w-4 h-4 ${isSuspicious ? 'text-red-400 animate-pulse' : 'text-indigo-400'}`} />
                    <div className="h-[1px] w-8 bg-slate-700" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{formatExactCurrency(hop.amount)}</span>
                </div>

                {/* Receiver Account */}
                <div className="md:col-span-4 bg-dark-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-medium mb-1">Receiver (Mule)</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-white text-xs block">{hop.toAccount}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[150px] block">{hop.toAccountName}</span>
                    </div>
                    <RiskBadge level={hop.toRiskLevel || 'HIGH'} score={hop.toRiskScore} size="sm" />
                  </div>
                </div>
              </div>

              {/* Hop Flag Explanation */}
              {hop.flagReason && (
                <div className="mt-2 text-[11px] text-slate-300 bg-dark-900/60 px-3 py-1.5 rounded flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Forensic Signal:</strong> {hop.flagReason}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => onViewAccount && onViewAccount(hop.toAccount)}
                  className="px-2.5 py-1 rounded bg-dark-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  View Account ({hop.toAccount})
                </button>
                <button
                  onClick={() => onViewTransaction && onViewTransaction(hop.txnId)}
                  className="px-2.5 py-1 rounded bg-dark-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  View Txn Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Trace Action Button */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={onContinueTrace}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" />
          {isLoading ? 'Scanning Further Synthetic Hops...' : 'Continue Trace (Deep Scan Next Hops)'}
        </button>
      </div>
    </div>
  );
}
