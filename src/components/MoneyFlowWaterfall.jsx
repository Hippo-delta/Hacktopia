import React from 'react';
import { ArrowDown, DollarSign, Zap, TrendingDown, Percent, Layers } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function MoneyFlowWaterfall({ analytics, hops = [] }) {
  if (!analytics) return null;

  return (
    <div className="card-investigation p-5 bg-dark-850">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Money Flow Analytics & Waterfall
          </h3>
          <p className="text-xs text-slate-400">Quantitative fund decay across traced mule hops</p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
          Synthetic Forensic Flow
        </span>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <div className="bg-dark-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Total In</span>
          <span className="font-mono text-xs font-bold text-emerald-400">{formatCurrency(analytics.totalIncoming)}</span>
        </div>
        <div className="bg-dark-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Total Out</span>
          <span className="font-mono text-xs font-bold text-amber-400">{formatCurrency(analytics.totalOutgoing)}</span>
        </div>
        <div className="bg-dark-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Retained / Siphoned</span>
          <span className="font-mono text-xs font-bold text-red-400">{formatCurrency(analytics.amountRetained)}</span>
        </div>
        <div className="bg-dark-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Pass-Through Ratio</span>
          <span className="font-mono text-xs font-bold text-indigo-400">{formatPercent(analytics.passThroughRatio)}</span>
        </div>
        <div className="bg-dark-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Fastest Transfer</span>
          <span className="font-mono text-xs font-bold text-cyan-400">{analytics.fastestTransferMin} mins</span>
        </div>
        <div className="bg-dark-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Highest Txn</span>
          <span className="font-mono text-xs font-bold text-white">{formatCurrency(analytics.highestTxn)}</span>
        </div>
        <div className="bg-dark-900 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Average Txn</span>
          <span className="font-mono text-xs font-bold text-slate-200">{formatCurrency(analytics.avgTxn)}</span>
        </div>
      </div>

      {/* Visual Waterfall Progression */}
      <div className="bg-dark-950 p-4 rounded-xl border border-slate-800">
        <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
          <span>Decay Sequence: Fund Drainage by Hop</span>
          <span className="text-[11px] text-slate-500 font-normal">Initial Scam Deposit → Layering Off-Ramp</span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 overflow-x-auto pb-2">
          {hops.map((h, i) => {
            const retentionDelta = i > 0 ? (hops[i - 1].amount - h.amount) : 0;
            return (
              <React.Fragment key={h.txnId || i}>
                <div className="flex flex-col items-center bg-dark-900 border border-slate-700/80 p-3 rounded-lg min-w-[130px] shrink-0 text-center shadow">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold mb-1">
                    {i === 0 ? 'ENTRY DEBIT' : `HOP ${h.hopNumber}`}
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    {formatCurrency(h.amount)}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {h.toAccount}
                  </span>
                  {retentionDelta > 0 && (
                    <span className="text-[9px] font-mono text-red-400 mt-1 bg-red-500/10 px-1 rounded">
                      - {formatCurrency(retentionDelta)} siphon
                    </span>
                  )}
                </div>

                {i < hops.length - 1 && (
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <ArrowDown className="w-4 h-4 text-indigo-400 rotate-0 md:-rotate-90 animate-pulse my-1" />
                    <span className="text-[10px] font-mono text-slate-500">
                      {hops[i + 1]?.delayMinutes || 2}m
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
