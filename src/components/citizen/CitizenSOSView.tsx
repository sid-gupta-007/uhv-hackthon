import React, { useState, useEffect } from 'react';
import { useRaksha } from '../../context/RakshaContext';
import { I18N } from '../../core/mockData';
import { ConnectivityTier, EmergencyCategory } from '../../core/types';
import { ContactChannelModal } from '../common/ContactChannelModal';
import { 
  HeartPulse, 
  Car, 
  Baby, 
  Droplet, 
  Flame, 
  Waves, 
  Radio, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Mic, 
  Users, 
  CheckCircle2, 
  Truck, 
  Satellite, 
  Zap, 
  LifeBuoy,
  XCircle,
  PhoneCall
} from 'lucide-react';

export const CitizenSOSView: React.FC = () => {
  const { 
    citizenLanguage, 
    isSimulatedOffline, 
    activeConnectivityTier, 
    setActiveConnectivityTier,
    activeCitizenIncident,
    triggerCitizenSOS,
    cancelCitizenSOS,
    syncOfflineQueue
  } = useRaksha();

  const t = I18N[citizenLanguage];

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('CARDIAC');
  const [companionCount, setCompanionCount] = useState<number>(1);
  const [landmark, setLandmark] = useState<string>('Near Metro Pillar 142 / 100ft Road');
  const [voiceNoteRecorded, setVoiceNoteRecorded] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Countdown State
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);

  // Categories definition
  const categories: { id: EmergencyCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'CARDIAC', label: t.cardiac, icon: <HeartPulse className="w-6 h-6" />, color: 'from-rose-500 to-red-600' },
    { id: 'CRASH', label: t.crash, icon: <Car className="w-6 h-6" />, color: 'from-amber-500 to-orange-600' },
    { id: 'MATERNAL', label: t.maternal, icon: <Baby className="w-6 h-6" />, color: 'from-pink-500 to-rose-600' },
    { id: 'TRAUMA', label: t.trauma, icon: <Droplet className="w-6 h-6" />, color: 'from-red-600 to-rose-700' },
    { id: 'FIRE', label: t.fire, icon: <Flame className="w-6 h-6" />, color: 'from-orange-500 to-red-600' },
    { id: 'DISASTER', label: t.disaster, icon: <Waves className="w-6 h-6" />, color: 'from-sky-500 to-indigo-600' }
  ];

  // 3s Abort Countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isCountingDown && countdownSeconds > 0) {
      timer = setTimeout(() => {
        setCountdownSeconds(prev => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdownSeconds === 0) {
      setIsCountingDown(false);
      executeSOS();
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdownSeconds]);

  const executeSOS = async () => {
    const matched = categories.find(c => c.id === selectedCategory);
    await triggerCitizenSOS({
      category: selectedCategory,
      categoryLabel: matched ? matched.label : 'Medical Emergency',
      description: `Emergency ${matched?.label || 'Distress'} at ${landmark}.`,
      landmark,
      companionCount,
      citizenLanguage,
      connectivityTier: activeConnectivityTier,
      audioNoteRecorded: voiceNoteRecorded
    });
  };

  const handleVoiceRecord = () => {
    if (voiceNoteRecorded) {
      setVoiceNoteRecorded(false);
      return;
    }
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setVoiceNoteRecorded(true);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">
      
      {/* Connectivity Selector (Clean & Minimalist) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Radio className="w-4 h-4 text-sky-400" />
          <span>Active Signal Tier:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveConnectivityTier('FULL_NETWORK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeConnectivityTier === 'FULL_NETWORK'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            4G / 5G Link
          </button>
          <button
            onClick={() => setActiveConnectivityTier('LORA_MESH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeConnectivityTier === 'LORA_MESH'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            LoRa Mesh
          </button>
          <button
            onClick={() => setActiveConnectivityTier('SNEAKERNET')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeConnectivityTier === 'SNEAKERNET'
                ? 'bg-orange-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            Sneakernet
          </button>
          <button
            onClick={() => setActiveConnectivityTier('SATELLITE_PING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeConnectivityTier === 'SATELLITE_PING'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            NavIC Satellite
          </button>
        </div>
      </div>

      {/* ACTIVE EMERGENCY TRACKING CARD (SHOWN WHEN ACTIVE) */}
      {activeCitizenIncident && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-sky-500/60 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-sky-400 font-bold">
                  {activeCitizenIncident.trackingCode}
                </div>
                <h2 className="text-xl font-black text-white">{t.reassureTitle}</h2>
                <p className="text-xs text-slate-300">{t.reassureSub}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowContactModal(true)}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/30"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Paramedic / 108</span>
              </button>

              <button
                onClick={() => cancelCitizenSOS(activeCitizenIncident.id)}
                className="px-3 py-2 rounded-xl border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {/* 3 Vital Fact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Estimated Arrival</span>
              </div>
              <div className="text-2xl font-black text-white">~ {activeCitizenIncident.etaMinutes} mins</div>
              <div className="text-[11px] text-emerald-400 font-medium mt-0.5">High Priority Route</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>Assigned Unit</span>
              </div>
              <div className="text-sm font-bold text-white truncate">
                {activeCitizenIncident.assignedUnitName || '108 Karnataka ALS-04'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">ALS Critical Care Equipped</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Status</span>
              </div>
              <div className="text-sm font-bold text-emerald-400">
                {activeCitizenIncident.isSynced ? 'Registered & Dispatched' : 'Queued in IndexedDB (Offline)'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">UHV Floor Active (Score {activeCitizenIncident.aiPriorityScore})</div>
            </div>
          </div>

          {/* Offline Sync Reminder if offline */}
          {!activeCitizenIncident.isSynced && (
            <div className="p-3 bg-amber-950/50 border border-amber-500/50 rounded-2xl flex items-center justify-between text-xs text-amber-200">
              <span>Saved on device offline — will relay automatically when connected.</span>
              <button
                onClick={syncOfflineQueue}
                className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400"
              >
                Sync Now
              </button>
            </div>
          )}

          {/* First Aid Tip */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-300">
            <span className="font-bold text-amber-400 mr-1.5">First Aid Advice:</span>
            {selectedCategory === 'CARDIAC' && t.firstAidCardiac}
            {selectedCategory === 'CRASH' && t.firstAidCrash}
            {selectedCategory === 'MATERNAL' && t.firstAidMaternal}
            {selectedCategory !== 'CARDIAC' && selectedCategory !== 'CRASH' && selectedCategory !== 'MATERNAL' && (
              'Keep the patient warm, comfortable, and conscious. Stay near the landmark.'
            )}
          </div>

          {/* 2-Way Contact Modal */}
          {showContactModal && (
            <ContactChannelModal
              incident={activeCitizenIncident}
              userRole="citizen"
              onClose={() => setShowContactModal(false)}
            />
          )}

        </div>
      )}

      {/* SOS INPUT INTERFACE (SHOWN WHEN NO ACTIVE SOS) */}
      {!activeCitizenIncident && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col gap-5">
          
          {/* 1. Category Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              1. Select Emergency Type:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-slate-800 border-sky-500 shadow-md ring-2 ring-sky-500/30 text-white'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shrink-0`}>
                    {cat.icon}
                  </div>
                  <span className="text-xs font-bold text-left leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Quick Helpers: Landmark & Voice Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Landmark */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
              <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Landmark / Location:</span>
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Metro Pillar 142"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Voice Note & Companions */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400">Audio / People Count:</div>
                <div className="text-xs text-slate-200 font-semibold mt-0.5">
                  {companionCount} Affected • {voiceNoteRecorded ? 'Voice Note Added ✓' : 'No Voice Note'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleVoiceRecord}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : voiceNoteRecorded
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 inline mr-1" />
                  {isRecording ? 'Listening...' : voiceNoteRecorded ? '4s Note' : 'Voice'}
                </button>
              </div>
            </div>

          </div>

          {/* 3. BIG SOS BUTTON WITH 3S ABORT WINDOW */}
          <div className="flex flex-col items-center justify-center pt-2 pb-2">
            
            {isCountingDown ? (
              <div className="flex flex-col items-center gap-3 animate-in zoom-in-90 duration-150">
                <div className="w-40 h-40 rounded-full flex items-center justify-center bg-rose-950 border-4 border-rose-500 shadow-2xl shadow-rose-600/50 animate-pulse">
                  <div className="text-center">
                    <div className="text-4xl font-black text-white">{countdownSeconds}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300 mt-0.5">
                      Dispatching...
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsCountingDown(false)}
                  className="px-5 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-600 shadow"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Cancel Emergency (Abort)</span>
                </button>
              </div>
            ) : (
              <div className="relative flex flex-col items-center gap-2">
                <div className="absolute inset-0 m-auto w-48 h-48 rounded-full bg-rose-600/20 animate-radar pointer-events-none"></div>

                <button
                  onClick={() => {
                    setCountdownSeconds(3);
                    setIsCountingDown(true);
                  }}
                  className="relative z-10 w-44 h-44 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-black text-base shadow-2xl shadow-red-600/50 flex flex-col items-center justify-center p-4 border-4 border-red-400/40 transform active:scale-95 transition-all cursor-pointer"
                >
                  <HeartPulse className="w-9 h-9 mb-1 text-white animate-pulse" />
                  <span className="tracking-tight text-center leading-tight">
                    {t.oneTapSOS}
                  </span>
                  <span className="text-[10px] font-normal opacity-80 mt-1">
                    1-Tap Emergency
                  </span>
                </button>

                <p className="text-[11px] text-slate-400 text-center font-medium">
                  {t.holdingCancel} • 3s cancel window included
                </p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
