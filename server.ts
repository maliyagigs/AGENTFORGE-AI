import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please add it via AI Studio Secrets Panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// 1. API route: Check API Key status
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({
    status: "ok",
    hasApiKey: hasKey,
    environment: process.env.NODE_ENV || "development"
  });
});

// 2. API route: Generate targeted discovery questions for a niche
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { nicheName, nicheDescription } = req.body;
    if (!nicheName) {
      return res.status(400).json({ error: "Niche name is required" });
    }

    const ai = getGeminiClient();
    const prompt = `You are an expert AI Architect. A user wants to build an automated AI Agent team for the niche: "${nicheName}" (${nicheDescription || "no description provided"}).
    Generate 4 custom high-yield questions to discover their business goals, target audience, typical workflows, and the main bottlenecks.
    Let's make sure the type of questions is a mix of 'text', 'select', or 'textarea'.
    Format the output strictly as a JSON array of SetupQuestion objects.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "A unique alphanumeric id like 'goal', 'audience', 'workflow'" },
              question: { type: Type.STRING, description: "The descriptive question itself" },
              placeholder: { type: Type.STRING, description: "A helpful placeholder text or example answer" },
              type: { type: Type.STRING, description: "Must be 'text', 'select', or 'textarea'" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of options if type is 'select'. Empty otherwise."
              },
              category: { type: Type.STRING, description: "Short category, e.g., 'Audience', 'Operations', 'Goals'" }
            },
            required: ["id", "question", "placeholder", "type", "category"]
          }
        },
        systemInstruction: "You are a meticulous AI systems consultant. Output highly professional, business-critical discovery questions. Ensure absolutely flawless JSON."
      }
    });

    const questionsText = response.text || "[]";
    const parsedQuestions = JSON.parse(questionsText.trim());
    res.json({ questions: parsedQuestions });
  } catch (error: any) {
    console.error("Error in generate-questions:", error);
    res.status(500).json({ error: error.message || "Failed to generate questions" });
  }
});

// 3. API route: Generate specialized agent swarm parameters based on requirements
app.post("/api/generate-agents", async (req, res) => {
  try {
    const { nicheName, nicheDescription, answers } = req.body;
    if (!nicheName) {
      return res.status(400).json({ error: "Niche name is required" });
    }

    const ai = getGeminiClient();
    const answersStr = JSON.stringify(answers, null, 2);

    const prompt = `Based on the niche "${nicheName}" (${nicheDescription || ""}) and the user discovery responses:
    ${answersStr}

    Design and configure a highly collaborative squad of exactly 3 specialized AI Agents that automate operations for this niche.
    Each agent should have a distinct role, personality, specialized system prompt instructions, specific simulated tools they can call, and sample prompts.
    Ensure they can collaborate together on tasks.

    Return the agents strictly as a JSON array matching the Agent schema specification.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Agent name, e.g. 'Campaign Planner', 'Audience Analyst'" },
              role: { type: Type.STRING, description: "A one-sentence definition of their primary role" },
              avatar: { type: Type.STRING, description: "A single representative emoji (e.g., 🧭, 📈, ✍️, 💻, 🧠, 🔍)" },
              color: { type: Type.STRING, description: "A standard Tailwind color name: choose from: 'sky', 'emerald', 'amber', 'rose', 'indigo', 'violet', 'orange', 'teal', 'fuchsia'" },
              systemInstruction: {
                type: Type.STRING,
                description: "Detailed system instructions outlining their identity, rules of engagement, professional posture, preferred output formats, and criteria."
              },
              temperature: { type: Type.NUMBER, description: "LLM temperature best suited for their job, from 0.1 to 0.9" },
              tools: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Action/tool camelCase code handle, e.g. fetchCompetitorAds, draftCopy" },
                    description: { type: Type.STRING, description: "When and why the agent starts this tool" },
                    exampleOutput: { type: Type.STRING, description: "Realistic simulation output returnable by this tool" }
                  },
                  required: ["name", "description", "exampleOutput"]
                },
                description: "Up to 3 mock data search/action tools the agent can use to pull specific context."
              },
              samplePrompts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 highly niche-specific prompt ideas that users can test this agent with"
              }
            },
            required: ["name", "role", "avatar", "color", "systemInstruction", "temperature", "tools", "samplePrompts"]
          }
        },
        systemInstruction: "You are an elite Multi-Agent Orchestrator. Create highly differentiated roles, avoiding duplicates. Ensure agents' system instructions are comprehensive, and colors are distinct."
      }
    });

    const agentsText = response.text || "[]";
    const parsedAgents = JSON.parse(agentsText.trim());
    res.json({ agents: parsedAgents });
  } catch (error: any) {
    console.error("Error in generate-agents:", error);
    res.status(500).json({ error: error.message || "Failed to generate agents" });
  }
});

