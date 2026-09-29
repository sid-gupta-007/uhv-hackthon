import React, { useState } from 'react';
import { useRaksha } from '../../context/RakshaContext';
import { Incident, ResponderUnit } from '../../core/types';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  MessageSquare, 
  ShieldCheck, 
  Volume2, 
  Radio, 
  Send, 
  X, 
  CheckCircle2, 
  Mic, 
  Play, 
  Pause,
  AlertCircle,
  Truck,
  User,
  Share2
} from 'lucide-react';

interface ContactChannelModalProps {
  incident: Incident;
  responder?: ResponderUnit;
  userRole?: 'dispatcher' | 'driver' | 'citizen';
  onClose: () => void;
}

export const ContactChannelModal: React.FC<ContactChannelModalProps> = ({
  incident,
  responder,
  userRole = 'dispatcher',
  onClose
}) => {
  const { citizenLanguage } = useRaksha();

  // Active call simulation state
  const [callState, setCallState] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ENDED'>('IDLE');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isPlayingAudioNote, setIsPlayingAudioNote] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'CALL_BRIDGE' | 'DIGNITY_CHAT' | 'MESH_BEACON'>('CALL_BRIDGE');

  // Simulated Chat Feed between Citizen and Field Paramedic
  const [messages, setMessages] = useState<Array<{ sender: 'CITIZEN' | 'DRIVER' | 'SYSTEM'; text: string; time: string }>>([
    {
      sender: 'SYSTEM',
      text: `Automated Reassurance SMS sent to citizen in ${citizenLanguage.toUpperCase()}: "Paramedic team en route (ETA ~${incident.etaMinutes}m). Keep patient warm."`,
      time: 'Just now'
    },
    {
      sender: 'CITIZEN',
      text: `We are standing right under Metro Pillar 142 next to the medical store.`,
      time: '1m ago'
    },
    {
      sender: 'DRIVER',
      text: `Driver Anand (108 ALS-04): We just took the 100ft road turn, turning on siren. Look for blue beacon.`,
      time: '30s ago'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Call timer simulation
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (callState === 'CONNECTED') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const handleStartCall = () => {
    setCallState('CONNECTING');
    setTimeout(() => {
      setCallState('CONNECTED');
    }, 2000);
  };

  const handleEndCall = () => {
    setCallState('ENDED');
    setTimeout(() => {
      setCallState('IDLE');
      setCallDuration(0);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      sender: userRole === 'citizen' ? ('CITIZEN' as const) : ('DRIVER' as const),
      text: inputMessage.trim(),
      time: 'Just now'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border-2 border-sky-500/60 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl relative flex flex-col gap-5 overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-emerald-500 to-indigo-500 animate-pulse"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Secure 2-Way Dignity Contact Bridge
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700">
                  {incident.trackingCode}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Privacy-Preserving Virtual Proxy • Direct Voice Bridge & Mesh Telemetry
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

        {/* Channel Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('CALL_BRIDGE')}
            className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'CALL_BRIDGE' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Virtual Call Bridge</span>
          </button>

          <button
            onClick={() => setActiveTab('DIGNITY_CHAT')}
            className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'DIGNITY_CHAT' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Two-Way Chat & SMS</span>
          </button>

          <button
            onClick={() => setActiveTab('MESH_BEACON')}
            className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'MESH_BEACON' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>LoRa/Acoustic Beacon</span>
          </button>
        </div>

        {/* TAB 1: MASKED VIRTUAL CALL BRIDGE */}
        {activeTab === 'CALL_BRIDGE' && (
          <div className="flex flex-col gap-4">
            
            {/* Privacy Shield Info Card */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100">Zero Personal Number Leakage</div>
                  <div className="text-[11px] text-slate-400">
                    Proxied via <span className="font-mono text-sky-400">+91 80 4712 ••••</span> (Encrypted Token)
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                TRAI Compliant
              </span>
            </div>

            {/* Active Call State Box */}
            <div className="bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
              
              {callState === 'IDLE' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-sky-500/10 border-2 border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Phone className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Ready to Connect</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Connects Dispatcher / Field Paramedic directly with Citizen {incident.citizenNameMasked || 'Patient'}
                    </div>
                  </div>
                  <button
                    onClick={handleStartCall}
                    className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Initiate Masked Call Bridge</span>
                  </button>
                </>
              )}

              {callState === 'CONNECTING' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 animate-pulse">
                    <Radio className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-300">Ringing Citizen Device...</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Routing through telecom virtual proxy
                    </div>
                  </div>
                  <button
                    onClick={handleEndCall}
                    className="mt-2 px-4 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-600 text-rose-300 font-bold text-xs"
                  >
                    Cancel Call
                  </button>
                </>
              )}

              {callState === 'CONNECTED' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-pulse">
                    <PhoneCall className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-300">Call Connected • HD Voice Bridge</div>
                    <div className="text-xl font-mono font-black text-white mt-1">
                      {formatTimer(callDuration)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Citizen: {incident.citizenNameMasked} • Paramedic Crew Linked
                    </div>
                  </div>
                  <button
                    onClick={handleEndCall}
                    className="mt-2 px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End Voice Call</span>
                  </button>
                </>
              )}

              {callState === 'ENDED' && (
                <div className="text-xs text-slate-400 font-medium">
                  Call finished. Call telemetry and audio quality logged securely.
                </div>
              )}

            </div>

            {/* Citizen Recorded Voice Snippet Playback */}
            {incident.audioNoteRecorded && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Citizen Audio Note (Recorded at SOS trigger)</div>
                    <div className="text-[11px] text-slate-400">Duration: 4.2 seconds • Background street noise filtered</div>
                  </div>
                </div>

                <button
                  onClick={() => setIsPlayingAudioNote(!isPlayingAudioNote)}
                  className="px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-600/50 text-purple-300 hover:bg-purple-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {isPlayingAudioNote ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudioNote ? 'Playing (Voice Note)' : 'Play Voice Note'}</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: TWO-WAY DIGNITY CHAT & REASSURANCE SMS */}
        {activeTab === 'DIGNITY_CHAT' && (
          <div className="flex flex-col gap-3">
            
            {/* Messages Scroll Area */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 h-64 overflow-y-auto flex flex-col gap-2.5">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] text-xs p-3 rounded-2xl ${
                    m.sender === 'SYSTEM'
                      ? 'bg-slate-900/90 border border-slate-800 self-center text-center text-slate-400 text-[11px]'
                      : m.sender === 'CITIZEN'
                      ? 'bg-sky-950/80 border border-sky-800/80 text-sky-100 self-start rounded-tl-none'
                      : 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-100 self-end rounded-tr-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold opacity-75 mb-0.5">
                    <span>
                      {m.sender === 'CITIZEN' ? '👤 Citizen (Needy)' : m.sender === 'DRIVER' ? '🚑 Paramedic / Driver' : '⚙️ Automated Gateway'}
                    </span>
                    <span>{m.time}</span>
                  </div>
                  <div>{m.text}</div>
                </div>
              ))}
            </div>

            {/* Input Message Form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type reassuring message or landmark advice..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

        {/* TAB 3: MESH / ACOUSTIC BEACON FOR ZERO-SIGNAL ZONES */}
        {activeTab === 'MESH_BEACON' && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 text-xs text-slate-300">
            <div>
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Zero-Cellular Offline Acoustic & LoRa Beacon</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                When operating in dense basements, flood zones, or rural blindspots with no cellular signal:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1.5">
                <span className="font-bold text-purple-300">LoRa 868MHz Mesh Ping</span>
                <span className="text-[11px] text-slate-400">
                  Ambulance broadcasts a high-frequency packet ping to citizen PWA device within 2.5 km.
                </span>
                <button
                  onClick={() => alert('LoRa 868MHz packet burst sent to target device!')}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-500 transition-colors"
                >
                  Broadcast Mesh Ping
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1.5">
                <span className="font-bold text-amber-300">Acoustic Siren Strobe Tone</span>
                <span className="text-[11px] text-slate-400">
                  Plays dual-tone siren pattern matching citizen PWA vibration cadence so citizen recognizes approaching team.
                </span>
                <button
                  onClick={() => alert('Acoustic strobe tone triggered on ambulance siren system!')}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-amber-600 text-slate-950 font-bold text-[11px] hover:bg-amber-500 transition-colors"
                >
                  Activate Acoustic Strobe
                </button>
              </div>
            </div>

            <div className="p-3 bg-purple-950/40 border border-purple-600/30 rounded-xl text-[11px] text-purple-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                Zero hardware dependencies for basic PWA Bluetooth/WiFi Direct local handshake.
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
