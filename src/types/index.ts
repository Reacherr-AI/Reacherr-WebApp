export * from './agentTemplate';
export * from './dashboard';

// --- Reporting & Dashboard ---

export interface AgentPerformance {
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

export interface Billing {
  totalCost: number;
  averageCostPerCall: number;
  totalCalls: number;
  costPerMinuteRate: number;
  dailyBreakdown: DailyBilling[];
  inboundCost?: number;
  outboundCost?: number;
}

export interface LeadStatus {
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

export interface CampaignPerformance {
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

// --- Shared Utilities ---

export interface S3Meta {
  fileId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  lastModified: number;
}

export interface Voice {
  voiceId: string;
  speaker: string;
  preSignUrl?: string;
}

export interface Recording {
  recordingObjKey: string;
  preSignUrl?: string;
}

// --- Phone Numbers ---

export enum CountryCodeType {
    US = "US",
    CA = "CA",
    IN = "IN",
    IT = "IT",
    FR = "FR"
}

export enum PhoneNumberType {
    TWILIO = "TWILIO",
    CUSTOM = "CUSTOM",
    TELNYX = "TELNYX",
    PLIVO = "PLIVO"
}

export enum SIPTransportType {
    UDP = "UDP",
    TCP = "TCP",
    TLS = "TLS",
    AUTO = "AUTO"
}

export interface SipTrunk {
    terminationUri: string;
    authUsername: string;
    authPassword: string;
    transportType: SIPTransportType;
}

export interface PhoneNumber {
    phoneNumber: string;
    isTollFree: boolean;
    countryCode: CountryCodeType;
    nickname: string;
    inboundWebhookUrl?: string;
    areaCode?: number;
    allowedInboundCountry?: CountryCodeType[];
    allowedOutboundCountry?: CountryCodeType[];
    phoneNumberType: PhoneNumberType;
    inboundAgentId?: string; // UUID
    outboundAgentId?: string; // UUID
    sipTrunkConfig?: SipTrunk;
}


// --- Voice Agent Core ---

// Enums
export type Language = 'en' | 'hi' | 'es' | 'it' | string; // Extend as needed

export enum PiiScrubMode {
  POST_CALL = "post_call"
}

export enum PiiCategory {
  PERSON_NAME = "PERSON_NAME",
  ADDRESS = "ADDRESS",
  EMAIL = "EMAIL",
  PHONE_NUMBER = "PHONE_NUMBER",
  SSN = "SSN",
  PASSPORT = "PASSPORT",
  DRIVER_LICENSE = "DRIVER_LICENSE",
  CREDIT_CARD = "CREDIT_CARD",
  BANK_ACCOUNT = "BANK_ACCOUNT",
  PASSWORD = "PASSWORD",
  PIN = "PIN",
  MEDICAL_ID = "MEDICAL_ID",
  DATE_OF_BIRTH = "DATE_OF_BIRTH",
  CUSTOMER_ACCOUNT_NUMBER = "CUSTOMER_ACCOUNT_NUMBER"
}

export enum StartSpeaker {
  USER = "user",
  AGENT = "ai"
}

// Configurations
export interface TtsConfig {
  provider: string;
  model: string;
  voiceId: string;
  settings: {
    pitch?: number;
    volume?: number;
    stability?: number;
    voiceSpeed?: number;
    similarityBoost?: number;
    voiceTemperature?: number;
    styleExaggeration?: number;
  };
}

export interface SttConfig {
  provider?: string;
  model?: string;
  settings?: {
    language?: string;
    punctuate?: boolean;
    keywords?: string[];
  };
}

export interface PiiConfig {
  mode: PiiScrubMode;
  categories: PiiCategory[];
}

export interface UserDtmfOptions {
  digit_limit: number;
  termination_key: string;
  timeout_ms: number;
}

// Voicemail Actions (Discriminated Union)
export interface StaticTextVoicemailAction {
  type: 'static_text';
  text: string;
}

export interface PromptVoicemailAction {
  type: 'prompt';
  prompt: string;
}

export interface HungupVoicemailAction {
  type: 'hangup';
}

export type VoicemailAction = 
  | StaticTextVoicemailAction 
  | PromptVoicemailAction 
  | HungupVoicemailAction;

export interface VoicemailOption {
  action: VoicemailAction;
  enabled?: boolean; // Inferred from frontend usage, though not in DTO record explicitly
  message?: string; // Legacy/Frontend convenience
}

// Post Call Analysis Data (Discriminated Union)
interface BaseAnalysisData {
  name: string;
  description: string;
}

export interface NumberPostCallField extends BaseAnalysisData {
  type: 'number';
}

export interface BooleanPostCallField extends BaseAnalysisData {
  type: 'boolean';
}

export interface StringPostCallField extends BaseAnalysisData {
  type: 'string';
  examples?: string[];
}

export interface EnumPostCallField extends BaseAnalysisData {
  type: 'enum';
  choices: string[];
}

export type AnalysisData = 
  | NumberPostCallField 
  | BooleanPostCallField 
  | StringPostCallField 
  | EnumPostCallField;

// Response Engine References (Discriminated Union)
export interface ReacherrLLMRef {
  type: 'REACHERR_LLM';
  llmId: string;
  version?: number;
}

export interface ConversationFlowRef {
  type: 'CONVERSATIONAL';
  conversationFlowId: string;
  version?: number;
}

export type ResponseEngineRef = ReacherrLLMRef | ConversationFlowRef;

// --- Main Voice Agent ---
export interface VoiceAgent {
  agentId: string;
  version: number;
  lastUpdatedTimestamp?: number;
  responseEngine: ResponseEngineRef;
  agentName: string;
  isPublished?: boolean;
  ttsConfig: TtsConfig;
  sttConfig?: SttConfig;
  language?: Language;
  webhookUrl?: string;
  webhookTimeoutMs?: number;
  maxCallDurationMs: number;
  ringTimeOutMs: number;
  noResponseTimeoutMs: number;
  enableVoicemailDetection?: boolean;
  voiceMailDetection?: VoicemailOption;
  analysisSuccessfulPrompt?: string;
  analysisSummaryPrompt?: string;
  postCallAnalysisData?: AnalysisData[];
  versionDescription?: string | null;
  piiConfig?: PiiConfig;
  allowUserDtmf?: boolean;
  userDtmfOptions?: UserDtmfOptions;
  
