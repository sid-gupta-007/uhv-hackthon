import React from 'react';
import { useRaksha } from '../../context/RakshaContext';
import { HexSector } from '../../core/types';
import { 
  Radio, 
  Wifi, 
  Truck, 
  Satellite, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Activity,
  AlertCircle
} from 'lucide-react';

export const HexagonMap: React.FC = () => {
  const { sectors, responders, incidents, selectedSectorId, setSelectedSectorId } = useRaksha();

  // Convert axial coordinates (q, r) to 2D SVG pixel positions for flat-topped hexagons
  const hexRadius = 85;
  const centerX = 360;
  const centerY = 240;

  const getHexCoordinates = (q: number, r: number) => {
    // Flat-topped hexagon axial coordinate projection
    const x = centerX + hexRadius * (3/2 * q);
    const y = centerY + hexRadius * ((Math.sqrt(3)/2 * q) + Math.sqrt(3) * r);
    return { x, y };
  };

  // Generate SVG polygon points for a flat-topped hexagon
  const getPolygonPoints = (cx: number, cy: number, r: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i;
      const angleRad = (Math.PI / 180) * angleDeg;
      points.push(`${cx + r * Math.cos(angleRad)},${cy + r * Math.sin(angleRad)}`);
    }
    return points.join(' ');
  };

  const selectedSector = sectors.find(s => s.id === selectedSectorId) || sectors[0];
  const sectorResponders = responders.filter(r => r.sectorId === selectedSector?.id);
  const sectorIncidents = incidents.filter(i => i.location.sectorId === selectedSector?.id);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4">
      
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Hexagon Sector Spatial Mesh (H3-Style)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time sector density, pooled fleet positioning & dynamic backup routing
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span> Elevated
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span> Critical Surge
          </span>
        </div>
      </div>

      {/* SVG Interactive Hex Grid */}
      <div className="relative w-full h-[380px] bg-slate-950/70 border border-slate-800/80 rounded-2xl overflow-hidden flex items-center justify-center">
        
        {/* Subtle background radar circles */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        <svg viewBox="0 0 720 480" className="w-full h-full max-w-full max-h-full cursor-pointer select-none">
          <defs>
            {/* Gradients */}
            <linearGradient id="hexGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="backupLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Draw Dynamic Backup Lines between Sectors */}
          {sectors.map(sec => {
            if (!sec.isBackupActive || !sec.backupSectorId) return null;
            const backupTarget = sectors.find(s => s.id === sec.backupSectorId);
            if (!backupTarget) return null;

            const p1 = getHexCoordinates(sec.gridPos.q, sec.gridPos.r);
            const p2 = getHexCoordinates(backupTarget.gridPos.q, backupTarget.gridPos.r);

            return (
              <g key={`backup-line-${sec.id}`}>
                {/* Glowing path */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="url(#backupLineGrad)"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
                {/* Backup indicator circle */}
                <circle cx={(p1.x + p2.x) / 2} cy={(p1.y + p2.y) / 2} r="10" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                <text
                  x={(p1.x + p2.x) / 2}
                  y={(p1.y + p2.y) / 2 + 3.5}
                  fill="#f59e0b"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  ⚡
                </text>
              </g>
            );
          })}

          {/* Render Hexagons */}
          {sectors.map(sec => {
            const { x, y } = getHexCoordinates(sec.gridPos.q, sec.gridPos.r);
            const isSelected = sec.id === selectedSectorId;

            let strokeColor = '#334155';
            let fillColor = '#0f172a';
            let pulseDotColor = '#10b981';

            if (sec.status === 'CRITICAL_SURGE') {
              strokeColor = '#ef4444';
              fillColor = 'rgba(239, 68, 68, 0.15)';
              pulseDotColor = '#ef4444';
            } else if (sec.status === 'ELEVATED') {
              strokeColor = '#f59e0b';
              fillColor = 'rgba(245, 158, 11, 0.12)';
              pulseDotColor = '#f59e0b';
            } else {
              strokeColor = '#10b981';
              fillColor = 'rgba(16, 185, 129, 0.08)';
            }

            if (isSelected) {
              strokeColor = '#38bdf8';
              fillColor = 'rgba(56, 189, 248, 0.22)';
            }

            return (
              <g
                key={sec.id}
                onClick={() => setSelectedSectorId(sec.id)}
                className="transition-transform duration-200 hover:scale-[1.03] transform origin-center cursor-pointer"
              >
                {/* Outer Hex Polygon */}
                <polygon
                  points={getPolygonPoints(x, y, hexRadius - 6)}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 1.5}
                  className="transition-colors duration-200"
                />

                {/* Status Dot */}
                <circle cx={x - 45} cy={y - 45} r="4" fill={pulseDotColor} className="animate-pulse" />

                {/* Sector Code */}
                <text
                  x={x}
                  y={y - 24}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  letterSpacing="0.05em"
                >
                  {sec.code}
                </text>

                {/* Sector Name */}
                <text
                  x={x}
                  y={y - 8}
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {sec.name.split(' - ')[0]}
                </text>

                {/* Connectivity Tier Pill */}
                <rect
                  x={x - 38}
                  y={y + 6}
                  width="76"
                  height="16"
                  rx="8"
                  fill="#1e293b"
                  stroke={isSelected ? '#38bdf8' : '#475569'}
                  strokeWidth="0.8"
                />
                <text
                  x={x}
                  y={y + 18}
                  fill={sec.connectivityTier === 'FULL_NETWORK' ? '#38bdf8' : '#a855f7'}
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {sec.connectivityTier === 'FULL_NETWORK' && '4G/5G CLOUD'}
                  {sec.connectivityTier === 'LORA_MESH' && 'LORA MESH'}
                  {sec.connectivityTier === 'SNEAKERNET' && 'SNEAKERNET'}
                  {sec.connectivityTier === 'SATELLITE_PING' && 'ISRO SAT'}
                </text>

                {/* Active Incidents & Responders Counter */}
                <text
                  x={x}
                  y={y + 40}
                  fill="#cbd5e1"
                  fontSize="9.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {sec.activeIncidentsCount} Incidents • {sec.primaryUnitIds.length} Units
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Backup Alert Banner on top of map */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-200 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="font-bold">Dynamic Cross-Sector Backup:</span>
            <span className="text-slate-300">
              Sector H1 (Indiranagar) ALS engaged $\rightarrow$ Sector H2 (Koramangala) automatically providing active backup coverage!
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-600/50 text-amber-300">
            AUTO-ASSIST ACTIVE
          </span>
        </div>
      </div>

      {/* Selected Sector Details Drawer */}
      {selectedSector && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                {selectedSector.code}
              </span>
              <h3 className="text-sm font-bold text-white">{selectedSector.name}</h3>
              <span className="text-xs text-slate-400">({selectedSector.zoneType})</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Connectivity:</span>
              <span className="font-bold text-sky-400">{selectedSector.connectivityTier}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Mesh Nodes:</span>
              <span className="font-bold text-emerald-400">{selectedSector.signalMeshNodes}</span>
            </div>
          </div>

          {/* Assigned Pooled Responders in this Sector */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pooled Response Fleet in this Sector ({sectorResponders.length}):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sectorResponders.map(unit => (
                <div
                  key={unit.id}
                  className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-2.5 flex items-start justify-between text-xs"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-100">{unit.name}</span>
                    <span className="text-[11px] text-sky-400">{unit.organization}</span>
                    <span className="text-[10px] text-slate-400">
                      Equip: {unit.equipment.slice(0, 2).join(', ')}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    unit.status === 'AVAILABLE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-indigo-950 text-indigo-300 border border-indigo-800 animate-pulse'
                  }`}>
                    {unit.status}
                  </span>
                </div>
              ))}
              {sectorResponders.length === 0 && (
                <div className="col-span-2 text-xs text-slate-500 italic">
                  No dedicated unit in sector — covered by dynamic backup from {selectedSector.backupSectorId}.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
