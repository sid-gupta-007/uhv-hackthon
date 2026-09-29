import React, { useState } from 'react';
import { useRaksha } from '../../context/RakshaContext';
import { 
  FileCheck2, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Hash, 
  Calendar, 
  UserCheck, 
  Sparkles,
  Link as LinkIcon,
  ShieldX
} from 'lucide-react';

export const AuditLedgerView: React.FC = () => {
  const { 
    ledgerChain, 
    verifyLedger, 
    simulateLedgerTamper, 
    repairLedgerChain, 
    ledgerVerification,
    isVerifyingLedger 
  } = useRaksha();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredBlocks = ledgerChain.filter(block => {
    const matchesSearch = 
      block.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (block.overrideReason && block.overrideReason.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterAction === 'OVERRIDE_ONLY') return matchesSearch && block.action === 'DISPATCH_OVERRIDDEN';
    if (filterAction === 'APPROVED_ONLY') return matchesSearch && block.action === 'DISPATCH_APPROVED';
    if (filterAction === 'AI_ONLY') return matchesSearch && block.action === 'AI_RECOMMENDATION';
    return matchesSearch;
  });

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-6">
      
      {/* Oversight Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Tamper-Evident SHA-256 Decision Ledger
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Read-Only Audit Mode
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Independent oversight authority portal • Cryptographically chained immutable log of all AI suggestions & human decisions
              </p>
            </div>
          </div>
        </div>

        {/* Cryptographic Verifier Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={verifyLedger}
            disabled={isVerifyingLedger}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            title="Recalculate SHA-256 hashes across all blocks"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isVerifyingLedger ? 'Verifying Hashes...' : 'Verify Chain Integrity'}</span>
          </button>

          <button
            onClick={simulateLedgerTamper}
            className="px-3.5 py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-600/50 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            title="Demonstrate how cryptographic hashing catches retroactively altered decisions"
          >
            <ShieldX className="w-4 h-4 text-rose-400" />
            <span>Simulate Tamper</span>
          </button>

          <button
            onClick={repairLedgerChain}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            title="Restore valid hash chain"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Verification Status Alert Banner */}
      {ledgerVerification && (
        <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
          ledgerVerification.isValid
            ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
            : 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-xl shadow-rose-950/50'
        }`}>
          <div className="flex items-start gap-3">
            {ledgerVerification.isValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
            )}
            <div>
              <div className="text-sm font-bold">
                {ledgerVerification.isValid ? 'Cryptographic Integrity 100% Verified' : 'Cryptographic Tampering Detected!'}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {ledgerVerification.message}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 shrink-0">
            {ledgerVerification.totalBlocks} Blocks Verified
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Tracking Code, Dispatcher, Reason..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          <button
            onClick={() => setFilterAction('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterAction === 'ALL' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Blocks ({ledgerChain.length})
          </button>
          <button
            onClick={() => setFilterAction('OVERRIDE_ONLY')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterAction === 'OVERRIDE_ONLY' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overrides Only
          </button>
          <button
            onClick={() => setFilterAction('APPROVED_ONLY')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterAction === 'APPROVED_ONLY' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Approved Dispatches
          </button>
        </div>
      </div>

      {/* Cryptographic Chained Block Cards */}
      <div className="flex flex-col gap-4">
        {filteredBlocks.map((block, idx) => {
          const isGenesis = block.index === 0;
          const isOverride = block.action === 'DISPATCH_OVERRIDDEN';
          const isTampered = ledgerVerification && !ledgerVerification.isValid && ledgerVerification.tamperedBlockIndex === block.index;

          return (
            <div
              key={block.index}
              className={`border-2 rounded-3xl p-5 sm:p-6 transition-all duration-200 relative overflow-hidden ${
                isTampered
                  ? 'bg-rose-950/70 border-rose-500 ring-4 ring-rose-500/30 shadow-2xl'
                  : isOverride
                  ? 'bg-gradient-to-r from-slate-900 to-amber-950/20 border-amber-500/40'
                  : isGenesis
                  ? 'bg-gradient-to-r from-slate-900 to-indigo-950/20 border-indigo-500/40'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              {/* Block Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    isTampered
                      ? 'bg-rose-600 text-white animate-bounce'
                      : isOverride
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-emerald-400'
                  }`}>
                    #{block.index}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-white">
                        {block.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        {block.trackingCode}
                      </span>
                      {isOverride && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                          AUDITED OVERRIDE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                        {block.actor}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(block.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* UHV Hard Floor Tag */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-purple-950/80 text-purple-300 border border-purple-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    Life-Safety Veto Enforced
                  </span>
                </div>

              </div>

              {/* Block Body */}
              <div className="my-3 text-xs text-slate-200 leading-relaxed">
                {block.details}
              </div>

              {/* Mandatory Reason Callout if Overridden */}
              {block.overrideReason && (
                <div className="my-2.5 p-3 rounded-xl bg-amber-950/50 border border-amber-600/40 text-xs text-amber-200">
                  <span className="font-bold text-amber-300">Mandatory Override Reason: </span>
                  {block.overrideReason}
                </div>
              )}

              {/* Cryptographic Hash Chain Footer */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                
                <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 flex items-center justify-between overflow-hidden">
                  <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0 mr-2">Prev Hash:</span>
                  <span className="text-slate-400 truncate" title={block.previousHash}>
                    {block.previousHash}
                  </span>
                </div>

                <div className={`p-2 rounded-xl border flex items-center justify-between overflow-hidden ${
                  isTampered 
                    ? 'bg-rose-950/90 border-rose-500 text-rose-200' 
                    : 'bg-slate-950/80 border-slate-800/80 text-emerald-400'
                }`}>
                  <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0 mr-2">Block SHA-256:</span>
                  <span className="truncate font-bold" title={block.hash}>
                    {block.hash}
                  </span>
                </div>

              </div>

            </div>
          );
        })}

        {filteredBlocks.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No ledger blocks matched your search criteria.
          </div>
        )}
      </div>

    </div>
  );
};
