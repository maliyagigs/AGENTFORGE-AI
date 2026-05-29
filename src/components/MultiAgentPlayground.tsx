import React, { useState, useRef, useEffect } from "react";
import { Agent, Message, MessagePart, SharedArtifact } from "../types";
import {
  Send,
  Sparkles,
  Bot,
  Play,
  RotateCcw,
  SkipForward,
  Pause,
  AlertCircle,
  TrendingUp,
  Cpu,
  Layers,
  Wrench,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MultiAgentPlaygroundProps {
  nicheName: string;
  agents: Agent[];
  messages: Message[];
  onAddMessage: (msg: Message) => void;
  onAddArtifact: (art: SharedArtifact) => void;
  onClearWorkspace: () => void;
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
}

export default function MultiAgentPlayground({
  nicheName,
  agents,
  messages,
  onAddMessage,
  onAddArtifact,
  onClearWorkspace,
  selectedAgentId,
  onSelectAgent
}: MultiAgentPlaygroundProps) {
  const [mode, setMode] = useState<"solo" | "swarm">("solo");
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activePromptIndex, setActivePromptIndex] = useState<number | null>(null);

  // Swarm specific states
  const [swarmTask, setSwarmTask] = useState("");
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  const [swarmSpeakerIndex, setSwarmSpeakerIndex] = useState(0);
  const [swarmRound, setSwarmRound] = useState(1);
  const [maxSwarmRounds] = useState(4); // limit sequence max turns to be clean

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Color mapper helper
  const getColorClasses = (colorName: string) => {
    const maps: Record<string, { border: string, bg: string, text: string, textAccent: string, glow: string }> = {
      sky: { border: "border-sky-500/30", bg: "bg-sky-950/20", text: "text-sky-300", textAccent: "text-sky-400", glow: "shadow-sky-500/10" },
      emerald: { border: "border-emerald-500/30", bg: "bg-emerald-950/20", text: "text-emerald-300", textAccent: "text-emerald-400", glow: "shadow-emerald-500/10" },
      amber: { border: "border-amber-500/30", bg: "bg-amber-950/20", text: "text-amber-300", textAccent: "text-amber-400", glow: "shadow-amber-500/10" },
      rose: { border: "border-rose-500/30", bg: "bg-rose-950/20", text: "text-rose-300", textAccent: "text-rose-400", glow: "shadow-rose-500/10" },
      indigo: { border: "border-indigo-500/30", bg: "bg-indigo-950/20", text: "text-indigo-300", textAccent: "text-indigo-400", glow: "shadow-indigo-500/10" },
      violet: { border: "border-violet-500/30", bg: "bg-violet-950/20", text: "text-violet-300", textAccent: "text-violet-400", glow: "shadow-violet-500/10" },
      orange: { border: "border-orange-500/30", bg: "bg-orange-950/20", text: "text-orange-300", textAccent: "text-orange-400", glow: "shadow-orange-500/10" },
      teal: { border: "border-teal-500/30", bg: "bg-teal-950/20", text: "text-teal-300", textAccent: "text-teal-400", glow: "shadow-teal-500/10" },
      fuchsia: { border: "border-fuchsia-500/30", bg: "bg-fuchsia-950/20", text: "text-fuchsia-300", textAccent: "text-fuchsia-400", glow: "shadow-fuchsia-500/10" }
    };
    return maps[colorName] || maps.sky;
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Post single agent chat
  const handleSendSoloMessage = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt || userInput;
    if (!promptToSend.trim() || isLoading) return;

    // 1. Add user message
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: "user",
      senderName: "Operations Manager",
      senderAvatar: "💼",
      senderColor: "slate",
      parts: [{ type: "text", text: promptToSend }],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onAddMessage(userMsg);
    setUserInput("");
    setIsLoading(true);

    try {
      // 2. Fetch API route
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: selectedAgent,
          messageHistory: messages,
          userPrompt: promptToSend
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const resData = await response.json();

      // Assemble reply parts to demonstrate tools
      const parts: MessagePart[] = [{ type: "text", text: resData.text }];
      if (resData.toolCall) {
        parts.push({
          type: "tool_call",
          toolCall: resData.toolCall
        });
      }
      if (resData.toolResponse) {
        parts.push({
          type: "tool_response",
          toolResponse: resData.toolResponse
        });
      }

      // Add agent message
      const agentMsg: Message = {
        id: `msg_resp_${Date.now()}`,
        senderId: selectedAgent.id,
        senderName: selectedAgent.name,
        senderAvatar: selectedAgent.avatar,
        senderColor: selectedAgent.color,
        parts: parts,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onAddMessage(agentMsg);

    } catch (err: any) {
      console.error(err);
      onAddMessage({
        id: `msg_err_${Date.now()}`,
        senderId: "system",
        senderName: "System Controller",
        senderAvatar: "⚠️",
        senderColor: "red",
        parts: [{ type: "text", text: `Error executing chat: ${err.message || err}. Ensure your GEMINI_API_KEY is configured in the Secrets panel.` }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Swarm operations step turn
  const runSwarmSingleStep = async () => {
    if (isLoading || agents.length === 0) return;
    setIsLoading(true);

    const speakerIndex = swarmSpeakerIndex;
    const currentAgent = agents[speakerIndex % agents.length];

    try {
      const response = await fetch("/api/swarm/execute-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: swarmTask,
          agentsList: agents,
          conversationHistory: messages,
          currentAgentIndex: speakerIndex
        })
      });

      if (!response.ok) throw new Error(await response.text());
      const resData = await response.json();

      // Add agent turn message
      const swarmMsg: Message = {
        id: `msg_swarm_${Date.now()}`,
        senderId: resData.agentId,
        senderName: resData.agentName,
        senderAvatar: resData.agentAvatar,
        senderColor: resData.agentColor,
        parts: [{ type: "text", text: resData.text }],
        round: swarmRound,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onAddMessage(swarmMsg);

      // Save shared artifact if returned
      if (resData.artifact) {
        onAddArtifact(resData.artifact);
      }

      // Shift index forward
      const nextSpeakerIdx = (speakerIndex + 1) % agents.length;
      setSwarmSpeakerIndex(nextSpeakerIdx);

      // Progress rounds tracker
      if (nextSpeakerIdx === 0) {
        setSwarmRound(prev => prev + 1);
        if (swarmRound >= maxSwarmRounds) {
          setIsSwarmRunning(false); // Finished sequence
          onAddMessage({
            id: `msg_end_${Date.now()}`,
            senderId: "system",
            senderName: "Squad Coordinator",
            senderAvatar: "🎯",
            senderColor: "slate",
            parts: [{ type: "text", text: "Successfully completed collaborative sprint orchestration loop! Review the output summaries and artifacts." }],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      }

    } catch (err: any) {
      console.error(err);
      onAddMessage({
        id: `msg_err_${Date.now()}`,
        senderId: "system",
        senderName: "Orchestration Supervisor",
        senderAvatar: "⚠️",
        senderColor: "red",
        parts: [{ type: "text", text: `Swarm turn failed: ${err.message || err}` }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setIsSwarmRunning(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Swarm auto sequence tracker
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSwarmRunning && !isLoading) {
      // Trigger next step automatically after a neat brief timeout (e.g. 1500ms) to give simulated pipeline feel
      timer = setTimeout(() => {
        runSwarmSingleStep();
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [isSwarmRunning, isLoading]);

  const handleStartSwarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swarmTask.trim() || agents.length === 0) return;

    // Clear workspace & inject prompt
    onClearWorkspace();
    setSwarmSpeakerIndex(0);
    setSwarmRound(1);
    
    const startMsg: Message = {
      id: `msg_start_${Date.now()}`,
      senderId: "user",
      senderName: "Operations Manager",
      senderAvatar: "💼",
      senderColor: "slate",
      parts: [{ type: "text", text: `🚀 KICK-OFF TARGET OPERATIONS MISSION:\n"${swarmTask}"` }],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onAddMessage(startMsg);
    setIsSwarmRunning(true);
  };

  const handleResetWorkspace = () => {
    onClearWorkspace();
    setIsSwarmRunning(false);
    setSwarmTask("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-left">
      
      {/* Bento Header & Switch Modes */}
      <div className="bg-slate-800/20 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">Agent Swarm Simulation</span>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => {
              setMode("solo");
              setIsSwarmRunning(false);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === "solo"
                ? "bg-indigo-600 text-slate-100 font-bold shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Solo Agent Console
          </button>
          <button
            onClick={() => {
              setMode("swarm");
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === "swarm"
                ? "bg-indigo-600 text-slate-100 font-bold shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Multi-Agent Swarm
          </button>
        </div>
      </div>

      {mode === "swarm" && (
        <div className="bg-slate-950/60 p-4 border-b border-slate-850 text-left space-y-3">
          <form onSubmit={handleStartSwarm} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Conduct a website audit, Design an apparel collection promotion strategy..."
              value={swarmTask}
              onChange={(e) => setSwarmTask(e.target.value)}
              className="flex-1 bg-slate-900/40 border border-slate-800 placeholder-slate-500 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-100"
              disabled={isSwarmRunning}
            />
            <button
              type="submit"
              disabled={isSwarmRunning || !swarmTask.trim() || isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 border border-indigo-400/20 text-slate-100 text-xs font-medium inline-flex items-center gap-1.5 shadow hover:shadow-indigo-500/10 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Launch Swarm</span>
            </button>
          </form>

          {/* Stepping controls */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-sans">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                Round: <span className="font-mono font-bold text-slate-200">{swarmRound} / {maxSwarmRounds}</span>
              </span>
              <span>|</span>
              <span className="truncate max-w-[210px]">
                Active Speaker:{" "}
                <span className="font-bold text-slate-200">
                  {agents[swarmSpeakerIndex % agents.length]?.name || "None"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSwarmRunning(p => !p)}
                disabled={!swarmTask.trim() || isLoading}
                className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isSwarmRunning ? (
                  <>
                    <Pause className="w-3 h-3 text-amber-400" /> <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-emerald-400" /> <span>Resume Auto</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={runSwarmSingleStep}
                disabled={isSwarmRunning || !swarmTask.trim() || isLoading}
                className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <SkipForward className="w-3 h-3" />
                <span>Trigger Next Turn</span>
              </button>

              <button
                type="button"
                onClick={handleResetWorkspace}
                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                title="Clear Swarm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Messages Board */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 text-slate-500">
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-850/60 inline-flex">
              <Bot className="w-8 h-8 text-indigo-400/50" />
            </div>
            <div className="space-y-1.5">
              <p className="text-slate-350 text-sm font-medium">Playspace Sandbox is Ready</p>
              <p className="text-slate-500 text-xs max-w-sm">
                {mode === "solo"
                  ? `Select an agent from the left and type your goals below, or click any pre-generated sample prompts.`
                  : "Draft a collaborative mission prompt above and click 'Launch Swarm' to watch our specialist squad build the blueprint step-by-step."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isUser = msg.senderId === "user";
              const isSystem = msg.senderId === "system";
              const styles = getColorClasses(msg.senderColor);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-left ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-lg text-lg shadow-sm">
                      {msg.senderAvatar}
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-1 ${isUser ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[10px] font-semibold text-slate-350">{msg.senderName}</span>
                      <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                      {msg.round && (
                        <span className="text-[9px] bg-slate-805 text-indigo-400 px-1 py-0.2 rounded">
                          Turn {msg.round}
                        </span>
                      )}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-[12.5px] leading-relaxed transition-all shadow-sm ${
                        isUser
                          ? "bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700/80"
                          : isSystem
                          ? "bg-slate-950/60 border border-slate-850 text-slate-400"
                          : `bg-slate-950/40 border ${styles.border} ${styles.glow} text-slate-200 rounded-tl-none`
                      }`}
                    >
                      {msg.parts.map((p, pIdx) => {
                        if (p.type === "text") {
                          return (
                            <p key={pIdx} className="whitespace-pre-line font-sans">
                              {p.text}
                            </p>
                          );
                        }

                        if (p.type === "tool_call") {
                          return (
                            <div key={pIdx} className="mt-2.5 p-2 bg-slate-950 border border-indigo-500/20 rounded-lg space-y-1">
                              <span className="text-[9.5px] font-mono text-indigo-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                                <Wrench className="w-3 h-3 animate-spin text-indigo-400" />
                                Tool Request Triggered
                              </span>
                              <div className="text-[10px] font-mono text-slate-350 bg-slate-900/60 p-1.5 rounded border border-slate-850">
                                {p.toolCall?.name}({JSON.stringify(p.toolCall?.args || {})})
                              </div>
                            </div>
                          );
                        }

                        if (p.type === "tool_response") {
                          return (
                            <div key={pIdx} className="mt-2.5 p-2 bg-slate-950 border border-emerald-500/20 rounded-lg space-y-1">
                              <span className="text-[9.5px] font-mono text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-400" />
                                Simulated Response Recovered
                              </span>
                              <div className="text-[9.5px] font-mono text-slate-400 bg-slate-900/60 p-1.5 rounded border border-slate-850 max-h-[100px] overflow-y-auto whitespace-pre-wrap">
                                {p.toolResponse?.output}
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg text-lg shadow-sm">
                      {msg.senderAvatar}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Speech Loading waveform indicator */}
        {isLoading && (
          <div className="flex gap-3 text-left justify-start items-start">
            <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-slate-950 border border-slate-850 rounded-lg">
              <span className="w-3 h-3 bg-indigo-500 rounded-full animate-ping"></span>
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-semibold text-slate-350">
                {mode === "solo" ? selectedAgent.name : agents[swarmSpeakerIndex % agents.length]?.name} thinking...
              </span>
              
              {/* Media Voice visualization bar simulation */}
              <div className="flex items-center gap-1 py-1 h-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#00E5FF] rounded-full"
                    style={{
                      height: `${Math.floor(Math.random() * 20) + 6}px`,
                      animation: `bounce 0.8s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.12}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Action Controller bottom inputs */}
      {mode === "solo" && (
        <div className="p-4 bg-slate-950/40 border-t border-slate-850 space-y-3">
          {/* Suggested quick chips */}
          <div className="text-left space-y-1">
            <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">Sample Queries</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedAgent?.samplePrompts?.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleSendSoloMessage(prompt);
                    setActivePromptIndex(idx);
                  }}
                  className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-slate-100 border border-slate-800 px-2.5 py-1 text-left rounded-lg transition-transform hover:-translate-y-0.2 select-none cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 border border-[#1E293B] rounded-2xl p-2 flex gap-2">
            <input
              type="text"
              placeholder={`Send instructions to ${selectedAgent?.name || "agent"}...`}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendSoloMessage()}
              className="flex-1 bg-transparent px-3 text-sm text-slate-250 placeholder-slate-600 focus:outline-none focus:ring-0"
              disabled={isLoading}
            />

            <button
              onClick={() => handleSendSoloMessage()}
              disabled={!userInput.trim() || isLoading}
              className="w-10 h-10 bg-slate-800 hover:bg-indigo-600 active:scale-95 text-slate-200 hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bounce CSS keyframes inject style tag */}
      <style>{`
        @keyframes bounce {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.3); }
        }
      `}</style>

    </div>
  );
}
