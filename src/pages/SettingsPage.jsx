import React, { useState } from 'react';
import { Settings, Shield, Sliders, Database, Server, CheckCircle2, Lock } from 'lucide-react';

export default function SettingsPage() {
  const [velocityThreshold, setVelocityThreshold] = useState(5);
  const [passThroughThreshold, setPassThroughThreshold] = useState(90);
  const [riskCutoff, setRiskCutoff] = useState(70);
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000/api/v1 (FastAPI Target)');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto text-xs">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            System & Forensic Heuristics Settings
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            CONFIG
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Configure automated fraud alert sensitivities and future FastAPI backend connections.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Heuristic parameters updated successfully for active session.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Fraud Heuristics Box */}
        <div className="card-investigation p-5 bg-dark-900 border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Mule Detection Sensitivity Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <label className="text-slate-300 font-semibold block">
                Velocity Delay Threshold
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={velocityThreshold}
                onChange={(e) => setVelocityThreshold(Number(e.target.value))}
                className="w-full bg-dark-900 border border-slate-700 rounded p-2 text-white font-mono focus:border-indigo-500 text-xs"
              />
              <p className="text-[10px] text-slate-500">
                Flag transfers occurring within &lt; {velocityThreshold} mins of deposit.
              </p>
            </div>

            <div className="bg-dark-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <label className="text-slate-300 font-semibold block">
                Pass-Through Drain Ratio
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={passThroughThreshold}
                onChange={(e) => setPassThroughThreshold(Number(e.target.value))}
                className="w-full bg-dark-900 border border-slate-700 rounded p-2 text-white font-mono focus:border-indigo-500 text-xs"
              />
              <p className="text-[10px] text-slate-500">
                Flag accounts forwarding &gt; {passThroughThreshold}% of incoming volume.
              </p>
            </div>

            <div className="bg-dark-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <label className="text-slate-300 font-semibold block">
                Critical Score Cutoff
              </label>
              <input
                type="number"
                min="40"
                max="95"
                value={riskCutoff}
                onChange={(e) => setRiskCutoff(Number(e.target.value))}
                className="w-full bg-dark-900 border border-slate-700 rounded p-2 text-white font-mono focus:border-indigo-500 text-xs"
              />
              <p className="text-[10px] text-slate-500">
                Accounts with risk &gt; {riskCutoff} trigger Critical automated alert.
              </p>
            </div>
          </div>
        </div>

        {/* Future Backend Configuration */}
        <div className="card-investigation p-5 bg-dark-900 border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Server className="w-4 h-4 text-indigo-400" />
            Backend API Architecture (Future Python / FastAPI Integration)
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                FastAPI Base Endpoint
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="w-full bg-dark-950 border border-slate-700 rounded-lg p-2.5 text-slate-300 font-mono text-xs focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                All frontend calls are routed cleanly through <code className="text-indigo-300 font-mono">services/api.js</code> so you can seamlessly plug in your real FastAPI server later.
              </p>
            </div>

            <div className="bg-dark-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-200 block">FastAPI Routes Expected:</span>
              <ul className="space-y-1 font-mono text-indigo-300 text-[10px]">
                <li>GET /api/v1/dashboard/stats</li>
                <li>GET /api/v1/accounts/{'{account_id}'}</li>
                <li>GET /api/v1/network/graph</li>
                <li>POST /api/v1/transactions/trace</li>
                <li>POST /api/v1/actions/simulate-freeze</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/30"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
