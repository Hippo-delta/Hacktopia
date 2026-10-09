import React from 'react';
import { User, X, Shield, Key, Building2, CheckCircle2 } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, onLogout }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-investigation bg-dark-900 border-slate-700 w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-dark-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Analyst Identity</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-center gap-3 bg-dark-950 p-3 rounded-xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-lg border border-indigo-500/40">
              RS
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Agent R. Sharma</h4>
              <p className="text-slate-400 text-xs">Lead Investigator — L2 Cyber Fraud</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-1">
                <CheckCircle2 className="w-3 h-3" /> Security Clearance Level 4
              </span>
            </div>
          </div>

          <div className="space-y-2 bg-dark-950/60 p-3.5 rounded-lg border border-slate-800 text-slate-300 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Unit:</span>
              <span>National Mule Interception Desk</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Station ID:</span>
              <span className="font-mono text-indigo-400">WS-MULE-2026-DEL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Role Authority:</span>
              <span className="text-amber-400">Interim Freeze Simulation Only</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Environment:</span>
              <span className="font-mono text-slate-400">Hackatopia 2026 Sandbox</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {onLogout ? (
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-3 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-medium text-xs transition"
              >
                Sign Out
              </button>
            ) : <div />}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-slate-800 text-white font-medium text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