  // Legacy/Frontend fields that might still be needed or mapped
  ivrhangup?: boolean;
  reEngageAttempts?: number;
  reEngageMessage?: string;
  waitDurationMs?: number;
  userGreetingType?: 'static' | 'dynamic';
}

// --- Reacherr LLM ---

export interface KbConfig {
  topK: number;
  filterScore: number;
  knowledgeBaseIds?: string[];
}

// Tools (Discriminated Union)
export interface BaseTool {
  name: string;
  description?: string;
  tool_id?: string;
  speakDuringExecution?: boolean;
  speakAfterExecution?: boolean;
  executionMessageDescription?: string;
}

export interface CustomTool extends BaseTool {
  type: 'custom';
  url: string;
  method: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  parameters?: Record<string, any>; // JSON Schema
  responseVariables?: Record<string, string>;
  timeoutMs?: number;
  argsAtRoot?: boolean;
}

export interface EndCallTool extends BaseTool {
  type: 'end_call';
}

export interface TransferCallTool extends BaseTool {
  type: 'transfer_call';
  transferDestination: string;
}

export interface BookAppointmentCalTool extends BaseTool {
  type: 'book_appointment_cal';
  calApiKey: string;
  eventTypeId: number;
  timezone: string;
}

export interface CheckAvailabilityCalTool extends BaseTool {
  type: 'check_availability_cal';
  calApiKey: string;
  eventTypeId: number;
  timezone: string;
}

export interface McpTool extends BaseTool {
  type: 'mcp_tool';
  // Add specific fields if any
}

export type Tool = 
  | CustomTool 
  | EndCallTool 
  | TransferCallTool 
  | BookAppointmentCalTool 
  | CheckAvailabilityCalTool 
  | McpTool;

export interface ReacherrLLM {
  llmId: string;
  lastModificationTimestamp?: number;
  provider: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  modelHighPriority?: boolean;
  toolCallStrictMode?: boolean;
  kbConfig?: KbConfig;
  knowledgeBaseIds?: string[];
  startSpeaker?: StartSpeaker;
  beginMessage?: string;
  generalPrompt?: string;
  generalTools?: Tool[];
  defaultDynamicVariables?: Record<string, string>;
  version?: number;
}

export interface AgentResponse {
  id: number;
  name: string;
  description: string;
  voice: Voice;
  knowledgeBase: S3Meta[];
  number: string;
  numberId: number | null;
  lang: string;
  s3Url: string;
  welcomeMessage?: string;
  firstSpeaker?: 'ai' | 'user' | 'ai_dynamic';
  userGreetingType: 'static' | 'dynamic';
  waitDuration?: number;
}