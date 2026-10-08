import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KpiCard({ title, value, trend, note, icon: Icon, alert = false, onClick }) {
  const isPositiveTrend = trend && trend.startsWith('+');
  const isNegativeTrend = trend && trend.startsWith('-');

  return (
    <div 
      onClick={onClick}
      className={`card-investigation p-4 relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-indigo-500/40 hover:bg-dark-800/80' : ''
      } ${alert ? 'border-red-500/30 bg-red-950/10' : 'bg-dark-850'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${alert ? 'bg-red-500/15 text-red-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">{value}</span>
        {trend && (
          <span className={`inline-flex items-center text-xs font-mono font-medium ${
            isPositiveTrend ? (alert ? 'text-red-400' : 'text-emerald-400') : isNegativeTrend ? 'text-indigo-400' : 'text-slate-400'
          }`}>
            {isPositiveTrend ? <TrendingUp className="w-3 h-3 mr-0.5" /> : isNegativeTrend ? <TrendingDown className="w-3 h-3 mr-0.5" /> : <Minus className="w-3 h-3 mr-0.5" />}
            {trend}
          </span>
        )}
      </div>

      {note && (
        <p className="text-[11px] text-slate-400 line-clamp-1">{note}</p>
      )}

      {/* Subtle indicator accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${alert ? 'bg-red-500/60' : 'bg-transparent'}`} />
    </div>
  );
}
