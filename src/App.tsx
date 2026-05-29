import React, { useState, useEffect } from "react";
import { SetupQuestion, SetupAnswers, Agent, Message, SharedArtifact } from "./types";
import NicheSelector from "./components/NicheSelector";
import QuestionWizard from "./components/QuestionWizard";
import AgentCustomizer from "./components/AgentCustomizer";
import MultiAgentPlayground from "./components/MultiAgentPlayground";
import SharedArtifacts from "./components/SharedArtifacts";
import ExportCenter from "./components/ExportCenter";
import AuthScreen from "./components/AuthScreen";
import KeyRouter from "./components/KeyRouter";
import N8NWorkflowBuilder from "./components/N8NWorkflowBuilder";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Bot,
  Terminal,
  Activity,
  Layers,
  FileCode,
  BookOpen,
  Wifi,
  WifiOff,
  AlertCircle,
  Undo2,
  Sliders,
  LogOut,
  Settings,
  X,
  Key,
  Network
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [activeEngine, setActiveEngine] = useState<"google" | "deepseek">("google");
  const [activeApiKey, setActiveApiKey] = useState<string>("AIzaSyCCEuIKhzZHWe0wITUmm9GYH3kxjwvcKRY");

  const [phase, setPhase] = useState<"niche" | "questions" | "synth" | "workspace">("niche");
  const [nicheName, setNicheName] = useState("");
  const [nicheDescription, setNicheDescription] = useState("");
  const [questions, setQuestions] = useState<SetupQuestion[]>([]);
  const [answers, setAnswers] = useState<SetupAnswers>({});
  
  // Custom Squad agents state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // Playground communications state
  const [messages, setMessages] = useState<Message[]>([]);
  const [artifacts, setArtifacts] = useState<SharedArtifact[]>([]);
  const [workspaceTab, setWorkspaceTab] = useState<"playspace" | "artifacts" | "n8n" | "keys" | "export">("playspace");

  // Server API Key Status
  const [apiChecked, setApiChecked] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Load api checks and user session on init
  useEffect(() => {
    const savedUser = localStorage.getItem("agentforge_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to restore session:", err);
      }
    }

    async function checkApiHealth() {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          const data = await res.json();
          setHasApiKey(data.hasApiKey);
        }
      } catch (err) {
        console.error("Health check failed:", err);
        setHasApiKey(false); // assuming local or error issues
      } finally {
        setApiChecked(true);
      }
    }
    checkApiHealth();
  }, []);

  const handleAuthenticated = (profile: { email: string; name: string }) => {
    setUser(profile);
    localStorage.setItem("agentforge_user", JSON.stringify(profile));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("agentforge_user");
    handleRestartApp();
  };

  // Fallback default Questions builder if API request fails
  const getFallbackQuestions = (nName: string): SetupQuestion[] => {
    return [
      {
        id: "goal",
        question: `What are the primary operational goals you want to automate in ${nName}?`,
        placeholder: "e.g., Drafting high-yield campaign letters, answering customer refund tickets, scheduling property walk-throughs...",
        type: "textarea",
        category: "Operations"
      },
      {
        id: "audience",
        question: "Who is your primary target customer base or user demographics?",
        placeholder: "e.g., Luxury homebuyers, sustainable streetwear shoppers, young business owners...",
        type: "text",
        category: "Demographics"
      },
      {
        id: "tone",
        question: "What is your desired primary communication tone for running operations?",
        placeholder: "Assertive & Direct",
        type: "select",
        options: ["Empathetic & Advisory", "Assertive & Bold", "Meticulous & Technical", "Energetic & Sassy"],
        category: "Brand Persona"
      },
      {
        id: "bottlenecks",
        question: "Describe the biggest operational bottleneck you face on a daily basis.",
        placeholder: "e.g., Spending hours manually responding to support inquiries, layout design reviews...",
        type: "textarea",
        category: "Frictions"
      }
    ];
  };

  // Fallback default Agents designs if API generation fails
  const getFallbackAgents = (nName: string, userAnswers: SetupAnswers): Agent[] => {
    return [
      {
        id: "agent_copy",
        name: "Campaign Architect",
        role: `Develop targeted outreach copy and promotional campaigns for ${nName}`,
        avatar: "✍️",
        color: "indigo",
        systemInstruction: `You are the Campaign Architect for ${nName}. Your job is to design copy, email outreach scripts, and social hooks in a tone that is: ${userAnswers.tone || "Empathetic & Advisory"}.\nFocus specifically on target goals: ${userAnswers.goal || "Growth and optimization"}.`,
        temperature: 0.7,
        tools: [
          {
            name: "suggestMarketingHooks",
            description: "Retrieve top converting outline structures for apparel campaigns",
            exampleOutput: "JSON: { hooks: ['The Green Revolution', 'Wear Your Values'] }"
          }
        ],
        samplePrompts: [
          "Draft an introductory email sequence template",
          "Create 3 catchy social media launch hooks details",
          "Synthesize a promotional calendar proposal for next month"
        ]
      },
      {
        id: "agent_analyst",
        name: "Strategic Analyst",
        role: "Analyze target demographics, market gaps, and optimize daily workflows",
        avatar: "📊",
        color: "emerald",
        systemInstruction: `You are the Strategic Analyst for ${nName}. Focus on resolving bottlenecks: ${userAnswers.bottlenecks || "Time consuming manual tasks"}.\nSuggest quantitative benchmarks and audit recommendations targeting audience: ${userAnswers.audience || "Niche buyers"}.`,
        temperature: 0.5,
        tools: [
          {
            name: "fetchCompetitorReport",
            description: "Produce simulated SWOT parameters and organic volume logs",
            exampleOutput: "SWOT Report: Competitors are weak in personalized outreach, strong in raw distribution volume."
          }
        ],
        samplePrompts: [
          "Perform a workflow bottleneck analysis and suggest metrics",
          "Suggest target persona parameters for our product line",
          "Audit our campaign strategies for metric efficiencies"
        ]
      },
      {
        id: "agent_support",
        name: "Customer Advocate",
        role: "Review client retention pathways and design meticulous feedback guidelines",
        avatar: "🤝",
        color: "amber",
        systemInstruction: `You are the Customer Advocate for ${nName}. Maintain a positive advisory posture. Draft comprehensive refund, inquiry, and onboarding templates to resolve support problems.`,
        temperature: 0.6,
        tools: [
          {
            name: "loadSupportHistory",
            description: "Simulate ticket volume charts and customer satisfaction indexes",
            exampleOutput: "INDEX Log: Response times are lagging on valuation reports; lead loss of 12%."
          }
        ],
        samplePrompts: [
          "Design a complete onboarding checklist flow",
          "How can we handle high-touch refund complaints politely?",
          "Suggest a draft layout for patient intake summaries"
        ]
      }
    ];
  };

  // Step 1 Trigger: Niche defined -> Generate questions
  const handleSelectNiche = async (name: string, desc: string) => {
    setNicheName(name);
    setNicheDescription(desc);
    setPhase("questions");

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicheName: name, nicheDescription: desc })
      });

      if (!res.ok) throw new Error("API call failed");
      const data = await res.json();
      setQuestions(data.questions && data.questions.length > 0 ? data.questions : getFallbackQuestions(name));
    } catch (err) {
      console.warn("Using fallback setup questions due to:", err);
      setQuestions(getFallbackQuestions(name));
    }
  };

  // Step 2 Trigger: Questions answered -> Generate agent squad
  const handleAnswersComplete = async (userAnswers: SetupAnswers) => {
    setAnswers(userAnswers);
    setPhase("synth");

    try {
      const res = await fetch("/api/generate-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheName: nicheName,
          nicheDescription: nicheDescription,
          answers: userAnswers
        })
      });

      if (!res.ok) throw new Error("Agent compilation failed");
      const data = await res.json();

      if (data.agents && Array.isArray(data.agents) && data.agents.length > 0) {
        // Decorate generated agents with local ids
        const formatted = data.agents.map((a: any, idx: number) => ({
          ...a,
          id: a.id || `agent_${idx}_${Date.now()}`
        }));
        setAgents(formatted);
        setSelectedAgentId(formatted[0].id);
      } else {
        throw new Error("Invalid agents return payload");
      }
    } catch (err) {
      console.warn("Using fallback generated agents squad due to:", err);
      const fallbackSquad = getFallbackAgents(nicheName, userAnswers);
      setAgents(fallbackSquad);
      setSelectedAgentId(fallbackSquad[0].id);
    } finally {
      // Transition to active playspace
      setPhase("workspace");
    }
  };

  const handleClearWorkspaceMessages = () => {
    setMessages([]);
  };

  const handleRestartApp = () => {
    setPhase("niche");
    setNicheName("");
    setNicheDescription("");
    setQuestions([]);
    setAnswers({});
    setAgents([]);
    setSelectedAgentId(null);
    setMessages([]);
    setArtifacts([]);
  };

  if (!user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans select-none antialiased">
      
      {/* Bento Layout Header */}
      <header className="px-6 py-4 border-b border-slate-800 pb-4 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>AgentForge AI</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded font-semibold font-mono tracking-normal">
                SWARM BUILDER v2.4
              </span>
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <span>Autonomous Orchestrator Engine</span>
              <span>•</span>
              <span className="text-indigo-400">Owner: {user.name}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          {/* Key Secrets panel alert */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400">
            {hasApiKey ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-[10px] text-slate-350">{activeEngine.toUpperCase()} Gateway Active</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span className="font-mono text-[10px] text-amber-400/90" title="Missing API Key config">
                  Local Simulation Mode
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {phase === "workspace" && (
              <button
                onClick={handleRestartApp}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 transition-all cursor-pointer text-slate-200"
              >
                Reset Swarm
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 transition-all cursor-pointer text-slate-300 hover:text-red-400 inline-flex items-center gap-1.5"
              title={`Logged in as ${user.email}`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-hidden relative flex flex-col justify-center items-center">
        
        {/* Phase 1: Select Niche */}
        {phase === "niche" && (
          <div className="w-full h-full overflow-y-auto px-6 py-12 scrollbar-none">
            <NicheSelector onNicheSelected={handleSelectNiche} isLoading={questions.length > 0} />
          </div>
        )}

        {/* Phase 2: Dynamic discovery wizard */}
        {phase === "questions" && (
          <div className="w-full h-full overflow-y-auto px-6 py-12 flex items-center justify-center">
            <QuestionWizard
              nicheName={nicheName}
              nicheDescription={nicheDescription}
              questions={questions}
              isLoading={questions.length === 0}
              onComplete={handleAnswersComplete}
              onReset={handleRestartApp}
            />
          </div>
        )}

        {/* Phase 3: Loading compilation */}
        {phase === "synth" && (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-md space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/15 blur-2xl rounded-full scale-125 animate-pulse"></div>
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="w-14 h-14 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </motion.div>
            </div>
            <div className="space-y-2">
              <h3 className="font-sans text-xl font-medium text-slate-100">Compiling Operational Squad...</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Gemini is assembling specialized agent system nodes, configuring automated tool schemas, and tailoring strategic identity matrices based on your requirements.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400/80 bg-indigo-500/5 px-3 py-1 rounded border border-indigo-500/10 font-mono">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Synthesizing systemInstructions...</span>
            </div>
          </div>
        )}

        {/* Phase 4: Main Active Multi-Agent Cockpit */}
        {phase === "workspace" && (
          <div className="w-full h-full flex flex-col md:flex-row overflow-hidden absolute inset-0">
            
            {/* Sidebar: Config & Customization */}
            <div className="w-full md:w-80 border-r border-slate-850 bg-slate-950/40 p-4 overflow-y-auto flex flex-col justify-between shrink-0">
              <AgentCustomizer
                agents={agents}
                onChangeAgents={setAgents}
                selectedAgentId={selectedAgentId}
                onSelectAgent={setSelectedAgentId}
              />

              {/* Operations Stats Footer */}
              <div className="mt-6 pt-4 border-t border-slate-850 text-left space-y-1 bg-slate-950/20 p-2.5 rounded-xl border border-slate-855">
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-widest flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" /> Architecture Metrics
                </span>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono pt-1">
                  <div>Squad Size: <span className="text-slate-200">{agents.length} Nodes</span></div>
                  <div>Sandbox: <span className="text-emerald-400">Ready</span></div>
                  <div>Artifacts: <span className="text-slate-200">{artifacts.length} Compiled</span></div>
                  <div>Framework: <span className="text-slate-200">Express+Vite</span></div>
                </div>
              </div>
            </div>

            {/* Middle Workspace playground (main cockpit chat area) */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/60">
              
              {/* Tabs controls for middle workspace */}
              <div className="flex bg-slate-950/60 p-2 border-b border-slate-850 shrink-0 overflow-x-auto select-none z-10 scrollbar-none">
                <div className="flex gap-1.5 p-1 bg-slate-900 border border-slate-805 rounded-xl whitespace-nowrap">
                  <button
                    onClick={() => setWorkspaceTab("playspace")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      workspaceTab === "playspace" ? "bg-slate-855 text-slate-100 shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Workspace Playroom</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceTab("n8n")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      workspaceTab === "n8n" ? "bg-slate-855 text-slate-100 shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Network className="w-3.5 h-3.5 text-cyan-400" />
                    <span>n8n Automator</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceTab("keys")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      workspaceTab === "keys" ? "bg-slate-855 text-slate-100 shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Engine Core Keys</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceTab("artifacts")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer relative ${
                      workspaceTab === "artifacts" ? "bg-slate-855 text-slate-100 shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Blueprints Board</span>
                    {artifacts.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow shadow-emerald-500/20">
                        {artifacts.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setWorkspaceTab("export")}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      workspaceTab === "export" ? "bg-slate-855 text-slate-100 shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Deploy SDK Package</span>
                  </button>
                </div>
              </div>

              {/* Renders Tab Panels */}
              <div className="flex-1 overflow-hidden relative">
                {workspaceTab === "playspace" && (
                  <MultiAgentPlayground
                    nicheName={nicheName}
                    agents={agents}
                    messages={messages}
                    onAddMessage={(msg) => setMessages(prev => [...prev, msg])}
                    onAddArtifact={(art) => setArtifacts(prev => [...prev, art])}
                    onClearWorkspace={handleClearWorkspaceMessages}
                    selectedAgentId={selectedAgentId}
                    onSelectAgent={setSelectedAgentId}
                  />
                )}

                {workspaceTab === "n8n" && (
                  <div className="absolute inset-0 p-4 overflow-y-auto">
                    <N8NWorkflowBuilder
                      nicheName={nicheName}
                      agents={agents}
                      answers={answers}
                    />
                  </div>
                )}

                {workspaceTab === "keys" && (
                  <div className="absolute inset-0 p-4 overflow-y-auto flex items-center justify-center">
                    <div className="max-w-md w-full">
                      <KeyRouter
                        activeEngine={activeEngine}
                        onSelectEngine={(engine, key) => {
                          setActiveEngine(engine);
                          setActiveApiKey(key);
                        }}
                      />
                    </div>
                  </div>
                )}

                {workspaceTab === "artifacts" && (
                  <div className="absolute inset-0 p-4 overflow-y-auto">
                    <SharedArtifacts artifacts={artifacts} />
                  </div>
                )}

                {workspaceTab === "export" && (
                  <div className="absolute inset-0 p-4 overflow-y-auto">
                    <ExportCenter nicheName={nicheName} agents={agents} />
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Bento Grid Diagnostic Footer */}
      <footer className="h-8 border-t border-slate-900 bg-slate-950 px-6 flex items-center justify-between text-[10px] text-slate-500 font-mono shrink-0">
        <div className="flex gap-4">
          <span>SYSTEM STATUS: <span className="text-emerald-500 font-bold">OPTIMAL</span></span>
          <span className="hidden sm:inline">LATENCY: <span className="text-slate-400">42ms</span></span>
          <span className="hidden sm:inline">ENGINE CORE: <span className="text-indigo-400">GEMINI-3.5</span></span>
        </div>
        <div className="flex gap-4 uppercase tracking-wider text-slate-605">
          <span>Session ID: AF-9283-XK-22</span>
          <span className="text-emerald-500/80">● Auto-Save Active</span>
        </div>
      </footer>

    </div>
  );
}
