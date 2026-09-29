import React from 'react';
import { RakshaProvider, useRaksha } from './context/RakshaContext';
import { Header } from './components/common/Header';
import { CitizenSOSView } from './components/citizen/CitizenSOSView';
import { DispatcherDashboard } from './components/dispatcher/DispatcherDashboard';
import { AuditLedgerView } from './components/audit/AuditLedgerView';
import { TransparencyPortal } from './components/transparency/TransparencyPortal';
import { Shield, Heart, Lock, Globe, Radio, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, setActiveView } = useRaksha();

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Top Header */}
      <Header />

      {/* Main Role Views */}
      <main className="flex-1 w-full pb-12">
        {activeView === 'citizen' && <CitizenSOSView />}
        {activeView === 'dispatcher' && <DispatcherDashboard />}
        {activeView === 'audit' && <AuditLedgerView />}
        {activeView === 'transparency' && <TransparencyPortal />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300">
              RakshaNet (रक्षामित्र)
            </span>
            <span>— Universal Human Values Emergency Trust Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap justify-center">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> SHA-256 Decision Ledger
            </span>
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-purple-400" /> 4-Tier Zero Connectivity Reach
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-400" /> Inviolable Life-Safety Floor
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            Hackathon MVP Prototype • Built with React 19, IndexedDB & Tailwind CSS
          </div>

        </div>
      </footer>

    </div>
  );
};

export function App() {
  return (
    <RakshaProvider>
      <AppContent />
    </RakshaProvider>
  );
}

export default App;
