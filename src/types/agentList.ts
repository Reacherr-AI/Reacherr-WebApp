export type AgentType = 'single-prompt' | 'conversational-flow' | 'custom';

export type ResponseEngineRef = 
  | { type: 'conversation-flow'; conversationFlowId: string }
  | { type: 'llm'; llmId: string };

export interface AgentSummary {
  agentId: string; // uuid
  agentName: string;
  agentVersion: number; // int32
  lastUpdatedAt: number; // int64 timestamp
  phoneNumbers: string[];
  agentType: AgentType;
  responseEngineRefDto?: ResponseEngineRef;
  voiceAvatarUrl: string;
}