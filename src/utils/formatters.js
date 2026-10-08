/**
 * Financial & Date Formatting Utilities for Money Trail Hunter
 */

export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0';
  const num = Number(amount);
  
  if (Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export function formatExactCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(amount));
}

export function formatNumber(val) {
  if (val === undefined || val === null) return '0';
  return new Intl.NumberFormat('en-IN').format(Number(val));
}

export function formatPercent(val) {
  if (val === undefined || val === null) return '0%';
  return `${(Number(val) * 100).toFixed(1)}%`;
}

export function getRiskColorClass(level) {
  switch (String(level).toUpperCase()) {
    case 'CRITICAL':
      return {
        badge: 'bg-red-500/15 text-red-400 border border-red-500/30',
        text: 'text-red-400',
        dot: 'bg-red-500',
        hex: '#ef4444',
        border: 'border-red-500/40',
        glow: 'shadow-[0_0_15px_rgba(239,68,68,0.35)]'
      };
    case 'HIGH':
      return {
        badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
        text: 'text-orange-400',
        dot: 'bg-orange-500',
        hex: '#f97316',
        border: 'border-orange-500/40',
        glow: 'shadow-[0_0_15px_rgba(249,115,22,0.35)]'
      };
    case 'MEDIUM':
      return {
        badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        text: 'text-amber-400',
        dot: 'bg-amber-500',
        hex: '#eab308',
        border: 'border-amber-500/40',
        glow: 'shadow-[0_0_15px_rgba(234,179,8,0.35)]'
      };
    case 'LOW':
    case 'SAFE':
    default:
      return {
        badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        text: 'text-emerald-400',
        dot: 'bg-emerald-500',
        hex: '#10b981',
        border: 'border-emerald-500/40',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]'
      };
  }
}

export function getStatusBadgeClass(status) {
  switch (String(status).toLowerCase()) {
    case 'new':
      return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    case 'investigating':
    case 'open':
      return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
    case 'escalated':
      return 'bg-red-500/15 text-red-400 border border-red-500/30 font-semibold';
    case 'resolved':
    case 'closed':
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'dismissed':
      return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
    case 'simulated frozen':
    case 'flagged for review':
      return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
    default:
      return 'bg-slate-700/30 text-slate-300 border border-slate-600/30';
  }
}
