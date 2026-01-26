export type TemplateType = 'single-prompt' | 'conversational-flow';
export interface Template {
  id: string;
  name: string;
  description: string;
  templateType:TemplateType;
}