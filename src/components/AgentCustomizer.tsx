import React, { useState } from "react";
import { Agent, AgentTool } from "../types";
import { Sliders, HelpCircle, Save, Plus, Trash2, Bot, Sparkles, AlertCircle, Wrench } from "lucide-react";
import { motion } from "motion/react";

interface AgentCustomizerProps {
  agents: Agent[];
  onChangeAgents: (updatedAgents: Agent[]) => void;
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
}

export default function AgentCustomizer({
  agents,
  onChangeAgents,
  selectedAgentId,
  onSelectAgent
}: AgentCustomizerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  // States for editing forms
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editSystemInstruction, setEditSystemInstruction] = useState("");
  const [editTemp, setEditTemp] = useState(0.7);
  const [editTools, setEditTools] = useState<AgentTool[]>([]);

  // Open editor
  const handleStartEdit = (agent: Agent) => {
    setEditName(agent.name);
    setEditRole(agent.role);
    setEditSystemInstruction(agent.systemInstruction);
    setEditTemp(agent.temperature);
    setEditTools([...agent.tools]);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedAgentId) return;
    const updated = agents.map(a => {
      if (a.id === selectedAgentId) {
        return {
          ...a,
          name: editName,
          role: editRole,
          systemInstruction: editSystemInstruction,
          temperature: editTemp,
          tools: editTools
        };
      }
      return a;
    });
    onChangeAgents(updated);
    setIsEditing(false);
  };

  const handleAddNewAgent = () => {
    const freshId = `agent_${Date.now()}`;
    const colors = ['rose', 'violet', 'orange', 'emerald', 'sky', 'amber'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];
    const freshAgent: Agent = {
      id: freshId,
      name: "Strategy Consultant",
      role: "Analyze high-level business benchmarks and suggest operational vectors.",
      avatar: "🧠",
      color: chosenColor,
      systemInstruction: "You are an analytical Strategy Consultant agent. Synthesize business plans based on user files and metrics.",
      temperature: 0.7,
      tools: [
        {
          name: "fetchMarketData",
          description: "Pull targeted industry trends and customer benchmarks",
          exampleOutput: "JSON: { marketShareGained: '14.5%', competitorFocus: 'AI-led dispatchers' }"
        }
      ],
      samplePrompts: [
        "What are the top three trends for this year?",
        "Benchmark our core metrics against industry standards.",
        "Synthesize a 12-month automation roadmap outline."
      ]
    };
    const updated = [...agents, freshAgent];
    onChangeAgents(updated);
    onSelectAgent(freshId);
    handleStartEdit(freshAgent);
  };

  const handleDeleteAgent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (agents.length <= 1) {
      alert("At least one agent must persist in the swarm!");
      return;
    }
    const updated = agents.filter(a => a.id !== id);
    onChangeAgents(updated);
    if (selectedAgentId === id) {
      onSelectAgent(updated[0].id);
    }
  };

  const handleUpdateTool = (index: number, field: keyof AgentTool, value: string) => {
    const updatedTools = editTools.map((t, idx) => {
      if (idx === index) {
        return { ...t, [field]: value };
      }
      return t;
    });
    setEditTools(updatedTools);
  };

  const handleAddTool = () => {
    const newTool: AgentTool = {
      name: "customAction",
      description: "Trigger a database run or analytical request",
      exampleOutput: "{ result: 'Simulated operation succeeded' }"
    };
    setEditTools([...editTools, newTool]);
  };

  const handleRemoveTool = (index: number) => {
    setEditTools(editTools.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <h2 className="font-sans text-sm font-medium text-slate-200">Active Squad</h2>
        </div>
        <button
          onClick={handleAddNewAgent}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-medium border border-blue-500/10 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom</span>
        </button>
      </div>

      {/* Agents lists cards */}
      <div className="space-y-2">
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          const bgColorsMap: Record<string, string> = {
            sky: "border-sky-500/30 hover:border-sky-500/50 bg-sky-500/5",
            emerald: "border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/5",
            amber: "border-amber-500/30 hover:border-amber-500/50 bg-amber-500/5",
            rose: "border-rose-500/30 hover:border-rose-500/50 bg-rose-500/5",
            indigo: "border-indigo-500/30 hover:border-indigo-500/50 bg-indigo-500/5",
            violet: "border-violet-500/30 hover:border-violet-500/50 bg-violet-500/5",
            orange: "border-orange-500/30 hover:border-orange-500/50 bg-orange-500/5",
            teal: "border-teal-500/30 hover:border-teal-500/50 bg-teal-500/5",
            fuchsia: "border-fuchsia-500/30 hover:border-fuchsia-500/50 bg-fuchsia-500/5"
          };
          const textColorsMap: Record<string, string> = {
            sky: "text-sky-400",
            emerald: "text-emerald-400",
            amber: "text-amber-400",
            rose: "text-rose-400",
            indigo: "text-indigo-400",
            violet: "text-violet-400",
            orange: "text-orange-400",
            teal: "text-teal-400",
            fuchsia: "text-fuchsia-400"
          };

          const textClass = textColorsMap[agent.color] || "text-blue-400";
          const borderClass = isSelected ? `border-2 border-${agent.color}-400/80` : (bgColorsMap[agent.color] || "border-slate-800 hover:border-slate-700");

          return (
            <div
              key={agent.id}
              onClick={() => {
                onSelectAgent(agent.id);
                setIsEditing(false); // Close edit if switching
              }}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 relative group flex gap-3 ${
                isSelected ? "bg-slate-900 border-2" : "bg-slate-900/30"
              }`}
            >
              {/* Avatar Emoji */}
              <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-slate-950/80 border border-slate-800 rounded-lg text-lg">
                {agent.avatar}
              </div>

              {/* Text metadata */}
              <div className="flex-1 space-y-0.5 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h4 className="font-sans text-xs font-semibold text-slate-100 truncate">{agent.name}</h4>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={(e) => handleDeleteAgent(agent.id, e)}
                      className="p-1 text-slate-500 hover:text-slate-350 hover:bg-slate-850 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 truncate font-sans">{agent.role}</p>
                
                {/* Micro Metrics Tags */}
                <div className="flex items-center gap-2 pt-1 font-mono text-[9px] text-slate-500">
                  <span className="flex items-center gap-0.5">
                    <Sliders className="w-2.5 h-2.5" /> Temp: {agent.temperature}
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-0.5">
                    <Wrench className="w-2.5 h-2.5" /> Tools: {agent.tools.length}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editing / Customizing details panel */}
      {selectedAgent && (
        <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3">
          {!isEditing ? (
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00E5FF]">System Instructions</span>
                <button
                  onClick={() => handleStartEdit(selectedAgent)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Edit Configuration
                </button>
              </div>

              <div className="max-h-[140px] overflow-y-auto pr-1 text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line bg-slate-950 p-2.5 rounded border border-slate-850">
                {selectedAgent.systemInstruction}
              </div>

              {selectedAgent.tools && selectedAgent.tools.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Simulated Tools ({selectedAgent.tools.length})</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgent.tools.map((t) => (
                      <div
                        key={t.name}
                        className="text-[10px] bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded flex items-center gap-1"
                        title={t.description}
                      >
                        <Wrench className="w-2.5 h-2.5 text-indigo-400" />
                        <span className="font-mono">{t.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-left">
              <h3 className="font-sans text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Confirm Agent Settings
              </h3>

              {/* Form elements */}
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Agent Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-slate-200 bg-slate-900 border border-slate-800 rounded p-2 text-xs focus:outline-none focus:border-blue-500/80"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Role Description</label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full text-slate-200 bg-slate-900 border border-slate-800 rounded p-2 text-xs focus:outline-none focus:border-blue-500/80"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">System Instructions</label>
                  <textarea
                    rows={4}
                    value={editSystemInstruction}
                    onChange={(e) => setEditSystemInstruction(e.target.value)}
                    className="w-full text-slate-200 bg-slate-900 border border-slate-800 rounded p-2 text-xs focus:outline-none focus:border-blue-500/80 resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-slate-400">Temperature (Creativity)</label>
                    <span className="font-mono text-[10px] text-blue-400">{editTemp}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.1"
                    value={editTemp}
                    onChange={(e) => setEditTemp(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 bg-slate-905 h-1 rounded"
                  />
                </div>

                {/* Edit Tools List */}
                <div className="space-y-2 border-t border-slate-800/80 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Action Tools</label>
                    <button
                      type="button"
                      onClick={handleAddTool}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-medium"
                    >
                      + New Tool
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {editTools.map((tool, index) => (
                      <div key={index} className="bg-slate-900/60 p-2 border border-slate-850 rounded text-left space-y-1.5">
                        <div className="flex justify-between items-center gap-1">
                          <input
                            type="text"
                            value={tool.name}
                            onChange={(e) => handleUpdateTool(index, "name", e.target.value)}
                            className="bg-slate-950 font-mono text-[10px] text-indigo-400 border border-slate-800 rounded p-1 w-2/3"
                            placeholder="camelCaseHandle"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveTool(index)}
                            className="text-red-400 hover:text-red-300 text-[10px]"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={tool.description}
                          onChange={(e) => handleUpdateTool(index, "description", e.target.value)}
                          className="bg-slate-950 text-[10px] text-slate-300 border border-slate-800 rounded p-1 w-full"
                          placeholder="Purpose / when to invoke"
                        />
                        <textarea
                          rows={1}
                          value={tool.exampleOutput}
                          onChange={(e) => handleUpdateTool(index, "exampleOutput", e.target.value)}
                          className="bg-slate-950 text-[9px] font-mono text-slate-400 border border-slate-800 rounded p-1 w-full"
                          placeholder="Simulated text/json output"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-100 font-medium py-1.5 rounded text-xs select-none cursor-pointer shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Commit Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3.5 rounded text-xs select-none cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
