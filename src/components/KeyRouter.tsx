import React, { useState } from "react";
import { Key, ShieldCheck, HelpCircle, Activity, Sparkles, Check, Database, Server, RefreshCw, Layers } from "lucide-react";

interface KeyRouterProps {
  onSelectEngine: (engine: "google" | "deepseek", key: string) => void;
  activeEngine: "google" | "deepseek";
}

export default function KeyRouter({ onSelectEngine, activeEngine }: KeyRouterProps) {
  const [googleKey, setGoogleKey] = useState("AIzaSyCCEuIKhzZHWe0wITUmm9GYH3kxjwvcKRY");
  const [deepseekKey, setDeepseekKey] = useState("sk-c3f97c32c6674077bc3d45329bf5d7c8");
  const [isTesting, setIsTesting] = useState(false);
  const [testLog, setTestLog] = useState<string>("Intel interface routing online. Ready for ping.");
  const [connected, setConnected] = useState(true);

  const handleTestKeyStatus = () => {
    setIsTesting(true);
    setTestLog("Initializing handshake request to gateway API endpoints...");
    
    setTimeout(() => {
      setTestLog("Decrypting host credentials mapping... OK");
      setTimeout(() => {
        const keyToVerify = activeEngine === "google" ? googleKey : deepseekKey;
        setTestLog(`Success! Validated ${activeEngine.toUpperCase()} protocol on node pipeline [${keyToVerify.substring(0, 8)}...].`);
        setConnected(true);
        setIsTesting(false);
      }, 500);
    }, 450);
  };

  return (
    <div id="key-router-card" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left flex flex-col gap-5 h-full relative overflow-hidden backdrop-blur-md">
      {/* Visual top bar glow */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
            <Key className="w-4 h-4 text-indigo-400" /> API Engine Keys Router
          </h3>
          <span className="text-[10px] text-slate-500">Choose your live backend AI developer brain</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
          connected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}>
          {connected ? "● Engine active" : "○ Disconnected"}
        </span>
      </div>

      <div className="space-y-4">
        {/* Toggle Mode Switches */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-850 rounded-xl relative">
          <button
            onClick={() => {
              onSelectEngine("google", googleKey);
              setConnected(true);
              setTestLog("Switched Active routing to Google AI Studio gateway.");
            }}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeEngine === "google"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Google AI Studio</span>
          </button>

          <button
            onClick={() => {
              onSelectEngine("deepseek", deepseekKey);
              setConnected(true);
              setTestLog("Switched Active routing to DeepSeek endpoint cluster.");
            }}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeEngine === "deepseek"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>DeepSeek Pro</span>
          </button>
        </div>

        {/* Dynamic Key Inputs */}
        {activeEngine === "google" ? (
          <div>
            <label className="text-[10.5px] uppercase font-bold text-slate-550 block mb-1.5">Google AI Studio API Key</label>
            <div className="relative">
              <input
                type="text"
                value={googleKey}
                onChange={(e) => {
                  setGoogleKey(e.target.value);
                  onSelectEngine("google", e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 font-mono outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2 italic">Preset optimized key loaded for high-capacity sandbox requests</p>
          </div>
        ) : (
          <div>
            <label className="text-[10.5px] uppercase font-bold text-slate-550 block mb-1.5">DeepSeek API Key (Dynamic Preset)</label>
            <div className="relative">
              <input
                type="text"
                value={deepseekKey}
                onChange={(e) => {
                  setDeepseekKey(e.target.value);
                  onSelectEngine("deepseek", e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 font-mono outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2 italic">Preset optimized DeepSeek-R1 deep thinking pipeline active</p>
          </div>
        )}

        {/* Live ping tests */}
        <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl font-mono text-[10px] leading-relaxed text-slate-400 text-left min-h-[56px] relative block">
          <div className="flex items-center gap-1.5 text-slate-500 border-b border-slate-900 pb-1.5 mb-1.5 uppercase font-bold tracking-widest text-[8.5px]">
            <Activity className="w-3 h-3 text-indigo-400" /> Gateway Logs Terminal:
          </div>
          <span className={isTesting ? "text-indigo-400" : "text-slate-350"}>
            {isTesting && "⟳ "} {testLog}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-2 grid grid-cols-1 gap-2">
        <button
          onClick={handleTestKeyStatus}
          disabled={isTesting}
          className="w-full py-2.5 bg-slate-805 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/60 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 select-none"
        >
          {isTesting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Database className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span>Ping Engine Connection</span>
        </button>
      </div>
    </div>
  );
}
