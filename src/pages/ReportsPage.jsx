import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldAlert, 
  CheckCircle2, 
  GitBranch, 
  Layers, 
  Share2, 
  Lock,
  ArrowRight
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { getReports, exportTransactionsCsv, exportAccountsCsv } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function ReportsPage({ onNavigateToAccount, onNavigateToTrace }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      setReport(data);
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Forensic Investigation Dossier
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              AUDIT READY
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Formally structured anti-money laundering (AML) forensic report for bank compliance and cyber police submission.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => exportAccountsCsv()}
            className="px-3 py-1.5 rounded-lg bg-dark-850 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Accounts CSV
          </button>
          <button
            onClick={() => exportTransactionsCsv()}
            className="px-3 py-1.5 rounded-lg bg-dark-850 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Transactions CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF Report
          </button>
        </div>
      </div>

      {/* Report Document Shell */}
      <div className="card-investigation p-8 bg-dark-900 border-slate-700/80 space-y-6 print:bg-white print:text-black">
        {/* Document Classification Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-mono font-bold text-red-400 block tracking-widest text-[11px] mb-1">
              {report.classification}
            </span>
            <h2 className="text-lg font-bold text-white">{report.title}</h2>
            <p className="text-slate-400 text-xs mt-0.5">Report Ref: <strong className="font-mono text-slate-300">{report.reportId}</strong></p>
          </div>

          <div className="text-slate-400 text-[11px] space-y-0.5 md:text-right">
            <div>Generated: <span className="text-slate-200 font-mono">{report.generatedAt}</span></div>
            <div>Investigator: <span className="text-slate-200">{report.author}</span></div>
            <div>Classification Authority: <span className="text-indigo-400">Mule Hunter Automated System</span></div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            1. Executive Investigation Summary
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-dark-950 p-4 rounded-xl border border-slate-800">
            {report.executiveSummary}
          </p>
        </div>

        {/* Section 2: Key Metrics & Investigation Findings */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            2. High-Risk Network Telemetry
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-dark-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Flagged Mule Nodes</span>
              <span className="font-mono text-base font-bold text-red-400">{report.keyMetrics.totalAccountsInvolved} Accounts</span>
            </div>
            <div className="bg-dark-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Scam Amount Traced</span>
              <span className="font-mono text-base font-bold text-emerald-400">{formatCurrency(report.keyMetrics.scamAmountTraced)}</span>
            </div>
            <div className="bg-dark-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Turnover Latency</span>
              <span className="font-mono text-base font-bold text-amber-400">{report.keyMetrics.velocityRating}</span>
            </div>
            <div className="bg-dark-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Target Freeze Node</span>
              <span className="font-mono text-base font-bold text-cyan-400">{report.keyMetrics.recommendedFreezeTarget}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Money Trail Progression */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            3. Chronological Money Trail Summary (Scam Inflow to Cashout)
          </h3>

          <div className="border border-slate-800 rounded-lg overflow-hidden bg-dark-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-dark-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                  <th className="p-3">Hop</th>
                  <th className="p-3">Transfer Sequence</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Inter-Hop Delay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {report.moneyTrailSummary.map((hop) => (
                  <tr key={hop.hop} className="hover:bg-slate-800/20">
                    <td className="p-3 font-bold text-indigo-400">Hop {hop.hop}</td>
                    <td className="p-3 text-white font-semibold">{hop.flow}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">{formatCurrency(hop.amount)}</td>
                    <td className="p-3 text-amber-400 font-sans text-xs">{hop.delay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Flagged Mule Accounts Ledger */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            4. Flagged Mule Accounts Forensic Details
          </h3>

          <div className="border border-slate-800 rounded-lg overflow-hidden bg-dark-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-dark-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                  <th className="p-3">Account ID</th>
                  <th className="p-3">Holder Identity</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Pass-Through</th>
                  <th className="p-3">Turnover Delay</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {report.flaggedMules.map((mule) => (
                  <tr key={mule.id} className="hover:bg-slate-800/20">
                    <td className="p-3 font-bold text-indigo-400">{mule.id}</td>
                    <td className="p-3 text-slate-200 font-sans">{mule.name}</td>
                    <td className="p-3">
                      <RiskBadge level={mule.level} score={mule.score} size="sm" />
                    </td>
                    <td className="p-3 text-slate-300">{mule.passThrough}</td>
                    <td className="p-3 text-amber-400">{mule.delay}</td>
                    <td className="p-3 font-sans text-[11px] text-slate-300">{mule.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Signature & Legal Sandbox Attestation */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-1">
            <span className="font-semibold text-slate-300 block">System Verification Statement:</span>
            <p className="text-[11px] text-slate-400 max-w-md">
              Report compiled through Money Trail Hunter Graph Heuristic Engine (FT-03). All data presented is deterministic synthetic simulation for the Hackatopia 2026 hackathon.
            </p>
          </div>

          <div className="text-right border-t border-slate-700 pt-2 w-48 font-mono text-[11px]">
            <span className="text-slate-200 font-bold block">Agent R. Sharma</span>
            <span className="text-slate-500 text-[10px]">Cyber Operations Lead</span>
            <span className="text-emerald-400 text-[10px] block mt-0.5">DIGITALLY SIGNED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
