import React, { useState } from "react";
import { Niche } from "../types";
import { RECOMMENDED_NICHES } from "../niches";
import { Home, ShoppingBag, Cpu, Megaphone, GraduationCap, Plus, Sparkles, Wand2 } from "lucide-react";
import { motion } from "motion/react";

interface NicheSelectorProps {
  onNicheSelected: (nicheName: string, nicheDescription: string) => void;
  isLoading: boolean;
}

export default function NicheSelector({ onNicheSelected, isLoading }: NicheSelectorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [customNicheName, setCustomNicheName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [isBespoke, setIsBespoke] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Home":
        return <Home className="w-6 h-6 text-emerald-400" />;
      case "ShoppingBag":
        return <ShoppingBag className="w-6 h-6 text-amber-400" />;
      case "Cpu":
        return <Cpu className="w-6 h-6 text-indigo-400" />;
      case "Megaphone":
        return <Megaphone className="w-6 h-6 text-rose-400" />;
      case "GraduationCap":
        return <GraduationCap className="w-6 h-6 text-sky-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-blue-400" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBespoke) {
      if (customNicheName.trim() === "") return;
      onNicheSelected(customNicheName, customDescription);
    } else {
      const template = RECOMMENDED_NICHES.find(n => n.id === selectedTemplateId);
      if (template) {
        onNicheSelected(template.name, template.description);
      }
    }
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setIsBespoke(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-medium">
          <Wand2 className="w-3.5 h-3.5" />
          <span>Generative Agent Squad Synthesizer</span>
        </div>
        <h1 className="font-sans text-3xl md:text-4xl font-semibold tracking-tight text-slate-100">
          Automate Any Corporate Niche
        </h1>
        <p className="font-sans text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Select an industrial archetype template below, or describe a completely custom niche. 
          Our orchestration engine compiles a team of specialized AI agents.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RECOMMENDED_NICHES.map((niche) => {
            const isSelected = selectedTemplateId === niche.id && !isBespoke;
            return (
              <div
                key={niche.id}
                onClick={() => handleSelectTemplate(niche.id)}
                className={`relative group cursor-pointer p-6 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? "bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-500/10"
                    : "bg-slate-900/50 border-[#1E293B] hover:bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9.5px] uppercase font-semibold text-slate-500 tracking-wider">archetype</span>
                  <span className={`px-2 py-0.5 text-[9px] rounded border uppercase font-medium tracking-wide ${
                    isSelected ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" : "bg-slate-950 text-slate-500 border-slate-850"
                  }`}>
                    {isSelected ? "selected" : "ready"}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className={`p-2.5 rounded-xl inline-block ${
                    isSelected ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-slate-950/60"
                  }`}>
                    {getIcon(niche.icon)}
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-sans text-sm font-bold ${
                      isSelected ? "text-white" : "text-slate-250"
                    }`}>
                      {niche.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {niche.description}
                    </p>
                  </div>
                </div>

                {niche.suggestedProducts && (
                  <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t border-slate-800/60">
                    {niche.suggestedProducts.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-950/80 text-indigo-300 border border-indigo-400/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Bespoke Niche card */}
          <div
            onClick={() => {
              setIsBespoke(true);
              setSelectedTemplateId(null);
            }}
            className={`cursor-pointer p-6 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-center min-h-[180px] ${
              isBespoke
                ? "bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-500/10"
                : "bg-slate-900/30 hover:bg-slate-900 hover:border-slate-700 border-dashed border-[#1E293B]"
            }`}
          >
            <div className="space-y-3 text-center">
              <div className={`p-2.5 rounded-xl inline-block ${
                isBespoke ? "bg-indigo-500/15 border border-indigo-500/22 text-indigo-400" : "bg-slate-950/50 text-slate-500"
              }`}>
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-bold text-slate-200">
                  Custom Bespoke Niche
                </h3>
                <p className="text-xs text-slate-400 max-w-[200px] mx-auto mt-1 leading-snug">
                  Type any specialized corporate, lifestyle or academic domain.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Input Fields (renders when custom bespoke option is triggered or click) */}
        {isBespoke && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4 max-w-xl mx-auto"
          >
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block">Niche Name</label>
              <input
                type="text"
                placeholder="e.g., Craft Beer Microbrewery, Solar Panel Installer, Deep Sea Logistics"
                value={customNicheName}
                onChange={(e) => setCustomNicheName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-600 transition-all"
                required={isBespoke}
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Description (Optional)</label>
              <textarea
                placeholder="Briefly describe what this business sells, operates, or who their typical customers are."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-600 transition-all resize-none h-[100px]"
                rows={3}
              />
            </div>
          </motion.div>
        )}

        <div className="text-center pt-2 max-w-sm mx-auto">
          <button
            type="submit"
            disabled={isLoading || (!isBespoke && !selectedTemplateId) || (isBespoke && customNicheName.trim() === "")}
            className={`w-full py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all ${
              isLoading || (!isBespoke && !selectedTemplateId) || (isBespoke && customNicheName.trim() === "")
                ? "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed shadow-none"
                : "bg-slate-100 hover:bg-slate-200 text-slate-950 cursor-pointer shadow-lg active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                <span>Synthesizing Strategy Wizards...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span>Initialize Dynamic Discovery</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
