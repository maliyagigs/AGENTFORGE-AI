export interface Niche {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  suggestedProducts?: string[];
}

export interface SetupQuestion {
  id: string;
  question: string;
  placeholder: string;
  type: 'text' | 'select' | 'textarea';
  options?: string[];
  category: string;
}

export interface SetupAnswers {
  [questionId: string]: string;
}

export interface AgentTool {
  name: string;
  description: string;
  exampleOutput: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string; // URL or emoticon/shorthand
  color: string; // hex or tailwind class
  systemInstruction: string;
  temperature: number;
  tools: AgentTool[];
  samplePrompts: string[];
}

export interface MessagePart {
  type: 'text' | 'tool_call' | 'tool_response';
  text?: string;
  toolCall?: {
    name: string;
    args: Record<string, any>;
  };
  toolResponse?: {
    name: string;
    output: string;
  };
}

export interface Message {
  id: string;
  senderId: string; // "user" or agentId
  senderName: string;
  senderAvatar: string;
  senderColor: string;
  parts: MessagePart[];
  timestamp: string;
  round?: number; // Swarm loop round
}

export interface SharedArtifact {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'code' | 'json' | 'markdown';
  updatedBy: string; // Agent name
  timestamp: string;
}
