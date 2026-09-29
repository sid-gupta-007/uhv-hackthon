import React from 'react';
import { useRaksha } from '../../context/RakshaContext';
import { 
  BarChart3, 
  ShieldCheck, 
  HeartHandshake, 
  Scale, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  TrendingDown, 
  Users, 
  Building2, 
  Landmark 
} from 'lucide-react';

export const TransparencyPortal: React.FC = () => {
  const { publicMetrics } = useRaksha();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6">
      
      {/* Transparency Header & Ethical Framing */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Public Resource Equity & Sector Transparency
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  UHV Framework
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Democratizing emergency telemetry across India's urban, peri-urban, and rural sectors
              </p>
            </div>
          </div>
        </div>

        {/* Ethical Charter Notice */}
        <div className="p-3 bg-purple-950/40 border border-purple-600/30 rounded-2xl text-xs text-purple-200 max-w-md flex items-start gap-2.5">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="leading-tight">
            <strong>Transparency Principle:</strong> This portal is explicitly structured to identify systemic resource deficits and guide municipal ambulance deployments — <em>never</em> to rank staff or penalize field personnel.
          </p>
        </div>
      </div>

      {/* Aggregate Equity Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pooled Cross-Agency Fleet</div>
            <div className="text-2xl font-black text-white mt-1">100% Unified</div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Govt 108 + Apollo & Manipal Private Fleets + Red Cross volunteer bikes shared under a single ethical dispatch protocol.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Zero proprietary vendor lock-in
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Universal Equity Floor</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">Non-Negotiable</div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Hard veto prevents any algorithmic optimization from deprioritizing requests based on patient identity, wealth, or sector economic status.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-purple-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Universal Human Values Guarantee
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rural & Tribal Reach</div>
            <div className="text-2xl font-black text-sky-400 mt-1">4 Connectivity Tiers</div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Zero-connectivity zones reached via LoRa 868MHz mesh relays, transit vehicle sneakernets, and direct NavIC satellite byte bursts.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-sky-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Offline-first IndexedDB resilience
          </div>
        </div>

      </div>

      {/* Sector-by-Sector Response Time & Resource Deficit Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Sector Response Equity & Infrastructure Deficit Mapping
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compares average response times against target thresholds to highlight areas requiring new ambulance staging depots.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800 bg-slate-950/60">
              <tr>
                <th className="p-3 rounded-l-xl">Hex Sector</th>
                <th className="p-3">Zone Type</th>
                <th className="p-3">Avg Response Time</th>
                <th className="p-3">Target Response</th>
                <th className="p-3">Pooled Fleet Share</th>
                <th className="p-3 rounded-r-xl">Infrastructure Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {publicMetrics.map((m) => (
                <tr key={m.sectorId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    <span>{m.sectorName}</span>
                  </td>
                  <td className="p-3 text-slate-400">{m.zoneType}</td>
                  <td className="p-3 font-mono font-bold text-white">
                    {m.averageResponseMinutes} mins
                  </td>
                  <td className="p-3 font-mono text-slate-400">
                    &lt; {m.targetResponseMinutes} mins
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium">
                      <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800" title="Government 108">
                        108: {m.pooledGovtShare}%
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800" title="Private Hospital">
                        Pvt: {m.pooledPrivateShare}%
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800" title="Red Cross Volunteer">
                        Vol: {m.pooledVolunteerShare}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    {m.resourceDeficitAlert ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold text-[10px]">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        Infrastructure Deficit (Recommend New Depot)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Within Target Benchmark
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
