import React from 'react';
import { 
  ShieldAlert, 
  GitBranch, 
  UserCheck, 
  Network, 
  Bell, 
  FileText, 
  Layers, 
  Database, 
  Settings, 
  Briefcase, 
  Activity,
  Compass
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, alertsCount = 12, casesCount = 2 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'trace', label: 'Trace Transaction', icon: GitBranch, highlight: true },
    { id: 'investigate', label: 'Investigate Account', icon: UserCheck },
    { id: 'network', label: 'Network Analysis', icon: Network },
    { id: 'alerts', label: 'Risk Alerts', icon: Bell, badge: alertsCount, badgeColor: 'bg-red-500' },
    { id: 'cases', label: 'Case Management', icon: Briefcase, badge: casesCount, badgeColor: 'bg-indigo-500' },
    { id: 'explorer', label: 'Transaction Explorer', icon: Layers },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'data', label: 'Data / Demo Dataset', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-dark-900 border-r border-slate-800/80 flex flex-col justify-between h-screen select-none shrink-0 z-30">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              MONEY TRAIL
              <span className="text-[10px] font-mono px-1 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">FT-03</span>
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wide font-medium">Mule Hunter Platform</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
            Investigation Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 text-[10px] font-mono rounded-full text-white font-semibold ${item.badgeColor || 'bg-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sidebar: Status & Analyst Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-dark-950/60 text-xs">
        {/* System Status */}
        <div className="flex items-center justify-between px-2 py-1 mb-2 bg-dark-900/80 rounded border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-300">System: Online</span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1 rounded">SYNTHETIC</span>
        </div>

        {/* Analyst & Version */}
        <div className="px-2 pt-1 flex items-center justify-between text-[11px] text-slate-400">
          <div className="truncate">
            <p className="font-semibold text-slate-200 truncate">Agent R. Sharma</p>
            <p className="text-[10px] text-slate-500 truncate">Cyber Fraud Lead</p>
          </div>
          <span className="font-mono text-[10px] text-slate-500 border border-slate-800 px-1 py-0.5 rounded">v1.4.2</span>
        </div>
      </div>
    </aside>
  );
}
