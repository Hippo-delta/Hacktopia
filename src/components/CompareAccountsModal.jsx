import React, { useState } from 'react';
import { Scale, X, ArrowRight, ShieldAlert, CheckCircle2, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';
import RiskBadge from './RiskBadge';

export default function CompareAccountsModal({ 
  isOpen, 
  onClose, 
  accounts = [], 
  initialAccountA = 'A102', 
  initialAccountB = 'E889' 
}) {
  const [accAId, setAccAId] = useState(initialAccountA);
  const [accBId, setAccBId] = useState(initialAccountB);

  if (!isOpen) return null;

  const accA = accounts.find(a => a.id === accAId) || accounts[0];
  const accB = accounts.find(a => a.id === accBId) || accounts[1] || accounts[0];

  const comparisonMetrics = [
    { label: 'Risk Score', valA: `${accA.riskScore} / 100`, valB: `${accB.riskScore} / 100`, muleWeight: 'A' },
    { label: 'Risk Level', valA: accA.riskLevel, valB: accB.riskLevel, isBadge: true },
    { label: 'Pass-Through Ratio', valA: formatPercent(accA.passThroughRatio), valB: formatPercent(accB.passThroughRatio), muleWeight: 'A' },
    { label: 'Median Transfer Delay', valA: `${accA.medianTransferDelayMinutes} min`, valB: `${accB.medianTransferDelayMinutes} min`, muleWeight: 'A' },
    { label: 'Total Inflow', valA: formatCurrency(accA.totalIncoming), valB: formatCurrency(accB.totalIncoming) },
    { label: 'Total Outflow', valA: formatCurrency(accA.totalOutgoing), valB: formatCurrency(accB.totalOutgoing) },
    { label: 'Unique Senders', valA: accA.uniqueSenders, valB: accB.uniqueSenders },
    { label: 'Unique Receivers', valA: accA.uniqueReceivers, valB: accB.uniqueReceivers },
    { label: 'Account Age', valA: `${accA.accountAgeDays} days`, valB: `${accB.accountAgeDays} days` },
    { label: 'Community Cluster', valA: accA.communityId || 'General', valB: accB.communityId || 'General' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-investigation bg-dark-900 border-slate-700 w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-dark-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Forensic Account Comparison</h3>
              <p className="text-[11px] text-slate-400">Contrast behavioural mule indicators side-by-side</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Account Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Account A</label>
              <select
                value={accAId}
                onChange={(e) => setAccAId(e.target.value)}
                className="w-full bg-dark-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.id} — {a.name} ({a.riskLevel})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Account B</label>
              <select
                value={accBId}
                onChange={(e) => setAccBId(e.target.value)}
                className="w-full bg-dark-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.id} — {a.name} ({a.riskLevel})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-dark-950">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-dark-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-semibold">
                  <th className="p-3">Forensic Metric</th>
                  <th className="p-3 font-mono text-indigo-400">{accA.id}</th>
                  <th className="p-3 font-mono text-indigo-400">{accB.id}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {comparisonMetrics.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="p-3 font-sans text-slate-300 font-medium">{row.label}</td>
                    <td className="p-3 text-slate-200">
                      {row.isBadge ? (
                        <RiskBadge level={accA.riskLevel} size="sm" />
                      ) : (
                        row.valA
                      )}
                    </td>
                    <td className="p-3 text-slate-200">
                      {row.isBadge ? (
                        <RiskBadge level={accB.riskLevel} size="sm" />
                      ) : (
                        row.valB
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Explainability synthesis */}
          <div className="bg-dark-950 p-4 rounded-xl border border-indigo-500/20 text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              Comparative Mule Indicator Analysis:
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {accA.riskScore >= accB.riskScore ? (
                <>
                  <strong className="text-white font-mono">{accA.id}</strong> presents significantly stronger mule indicators than <strong className="text-white font-mono">{accB.id}</strong> due to an extreme pass-through ratio of {formatPercent(accA.passThroughRatio)} and rapid fund turnover delay of {accA.medianTransferDelayMinutes} minutes. It exhibits rapid layering behavior directly associated with cyber scam proceeds.
                </>
              ) : (
                <>
                  <strong className="text-white font-mono">{accB.id}</strong> exhibits stronger mule flags than <strong className="text-white font-mono">{accA.id}</strong> due to elevated transaction frequency and proximity to high-risk syndicate nodes.
                </>
              )}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition text-xs"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
