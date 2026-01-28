export type AgentType = 'single-prompt' | 'conversational-flow';
export interface Template {
  id: string;
  name: string;
  description: string;
  templateType:AgentType;
}