// 4. API route: Simulate single-agent interaction (with optional tool simulation)
app.post("/api/agent/chat", async (req, res) => {
  try {
    const { agent, messageHistory, userPrompt } = req.body;
    if (!agent || !userPrompt) {
      return res.status(400).json({ error: "Agent configuration and current userPrompt are required" });
    }

    const ai = getGeminiClient();

    // Map tools to help model trigger one if appropriate
    const toolInstructions = agent.tools && agent.tools.length > 0
      ? `You have access to the following simulated tools. If a tool is highly relevant, write a structured tool request:
      ${JSON.stringify(agent.tools, null, 2)}
      
      To execute a tool, include a tool call codeblock at the beginning or end of your message in the exact format:
      [TOOL_CALL: nameOfTool({ arg1: "value" })]
      And then immediately resume your reasoning. In the final response, you can assume the tool returns the data specified under 'exampleOutput' from the tool.`
      : "";

    const systemPrompt = `You are ${agent.name}, an AI agent whose role is: ${agent.role}.
    
    CRITICAL INSTANCES INFO & CORE SYSTEM INSTRUCTIONS:
    ${agent.systemInstruction}
    
    ${toolInstructions}
    
    Be immersive. Speak in the tone and profile expected. Maintain strict fidelity to your character. Avoid any AI meta-commentary unless specified. Limit final responses to 3-4 neat paragraphs max or styled tables/lists.`;

    // Construct history in the correct format
    const formattedContents: any = [];
    
    // Convert previous chat history
    if (messageHistory && Array.isArray(messageHistory)) {
      messageHistory.forEach((msg: any) => {
        // Only include text contents for simplicity
        const mText = msg.parts?.map((p: any) => {
          if (p.type === 'text') return p.text;
          if (p.type === 'tool_call') return `[TOOL_CALL: ${p.toolCall.name}(${JSON.stringify(p.toolCall.args)})]`;
          if (p.type === 'tool_response') return `[TOOL_RESPONSE: ${p.toolResponse.name} output: ${p.toolResponse.output}]`;
          return '';
        }).join('\n');

        const role = msg.senderId === 'user' ? 'user' : 'model';
        formattedContents.push({
          role: role,
          parts: [{ text: mText || "" }]
        });
      });
    }

    // Add current user prompt
    formattedContents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: agent.temperature || 0.7,
      }
    });

    const replyText = response.text || "";

    // Parse for simulated tool calls in reply text
    // E.g. [TOOL_CALL: nameOfTool({ arg1: "val" })]
    const toolCallRegex = /\[TOOL_CALL:\s*([a-zA-Z0-9_]+)\(([^)]*)\)\]/;
    const match = replyText.match(toolCallRegex);

    let detectedToolCall: any = null;
    let finalCleanText = replyText;
    let simulatedResponse: any = null;

    if (match) {
      const toolName = match[1];
      const argsRaw = match[2];
      let argsParsed = {};
      try {
        argsParsed = eval(`(${argsRaw})`) || {}; // Safely parse JS/JSON-like object args
      } catch (e) {
        // Fallback
        argsParsed = { raw: argsRaw };
      }

      // Check if tool exists
      const tool = agent.tools?.find((t: any) => t.name.toLowerCase() === toolName.toLowerCase());
      if (tool) {
        detectedToolCall = {
          name: tool.name,
          args: argsParsed
        };
        simulatedResponse = {
          name: tool.name,
          output: tool.exampleOutput
        };
        // Clean out the tool call string from final text to keep output clean, or let frontend show it
        finalCleanText = replyText.replace(toolCallRegex, `*(System executed tool: **${tool.name}**)*\n`);
        
        // Let's generate a quick continuation turn, telling the agent what the tool returned
        const continuationPrompt = `[SYSTEM NOTE: The tool "${tool.name}" was executed. Here is the actual retrieved output data:
        ${tool.exampleOutput}
        
        Acknowledge this data directly, explain its meaning, and wrap up your response with your expert summary based on this exact data.]`;

        // Update history with system-added notes to refine the response
        const continuationContents = [
          ...formattedContents,
          { role: 'model', parts: [{ text: replyText }] },
          { role: 'user', parts: [{ text: continuationPrompt }] }
        ];

        const secondResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: continuationContents,
          config: {
            systemInstruction: systemPrompt,
            temperature: agent.temperature || 0.7
          }
        });

        finalCleanText = secondResponse.text || "No response content after tool execution.";
      }
    }

    res.json({
      text: finalCleanText,
      toolCall: detectedToolCall,
      toolResponse: simulatedResponse
    });
  } catch (error: any) {
    console.error("Error in agent-chat:", error);
    res.status(500).json({ error: error.message || "Failed to talk to agent" });
  }
});

