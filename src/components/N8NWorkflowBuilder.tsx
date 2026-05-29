import React, { useState } from "react";
import { Agent, SetupAnswers } from "../types";
import { Network, Zap, Check, ArrowRight, Clipboard, HelpCircle, Save, Layers, Play, Settings, Terminal, AlertCircle } from "lucide-react";

interface N8NWorkflowBuilderProps {
  nicheName: string;
  agents: Agent[];
  answers: SetupAnswers;
}

export default function N8NWorkflowBuilder({ nicheName, agents, answers }: N8NWorkflowBuilderProps) {
  const [triggerType, setTriggerType] = useState<"webhook" | "cron" | "gmail">("webhook");
  const [outputType, setOutputType] = useState<"discord" | "sheets" | "external">("discord");
  const [apiGateway, setApiGateway] = useState<"deepseek" | "google">("google");
  const [copied, setCopied] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string>("trigger");

  const generateN8NJson = () => {
    const formattedAgents = agents.map((a, idx) => ({
      name: a.name,
      role: a.role,
      prompt: a.systemInstruction,
      temperature: a.temperature
    }));

    const triggerNodeSpec = {
      parameters: triggerType === "webhook" ? {
        path: "agentforge-swarm-trigger",
        options: {},
        httpMethod: "POST",
        responseMode: "lastNode"
      } : triggerType === "cron" ? {
        triggerTimes: {
          item: [{ mode: "everyHour" }]
        }
      } : {
        pollTimes: { item: [{ mode: "everyMinute" }] },
        mailbox: "INBOX"
      },
      id: "node-trigger-id",
      name: triggerType === "webhook" ? "Webhook Entry API" : triggerType === "cron" ? "Scheduled Swarm Cron" : "Gmail Inbox Poller",
      type: triggerType === "webhook" ? "n8n-nodes-base.webhook" : triggerType === "cron" ? "n8n-nodes-base.cron" : "n8n-nodes-base.gmail",
      typeVersion: 1,
      position: [250, 300]
    };

    const agentAIsJson = formattedAgents.map((agent, index) => ({
      parameters: {
        modelId: apiGateway === "google" ? "gemini-3.5-flash" : "deepseek-r1-pro",
        options: {
          temperature: agent.temperature,
          systemInstruction: agent.prompt
        },
        prompt: `Execute swarm role contribution for: "${nicheName}". Trigger text input: {{$json.body.message || $json.text}}`
      },
      id: `node-agent-${index}`,
      name: `${agent.name.replace(/\s+/g, "_")}_BrainNode`,
      type: "n8n-nodes-base.aggregateModelCall",
      typeVersion: 1,
      position: [480 + (index * 200), 300]
    }));

    const outputNodeSpec = {
      parameters: outputType === "discord" ? {
        webhookUri: "https://discord.com/api/webhooks/your-private-room-slug",
        content: `**[AgentForge AI - Swarm Success]**\n\n🎯 Niche Target: ${nicheName}\n⚡ Brain Nodes orchestrated successfully. Output payload attached format.`,
        embeds: [
          {
            title: "Automated Report Output",
            description: "AgentForge Swarm outputs sent via secure n8n automation pipeline."
          }
        ]
      } : outputType === "sheets" ? {
        operation: "append",
        sheetId: "your-google-sheet-unique-id",
        range: "A:D",
        options: {}
      } : {
        url: "https://api.yourcompany.com/v4/receiver",
        method: "POST",
        sendHeaders: true,
        headerParameters: {
          item: [{ name: "Authorization", value: "Bearer sk-custom-secure-token" }]
        }
      },
      id: "node-endpoint-output",
      name: outputType === "discord" ? "Discord Alert Webhook" : outputType === " sheets" ? "Google Sheets Log Row" : "External REST Endpoints",
      type: outputType === "discord" ? "n8n-nodes-base.discord" : outputType === "sheets" ? "n8n-nodes-base.googleSheets" : "n8n-nodes-base.httpRequest",
      typeVersion: 1,
      position: [1100, 300]
    };

    // Full orchestration manifest
    const manifest = {
      nodes: [
        triggerNodeSpec,
        ...agentAIsJson,
        outputNodeSpec
      ],
      connections: {
        [triggerNodeSpec.name]: {
          main: [
            [
              {
                node: agentAIsJson[0].name,
                type: "main",
                index: 0
              }
            ]
          ]
        },
        ...agentAIsJson.reduce((acc, curr, idx) => {
          const nextNodeName = idx < agentAIsJson.length - 1 ? agentAIsJson[idx + 1].name : outputNodeSpec.name;
          acc[curr.name] = {
            main: [
              [
                {
                  node: nextNodeName,
                  type: "main",
                  index: 0
                }
              ]
            ]
          };
          return acc;
        }, {} as any)
      },
      active: true,
      settings: {
        executionTimeout: 240
      }
    };

    return JSON.stringify(manifest, null, 2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateN8NJson());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="n8n-builder-panel" className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col text-left">
      {/* Mini-Glow top */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-slate-850 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-sans text-sm font-semibold text-slate-100">n8n Automated Workflow Builder</h3>
            <span className="text-[10px] text-slate-400">Instantly generate copy-paste pipelines with premium trigger-to-endpoint nodes</span>
          </div>
        </div>
        <span className="text-xs px-2.5 py-0.5 bg-cyan-500/10 text-[#00E5FF] border border-cyan-500/20 rounded-full font-bold uppercase tracking-wider">
          n8n Native Code
        </span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left column config preferences */}
        <div className="lg:col-span-5 p-5 border-r border-slate-850 bg-slate-950/20 overflow-y-auto space-y-5">
          <h4 className="text-xs font-bold text-slate-350 uppercase tracking-widest">Automation Preferences</h4>

          {/* Core Trigger Event Type */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] uppercase font-bold text-slate-450 block">1. Select Trigger Input Node</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTriggerType("webhook")}
                className={`py-2 px-3 text-xs rounded-xl border font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  triggerType === "webhook"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-slate-950/80 hover:bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-705"
                }`}
              >
                <Zap className="w-4 h-4 shrink-0" />
                <span className="text-[10px]">API Webhook</span>
              </button>

              <button
                onClick={() => setTriggerType("cron")}
                className={`py-2 px-3 text-xs rounded-xl border font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  triggerType === "cron"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-slate-950/80 hover:bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-705"
                }`}
              >
                <Network className="w-4 h-4 shrink-0" />
                <span className="text-[10px]">Hour Cron</span>
              </button>

              <button
                onClick={() => setTriggerType("gmail")}
                className={`py-2 px-3 text-xs rounded-xl border font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  triggerType === "gmail"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-slate-950/80 hover:bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-705"
                }`}
              >
                <Save className="w-4 h-4 shrink-0" />
                <span className="text-[10px]">Gmail Poller</span>
              </button>
            </div>
          </div>

          {/* Output Trigger Webhook destinations */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] uppercase font-bold text-slate-450 block">2. Select Action Output Destination</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setOutputType("discord")}
                className={`py-2 px-3 text-xs rounded-xl border font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  outputType === "discord"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-slate-950/80 hover:bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-705"
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span className="text-[10px]">Discord Bot</span>
              </button>

              <button
                onClick={() => setOutputType("sheets")}
                className={`py-2 px-3 text-xs rounded-xl border font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  outputType === "sheets"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-slate-950/80 hover:bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-705"
                }`}
              >
                <Clipboard className="w-4 h-4" />
                <span className="text-[10px]">G Sheets Row</span>
              </button>

              <button
                onClick={() => setOutputType("external")}
                className={`py-2 px-3 text-xs rounded-xl border font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  outputType === "external"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-slate-950/80 hover:bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-705"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-[10px]">REST API Call</span>
              </button>
            </div>
          </div>

          {/* Connect API configuration gateway inside n8n model */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] uppercase font-bold text-slate-450 block">3. Model Router Core Connection</span>
            <select
              value={apiGateway}
              onChange={(e) => setApiGateway(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:ring-1 focus:ring-cyan-500 outline-none"
            >
              <option value="google">Google AI Studio (Gemini-3.5-Flash Core)</option>
              <option value="deepseek">DeepSeek AI Gateway (sk-c3f97... Preset)</option>
            </select>
          </div>

          {/* Help Card Description */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>How to Import into n8n:</span>
            </div>
            <p className="text-slate-450 text-[11px] leading-relaxed">
              1. Tap the **Copy n8n Code** button on the right panel. <br />
              2. Open your hosting server n8n dashboard editor canvas. <br />
              3. Press <kbd className="bg-slate-900 border border-slate-750 px-1 py-0.2 rounded font-mono">Ctrl + V</kbd> or <kbd className="bg-slate-900 border border-slate-750 px-1 py-0.2 rounded font-mono">Cmd + V</kbd> directly on raw workspace to mount the full flow!
            </p>
          </div>
        </div>

        {/* Right column Interactive Canvas & Manifest View */}
        <div className="lg:col-span-7 flex flex-col overflow-hidden bg-slate-950">
          
          {/* Visual Canvas Panel */}
          <div className="p-4 border-b border-slate-850 bg-slate-950/60 shrink-0 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-3">Live n8n Interlink Simulation Canvas</span>
            
            {/* Visual Node Diagram */}
            <div className="p-3 bg-slate-900 border border-slate-850 rounded-2xl flex flex-wrap items-center justify-around gap-2 relative">
              
              {/* Trigger node card */}
              <div
                onClick={() => setActiveNodeId("trigger")}
                className={`p-3 rounded-xl text-center min-w-[100px] border cursor-pointer select-none transition-all ${
                  activeNodeId === "trigger" ? "bg-cyan-500/10 border-cyan-400 font-bold text-cyan-300 scale-105" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-705"
                }`}
              >
                <Zap className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                <span className="text-[9.5px] uppercase block truncate">{triggerType === "webhook" ? "Webhook In" : triggerType === "cron" ? "Hourly Cron" : "Gmail Received"}</span>
              </div>

              <div className="text-slate-700 font-bold">➔</div>

              {/* Swarm Master orchestrator node card */}
              <div
                onClick={() => setActiveNodeId("brain")}
                className={`p-3 rounded-xl text-center min-w-[120px] border cursor-pointer select-none transition-all ${
                  activeNodeId === "brain" ? "bg-indigo-500/15 border-indigo-400 font-bold text-indigo-300 scale-105 animate-pulse" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-705"
                }`}
              >
                <Layers className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
                <span className="text-[9.5px] uppercase block tracking-wider font-semibold">Forge Swarm</span>
                <span className="text-[8px] text-slate-500 block">({agents.length} Brains)</span>
              </div>

              <div className="text-slate-700 font-bold">➔</div>

              {/* Endpoint output action card */}
              <div
                onClick={() => setActiveNodeId("output")}
                className={`p-3 rounded-xl text-center min-w-[100px] border cursor-pointer select-none transition-all ${
                  activeNodeId === "output" ? "bg-emerald-500/15 border-emerald-400 font-bold text-emerald-300 scale-105" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-705"
                }`}
              >
                <Check className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <span className="text-[9.5px] uppercase block truncate">{outputType === "discord" ? "Discord Out" : outputType === "sheets" ? "G-Sheets Append" : "Custom API Endpoint"}</span>
              </div>

            </div>

            {/* Active Node Inspection Box */}
            <div className="mt-3 p-3 bg-slate-900/60 border border-slate-850 rounded-xl text-xs text-slate-350 min-h-[50px]">
              {activeNodeId === "trigger" && (
                <p>💡 **Trigger Node active**: Set to ingest incoming API parameters. Exposes public webhook hook: `/webhook/agentforge-swarm-trigger`.</p>
              )}
              {activeNodeId === "brain" && (
                <p>🤖 **Swarm Agent Router active**: Orchestrates {agents.length} multi-agent profiles successively via {apiGateway === "google" ? "Gemini-3.5-Flash" : "DeepSeek R1"} Core framework parameters.</p>
              )}
              {activeNodeId === "output" && (
                <p>🚀 **Action Endpoint active**: Dispatches custom structured payloads to {outputType === "discord" ? "your private Discord server text channels" : outputType === "sheets" ? "Google Sheets cloud rows database table" : "external custom software endpoints Webhook Router"}.</p>
              )}
            </div>
          </div>

          {/* Copyable code view */}
          <div className="px-5 py-2.5 bg-slate-950 flex items-center justify-between border-b border-slate-850">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">n8n JSON Manifest Specifications</span>
            <button
              onClick={handleCopy}
              className="text-xs text-slate-100 hover:text-white bg-cyan-600 hover:bg-cyan-500 font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all select-none cursor-pointer shadow shadow-cyan-500/10"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied n8n Code!</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Copy n8n Code</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-slate-950 relative">
            <pre className="text-[10.5px] font-mono leading-relaxed text-slate-400 select-all whitespace-pre">
              {generateN8NJson()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
