import React, { useState } from 'react';
import { useRaksha } from '../../context/RakshaContext';
import { 
  Shield, 
  Radio, 
  Activity, 
  FileCheck2, 
  BarChart3, 
  Wifi, 
  WifiOff, 
  Sparkles,
  Flame,
  Volume2,
  VolumeX
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    citizenLanguage, 
    setCitizenLanguage, 
    isSimulatedOffline, 
    toggleOfflineSimulation,
    pendingOfflineCount,
    syncOfflineQueue,
    soundEnabled,
    setSoundEnabled,
    triggerSimulationScenario
  } = useRaksha();

  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div 
          onClick={() => setActiveView('citizen')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-base font-black tracking-tight text-white">Raksha<span className="text-sky-400">Net</span></span>
              <span className="text-[10px] font-bold text-slate-400">रक्षामित्र</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Emergency Coordination</p>
          </div>
        </div>

        {/* Primary View Switcher */}
        <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveView('citizen')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'citizen'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Citizen SOS</span>
            {pendingOfflineCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full animate-bounce">
                {pendingOfflineCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('dispatcher')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'dispatcher'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dispatcher HQ</span>
          </button>

          <button
            onClick={() => setActiveView('audit')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'audit'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Decision Ledger</span>
          </button>

          <button
            onClick={() => setActiveView('transparency')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'transparency'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Public Equity</span>
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          
          {/* Language Picker */}
          <select
            value={citizenLanguage}
            onChange={(e) => setCitizenLanguage(e.target.value as 'en' | 'hi' | 'kn' | 'bn')}
            className="bg-slate-950 border border-slate-700/80 text-xs font-semibold text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="bn">বাংলা</option>
          </select>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Quick Demo Scenarios Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowScenarioMenu(!showScenarioMenu)}
              className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Demo Scenarios</span>
            </button>

            {showScenarioMenu && (
              <div 
                className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowScenarioMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  Inject Demo Emergency
                </div>
                <button
                  onClick={() => triggerSimulationScenario('HIGHWAY_PILEUP')}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-xl text-xs text-slate-200 flex flex-col gap-0.5"
                >
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-400" /> Highway Crash (3 Signals)
                  </span>
                  <span className="text-[10px] text-slate-400">PWA + CCTV + 112 Fused</span>
                </button>
                <button
                  onClick={() => triggerSimulationScenario('REMOTE_CARDIAC')}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded-xl text-xs text-slate-200 flex flex-col gap-0.5"
                >
                  <span className="font-bold text-sky-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-sky-400" /> LoRa Mesh Cardiac SOS
                  </span>
                  <span className="text-[10px] text-slate-400">Rural blindspot + Drone dispatch</span>
                </button>
              </div>
            )}
          </div>

          {/* Offline Mode Toggle Button */}
          <button
            onClick={toggleOfflineSimulation}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isSimulatedOffline
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isSimulatedOffline ? 'Offline (Airplane)' : 'Online'}</span>
          </button>

          {/* Sync Button if offline items exist */}
          {pendingOfflineCount > 0 && !isSimulatedOffline && (
            <button
              onClick={syncOfflineQueue}
              className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1.5 rounded-lg hover:bg-amber-400 transition-colors shadow"
            >
              Sync ({pendingOfflineCount})
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
