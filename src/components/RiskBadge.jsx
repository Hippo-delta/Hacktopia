import React from 'react';
import { getRiskColorClass } from '../utils/formatters';

export default function RiskBadge({ level, score = null, showDot = true, size = 'sm' }) {
  const styles = getRiskColorClass(level);
  
  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1 text-sm font-semibold' 
    : size === 'md' 
    ? 'px-2.5 py-0.5 text-xs font-medium' 
    : 'px-2 py-0.5 text-[11px] font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${styles.badge} ${sizeClasses} whitespace-nowrap`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} ${level === 'CRITICAL' ? 'animate-ping' : ''}`} />
      )}
      <span className="tracking-wide uppercase">{level}</span>
      {score !== null && (
        <span className="font-mono opacity-80 border-l border-current/30 pl-1 ml-0.5">
          {score}
        </span>
      )}
    </span>
  );
}
