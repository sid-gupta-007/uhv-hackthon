import React, { useState } from 'react';
import { useRaksha } from '../../context/RakshaContext';
import { LiveLeafletMap } from './LiveLeafletMap';
import { HexagonMap } from './HexagonMap';
import { IncidentQueue } from './IncidentQueue';
import { 
  Activity, 
  Truck, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Clock, 
  Map as MapIcon,
  Compass,
  AlertTriangle, 
  Users,
  CheckCircle2
} from 'lucide-react';

export const DispatcherDashboard: React.FC = () => {
  const { incidents, responders, sectors } = useRaksha();
  const [mapMode, setMapMode] = useState<'LEAFLET_GEO' | 'HEX_MESH'>('LEAFLET_GEO');

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const criticalCount = incidents.filter(i => i.aiPriorityScore >= 85).length;
  const availableResponders = responders.filter(r => r.status === 'AVAILABLE').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
      
      {/* Top Real-Time KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Emergencies</div>
            <div className="text-2xl font-black text-white mt-1">{activeIncidents.length}</div>
            <div className="text-[11px] text-rose-400 font-medium mt-0.5">{criticalCount} Critical priority</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Pooled Fleet</div>
            <div className="text-2xl font-black text-white mt-1">{availableResponders} / {responders.length}</div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5">Govt 108 + Apollo + Red Cross</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Fused Response ETA</div>
            <div className="text-2xl font-black text-white mt-1">~ 6.4 <span className="text-sm font-normal text-slate-400">mins</span></div>
            <div className="text-[11px] text-sky-400 font-medium mt-0.5">Target &lt; 8.0 mins metro</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">UHV Life-Safety Floor</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">100% Active</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Zero downranking for wealth/ID</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Map Mode Selector Tabs */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMapMode('LEAFLET_GEO')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mapMode === 'LEAFLET_GEO'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Geographic Leaflet Map (Live Fleet & Heatzones)</span>
          </button>

          <button
            onClick={() => setMapMode('HEX_MESH')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mapMode === 'HEX_MESH'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>H3 Hexagonal Spatial Mesh Diagram</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block font-medium">
          {mapMode === 'LEAFLET_GEO' ? 'Carto Dark Matter Tiles • Live Ambulance GPS' : 'Axial Hex Grid • Topology Routing'}
        </div>
      </div>

      {/* Main Grid: Leaflet / Hex Map on Left (7 cols on lg), Ranked Queue on Right (5 cols on lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Map Component (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {mapMode === 'LEAFLET_GEO' ? <LiveLeafletMap /> : <HexagonMap />}
        </div>

        {/* Right: Live Incident Ranked Queue (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <IncidentQueue />
        </div>

      </div>

    </div>
  );
};
