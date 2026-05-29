import React, { useState } from "react";
import { SharedArtifact } from "../types";
import { BookOpen, Copy, Check, FileText, Code, CornerDownRight, Layers } from "lucide-react";

interface SharedArtifactsProps {
  artifacts: SharedArtifact[];
}

export default function SharedArtifacts({ artifacts }: SharedArtifactsProps) {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeArtifact = artifacts.find(a => a.id === selectedArtifactId) || artifacts[0];

  const handleCopy = (art: SharedArtifact, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(art.content);
    setCopiedId(art.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-left">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-850 bg-slate-950/40 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-emerald-400" />
        <div>
          <h3 className="font-sans text-sm font-semibold text-slate-100">Compiled Shared Artifacts</h3>
          <span className="text-[10px] text-slate-400">Tactical strategies designed by working agents</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {artifacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500 space-y-3">
            <div className="p-3.5 bg-slate-950/30 border border-slate-850/60 rounded-xl inline-flex">
              <FileText className="w-6 h-6 text-emerald-500/40" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-350">No blueprints synthesized yet</p>
              <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto mt-1 leading-snug">
                As agents talk in Swarm mode, structured strategies will populate this board in real-time.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {artifacts.map((art) => {
              const isSelected = activeArtifact?.id === art.id;
              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArtifactId(art.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-gradient-to-br from-emerald-950/15 to-slate-900 border-emerald-500/60 ring-1 ring-emerald-500/10 shadow shadow-emerald-500/5"
                      : "bg-slate-900/30 hover:bg-slate-950/20 border-slate-800 hover:border-slate-750"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
                        {art.type === 'code' ? <Code className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                      </div>
                      <h4 className="font-sans text-xs font-semibold text-slate-200 truncate">{art.title}</h4>
                    </div>

                    <button
                      onClick={(e) => handleCopy(art, e)}
                      className="p-1 text-slate-500 hover:text-slate-350 rounded shrink-0 transition-colors"
                      title="Copy Artifact Code"
                    >
                      {copiedId === art.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 font-sans mt-1">
                    <span className="flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3 text-slate-500" /> Compiled by: {art.updatedBy}
                    </span>
                    <span>{art.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Render area for actively selected strategy blueprint */}
        {activeArtifact && (
          <div className="border-t border-slate-850 pt-4 mt-4 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Active Blueprint View</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-500/10 font-mono">
                {activeArtifact.type.toUpperCase()}
              </span>
            </div>

            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl max-h-[240px] overflow-y-auto">
              <pre className="text-[11px] leading-relaxed font-mono font-medium text-slate-300 whitespace-pre-wrap break-all select-all leading-relaxed whitespace-pre-line">
                {activeArtifact.content}
              </pre>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
