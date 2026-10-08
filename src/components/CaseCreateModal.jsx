import React, { useState } from 'react';
import { Briefcase, X, PlusCircle, Check } from 'lucide-react';

export default function CaseCreateModal({ 
  isOpen, 
  onClose, 
  onCaseCreated, 
  initialEntity = null 
}) {
  const [title, setTitle] = useState(
    initialEntity?.id ? `Investigation: ${initialEntity.id}` : 'Suspected Multi-Hop Scam Investigation'
  );
  const [priority, setPriority] = useState('High');
  const [analyst, setAnalyst] = useState('Agent R. Sharma (Cyber Unit)');
  const [summary, setSummary] = useState(
    initialEntity?.label ? `Created from flagged entity ${initialEntity.label}.` : 'Investigating rapid mule account pass-through chain.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCase = {
      title,
      priority,
      assignedAnalyst: analyst,
      summary,
      accounts: initialEntity?.type === 'account' ? [initialEntity.label] : [],
      transactions: initialEntity?.type === 'transaction' ? [initialEntity.label] : [],
      amount: initialEntity?.amount || 75000,
      evidenceList: initialEntity ? [{
        id: `EV-${Date.now()}`,
        type: initialEntity.type || 'account',
        label: initialEntity.label || initialEntity.id,
        detail: initialEntity.detail || 'Initial case trigger item'
      }] : []
    };

    if (onCaseCreated) onCaseCreated(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-investigation bg-dark-900 border-slate-700 w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-dark-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create Investigation Case</h3>
              <p className="text-[11px] text-slate-400">Bank AML & Fraud Case Dossier</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Case Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
              placeholder="e.g. Digital Arrest Scam - Cluster #17"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-dark-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Assigned Analyst</label>
              <select
                value={analyst}
                onChange={(e) => setAnalyst(e.target.value)}
                className="w-full bg-dark-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value="Agent R. Sharma (Cyber Unit)">Agent R. Sharma</option>
                <option value="Agent S. Iyer (AML Specialist)">Agent S. Iyer</option>
                <option value="Agent V. Nair (Fraud Risk)">Agent V. Nair</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Case Description & Objective</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-dark-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs resize-none"
              placeholder="Forensic objectives, complainant details, regulatory escalation notes..."
            />
          </div>

          {initialEntity && (
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] flex justify-between items-center">
              <span>Attached Trigger:</span>
              <span className="font-mono font-bold text-white">{initialEntity.label || initialEntity.id}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-slate-800 text-slate-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Initialize Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
