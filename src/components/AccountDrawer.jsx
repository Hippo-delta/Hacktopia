import React from 'react';
import { 
  X, 
  UserCheck, 
  ShieldAlert, 
  GitBranch, 
  Lock, 
  Briefcase, 
  ArrowRight, 
  Clock, 
  ExternalLink,
  Scale
} from 'lucide-react';
import { formatCurrency, formatPercent, getRiskColorClass } from '../utils/formatters';
import RiskBadge from './RiskBadge';

export default function AccountDrawer({ 
  isOpen, 
  onClose, 
  account, 
  onInvestigate, 
  onTrace, 
  onSimulateFreeze, 
  onAddToCase,
  onCompare 
}) {
  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-dark-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-dark-950 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-dark-850 border border-slate-700 text-indigo-400">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-white">{account.id}</span>
                  <RiskBadge level={account.riskLevel} score={account.riskScore} size="sm" />
                </div>
                <h3 className="text-xs text-slate-300 font-medium">{account.name}</h3>
                <span className="text-[10px] text-slate-500 font-mono">{account.accountType}</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
            {/* KPI Matrix */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-dark-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Current Balance</span>
                <span className="font-mono text-xs font-bold text-white">{formatCurrency(account.currentBalance)}</span>
              </div>
              <div className="bg-dark-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Pass-Through Ratio</span>
                <span className="font-mono text-xs font-bold text-indigo-400">{formatPercent(account.passThroughRatio)}</span>
              </div>
              <div className="bg-dark-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Total Incoming</span>
                <span className="font-mono text-xs font-bold text-emerald-400">{formatCurrency(account.totalIncoming)}</span>
              </div>
              <div className="bg-dark-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Total Outgoing</span>
                <span className="font-mono text-xs font-bold text-amber-400">{formatCurrency(account.totalOutgoing)}</span>
              </div>
            </div>

            {/* Explainable Fraud Indicators */}
            <div className="bg-dark-950 p-4 rounded-xl border border-red-500/20 space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-400 uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Why This Account Is High Risk
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                {(account.riskReasons || []).map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Metrics */}
            <div className="space-y-2 bg-dark-950/60 p-3.5 rounded-lg border border-slate-800 text-slate-400 text-[11px]">
              <div className="flex justify-between">
                <span>Account Age:</span>
                <span className="font-mono text-slate-200">{account.accountAgeDays} days</span>
              </div>
              <div className="flex justify-between">
                <span>Median Transfer Delay:</span>
                <span className="font-mono text-amber-400">{account.medianTransferDelayMinutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Unique Counterparties:</span>
                <span className="font-mono text-slate-200">{account.uniqueSenders} In / {account.uniqueReceivers} Out</span>
              </div>
              <div className="flex justify-between">
                <span>Syndicate Cluster:</span>
                <span className="font-mono text-indigo-400">{account.communityId || 'General'}</span>
              </div>
              <div className="flex justify-between">
                <span>Network Region:</span>
                <span className="font-mono text-slate-200">{account.region}</span>
              </div>
            </div>

            {/* Recent Timeline Preview */}
            {account.timeline && account.timeline.length > 0 && (
              <div className="space-y-2">
                <span className="font-semibold text-slate-300 block">Recent Activity Log:</span>
                <div className="space-y-2">
                  {account.timeline.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="bg-dark-950 p-2.5 rounded border border-slate-800 text-[11px]">
                      <div className="flex justify-between text-slate-400 text-[10px] mb-1 font-mono">
                        <span>{item.time}</span>
                        <span className="uppercase text-indigo-400">{item.severity}</span>
                      </div>
                      <p className="text-slate-200">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Bar Footer */}
          <div className="p-4 border-t border-slate-800 bg-dark-950 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  if (onInvestigate) onInvestigate(account.id);
                }}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Full Investigation
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onTrace) onTrace(account.id);
                }}
                className="w-full py-2 px-3 rounded-lg bg-dark-800 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                Trace Money Trail
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  if (onSimulateFreeze) onSimulateFreeze(account);
                }}
                className="py-1.5 px-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-[11px] font-medium flex items-center justify-center gap-1 transition"
              >
                <Lock className="w-3 h-3 text-red-400" />
                Simulate Freeze
              </button>
              <button
                onClick={() => {
                  if (onAddToCase) onAddToCase({ type: 'account', label: account.id, detail: `Score: ${account.riskScore} | ${account.name}` });
                }}
                className="py-1.5 px-2 rounded-lg bg-dark-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center justify-center gap-1 transition"
              >
                <Briefcase className="w-3 h-3 text-indigo-400" />
                Add to Case
              </button>
              <button
                onClick={() => {
                  if (onCompare) onCompare(account.id);
                }}
                className="py-1.5 px-2 rounded-lg bg-dark-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center justify-center gap-1 transition"
              >
                <Scale className="w-3 h-3 text-amber-400" />
                Compare
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
