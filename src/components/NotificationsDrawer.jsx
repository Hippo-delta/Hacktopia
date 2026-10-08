import React from 'react';
import { X, Bell, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { getRiskColorClass } from '../utils/formatters';

export default function NotificationsDrawer({ 
  isOpen, 
  onClose, 
  alerts = [], 
  onInvestigateAlert 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-dark-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          <div className="p-4 border-b border-slate-800 bg-dark-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Risk Intelligence Alerts</h3>
                <p className="text-[11px] text-slate-400">{alerts.length} Active Automated Triggers</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
                <p>All alerts resolved. No outstanding high-risk triggers.</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const styles = getRiskColorClass(alert.severity);
                return (
                  <div
                    key={alert.id}
                    onClick={() => {
                      onClose();
                      if (onInvestigateAlert) onInvestigateAlert(alert);
                    }}
                    className="card-investigation p-3.5 bg-dark-950 hover:border-indigo-500/40 cursor-pointer transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                        <span className="font-mono font-bold text-indigo-400">{alert.accountId}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({alert.id})</span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${styles.badge}`}>
                        {alert.severity} ({alert.riskScore})
                      </span>
                    </div>

                    <p className="text-slate-200 text-[11px] leading-snug">{alert.description}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>{alert.detectedTime}</span>
                      <span className="text-indigo-400 hover:underline flex items-center gap-1">
                        Investigate Account <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-slate-800 bg-dark-950 text-center">
            <button
              onClick={onClose}
              className="w-full py-2 bg-dark-800 hover:bg-slate-800 text-slate-300 font-medium rounded-lg text-xs transition"
            >
              Close Alerts Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
