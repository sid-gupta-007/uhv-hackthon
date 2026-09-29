import React, { useState } from 'react';
import { useRaksha } from '../../context/RakshaContext';
import { Incident } from '../../core/types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  Lock, 
  FileCheck2, 
  CheckCircle2, 
  Info 
} from 'lucide-react';

interface OverrideModalProps {
  incident: Incident;
  onClose: () => void;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({ incident, onClose }) => {
  const { responders, overrideDispatch } = useRaksha();

  const [selectedUnitId, setSelectedUnitId] = useState<string>(incident.recommendedUnitId);
  const [reasonCode, setReasonCode] = useState<string>('ON_GROUND_TRAFFIC_CONGESTION');
  const [detailedReason, setDetailedReason] = useState<string>('');
  const [dispatcherBadge, setDispatcherBadge] = useState<string>('KA-DSP-042');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reasonCodes = [
    { code: 'ON_GROUND_TRAFFIC_CONGESTION', label: 'Heavy Traffic / Road Construction Delay' },
    { code: 'PARAMEDIC_TELEMETRY_ASSESSMENT', label: 'Field Telemetry Requires Different Equipment' },
    { code: 'SPECIALIZED_PEDIATRIC_NEONATAL', label: 'Specialized Pediatric / Neo-Natal Incubator Needed' },
    { code: 'POLICE_FIRE_JOINT_PROTOCOL', label: 'Joint Police/Fire Scene Clearance Protocol' },
    { code: 'COMMUNITY_BIKE_FASTER_REACH', label: 'Volunteer First Aid Bike Reaches Faster on Narrow Alley' },
    { code: 'SPECIAL_HAZMAT_DECONTAMINATION', label: 'Industrial Chemical / Hazmat Protocol' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Hard UI validation check
    if (!reasonCode) {
      setErrorMessage('A standardized reason code is mandatory for all overrides.');
      return;
    }

    if (detailedReason.trim().length < 8) {
      setErrorMessage('Please provide a meaningful explanation (at least 8 characters) for the audit ledger.');
      return;
    }

    if (!dispatcherBadge.trim()) {
      setErrorMessage('Dispatcher Badge ID is required for cryptographic accountability.');
      return;
    }

    setIsSubmitting(true);
    await overrideDispatch({
      incidentId: incident.id,
      newUnitId: selectedUnitId,
      reasonCode,
      detailedReason,
      dispatcherBadge
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl relative flex flex-col gap-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Mandatory Audited Override
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                  {incident.trackingCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Hard constraint: Human overrides are permitted, but strictly logged to the SHA-256 Decision Ledger.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Incident AI Recommendation summary */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-xs flex flex-col gap-1">
            <div className="text-slate-400">
              Current AI Recommended Unit: <span className="font-bold text-sky-400">{incident.recommendedUnitId}</span>
            </div>
            <div className="text-slate-400">
              AI Priority Score: <span className="font-bold text-emerald-400">{incident.aiPriorityScore} pts</span> (Corroboration Tier {incident.corroborationTier})
            </div>
          </div>

          {/* Select Alternate Pooled Unit */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Select Alternate Pooled Unit:
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
            >
              {responders.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.organization} ({r.status})
                </option>
              ))}
            </select>
          </div>

          {/* Reason Code Dropdown (Mandatory) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Standard Reason Code (Mandatory):</span>
              <span className="text-[10px] text-amber-400 font-normal">Audit Req.</span>
            </label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
            >
              {reasonCodes.map(r => (
                <option key={r.code} value={r.code}>
                  [{r.code}] {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Detailed Reason Explanation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Detailed Human Rationale / Field Notes:
            </label>
            <textarea
              rows={3}
              value={detailedReason}
              onChange={(e) => setDetailedReason(e.target.value)}
              placeholder="e.g. Traffic police at Sony Signal confirmed flyover ramp is blocked by oil spill; routing via Red Cross First Aid bike from 100ft road."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Dispatcher Badge ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Authorizing Dispatcher Badge ID:</span>
            </label>
            <input
              type="text"
              value={dispatcherBadge}
              onChange={(e) => setDispatcherBadge(e.target.value)}
              placeholder="e.g. KA-DSP-042"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Error notice if validation fails */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/70 border border-rose-600 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Cryptographic Ledger Warning */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              This decision will be cryptographically signed with your badge ID and chained into the immutable SHA-256 Decision Ledger.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing Block...' : 'Submit & Sign Override'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
