import React from 'react';
import { HelpCircle, X, Shield, GitBranch, Lock, Database, Info, Layers } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-investigation bg-dark-900 border-slate-700 w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-dark-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Money Trail Hunter — Investigator Guide</h3>
              <p className="text-[11px] text-slate-400">FT-03 Mule Account Forensic Platform (Hackatopia 2026)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Overview */}
          <div className="bg-dark-950 p-4 rounded-xl border border-indigo-500/20 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Core Problem: Digital Arrest & Investment Scam Networks
            </h4>
            <p className="text-slate-400">
              When victims are coerced into transferring money during digital arrest or fake IPO investment scams, cybercriminals immediately route funds through multi-tier rented <em>mule accounts</em> within minutes. Traditional bank anti-fraud checks inspect isolated accounts and miss cross-bank syndicates.
            </p>
          </div>

          {/* Key Platform Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-dark-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4" />
                Multi-Hop Money Tracing
              </div>
              <p className="text-[11px] text-slate-400">
                Uses temporal BFS graph traversal to trace transaction chains from the initial victim debit through sequential mule layers (Hop 1 → Hop 2 → Hop 3).
              </p>
            </div>

            <div className="bg-dark-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="font-semibold text-red-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Next-Hop Prediction & Freeze
              </div>
              <p className="text-[11px] text-slate-400">
                Identifies subsequent likely mule hops before funds exit the banking system, allowing investigators to simulate preemptive debit freezes.
              </p>
            </div>

            <div className="bg-dark-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Explainable Risk Scoring
              </div>
              <p className="text-[11px] text-slate-400">
                Transparent deterministic metrics: Incoming diversity + Velocity + Pass-through ratio + Syndicate network proximity + Frequency spikes.
              </p>
            </div>

            <div className="bg-dark-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                Demo Scenario Switching
              </div>
              <p className="text-[11px] text-slate-400">
                Jump between 3 distinct synthetic banking scenarios anytime via the <em>Data / Demo Dataset</em> tab for live hackathon presentations.
              </p>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              All accounts, transactions, and amounts are 100% synthetic mock data created strictly for demonstration.
            </span>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-dark-950 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
