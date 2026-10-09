import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, 
  Eye, EyeOff, ShieldAlert, Layers, Filter 
} from 'lucide-react';
import { formatCurrency, getRiskColorClass } from '../utils/formatters';

export default function NetworkGraph({ 
  nodes = [], 
  edges = [], 
  onSelectNode, 
  onSelectEdge,
  selectedNodeId = null,
  selectedEdgeId = null,
  height = '520px',
  showControls = true,
  communityFocus = null
}) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState(true);
  const [showOnlySuspicious, setShowOnlySuspicious] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  // Position nodes nicely using a deterministic, adaptive flow layout
  const [nodePositions, setNodePositions] = useState({});

  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    const positions = {};
    const width = 800;
    const height = 500;
    const centerY = height / 2;

    // Detect trail chain order from scam edges if available
    const scamEdges = (edges || []).filter(e => e.isScamTrail || e.riskLevel === 'CRITICAL');
    const trailOrder = [];
    const inDegrees = {};
    const nextHops = {};

    scamEdges.forEach(e => {
      inDegrees[e.target] = (inDegrees[e.target] || 0) + 1;
      nextHops[e.source] = e.target;
    });

    // Find trail roots (nodes with no incoming scam edges)
    const roots = scamEdges.map(e => e.source).filter(s => !inDegrees[s]);
    const visited = new Set();
    let curr = roots[0] || (scamEdges[0]?.source);

    while (curr && !visited.has(curr)) {
      visited.add(curr);
      trailOrder.push(curr);
      curr = nextHops[curr];
    }
    // Add any remaining scam nodes
    scamEdges.forEach(e => {
      if (!visited.has(e.source)) { visited.add(e.source); trailOrder.push(e.source); }
      if (!visited.has(e.target)) { visited.add(e.target); trailOrder.push(e.target); }
    });

    // Lay out scam trail horizontally across the center (Wave path)
    const trailCount = trailOrder.length;
    if (trailCount > 0) {
      const stepX = Math.min(140, Math.max(90, 600 / Math.max(1, trailCount - 1)));
      const startX = Math.max(80, (width - (trailCount - 1) * stepX) / 2);

      trailOrder.forEach((id, idx) => {
        const x = startX + idx * stepX;
        const y = centerY + Math.sin(idx * 0.9) * 45 - 10;
        positions[id] = { x, y };
      });
    }

    // Identify non-scam nodes (benign merchants, normal peers)
    const nonTrailNodes = nodes.filter(n => !positions[n.id]);
    const benignMerchants = nonTrailNodes.filter(n => (n.accountType || '').toLowerCase().includes('merch') || (n.name || '').toLowerCase().includes('mart') || (n.name || '').toLowerCase().includes('grocer'));
    const benignRetail = nonTrailNodes.filter(n => !benignMerchants.includes(n));

    // Position merchants along upper orbit
    benignMerchants.forEach((n, idx) => {
      const x = 200 + idx * 160;
      const y = 95 + (idx % 2 === 0 ? -20 : 20);
      positions[n.id] = { x, y };
    });

    // Position other benign peers along bottom orbit
    benignRetail.forEach((n, idx) => {
      const x = 180 + idx * 150;
      const y = height - 90 + (idx % 2 === 0 ? 15 : -15);
      positions[n.id] = { x, y };
    });

    // Fallback circular layout for any remaining unplaced nodes
    nodes.forEach((n, i) => {
      if (!positions[n.id]) {
        const angle = (i / Math.max(1, nodes.length)) * 2 * Math.PI;
        positions[n.id] = {
          x: width / 2 + Math.cos(angle) * 250,
          y: centerY + Math.sin(angle) * 160
        };
      }
    });

    setNodePositions(positions);
  }, [nodes, edges]);

  // Handle node drag
  const [draggedNodeId, setDraggedNodeId] = useState(null);

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.id === 'graph-backdrop') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (draggedNodeId) {
      // Reposition dragged node
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - pan.y) / zoom;
      setNodePositions(prev => ({
        ...prev,
        [draggedNodeId]: { x: rawX, y: rawY }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNodeId(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(z => Math.min(2.5, Math.max(0.4, z * zoomFactor)));
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Filtered nodes
  const displayNodes = useMemo(() => {
    return nodes.filter(n => {
      if (showOnlySuspicious && n.riskScore < 60) return false;
      if (communityFocus && n.communityId !== communityFocus) return false;
      return true;
    });
  }, [nodes, showOnlySuspicious, communityFocus]);

  const displayNodeIds = useMemo(() => new Set(displayNodes.map(n => n.id)), [displayNodes]);

  const displayEdges = useMemo(() => {
    return edges.filter(e => displayNodeIds.has(e.source) && displayNodeIds.has(e.target));
  }, [edges, displayNodeIds]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden bg-dark-950 border border-slate-800/80 select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Background Grid Pattern */}
      <div 
        id="graph-backdrop"
        className="absolute inset-0 pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* SVG Canvas */}
      <svg 
        className="w-full h-full relative z-10 pointer-events-auto"
        viewBox="0 0 800 500"
      >
        <defs>
          {/* Arrowhead marker for normal edges */}
          <marker
            id="arrow-normal"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
          </marker>

          {/* Arrowhead marker for suspicious scam edges */}
          <marker
            id="arrow-scam"
            viewBox="0 0 10 10"
            refX="24"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
          </marker>

          {/* Glow filter */}
          <filter id="red-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.7"/>
          </filter>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edge Lines */}
          {displayEdges.map((edge) => {
            const sourcePos = nodePositions[edge.source];
            const targetPos = nodePositions[edge.target];
            if (!sourcePos || !targetPos) return null;

            const isScam = edge.isScamTrail || edge.riskLevel === 'CRITICAL';
            const isSelected = selectedEdgeId === edge.id;
            const isHovered = hoveredEdge?.id === edge.id;

            // Stroke thickness based on amount
            const strokeWidth = Math.min(5, Math.max(1.8, Math.sqrt(edge.amount) / 90));

            // Curve slight offset for bidirectional or aesthetics
            const midX = (sourcePos.x + targetPos.x) / 2;
            const midY = (sourcePos.y + targetPos.y) / 2 - 8;

            return (
              <g key={edge.id} className="cursor-pointer" onClick={() => onSelectEdge && onSelectEdge(edge)}>
                <path
                  d={`M ${sourcePos.x} ${sourcePos.y} Q ${midX} ${midY} ${targetPos.x} ${targetPos.y}`}
                  fill="none"
                  stroke={isScam ? '#ef4444' : isSelected ? '#6366f1' : '#334155'}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isScam ? 'none' : isSelected ? '4 2' : 'none'}
                  markerEnd={isScam ? 'url(#arrow-scam)' : 'url(#arrow-normal)'}
                  className={`transition-all duration-150 ${isScam ? 'animate-pulse' : ''}`}
                  onMouseEnter={() => setHoveredEdge(edge)}
                  onMouseLeave={() => setHoveredEdge(null)}
                />
                
                {/* Edge Amount Badge */}
                <rect
                  x={midX - 26}
                  y={midY - 9}
                  width="52"
                  height="16"
                  rx="4"
                  fill="#0c162d"
                  stroke={isScam ? '#ef4444' : '#1e293b'}
                  strokeWidth="1"
                  className="pointer-events-none opacity-90"
                />
                <text
                  x={midX}
                  y={midY + 3}
                  textAnchor="middle"
                  fill={isScam ? '#fca5a5' : '#94a3b8'}
                  fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  {formatCurrency(edge.amount)}
                </text>
              </g>
            );
          })}

          {/* Node Circles */}
          {displayNodes.map((node) => {
            const pos = nodePositions[node.id] || { x: 400, y: 250 };
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNode?.id === node.id;
            const riskStyles = getRiskColorClass(node.riskLevel);
            const isCriticalMule = node.riskLevel === 'CRITICAL' || node.isMule;

            return (
              <g 
                key={node.id} 
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedNodeId(node.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectNode) onSelectNode(node);
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Outer halo / selection indicator */}
                {isSelected && (
                  <circle
                    r="24"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    className="animate-spin"
                  />
                )}

                {/* Critical risk pulsing aura */}
                {isCriticalMule && (
                  <circle
                    r="20"
                    fill={riskStyles.hex}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Main Node Body */}
                <circle
                  r="16"
                  fill="#0c162d"
                  stroke={riskStyles.hex}
                  strokeWidth={isCriticalMule ? 3 : 2}
                  filter={isCriticalMule ? 'url(#red-glow)' : 'none'}
                  className="transition-transform duration-150 hover:scale-110"
                />

                {/* Node Center Glyph / Score */}
                <text
                  y="4"
                  textAnchor="middle"
                  fill={riskStyles.hex}
                  fontSize="10"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="700"
                  className="pointer-events-none select-none"
                >
                  {node.riskScore}
                </text>

                {/* Node Label Below */}
                {showLabels && (
                  <g transform="translate(0, 26)">
                    <rect
                      x="-38"
                      y="-1"
                      width="76"
                      height="16"
                      rx="3"
                      fill="#070d19"
                      stroke="#1e293b"
                      strokeWidth="1"
                      className="pointer-events-none opacity-95"
                    />
                    <text
                      textAnchor="middle"
                      y="11"
                      fill="#e2e8f0"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="'JetBrains Mono', monospace"
                      className="pointer-events-none"
                    >
                      {node.id}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredNode && (
        <div 
          className="absolute top-4 left-4 z-20 bg-dark-900/95 border border-slate-700 p-3 rounded-lg shadow-xl text-xs backdrop-blur-md pointer-events-none max-w-[240px]"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-mono font-bold text-white text-sm">{hoveredNode.id}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getRiskColorClass(hoveredNode.riskLevel).badge}`}>
              {hoveredNode.riskLevel} ({hoveredNode.riskScore})
            </span>
          </div>
          <div className="text-slate-300 font-medium truncate mb-2">{hoveredNode.name}</div>
          <div className="space-y-0.5 text-slate-400 text-[11px]">
            <div className="flex justify-between">
              <span>Pass-through:</span>
              <span className="font-mono text-slate-200">{Math.round((hoveredNode.passThroughRatio || 0) * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Balance:</span>
              <span className="font-mono text-slate-200">{formatCurrency(hoveredNode.currentBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span>Community:</span>
              <span className="font-mono text-indigo-400">{hoveredNode.communityId || 'General'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Toolbar Controls */}
      {showControls && (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-dark-900/90 border border-slate-700/80 p-1.5 rounded-lg shadow-lg backdrop-blur-md">
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
            title="Zoom In"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.4, z - 0.2))}
            title="Zoom Out"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            title="Reset View"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-700 my-auto mx-0.5" />
          <button
            onClick={() => setShowLabels(!showLabels)}
            title={showLabels ? "Hide Labels" : "Show Labels"}
            className={`p-1.5 rounded transition ${showLabels ? 'text-indigo-400 bg-indigo-500/15' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowOnlySuspicious(!showOnlySuspicious)}
            title="Filter Suspicious Mules Only"
            className={`p-1.5 rounded transition ${showOnlySuspicious ? 'text-red-400 bg-red-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            title="Full Screen View"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Graph Legend */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 bg-dark-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 backdrop-blur-md">
        <span className="font-semibold text-slate-300">Risk:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical Mule
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Safe / Victim
        </span>
      </div>
    </div>
  );
}