// 5. API route: Swarm collaboration - single-step turn sequence
app.post("/api/swarm/execute-step", async (req, res) => {
  try {
    const { task, agentsList, conversationHistory, currentAgentIndex } = req.body;
    if (!task || !agentsList || !Array.isArray(agentsList)) {
      return res.status(400).json({ error: "Task scope and agent list are required" });
    }

    const ai = getGeminiClient();
    const currentAgent = agentsList[currentAgentIndex % agentsList.length];
    
    // Prepare a context of other agents in the squad to help coordinate
    const squadProfiles = agentsList.map((a: any, idx: number) => 
      `${idx === currentAgentIndex ? '👉 ' : ''}[Agent: ${a.name}] - Role: ${a.role}`
    ).join("\n");

    const chatContext = conversationHistory.map((msg: any) => {
      const partsText = msg.parts.map((p: any) => p.text || "").join("\n");
      return `[${msg.senderName}]: ${partsText}`;
    }).join("\n\n");

    const swarmInstruction = `You are simulated inside a live collaborative workspace.
    The primary collective mission goal: "${task}".
    
    You are current step speaker: ${currentAgent.name} (Role: ${currentAgent.role}).
    
    OUR ENTIRE MULTI-AGENT SWARM SQUAD:
    ${squadProfiles}

    YOUR INDIVIDUAL DIRECTIVES:
    ${currentAgent.systemInstruction}

    PREVIOUS DISCUSSIONS & WORKLOG:
    ${chatContext || "(No messages yet. Lead the kick-off!)"}

    GUIDELINES FOR THIS TURN:
    - Synthesise, improve, review, or add your customized domain expert feedback upon what previous agents have said.
    - If you are speaking first, initiate the blueprint design for "${task}".
    - If others have already laid groundwork, progress the solution. Add concrete, highly detailed actions, copy, drafts, or schemas based on your role.
    - If you notice a logical gap or issue, politely address it.
    - Do not repeat details. Be efficient but comprehensive.
    - If the objective is near completion, craft a final, highly structured project outline/artifact summary. Put any rich summaries inside a code block or formatted markdown block.
    - Keep your spoken speech direct and focused. No meta or introductory filler. Start directly in character. Format output in 150-250 words total.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Perform your collaborative turn in response to the task progress. Generate your response now.`,
      config: {
        systemInstruction: swarmInstruction,
        temperature: currentAgent.temperature || 0.8
      }
    });

    const agentResponseText = response.text || "";

    // Let's also check if this agent produced a structured artifact (e.g. Markdown checklist, blueprint code, plan) that we should save on the board
    // We can run a super fast sub-analysis or heuristic check on the output to see if it deserves to be an artifact
    // Or we can just extract any markdown blocks, like ```markdown ... ``` or standard paragraphs
    let artifact: any = null;
    const codeBlockRegex = /```(markdown|yaml|json|javascript|python|html)?\n([\s\S]*?)```/g;
    const matches = [...agentResponseText.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
      const blockContent = matches[matches.length - 1][2]; // Take the last/most comprehensive block
      const blockType = matches[matches.length - 1][1] || "markdown";
      artifact = {
        id: `art_${Date.now()}`,
        title: `${currentAgent.name}'s Output (${currentAgent.role})`,
        content: blockContent.trim(),
        type: blockType === "markdown" ? "markdown" : (blockType === "json" ? "json" : "text"),
        updatedBy: currentAgent.name,
        timestamp: new Date().toLocaleTimeString()
      };
    } else if (agentResponseText.length > 250) {
      // If no code block, but response is detailed, create a generic text artifact summarizing the expert's turn
      artifact = {
        id: `art_${Date.now()}`,
        title: `${currentAgent.name}'s Operational Blueprint`,
        content: agentResponseText,
        type: 'markdown',
        updatedBy: currentAgent.name,
        timestamp: new Date().toLocaleTimeString()
      };
    }

    res.json({
      text: agentResponseText,
      agentId: currentAgent.id,
      agentName: currentAgent.name,
      agentAvatar: currentAgent.avatar,
      agentColor: currentAgent.color,
      artifact: artifact
    });
  } catch (error: any) {
    console.error("Error in swarm/execute-step:", error);
    res.status(500).json({ error: error.message || "Failed to execute swarm turn" });
  }
});


// Serve React build in production, set up Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite middleware for core development...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve client router fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Agents Builder running on port ${PORT}`);
  });
}

startServer();
