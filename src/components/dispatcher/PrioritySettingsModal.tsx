import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Zap, 
  X, 
  CheckCircle2, 
  Scale, 
  AlertTriangle, 
  HeartPulse, 
  Radio, 
  Clock, 
  Info 
} from 'lucide-react';
import { calculateIncidentPriority } from '../../core/priorityEngine';
import { EmergencyCategory } from '../../core/types';

interface PrioritySettingsModalProps {
  onClose: () => void;
}

export const PrioritySettingsModal: React.FC<PrioritySettingsModalProps> = ({ onClose }) => {
  // Interactive Live Priority Sandbox
  const [testCategory, setTestCategory] = useState<EmergencyCategory>('CARDIAC');
  const [signalCount, setSignalCount] = useState<number>(2);
  const [etaMinutes, setEtaMinutes] = useState<number>(5);
  const [companionCount, setCompanionCount] = useState<number>(1);

  // Generate mock signals based on count
  const mockSignals = Array.from({ length: signalCount }).map((_, i) => ({
    id: `TEST-SIG-${i}`,
    source: i === 0 ? ('CITIZEN_PWA' as const) : i === 1 ? ('VOICE_112' as const) : ('SMART_CITY_CCTV' as const),
    sourceLabel: i === 0 ? 'Citizen PWA SOS' : i === 1 ? '112 Call Telephony' : 'Smart City CCTV Anomaly',
    timestamp: Date.now(),
    confidenceWeight: 0.9,
    summary: 'Corroborating signal source',
    verified: true
  }));

  const simulatedScore = calculateIncidentPriority({
    category: testCategory,
    signals: mockSignals,
    estimatedEtaMinutes: etaMinutes,
    companionCount
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border-2 border-sky-500/60 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl relative flex flex-col gap-5 overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  How Priorities are Set & Calculated
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  UHV Framework
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                4-Factor Confidence Fusion Model with Non-Negotiable Human Life-Safety Floor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Core Priority Rules Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <span>1. Base Clinical Severity (0–45 pts)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Cardiac (45), Trauma/Bleeding (42), Maternal Delivery (40), Crash (38), Fire (36), Disaster (44). Multi-victim incidents receive companion bonuses.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-sky-300">
              <Radio className="w-4 h-4 text-sky-400" />
              <span>2. Multi-Channel Fusion (0–30 pts)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tier 1 (Single unverified report $\rightarrow$ +8 pts, send bike/drone); Tier 2 (2 signals $\rightarrow$ +22 pts, full ALS ambulance); Tier 3 (3+ signals $\rightarrow$ +30 pts, mass surge).
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>3. Proximity & Speed (0–20 pts)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Optimal available unit within &lt;5 mins (+20 pts), 5–12 mins (+14 pts), &gt;12 mins (+10 pts). Far distance does NOT disqualify critical cases.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-purple-800/80 bg-purple-950/20 rounded-2xl p-3.5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-purple-300">
              <Scale className="w-4 h-4 text-purple-400" />
              <span>4. Inviolable UHV Equity Floor (Hard Veto)</span>
            </div>
            <p className="text-[11px] text-purple-200/80 leading-relaxed">
              <strong>Guaranteed Minimum 75 pts:</strong> Hardcoded veto strictly blocks deprioritizing based on wealth, ID/Aadhaar credentials, or sector "efficiency".
            </p>
          </div>

        </div>

        {/* Interactive Priority Live Simulator */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Interactive Priority Simulator</span>
            </div>
            <span className="text-[11px] text-slate-400">Test how parameters drive the score</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            
            {/* Category Select */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Emergency Category:</label>
              <select
                value={testCategory}
                onChange={(e) => setTestCategory(e.target.value as EmergencyCategory)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 font-bold focus:outline-none"
              >
                <option value="CARDIAC">Cardiac Arrest / Heart (45 pts)</option>
                <option value="TRAUMA">Severe Trauma / Bleed (42 pts)</option>
                <option value="MATERNAL">Maternal Delivery (40 pts)</option>
                <option value="CRASH">Vehicular Crash (38 pts)</option>
                <option value="FIRE">Fire Hazard (36 pts)</option>
                <option value="DISASTER">Disaster Surge (44 pts)</option>
              </select>
            </div>

            {/* Signal Count */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Independent Signals Fused:</label>
              <select
                value={signalCount}
                onChange={(e) => setSignalCount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 font-bold focus:outline-none"
              >
                <option value={1}>1 Signal (Tier 1: Verify)</option>
                <option value={2}>2 Signals (Tier 2: Full ALS)</option>
                <option value={3}>3+ Signals (Tier 3: Mass Surge)</option>
              </select>
            </div>

            {/* ETA */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Estimated Unit ETA:</label>
              <select
                value={etaMinutes}
                onChange={(e) => setEtaMinutes(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 font-bold focus:outline-none"
              >
                <option value={3}>3 mins (Immediate Proximity)</option>
                <option value={7}>7 mins (Standard Proximity)</option>
                <option value={15}>15 mins (Remote Backup Assist)</option>
              </select>
            </div>

          </div>

          {/* Live Output Result Badge */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-400">Calculated Priority Score:</div>
              <div className="text-3xl font-black text-white flex items-center gap-2 mt-0.5">
                <span className="text-emerald-400">{simulatedScore.aiPriorityScore}</span>
                <span className="text-xs text-slate-400 font-normal">/ 100 points</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Tier {simulatedScore.corroborationTier} Dispatch
                </span>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="font-bold text-sky-400">Recommended Action:</div>
              <div className="text-slate-300 text-xs font-semibold">{simulatedScore.recommendedAction}</div>
            </div>
          </div>

          {/* Reasons List */}
          <div className="text-xs text-slate-300 space-y-1">
            <div className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Score Breakdown Factors:</div>
            {simulatedScore.scoreBreakdown.reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px]">
                <span className="text-sky-400">•</span>
                <span>{r}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Hard Floor guarantees 100% equity
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors"
          >
            Close Rules
          </button>
        </div>

      </div>
    </div>
  );
};
