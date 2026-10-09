import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Bell, 
  HelpCircle, 
  User, 
  Database, 
  ChevronDown, 
  ExternalLink,
  Shield,
  Clock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  LogOut
} from 'lucide-react';
import { formatCurrency, getRiskColorClass } from '../utils/formatters';

export default function TopBar({ 
  onSearchSelect, 
  onOpenNotifications, 
  onOpenHelp, 
  onOpenProfile, 
  onRefreshScenario,
  onLogout,
  isRefreshing = false,
  activeScenarioName = 'Flagship: Multi-Hop Network (TXN-84921)',
  unreadAlertsCount = 6
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  // Synthetic search index
  const searchResults = [
    { type: 'account', id: 'A102', title: 'Aman Deep (Mule L1)', risk: 'CRITICAL', score: 91 },
    { type: 'account', id: 'B552', title: 'Bharat Logix (Mule L2)', risk: 'HIGH', score: 78 },
    { type: 'account', id: 'C771', title: 'Chirag Tech (Mule L3)', risk: 'HIGH', score: 69 },
    { type: 'account', id: 'Victim-001', title: 'Devendra K. (Reporting Victim)', risk: 'LOW', score: 12 },
    { type: 'transaction', id: 'TXN-84921', title: '₹75,000 IMPS to A102', risk: 'CRITICAL', score: null },
    { type: 'transaction', id: 'TXN-84922', title: '₹73,500 Pass-through to B552', risk: 'CRITICAL', score: null },
    { type: 'case', id: 'CASE-2026-0142', title: 'Suspected Multi-Hop Scam', risk: 'HIGH', score: null }
  ].filter(item => 
    !searchQuery || 
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectItem = (item) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (onSearchSelect) onSearchSelect(item);
  };

  return (
    <header className="h-14 bg-dark-900 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 z-20">
      {/* Search Input & Demo Watermark */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div ref={searchRef} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Account ID (e.g. A102), TXN-84921, Case ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-dark-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-mono"
            />
          </div>

          {/* Quick Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-dark-900 border border-slate-700/80 rounded-lg shadow-2xl overflow-hidden z-50">
              <div className="px-3 py-1.5 bg-dark-950 border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                <span>Matching Forensic Entities</span>
                <span className="font-mono">{searchResults.length} found</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No matching synthetic accounts or transactions</div>
                ) : (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className="px-3 py-2 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-indigo-400 text-[11px]">{item.id}</span>
                        <span className="text-slate-300 truncate max-w-[220px]">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${getRiskColorClass(item.risk).badge}`}>
                          {item.risk}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Global Demo Notice Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-medium whitespace-nowrap">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>DEMO / SYNTHETIC DATA</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Active Scenario Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-[11px] truncate max-w-[170px]" title={activeScenarioName}>
            {activeScenarioName}
          </span>
        </div>

        {/* Global One-Click Scenario Refresh / New Investigation */}
        {onRefreshScenario && (
          <button
            onClick={onRefreshScenario}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition disabled:opacity-60"
            title="Generate a new coherent synthetic investigation scenario"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Generating...' : 'New Investigation'}</span>
          </button>
        )}

        {/* Date / Time Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-800 text-slate-300 text-xs hover:border-slate-700 transition"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Range: {timeRange}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {isTimeDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-dark-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs">
              {['1h', '6h', '24h', '7d', '30d'].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setTimeRange(r);
                    setIsTimeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 ${timeRange === r ? 'text-indigo-400 font-semibold' : 'text-slate-300'}`}
                >
                  Last {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon with Badge */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg bg-dark-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          title="Risk Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Help / Guide */}
        <button
          onClick={onOpenHelp}
          className="p-2 rounded-lg bg-dark-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          title="System Help & Scam Reference"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Profile */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1.5 rounded-lg bg-dark-950 border border-slate-800 text-slate-300 hover:border-slate-700 transition pl-2"
        >
          <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center text-xs font-bold border border-blue-500/40">
            RS
          </div>
          <span className="text-xs font-medium text-slate-200 hidden sm:inline">R. Sharma</span>
        </button>

        {/* Sign Out Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-dark-950 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition"
            title="Sign Out of PABLO"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
