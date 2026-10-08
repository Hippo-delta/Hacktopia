import React, { useState } from 'react';
import { Compass, HelpCircle, Check, X, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function WhatIfModal({ 
  isOpen, 
  onClose, 
  simulationData, 
  onAddToCase 
}) {
  const [added, setAdded] = useState(false);

  if (!isOpen || !simulationData) return null;

  const handleAdd = () => {
    if (onAddToCase) {
      onAddToCase({
        type: 'prediction',
        label: `What-If: ${simulationData.sourceAccount} → ${simulationData.hypotheticalDestination}`,
        detail: `Potential ${formatCurrency(simulationData.estimatedAmount)} within ${simulationData.estimatedDelay}`
      });
    }
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-investigation bg-dark-900 border-indigo-500/30 w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-indigo-950/40 border-b border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                What-If Money Flow Simulation
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                HYPOTHETICAL SIMULATION
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Forensic projection model: If source account <strong className="font-mono text-white">{simulationData.sourceAccount}</strong> completes its queued outbound transfer:
          </p>

          <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Potential Destination:</span>
              <span className="font-mono font-bold text-white text-sm">{simulationData.hypotheticalDestination}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Entity Title:</span>
              <span className="text-slate-200 font-medium">{simulationData.destinationName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Potential Amount:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{formatCurrency(simulationData.estimatedAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Estimated Delay Window:</span>
              <span className="font-mono text-cyan-400">{simulationData.estimatedDelay}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800">
              <span className="text-slate-400">Destination Risk Level:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                {simulationData.destinationRisk}
              </span>
            </div>
          </div>

          <div className="bg-dark-950/80 p-3 rounded-lg border border-slate-800 text-slate-300 space-y-1 text-[11px]">
            <div className="font-semibold text-slate-200">Investigation Impact:</div>
            <p className="text-slate-400 leading-relaxed">{simulationData.impactSummary}</p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-slate-800 text-slate-300 font-medium transition"
            >
              Dismiss
            </button>
            <button
              onClick={handleAdd}
              disabled={added}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {added ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
              {added ? 'Added to Case!' : 'Add Prediction to Case'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { PlusCircle } from 'lucide-react';
