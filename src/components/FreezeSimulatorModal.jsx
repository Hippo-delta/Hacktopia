import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, X, Lock, Info } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function FreezeSimulatorModal({ 
  isOpen, 
  onClose, 
  account, 
  estimatedAmount = null, 
  onConfirmFreeze 
}) {
  const [isSimulated, setIsSimulated] = useState(false);
  const [freezeReason, setFreezeReason] = useState('High-Velocity Digital Arrest Scam Mule Pass-Through');

  if (!isOpen || !account) return null;

  const handleSimulate = async () => {
    setIsSimulated(true);
    if (onConfirmFreeze) {
      await onConfirmFreeze(account.id, freezeReason);
    }
  };

  const handleClose = () => {
    setIsSimulated(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-investigation bg-dark-900 border-slate-700 w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-red-950/40 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Simulated Debit Freeze Recommendation
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                  SIMULATION ONLY
                </span>
              </h3>
              <p className="text-[11px] text-red-300/80">Automated Financial Crime Prevention Protocol</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {!isSimulated ? (
            <>
              {/* Account summary banner */}
              <div className="bg-dark-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Target Account ID:</span>
                  <span className="font-mono font-bold text-white text-sm">{account.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Account Holder:</span>
                  <span className="text-slate-200 font-medium">{account.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Calculated Risk Score:</span>
                  <span className="font-mono font-bold text-red-400">{account.riskScore || 87} / 100 (CRITICAL)</span>
                </div>
                {estimatedAmount && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Potential Onward Transfer:</span>
                    <span className="font-mono font-bold text-amber-400">{formatCurrency(estimatedAmount)}</span>
                  </div>
                )}
              </div>

              {/* Justification selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Freeze Regulatory Justification (Demo)
                </label>
                <select
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  className="w-full bg-dark-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-red-500 text-xs"
                >
                  <option value="High-Velocity Digital Arrest Scam Mule Pass-Through">High-Velocity Digital Arrest Scam Mule Pass-Through</option>
                  <option value="Rapid Onward Layering via Syndicate Community #17">Rapid Onward Layering via Syndicate Community #17</option>
                  <option value="Structuring Beneath KYC Thresholds">Structuring Beneath KYC Thresholds</option>
                  <option value="Imminent Bullion Cashout Off-Ramp Risk">Imminent Bullion Cashout Off-Ramp Risk</option>
                </select>
              </div>

              {/* Legal / Sandbox Disclaimer */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/90 flex gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Sandbox Guardrail:</strong> This simulated freeze triggers an internal review event and logs evidence to the active investigation case. It will <strong>NOT</strong> connect to or affect real banking rails, NEFT/RTGS/UPI, or actual account balances.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-slate-800 text-slate-300 font-medium transition"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={handleSimulate}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-red-600/30 transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Simulate Freeze Recommendation
                </button>
              </div>
            </>
          ) : (
            /* Confirmation state */
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                ACTION SIMULATED — ACCOUNT FLAGGED FOR REVIEW
              </h4>
              <p className="text-slate-300 text-xs max-w-sm mx-auto">
                Account <strong className="text-red-400 font-mono">{account.id}</strong> marked as <em>Simulated Frozen</em>. Evidence attached to investigation case and timeline updated.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleClose}
                  className="px-5 py-2 rounded-lg bg-dark-800 hover:bg-slate-700 text-white font-semibold transition"
                >
                  Done / Return to Investigation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
