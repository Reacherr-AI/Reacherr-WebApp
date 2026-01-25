export * from './dashboard';

export interface AgentPerformanceDTO {
  agentId: number;
  agentName: string;
  totalCalls: number;
  averageDuration: number;
  intentDistribution: {
    [intent: string]: number;
  };
  successRate: number;
}

export interface DailyBilling {
  date: string;
  totalCalls: number;
  totalCost: number;
  averageCostPerCall: number;
}

export interface BillingDTO {
  totalCost: number;
  averageCostPerCall: number;
  totalCalls: number;
  costPerMinuteRate: number;
  dailyBreakdown: DailyBilling[];
  inboundCost?: number;
  outboundCost?: number;
}

export interface LeadStatusDTO {
  totalCalls: number;
  intentDistribution: {
    [intent: string]: number;
  };
  conversionRate: number;
  inboundCalls?: number;
  inboundIntentDistribution?: {
    [intent: string]: number;
  };
  inboundConversionRate?: number;
  outboundCalls?: number;
  outboundIntentDistribution?: {
    [intent: string]: number;
  };
  outboundConversionRate?: number;
}

export interface CampaignPerformanceDTO {
  campaignId: number;
  campaignName: string;
  totalCalls: number;
  totalDuration: number;
  averageDuration: number;
  totalCost: number;
  intentDistribution: {
    [intent: string]: number;
  };
  conversionRate: number;
}

// --- Shared DTOs ---

export interface S3MetaDto {
  fileId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  lastModified: number;
}

export interface VoiceDto {
  voiceId: string;
  speaker: string;
  preSignUrl?: string;
}

export interface Recording {
  recordingObjKey: string;
  preSignUrl?: string;
}

export interface AgentResponseDto {
  id: number;
  name: string;
  description: string;
  voice: VoiceDto;
  knowledgeBase: S3MetaDto[];
  number: string;
  numberId: number | null;
  lang: string;
  s3Url: string;
  welcomeMessage?: string;
  firstSpeaker?: 'ai' | 'user' | 'ai_dynamic';
  userGreetingType: 'static' | 'dynamic';
  waitDuration?: number;
}

export * from './agentTemplate';

