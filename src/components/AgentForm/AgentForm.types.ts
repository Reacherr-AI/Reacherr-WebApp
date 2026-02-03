// ==========================================
// 1. Shared / Common UI Types
// ==========================================

export interface LanguageDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface HeaderPair {
  key: string;
  value: string;
}

// ==========================================
// 2. Knowledge Base Types
// ==========================================

export type KnowledgeItemType = 'pdf' | 'url' | 'article';

export interface KnowledgeItemUi {
  id: string;
  type: KnowledgeItemType;
  name: string;
  description?: string;
  
  // Data holders (only one will be populated based on type)
  fileData?: File;
  urlData?: string;
  articleContent?: string;
  
  status: 'ready' | 'pending_upload'; // To show UI indicators
}

// ==========================================
// 3. Agent Identity & Basic Configuration
// ==========================================

export interface AgentFormData {
  name: string;
  description: string;
  numberId: number | null;
}

export interface AgentFormProps {
  data: AgentFormData;
  onChange: (field: keyof AgentFormData, value: any) => void;
}

// ==========================================
// 4. Voice & Model Capabilities (Configuration)
// ==========================================

export interface VoiceCapabilities {
  speed?: boolean;
  stability?: boolean;
  similarity_boost?: boolean;
  style_exaggeration?: boolean;
  volume?: boolean;
  temperature?: boolean;
  pitch?: boolean;
  emotion?: boolean;
  speaking_rate?: boolean;
  volume_gain_db?: boolean;
}

export interface Voice {
  voiceId: string;
  displayName: string;
  gender: 'Male' | 'Female' | string;
  accent?: string; 
  previewUrl?: string;  
}

export interface VoiceModel {
  name: string;
  displayName: string;
  modality: 'STT' | 'TTS';
  languages: string[];
  capabilities: VoiceCapabilities;
  voices?: Voice[]; 
  supportsKeywords?: boolean;
}

// ==========================================
// 5. LLM Settings
// ==========================================

export interface KnowledgeBaseDto {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
}

export interface LLMSettingsFormData {
  provider: string;
  model: string;
  maxTokens: number;
  temperature: number;
  topK: number;
  knowledgeBase: KnowledgeBaseDto[];
}

export interface LLMSettingsFormProps {
  data: LLMSettingsFormData;
  onChange: (field: keyof LLMSettingsFormData, value: any) => void;
  availableKBs: KnowledgeBaseDto[];
  capabilities: null;
}

// ==========================================
// 6. Audio Settings (STT/TTS/Audio)
// ==========================================
export interface VoiceDto {
  voiceId: string;
  displayName: string; 
  provider?: string;   
  gender?: string;
  accent?: string;
  previewUrl?: string;
}

export interface AudioSettingsFormData {
  language: string;
  
  // STT Section
  sttProvider: string;
  sttModel: string;
  sttKeywords: string;
  
  // TTS Section
  ttsProvider: string;
  ttsModel: string;
  ttsVoiceId: string;

  // Audio / Performance Tuning
  speed: number;
  stability: number;
  similarityBoost: number;
  styleExaggeration: number;
  volume: number;
  pitch: number;
  temperature: number;

  voice: VoiceDto | null;
}

export interface AudioSettingsFormProps {
  data: AudioSettingsFormData;
  onChange: (name: keyof AudioSettingsFormData, value: any) => void;
  capabilities: null;
}

// ==========================================
// 7. Call Settings (Flow Control)
// ==========================================

export type VoicemailAction = 'hangup' | 'static_text' | 'prompt';

export interface CallSettingsFormData {
  welcomeMessage: string;
  firstSpeaker: 'ai' | 'user' | 'ai_dynamic';
  userGreetingType: 'static' | 'dynamic';
  waitDuration: number;
  reEngageEnabled: boolean;
  reEngageMessage: string;
  reEngageAttempts: number; 
  ivrHangupEnabled: boolean;
  voicemailDetectionEnabled: boolean;
  voicemailAction: VoicemailAction;
  voicemailMessage: string; 
  noResponseTime: number;    
  maxCallDuration: number;
  maxRingDuration: number;
}

export interface CallSettingsFormProps {
  data: CallSettingsFormData;
  onChange: (name: keyof CallSettingsFormData, value: any) => void;
}

// ==========================================
// 8. Functions & Integrations
// ==========================================

export interface TransferDetails {
  name: string;
  description: string;
  phoneNumber: string;
  countryCode?: string;
  isoCode?: string;
}

export interface SMSDetails {
  name: string;
  description?: string; // Fixed typo 'desciription'
  content: string; 
  smsType: 'prompt' | 'static';
}

export interface CustomFunction {
  id: string; 
  name: string;
  description: string;
  endpointUrl: string;
  method: HttpMethod;
  headers: HeaderPair[];
  parametersJson: string; 
  timeoutMs: number;
  speakDuringExecution: boolean;
  speakDuringMessage: string;
  speakAfterExecution: boolean;
}

export interface FunctionSettingsFormData {
  transferEnabled: boolean;
  transferDetails: TransferDetails;
  
  smsEnabled: boolean;
  smsDetails: SMSDetails;
  
  bookingEnabled: boolean;
  bookingDetails: { calComApiKey: string; eventTypeId: string; timezone: string; };
  
  checkAvailabilityEnabled: boolean; 
  checkAvailabilityDetails: { 
    calComApiKey: string; 
    eventTypeId: string; 
    timezone: string; 
  };
  
  customFunctions: CustomFunction[];
}

export interface FunctionSettingsFormProps {
  data: FunctionSettingsFormData;
  onChange: (name: keyof FunctionSettingsFormData, value: any) => void;
}

// ==========================================
// 9. Post Call Analysis
// ==========================================

export type AnalysisItemType = 'text' | 'selector' | 'boolean' | 'number';

export interface AnalysisExtractionItem {
  id: string;
  name: string;
  description: string;
  type: AnalysisItemType;
  enabled: boolean;
  options?: string[]; 
  isOptional: boolean;
}

export interface PostCallAnalysisData {
  extractionItems: AnalysisExtractionItem[];
  webhookEnabled: boolean;
  webhookUrl: string;
  webhookTimeout: number; // in seconds
}

export interface PostCallAnalysisFormProps {
  data: PostCallAnalysisData;
  onChange: (field: keyof PostCallAnalysisData, value: any) => void;
}
