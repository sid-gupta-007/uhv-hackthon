import React, { useState } from 'react';
import { useRaksha } from '../../context/RakshaContext';
import { Incident } from '../../core/types';
import { OverrideModal } from './OverrideModal';
import { ContactChannelModal } from '../common/ContactChannelModal';
import { PrioritySettingsModal } from './PrioritySettingsModal';
import { 
  HeartPulse, 
  Car, 
  Baby, 
  Droplet, 
  Flame, 
  Waves, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Zap, 
  SlidersHorizontal,
  PhoneCall,
  Sliders
} from 'lucide-react';

export const IncidentQueue: React.FC = () => {
  const { incidents, responders, approveDispatch } = useRaksha();

  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(incidents[0]?.id || null);
  const [overrideTargetIncident, setOverrideTargetIncident] = useState<Incident | null>(null);
  const [contactTargetIncident, setContactTargetIncident] = useState<Incident | null>(null);
  const [showPriorityModal, setShowPriorityModal] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PENDING' | 'DISPATCHED'>('ALL');

  const toggleExpand = (id: string) => {
    setExpandedIncidentId(prev => prev === id ? null : id);
  };

  const getCategoryIcon = (category: Incident['category']) => {
    switch (category) {
      case 'CARDIAC': return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'CRASH': return <Car className="w-4 h-4 text-amber-400" />;
      case 'MATERNAL': return <Baby className="w-4 h-4 text-pink-400" />;
      case 'TRAUMA': return <Droplet className="w-4 h-4 text-red-500" />;
      case 'FIRE': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'DISASTER': return <Waves className="w-4 h-4 text-cyan-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-sky-400" />;
    }
  };

  const sortedIncidents = [...incidents].sort((a, b) => b.aiPriorityScore - a.aiPriorityScore);

  const filteredIncidents = sortedIncidents.filter(inc => {
    if (selectedFilter === 'PENDING') return inc.status === 'RECOMMENDED';
    if (selectedFilter === 'DISPATCHED') return inc.status === 'DISPATCHED';
    return true;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
      
      {/* Queue Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Live Ranked Incidents ({incidents.length})
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by Clinical Severity + Multi-Signal Fusion + UHV Equity Floor
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPriorityModal(true)}
            className="px-3 py-1 rounded-xl bg-sky-950/80 border border-sky-600/50 text-sky-300 font-bold text-xs flex items-center gap-1.5 hover:bg-sky-900 transition-colors"
            title="Inspect or tune how priorities are set"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Priority Rules</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedFilter === 'ALL' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('PENDING')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedFilter('DISPATCHED')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedFilter === 'DISPATCHED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dispatched
            </button>
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="flex flex-col gap-2.5 max-h-[580px] overflow-y-auto pr-1">
        {filteredIncidents.map((incident, index) => {
          const isExpanded = expandedIncidentId === incident.id;
          const recommendedUnit = responders.find(r => r.id === incident.recommendedUnitId) || responders[0];

          return (
            <div
              key={incident.id}
              className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                incident.status === 'DISPATCHED'
                  ? 'bg-slate-950/60 border-slate-800'
                  : incident.aiPriorityScore >= 90
                  ? 'bg-slate-900 border-rose-500/50 shadow-md shadow-rose-950/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Summary Bar */}
              <div
                onClick={() => toggleExpand(incident.id)}
                className="p-3.5 cursor-pointer flex items-center justify-between gap-3 select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center text-xs font-black text-slate-500">
                    #{index + 1}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                    {getCategoryIcon(incident.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-[240px]">
                        {incident.categoryLabel}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {incident.trackingCode}
                      </span>
                      {incident.isOverridden && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700">
                          OVERRIDDEN
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate">{incident.location.landmark}</span>
                    </div>
                  </div>
                </div>

                {/* Priority Score Badge */}
                <div className="flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 border ${
                    incident.aiPriorityScore >= 90
                      ? 'bg-rose-950/80 text-rose-300 border-rose-600/60'
                      : incident.aiPriorityScore >= 75
                      ? 'bg-amber-950/80 text-amber-300 border-amber-600/60'
                      : 'bg-sky-950/80 text-sky-300 border-sky-600/60'
                  }`}>
                    <Zap className="w-3 h-3" />
                    <span>{incident.aiPriorityScore} pts</span>
                  </div>

                  <button className="p-1 text-slate-400 hover:text-slate-200">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Details & Actions */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-3 text-xs">
                  
                  {/* Fused Signals */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Fused Multi-Channel Feeds ({incident.signals.length}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {incident.signals.map(sig => (
                        <span key={sig.id} className="px-2 py-0.5 bg-slate-900 border border-slate-700/80 rounded-lg text-[11px] text-slate-200">
                          {sig.sourceLabel} ({(sig.confidenceWeight * 100).toFixed(0)}% conf.)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Why this rank factors */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                    <div className="font-bold text-sky-400 text-[11px] uppercase tracking-wider mb-1">
                      Priority Drivers ("Why This Rank"):
                    </div>
                    <ul className="space-y-0.5 text-[11px] text-slate-300 pl-1">
                      {incident.scoreBreakdown.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-sky-400 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dispatch Actions Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                    <div className="text-[11px] text-slate-400">
                      Recommended: <strong className="text-white">{recommendedUnit.name}</strong> (~{incident.etaMinutes}m ETA)
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setContactTargetIncident(incident)}
                        className="px-3 py-1.5 rounded-xl bg-sky-950 hover:bg-sky-900 border border-sky-600/50 text-sky-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Contact Citizen</span>
                      </button>

                      {incident.status !== 'DISPATCHED' ? (
                        <>
                          <button
                            onClick={() => approveDispatch(incident.id)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>1-Click Authorize</span>
                          </button>

                          <button
                            onClick={() => setOverrideTargetIncident(incident)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs flex items-center gap-1.5 border border-amber-500/30"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Override</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                          </span>
                          <button
                            onClick={() => setOverrideTargetIncident(incident)}
                            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                          >
                            Reassign
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          );
        })}

        {filteredIncidents.length === 0 && (
          <div className="p-6 text-center text-slate-500 text-xs">
            No incidents in this view.
          </div>
        )}
      </div>

      {/* Override Modal */}
      {overrideTargetIncident && (
        <OverrideModal
          incident={overrideTargetIncident}
          onClose={() => setOverrideTargetIncident(null)}
        />
      )}

      {/* 2-Way Contact Channel Modal */}
      {contactTargetIncident && (
        <ContactChannelModal
          incident={contactTargetIncident}
          onClose={() => setContactTargetIncident(null)}
        />
      )}

      {/* Priority Rules & Explanation Modal */}
      {showPriorityModal && (
        <PrioritySettingsModal
          onClose={() => setShowPriorityModal(false)}
        />
      )}

    </div>
  );
};
