import React, { useState } from "react";
import { Agent } from "../types";
import { Copy, Check, Terminal, FileCode, Sliders, ChevronRight, AlertCircle } from "lucide-react";

interface ExportCenterProps {
  nicheName: string;
  agents: Agent[];
  onClose?: () => void;
}

export default function ExportCenter({ nicheName, agents, onClose }: ExportCenterProps) {
  const [activeTab, setActiveTab] = useState<"ts" | "json">("ts");
  const [copied, setCopied] = useState(false);

  // Generate customized Google GenAI Node.js TS implementation code block
  const generateTsCode = () => {
    const serializedAgents = agents.map(a => ({
      name: a.name,
      role: a.role,
      systemInstruction: a.systemInstruction,
      temperature: a.temperature,
      tools: a.tools
    }));

    return `/**
 * Automated AI Agent Swarm Execution Script
 * Niche Target: ${nicheName}
 * Compiled Engine: @google/genai (v2.4.0+)
 */

import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client with standard AI Studio Build header mapping
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Compiled Agent Architectures
const agents = ${JSON.stringify(serializedAgents, null, 2)};

/**
 * Handle individual agent chat turns
 */
export async function runAgentConversation(agentIndex: number, userPrompt: string, history: any[] = []) {
  const agent = agents[agentIndex];
  
  // Combine System instructions & operational tools guide
  const systemInstruction = \`
    You are \${agent.name}, whose role is: \${agent.role}.
    
    SYSTEM DIRECTIVES:
    \${agent.systemInstruction}
    
    SIMULATED ACTIONS/TOOLS:
    \${JSON.stringify(agent.tools)}
  \`;

  // Format message payload for Google GenAI models
  const contents = [
    ...history,
    { role: "user", parts: [{ text: userPrompt }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: agent.temperature
      }
    });

    console.log(\`[\${agent.name}]:\`, response.text);
    return response.text;
  } catch (error) {
    console.error(\`Failed executing turn for \${agent.name}:\`, error);
    throw error;
  }
}

/**
 * Orchestrate full squad sequential swarm execution
 */
export async function executeAutomatedSwarm(task: string) {
  let conversationHistory = \`Task scope: "\${task}"\\n\\n\`;
  
  console.log("🚀 Initializing Swarm Operations on:", task);

  for (let round = 1; round <= 2; round++) {
    console.log(\`\\n--- Swarm Round \${round} ---\`);

    for (let i = 0; i < agents.length; i++) {
      const activeAgent = agents[i];
      const swarmInstruction = \`
        You are in a collaborative swarm workspace.
        Mission Goals: "\${task}".
        
        SQUAD COHORT:
        \${agents.map(a => a.name).join(", ")}
        
        YOUR ROLE: \${activeAgent.role}
        YOUR SYSTEM DIRECTIVES:
        \${activeAgent.systemInstruction}

        HISTORIC CHAT LOGS AND DEBATE STEPS:
        \${conversationHistory}
        
        Provide your expert feedback or summary turn contribution cleanly based on your character role profiles.
      \`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Apply collaborative feedback step contributions now.",
        config: {
          systemInstruction: swarmInstruction,
          temperature: activeAgent.temperature
        }
      });

      const speech = response.text || "";
      console.log(\`[SPEAKING Turn] \${activeAgent.name}: \${speech.slice(0, 80)}...\`);
      
      conversationHistory += \`\${activeAgent.name}: \${speech}\\n\\n\`;
    }
  }

  console.log("\\n🌟 Swarm Orchestration completed successfully!");
  return conversationHistory;
}
`;
  };

  const getCodeStr = () => {
    if (activeTab === "ts") {
      return generateTsCode();
    }
    return JSON.stringify(agents, null, 2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeStr());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col text-left">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-850 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <div>
            <h3 className="font-sans text-sm font-semibold text-slate-100">Export Center</h3>
            <span className="text-[10px] text-slate-400">Deploy your customized multi-agent squad</span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-450 hover:text-slate-200 cursor-pointer"
          >
            Close View
          </button>
        )}
      </div>

      {/* Tabs list switches */}
      <div className="px-5 py-3 border-b border-slate-850 bg-slate-950/20 flex items-center justify-between">
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-805 text-xs text-slate-450 font-medium">
          <button
            onClick={() => setActiveTab("ts")}
            className={`px-3 py-1 rounded transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === "ts" ? "bg-slate-800 text-slate-100" : "hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Node.js Code (GenAI SDK)</span>
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`px-3 py-1 rounded transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === "json" ? "bg-slate-800 text-slate-100" : "hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>JSON Spec configuration</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="text-xs text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all select-none cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text Panel */}
      <div className="flex-1 overflow-auto p-4 bg-slate-950">
        <pre className="text-[11px] font-mono leading-relaxed text-slate-300 select-all font-medium whitespace-pre">
          {getCodeStr()}
        </pre>
      </div>

      {/* Warning Tip */}
      <div className="p-4 border-t border-slate-850 bg-slate-950/30 flex items-start gap-2 text-slate-400 text-[10.5px] leading-relaxed">
        <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p>
          This boilerplate implementation utilizes the modern <span className="font-mono text-slate-300">@google/genai</span> Node.js package directly. Verify you run <span className="font-mono text-slate-300">npm i @google/genai</span> first. Configure your <span className="font-mono text-slate-300">GEMINI_API_KEY</span> securely on your deployment host environment.
        </p>
      </div>
    </div>
  );
}
