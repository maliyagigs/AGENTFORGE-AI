import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldAlert, KeyRound, Bot, Sparkles, Check, Server, RefreshCw, Key, User, ArrowRight } from "lucide-react";

interface AuthScreenProps {
  onAuthenticated: (user: { email: string; name: string }) => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("admin@agentforge.ai");
  const [name, setName] = useState("Agent Architect");
  const [password, setPassword] = useState("*********");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError("Please complete all required fields.");
      return;
    }
    setError("");
    setLoading(true);

    // Simulate clean premium response with short timing delay
    setTimeout(() => {
      setLoading(false);
      onAuthenticated({
        email: email,
        name: isSignUp ? name : (email === "admin@agentforge.ai" ? "Agent Architect" : email.split("@")[0])
      });
    }, 800);
  };

  const handleQuickDemoSession = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAuthenticated({
        email: "demo@agentforge.ai",
        name: "Dev Mastermind"
      });
    }, 450);
  };

  return (
    <div id="auth-panel-root" className="min-h-screen w-full bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 relative overflow-y-auto">
      {/* Dynamic background ambient grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 my-8">
        {/* Core Branded Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20 border border-indigo-400/35 mb-4"
          >
            <Bot className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">
            AgentForge <span className="text-xs px-2 py-0.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded font-semibold font-mono align-middle ml-1">v2.4</span>
          </h1>
          <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold max-w-xs mx-auto">
            Autonomous Multi-Agent Swarm Orchestrator
          </p>
        </div>

        {/* Auth Outer Bento Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Top glow border bar */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />

          <h2 className="text-lg font-bold text-white mb-2 text-left">
            {isSignUp ? "Create Developer Account" : "Access Intelligence Console"}
          </h2>
          <p className="text-xs text-slate-500 mb-6 text-left">
            {isSignUp ? "Configure your strategic sandbox permissions credentials" : "Enter your deployment keys or trigger a localized fast track bypass"}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-400 text-left">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {isSignUp && (
              <div>
                <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block mb-1.5">Developer Identity / Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-500"><User className="w-4 h-4" /></span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Satya Hoover"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-600 transition-all font-sans"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block mb-1.5">Work Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-slate-500">@</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agentforge.ai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-600 transition-all font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block mb-1.5">Sandbox Password Code</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-slate-500"><KeyRound className="w-4 h-4" /></span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-600 transition-all font-sans"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 cursor-pointer text-center inline-flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-200" />
                  <span>Decrypting Environment...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Provision Developer Account" : "Initialize Control Center"}</span>
                  <ArrowRight className="w-4 h-4 text-indigo-200" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Trigger */}
          <div className="mt-5 pt-5 border-t border-slate-800/80 text-center">
            <span className="text-[10.5px] text-slate-500 block mb-2">Want to evaluate instantly with preset credentials?</span>
            <button
              onClick={handleQuickDemoSession}
              disabled={loading}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 text-xs font-semibold rounded-xl text-slate-300 border border-slate-800 hover:border-slate-705 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Launch Quick Bypass Sandbox Mode</span>
            </button>
          </div>

          {/* Toggle Screen Trigger */}
          <div className="mt-5 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline select-none"
            >
              {isSignUp ? "Already registered? Sing/Sign In instead" : "Don't have an AI developer profile? Sign Up here"}
            </button>
          </div>
        </div>

        {/* Footer info logs */}
        <div className="flex items-center justify-between mt-6 px-4 text-[10px] text-slate-600 font-mono">
          <span className="flex items-center gap-1">
            <Server className="w-3 h-3 text-slate-550" /> System Active Grid
          </span>
          <span>SSL Encryption Active</span>
        </div>
      </div>
    </div>
  );
}
