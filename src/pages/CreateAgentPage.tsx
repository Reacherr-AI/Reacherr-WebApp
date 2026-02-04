import {
  BarChart4,
  BrainCircuit,
  Check,
  ChevronLeft,
  Cloud,
  Cpu, Edit2,
  Loader2,
  MessageCircle,
  Phone,
  Settings2,
  User,
  Variable,
  Zap
} from 'lucide-react';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { debounce } from 'lodash';

import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Skeleton } from '@/ui/skeleton';

// Shared Components
import SegmentedMetric from '../components/AgentForm/subcomponents/SegmentedMetric';

// Tab Form Components
import AgentForm from '../components/AgentForm/AgentForm';
import AudioSettingsForm from '../components/AgentForm/AudioSettingsForm';
import CallSettingsForm from '../components/AgentForm/CallSettingsForm';
import FunctionSettingsForm from '../components/AgentForm/FunctionSettingsForm';
import LLMSettingsForm from '../components/AgentForm/LLMSettingsForm';
import PostCallAnalysisForm from '../components/AgentForm/PostCallAnalysisForm';

import { INITIAL_AGENT_STATE } from '@/constants/initialAgentState';
import { agentReducer } from '@/reducers/agentReducer';

// API and Contexts
import {
  getAgentConversationData,
  getReacherrLlm,
  getVoiceAgent,
  updateReacherrLlm, updateVoiceAgent,
  listPhoneNumber,
  updatePhoneNumber
} from '@/api/client';
import LaunchAgentModal from '@/components/AgentForm/subcomponents/LaunchAgentModal';
import { ReacherrLLM, VoiceAgent, PhoneNumber } from '@/types';
import {
  AgentFormData,
  AnalysisExtractionItem,
  AudioSettingsFormData, CallSettingsFormData,
  CustomFunction,
  FunctionSettingsFormData,
  LLMSettingsFormData,
  PostCallAnalysisData
} from '../components/AgentForm/AgentForm.types';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// --- Helper: Map API Response to State ---
const mapApiResponseToState = (voiceAgent: Partial<VoiceAgent>, llm: Partial<ReacherrLLM>) => {
  return {
    ...INITIAL_AGENT_STATE, // Start with clean defaults

    // Identity
    agentId: voiceAgent.agentId || "",
    agentName: voiceAgent.agentName || "",

    // Global Config
    channel: "voice",
    language: voiceAgent.language || "en-US",
    webhookUrl: voiceAgent.webhookUrl || "",

    // Call Settings
    maxCallDurationMs: voiceAgent.maxCallDurationMs || INITIAL_AGENT_STATE.maxCallDurationMs,
    ringTimeOutMs: voiceAgent.ringTimeOutMs || INITIAL_AGENT_STATE.ringTimeOutMs,
    noResponseTimeoutMs: voiceAgent.noResponseTimeoutMs || INITIAL_AGENT_STATE.noResponseTimeoutMs,
    ivrhangup: voiceAgent.ivrhangup ?? true,
    reEngageAttempts: voiceAgent.reEngageAttempts ?? 3,
    reEngageMessage: voiceAgent.reEngageMessage || "",
    waitDurationMs: voiceAgent.waitDurationMs || 1000,
    userGreetingType: voiceAgent.userGreetingType || 'static',

    // Audio
    ttsConfig: voiceAgent.ttsConfig || INITIAL_AGENT_STATE.ttsConfig,
    sttConfig: voiceAgent.sttConfig || INITIAL_AGENT_STATE.sttConfig,

    // LLM
    reacherrLlmData: {
      ...INITIAL_AGENT_STATE.reacherrLlmData,
      ...llm,
      generalTools: llm.generalTools || [],
      // Ensure specific fields map if names differ
    },

    // Post Call Analysis
    postCallAnalysis: {
      webhookEnabled: !!voiceAgent.webhookUrl,
      webhookUrl: voiceAgent.webhookUrl || "",
      webhookTimeout: voiceAgent.webhookTimeoutMs || 45,
      extractionItems: (voiceAgent.postCallAnalysisData || []).map((item: any) => ({
        id: item.name,
        name: item.name,
        description: item.description,
        type: item.type === 'enum' ? 'selector' : item.type === 'string' ? 'text' : item.type,
        options: item.choices || [],
        enabled: true, // Assuming enabled by default if present in list
        isOptional: false
      } as AnalysisExtractionItem))
    },

    // Voicemail
    voicemailDetection: {
      enabled: voiceAgent.enableVoicemailDetection || false,
      action: voiceAgent.voiceMailDetection?.action?.type || 'hangup',
      message: (voiceAgent.voiceMailDetection?.action as any)?.text || (voiceAgent.voiceMailDetection?.action as any)?.promptId || ""
    },

    // Metadata
    versionMetadata: {
      version: voiceAgent.version || 0,
      isPublished: voiceAgent.isPublished || false,
      lastModificationTimestamp: voiceAgent.lastUpdatedTimestamp || 0
    }
  };
};

const NAV_ITEMS = [
  { id: 'agent', label: 'Agent Identity', icon: User },
  { id: 'llm', label: 'LLM Configuration', icon: Cpu },
  { id: 'audio-settings', label: 'Audio Settings', icon: Settings2 },
  { id: 'call-settings', label: 'Call Settings', icon: BrainCircuit },
  { id: 'post-call', label: 'Post Call Analysis', icon: BarChart4 },
  { id: 'functions', label: 'Functions', icon: Variable },
];

const CreateAgentPage: React.FC = () => {
  const [agentData, dispatch] = useReducer(agentReducer, INITIAL_AGENT_STATE);
  const [activeTab, setActiveTab] = useState('agent');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [appCapabilities, setAppCapabilities] = useState<any>(null);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useContext(AuthContext);
  const { addToast } = useToast();

  const [phoneList, setPhoneList] = useState<PhoneNumber[]>([]);

  // Fetch Phone Numbers
  const fetchPhones = useCallback(async () => {
    try {
      const res = await listPhoneNumber();
      setPhoneList(res.data);
    } catch (e) {
      console.error("Failed to fetch phone numbers", e);
    }
  }, []);

  useEffect(() => {
    fetchPhones();
  }, [fetchPhones]);

  // Redirect if agentId is missing or the legacy "create" string
  useEffect(() => {
    if (!agentId || agentId === 'create') {
      navigate('/agents', { replace: true });
    }
  }, [agentId, navigate]);

  // Helper to update global state via reducer
  const updateField = useCallback((path: string, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', path, value });
  }, []);

  // Auto-save LLM Data
  const debouncedUpdateLLM = useMemo(
    () => debounce(async (llmId: string, data: any) => {
      setIsAutoSaving(true);
      try {
        await updateReacherrLlm(llmId, data);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000),
    []
  );

  useEffect(() => {
    if (agentData.reacherrLlmData?.llmId && !isLoading) {
      debouncedUpdateLLM(agentData.reacherrLlmData.llmId, agentData.reacherrLlmData);
    }
    return () => {
      debouncedUpdateLLM.cancel();
    }
  }, [agentData.reacherrLlmData, isLoading, debouncedUpdateLLM]);

  // Handle Agent Fetching
  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId || agentId === 'create') return;

      try {
        setIsLoading(true);
        const agentRes = await getVoiceAgent(agentId);
        const agentData = agentRes.data;

        let llmData = {};
        // Only fetch LLM if it's a Reacherr LLM type
        if (agentData.responseEngine?.type === 'REACHERR_LLM' && (agentData.responseEngine as any).llmId) {
          const llmId = (agentData.responseEngine as any).llmId;
          const llmRes = await getReacherrLlm(llmId);
          llmData = llmRes.data;
        }

        const mergedData = mapApiResponseToState(agentData, llmData);
        dispatch({ type: 'LOAD_TEMPLATE', payload: mergedData });
        addToast("Loaded agent configuration", "success");
      } catch (error) {
        console.error("Failed to fetch agent:", error);
        addToast("Failed to load agent", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgent();
  }, [agentId]);

  // Get llm config and voice config
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsConfigLoading(true);
        const response = await getAgentConversationData();
        setAppCapabilities(response.data);
        // Console log to see the structure before mapping
        console.log("SUCCESS: Fetched Capabilities Config:", response.data);
      } catch (error) {
        console.error("CORS or Network Error:", error);
        addToast("Failed to connect to backend", "error");
      } finally {
        setIsConfigLoading(false);
      }
    };
    fetchData();
  }, []);

  const derivedAgentFormData: AgentFormData = useMemo(() => ({
    name: agentData.agentName,
    description: agentData.reacherrLlmData.generalPrompt,
    numberId: null,
  }), [agentData]);

  const derivedLLMData: LLMSettingsFormData = useMemo(() => ({
    provider: agentData.reacherrLlmData.provider || 'azure',
    model: agentData.reacherrLlmData.model,
    maxTokens: agentData.reacherrLlmData.maxTokens || 450,
    temperature: agentData.reacherrLlmData.temperature || 0.2,
    knowledgeBaseItems: [],
    topK: agentData.reacherrLlmData.topK || 40,
    knowledgeBase: (agentData.reacherrLlmData.kbConfig?.knowledgeBaseIds || []).map((id: string) => ({ id, name: id, type: 'pdf', status: 'ready' }))
  }), [agentData]);

  const derivedAudioData: AudioSettingsFormData = useMemo(() => ({
    language: agentData.language,
    sttProvider: agentData.sttConfig.provider,
    sttModel: agentData.sttConfig.model,
    sttKeywords: agentData.sttConfig.settings?.keywords?.join(', ') || '',
    ttsProvider: agentData.ttsConfig.provider,
    ttsModel: agentData.ttsConfig.model,
    ttsVoiceId: agentData.ttsConfig.voiceId,
    voice: {
      voiceId: agentData.ttsConfig.voice?.voiceId || agentData.ttsConfig.voiceId,
      displayName: agentData.ttsConfig.voice?.displayName || '',
      gender: agentData.ttsConfig.voice?.gender || '',
      provider: agentData.ttsConfig.voice?.provider || '',
      accent: agentData.ttsConfig.voice?.accent || '',
      previewUrl: agentData.ttsConfig.voice?.previewUrl || ''
    },
    speed: agentData.ttsConfig.settings.voiceSpeed,
    stability: agentData.ttsConfig.settings.stability,
    similarityBoost: agentData.ttsConfig.settings.similarityBoost,
    styleExaggeration: agentData.ttsConfig.settings.styleExaggeration,
    volume: agentData.ttsConfig.settings.volume,
    pitch: agentData.ttsConfig.settings.pitch || 0,
    temperature: agentData.ttsConfig.settings.voiceTemperature
  }), [agentData]);

  const derivedCallSettings: CallSettingsFormData = useMemo(() => ({
    welcomeMessage: agentData.reacherrLlmData.beginMessage,
    firstSpeaker: agentData.reacherrLlmData.startSpeaker,
    userGreetingType: agentData.userGreetingType as any || 'static',
    waitDuration: agentData.waitDurationMs || 1000,
    reEngageEnabled: agentData.reEngageAttempts > 0,
    reEngageMessage: agentData.reEngageMessage,
    reEngageAttempts: agentData.reEngageAttempts,
    ivrHangupEnabled: agentData.ivrhangup,
    voicemailDetectionEnabled: agentData.voicemailDetection?.enabled || false,
    voicemailAction: (agentData.voicemailDetection?.action as any) || 'hangup',
    voicemailMessage: agentData.voicemailDetection?.message || "",
    noResponseTime: agentData.noResponseTimeoutMs / 1000,
    maxCallDuration: agentData.maxCallDurationMs / 60000, // ms to minutes
    maxRingDuration: agentData.ringTimeOutMs / 1000, // ms to seconds
  }), [agentData]);

  const derivedPostCallData: PostCallAnalysisData = useMemo(() => ({
    extractionItems: (agentData.postCallAnalysis?.extractionItems || []).map((item: any) => ({
      ...item,
      enabled: true,
      isOptional: false,
    })),
    webhookEnabled: agentData.postCallAnalysis.webhookEnabled,
    webhookUrl: agentData.postCallAnalysis.webhookUrl,
    webhookTimeout: agentData.postCallAnalysis.webhookTimeout,
  }), [agentData]);

  const derivedFunctionData: FunctionSettingsFormData = useMemo(() => {
    const tools = agentData.reacherrLlmData.generalTools || [];

    const transferTool = tools.find((t: any) => t.type === 'transfer_call');
    const smsTool = tools.find((t: any) => t.type === 'send_sms');
    const bookingTool = tools.find((t: any) => t.type === 'book_appointment_cal');
    const checkAvailabilityTool = tools.find((t: any) => t.type === 'check_availability_cal');
    const customTools = tools.filter((t: any) => t.type === 'custom').map((t: any) => ({
      id: t.name, // Assuming name is unique
      name: t.name,
      description: t.description,
      endpointUrl: t.url,
      method: t.method,
      headers: t.headers ? Object.entries(t.headers).map(([k, v]) => ({ key: k, value: v as string })) : [],
      parametersJson: '', // Not directly stored in backend model
      timeoutMs: t.timeoutMs,
      speakDuringExecution: t.speakDuringExecution,
      speakDuringMessage: '', // Not stored
      speakAfterExecution: t.speakAfterExecution
    }));

    return {
      transferEnabled: !!transferTool,
      transferDetails: {
        name: transferTool?.name || 'transfer_human',
        description: transferTool?.description || 'Transfers the call to a human agent.',
        phoneNumber: transferTool?.transferDestination || '',
        countryCode: '', isoCode: ''
      },
      smsEnabled: !!smsTool,
      smsDetails: {
        name: smsTool?.name || 'send_follow_up_sms',
        description: smsTool?.description || 'Sends a follow-up SMS to the user.',
        content: smsTool?.content || '',
        smsType: smsTool?.smsType || 'static'
      },
      bookingEnabled: !!bookingTool,
      bookingDetails: {
        calComApiKey: bookingTool?.calApiKey || '',
        eventTypeId: bookingTool?.eventTypeId || '',
        timezone: bookingTool?.timezone || ''
      },
      checkAvailabilityEnabled: !!checkAvailabilityTool,
      checkAvailabilityDetails: {
        calComApiKey: checkAvailabilityTool?.calApiKey || '',
        eventTypeId: checkAvailabilityTool?.eventTypeId || '',
        timezone: checkAvailabilityTool?.timezone || ''
      },
      customFunctions: customTools,
    };
  }, [agentData]);


  // --- Change Handlers ---

  const handleAgentFormChange = (field: keyof AgentFormData, value: any) => {
    switch (field) {
      case 'name': updateField('agentName', value); break;
      case 'description': updateField('reacherrLlmData.generalPrompt', value); break;
    }
  };

  const handleLLMChange = (field: keyof LLMSettingsFormData, value: any) => {
    switch (field) {
      case 'provider': updateField('reacherrLlmData.provider', value); break;
      case 'model': updateField('reacherrLlmData.model', value); break;
      case 'maxTokens': updateField('reacherrLlmData.maxTokens', value); break;
      case 'temperature': updateField('reacherrLlmData.temperature', value); break;
      case 'topK': updateField('reacherrLlmData.topK', value); break;
      // Knowledge base mapping logic would go here
    }
  };

  const handleAudioChange = (field: keyof AudioSettingsFormData, value: any) => {
    switch (field) {
      case 'language': updateField('language', value); break;
      case 'sttProvider': updateField('sttConfig.provider', value); break;
      case 'sttModel': updateField('sttConfig.model', value); break;
      case 'sttKeywords': updateField('sttConfig.settings.keywords', typeof value === 'string' ? value.split(',') : value); break;
      case 'ttsProvider': updateField('ttsConfig.provider', value); break;
      case 'ttsModel': updateField('ttsConfig.model', value); break;
      case 'ttsVoiceId': updateField('ttsConfig.voiceId', value); break;
      case 'speed': updateField('ttsConfig.settings.voiceSpeed', value); break;
      case 'stability': updateField('ttsConfig.settings.stability', value); break;
      case 'similarityBoost': updateField('ttsConfig.settings.similarityBoost', value); break;
      case 'styleExaggeration': updateField('ttsConfig.settings.styleExaggeration', value); break;
      case 'volume': updateField('ttsConfig.settings.volume', value); break;
      case 'temperature': updateField('ttsConfig.settings.voiceTemperature', value); break;
      case 'pitch': updateField('ttsConfig.settings.pitch', value); break;
    }
  };

  const handleCallSettingChange = (field: keyof CallSettingsFormData, value: any) => {
    switch (field) {
      case 'welcomeMessage': updateField('reacherrLlmData.beginMessage', value); break;
      case 'firstSpeaker': updateField('reacherrLlmData.startSpeaker', value); break;
      case 'userGreetingType': updateField('userGreetingType', value); break;
      case 'waitDuration': updateField('waitDurationMs', value); break;
      case 'reEngageEnabled':
        // Logic: if disabled, maybe set attempts to 0 or have a flag in state?
        // For now just updating state if it matches
        break;
      case 'reEngageMessage': updateField('reEngageMessage', value); break;
      case 'reEngageAttempts': updateField('reEngageAttempts', value); break;
      case 'ivrHangupEnabled': updateField('ivrhangup', value); break;
      case 'voicemailDetectionEnabled': updateField('voicemailDetection.enabled', value); break;
      case 'voicemailAction': updateField('voicemailDetection.action', value); break;
      case 'voicemailMessage': updateField('voicemailDetection.message', value); break;
      case 'noResponseTime': updateField('noResponseTimeoutMs', value * 1000); break;
      case 'maxCallDuration': updateField('maxCallDurationMs', value * 60000); break;
      case 'maxRingDuration': updateField('ringTimeOutMs', value * 1000); break;
    }
  };

  const handlePostCallChange = (field: keyof PostCallAnalysisData, value: any) => {
    switch (field) {
      case 'extractionItems': updateField('postCallAnalysis.extractionItems', value); break;
      case 'webhookEnabled': updateField('postCallAnalysis.webhookEnabled', value); break;
      case 'webhookUrl': updateField('postCallAnalysis.webhookUrl', value); break;
      case 'webhookTimeout': updateField('postCallAnalysis.webhookTimeout', value); break;
    }
  };

  const handleFunctionChange = (field: keyof FunctionSettingsFormData, value: any) => {
    const currentTools = [...agentData.reacherrLlmData.generalTools];

    const updateOrAddTool = (toolType: string, newToolData: object) => {
      const toolIndex = currentTools.findIndex(t => t.type === toolType);
      if (toolIndex > -1) {
        currentTools[toolIndex] = { ...currentTools[toolIndex], ...newToolData };
      } else {
        currentTools.push({ type: toolType, ...newToolData });
      }
      return currentTools;
    };

    const removeTool = (toolType: string) => {
      return currentTools.filter(t => t.type !== toolType);
    };

    let newTools = currentTools;

    switch (field) {
      case 'transferEnabled':
        if (value) {
          const { transferDetails } = derivedFunctionData;
          newTools = updateOrAddTool('transfer_call', {
            name: transferDetails.name,
            description: transferDetails.description,
            transferDestination: transferDetails.phoneNumber,
          });
        } else {
          newTools = removeTool('transfer_call');
        }
        break;

      case 'transferDetails':
        const { transferDetails } = value;
        newTools = updateOrAddTool('transfer_call', {
          name: transferDetails.name,
          description: transferDetails.description,
          transferDestination: transferDetails.phoneNumber,
        });
        break;

      case 'smsEnabled':
        if (value) {
          const { smsDetails } = derivedFunctionData;
          newTools = updateOrAddTool('send_sms', {
            name: smsDetails.name,
            description: smsDetails.description,
            content: smsDetails.content,
            smsType: smsDetails.smsType,
          });
        } else {
          newTools = removeTool('send_sms');
        }
        break;

      case 'smsDetails':
        const { smsDetails } = value;
        newTools = updateOrAddTool('send_sms', {
          name: smsDetails.name,
          description: smsDetails.description,
          content: smsDetails.content,
          smsType: smsDetails.smsType,
        });
        break;

      case 'bookingEnabled':
        if (value) {
          const { bookingDetails } = derivedFunctionData;
          newTools = updateOrAddTool('book_appointment_cal', {
            calApiKey: bookingDetails.calComApiKey,
            eventTypeId: bookingDetails.eventTypeId,
            timezone: bookingDetails.timezone,
          });
        } else {
          newTools = removeTool('book_appointment_cal');
        }
        break;

      case 'bookingDetails':
        const { bookingDetails } = value;
        newTools = updateOrAddTool('book_appointment_cal', {
          calApiKey: bookingDetails.calComApiKey,
          eventTypeId: bookingDetails.eventTypeId,
          timezone: bookingDetails.timezone,
        });
        break;

      case 'checkAvailabilityEnabled':
        if (value) {
          const { checkAvailabilityDetails } = derivedFunctionData;
          newTools = updateOrAddTool('check_availability_cal', {
            calApiKey: checkAvailabilityDetails.calComApiKey,
            eventTypeId: checkAvailabilityDetails.eventTypeId,
            timezone: checkAvailabilityDetails.timezone,
          });
        } else {
          newTools = removeTool('check_availability_cal');
        }
        break;

      case 'checkAvailabilityDetails':
        const { checkAvailabilityDetails } = value;
        newTools = updateOrAddTool('check_availability_cal', {
          calApiKey: checkAvailabilityDetails.calComApiKey,
          eventTypeId: checkAvailabilityDetails.eventTypeId,
          timezone: checkAvailabilityDetails.timezone,
        });
        break;

      case 'customFunctions':
        const nonCustomTools = currentTools.filter((t: any) => t.type !== 'custom');
        const newCustomTools = (value as CustomFunction[]).map(f => ({
          type: 'custom',
          name: f.name,
          description: f.description,
          url: f.endpointUrl,
          method: f.method,
          headers: f.headers.reduce((acc: any, h) => ({ ...acc, [h.key]: h.value }), {}),
          timeoutMs: f.timeoutMs,
          speakAfterExecution: f.speakAfterExecution,
          speakDuringExecution: f.speakDuringExecution
        }));
        newTools = [...nonCustomTools, ...newCustomTools];
        break;
    }

    updateField('reacherrLlmData.generalTools', newTools);
  };

  // ---

  const handleSubmit = async (publishData?: any) => {
    // Check if user is logged in and agentId exists. Removed bId check as it's not in AuthContext user object.
    if (!auth?.user || !agentData.agentId) {
      console.warn("Submit aborted: Missing user or agentId", { user: auth?.user, agentId: agentData.agentId });
      return;
    }
    setIsSaving(true);
    try {
      // Map state back to VoiceAgent DTO
      const payload: Partial<VoiceAgent> = {
        agentId: agentData.agentId,
        agentName: agentData.agentName,
        language: agentData.language,
        webhookUrl: agentData.postCallAnalysis.webhookUrl, // Using postCallAnalysis webhook as the main one if aligned
        webhookTimeoutMs: agentData.postCallAnalysis.webhookTimeout,

        maxCallDurationMs: agentData.maxCallDurationMs,
        ringTimeOutMs: agentData.ringTimeOutMs,
        noResponseTimeoutMs: agentData.noResponseTimeoutMs,
        ivrhangup: agentData.ivrhangup,
        reEngageAttempts: agentData.reEngageAttempts,
        reEngageMessage: agentData.reEngageMessage,
        waitDurationMs: agentData.waitDurationMs,
        userGreetingType: agentData.userGreetingType as any,

        ttsConfig: agentData.ttsConfig,
        sttConfig: agentData.sttConfig,

        postCallAnalysisData: agentData.postCallAnalysis.extractionItems.filter(i => i.enabled).map(item => ({
          name: item.name,
          description: item.description,
          type: item.type === 'selector' ? 'enum' : item.type === 'text' ? 'string' : item.type,
          choices: item.options
        })),

        enableVoicemailDetection: agentData.voicemailDetection.enabled,
        voiceMailDetection: {
          action: {
            type: agentData.voicemailDetection.action,
            text: agentData.voicemailDetection.message // Assuming 'text' field carries the message
          } as any
        },

        version: agentData.versionMetadata.version,
        isPublished: true,
        versionDescription: publishData?.description || agentData.versionMetadata.versionDescription,

        responseEngine: {
          type: 'REACHERR_LLM',
          llmId: agentData.reacherrLlmData.llmId
        }
      };

      const updatePromises: Promise<any>[] = [];
      updatePromises.push(updateVoiceAgent(agentData.agentId, payload));

      // Handle Phone Number Assignment if publishData is present
      if (publishData) {
        const { inboundEnabled, selectedInbound, outboundEnabled, selectedOutbound } = publishData;
        const updates = new Map<string, { inboundAgentId?: string | null; outboundAgentId?: string | null }>();

        // 1. Identify current assignments to clear them if they changed
        phoneList.forEach(p => {
          if (p.inboundAgentId === agentData.agentId || p.outboundAgentId === agentData.agentId) {
            const num = p.phoneNumber;
            const update = updates.get(num) || {};

            if (p.inboundAgentId === agentData.agentId && (!inboundEnabled || selectedInbound !== num)) {
              update.inboundAgentId = null;
            }
            if (p.outboundAgentId === agentData.agentId && (!outboundEnabled || selectedOutbound !== num)) {
              update.outboundAgentId = null;
            }

            if (Object.keys(update).length > 0) {
              updates.set(num, update);
            }
          }
        });

        // 2. Set new assignments (will overwrite clearings if the same number is reused)
        if (inboundEnabled && selectedInbound) {
          const update = updates.get(selectedInbound) || {};
          update.inboundAgentId = agentData.agentId;
          updates.set(selectedInbound, update);
        }
        if (outboundEnabled && selectedOutbound) {
          const update = updates.get(selectedOutbound) || {};
          update.outboundAgentId = agentData.agentId;
          updates.set(selectedOutbound, update);
        }

        // 3. Queue updates for numbers that actually changed
        for (const [phoneNumber, data] of updates.entries()) {
          const current = phoneList.find(p => p.phoneNumber === phoneNumber);
          const hasInboundChange = 'inboundAgentId' in data && (data.inboundAgentId ?? null) !== (current?.inboundAgentId ?? null);
          const hasOutboundChange = 'outboundAgentId' in data && (data.outboundAgentId ?? null) !== (current?.outboundAgentId ?? null);

          if (hasInboundChange || hasOutboundChange) {
            updatePromises.push(updatePhoneNumber(phoneNumber, data as any));
          }
        }
      }

      await Promise.all(updatePromises);
      await fetchPhones(); // Refresh phone list to reflect changes in UI

      addToast('Agent published successfully!', 'success');
      setIsLaunchModalOpen(false); // Close the modal
    } catch (err: any) {
      console.error(err);
      addToast('Error publishing agent', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    if (isLoading || isConfigLoading || !appCapabilities) return <Skeleton className="h-full w-full rounded-3xl" />;
    switch (activeTab) {
      case 'agent': return <AgentForm data={derivedAgentFormData} onChange={handleAgentFormChange} />;
      case 'llm': return <LLMSettingsForm data={derivedLLMData} onChange={handleLLMChange} availableKBs={[]} capabilities={appCapabilities.llm} />;
      case 'audio-settings': return <AudioSettingsForm data={derivedAudioData} onChange={handleAudioChange} capabilities={appCapabilities.voice} />;
      case 'call-settings': return <CallSettingsForm data={derivedCallSettings} onChange={handleCallSettingChange} />;
      case 'post-call': return <PostCallAnalysisForm data={derivedPostCallData} onChange={handlePostCallChange} />;
      case 'functions': return <FunctionSettingsForm data={derivedFunctionData} onChange={handleFunctionChange} />;
      default: return null;
    }
  };

  // Cost segments calculation can also use agentData
  const costSegments = useMemo(() => [
    { label: `STT`, value: 20, displayValue: "$0.02", color: "bg-emerald-400" },
    { label: `LLM`, value: 40, displayValue: "$0.04", color: "bg-orange-400" },
    { label: `TTS`, value: 30, displayValue: "$0.03", color: "bg-blue-400" },
    { label: "Platform", value: 10, displayValue: "$0.01", color: "bg-purple-400" },
  ], []);

  return (
    <div className="h-screen bg-[#F9FAFB] p-4 lg:p-5 flex flex-col gap-4 overflow-hidden antialiased">

      {/* FLOATING HEADER */}
      <header className="bg-white rounded-2xl border border-zinc-100 px-6 py-3 shadow-sm shrink-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/agents')} className="rounded-xl border border-zinc-100 hover:bg-zinc-50">
            <ChevronLeft size={20} className="text-zinc-600" />
          </Button>

          <div className="flex flex-col gap-0.5 min-w-[220px]">
            <div className="flex items-center gap-2 group">
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    value={agentData.agentName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('agentName', e.target.value)}
                    className="h-8 text-sm font-bold bg-zinc-50 border-zinc-200"
                    onBlur={() => setIsEditingName(false)} autoFocus
                  />
                  <Button size="icon" className="h-7 w-7 bg-zinc-900" onClick={() => setIsEditingName(false)}><Check size={14} className="text-white" /></Button>
                </div>
              ) : (
                <>
                  <h1 className="text-base font-bold text-zinc-900 tracking-tight">{agentData.agentName}</h1>
                  <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => setIsEditingName(true)}>
                    <Edit2 size={12} className="text-zinc-400" />
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              {isAutoSaving ? (
                <div className="flex items-center gap-1.5 text-blue-500"><Loader2 size={10} className="animate-spin" /> Saving...</div>
              ) : lastSaved ? (
                <div className="flex items-center gap-1.5 text-emerald-500"><Cloud size={10} /> Saved {lastSaved.toLocaleTimeString()}</div>
              ) : (
                <span>Draft Mode</span>
              )}
              <span className="h-3 w-px bg-zinc-200" />
              <div className="flex items-center gap-1.5 text-blue-600"><Zap size={10} fill="currentColor" /> 1050ms Avg. Latency</div>
            </div>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-4">
          <SegmentedMetric title="Cost Estimate" total="$0.10" unit="/min" segments={costSegments} />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-50 p-1 rounded-xl border border-zinc-100 mr-2">
            <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-bold gap-2 hover:bg-white hover:shadow-sm">
              <MessageCircle size={15} className="text-blue-500" /> TEST CHAT
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-bold gap-2 hover:bg-white hover:shadow-sm">
              <Phone size={15} className="text-emerald-500" /> TEST CALL
            </Button>
          </div>
          <Button
            disabled={isSaving}
            onClick={() => setIsLaunchModalOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 rounded-xl h-11 text-sm font-bold shadow-lg transition-all active:scale-95"
          >
            {isSaving ? 'Saving...' : 'Launch Agent'}
          </Button>
        </div>
      </header>

      {isLaunchModalOpen && (
        <LaunchAgentModal
          data={agentData.versionMetadata}
          agentId={agentData.agentId}
          phoneList={phoneList}
          onClose={() => setIsLaunchModalOpen(false)}
          onPublish={(finalData: any) => {
            // Logic to hit your /agent/save or publish API
            console.log(finalData)
            handleSubmit(finalData);
          }}
        />
      )}

      {/* WORKSPACE */}
      <div className="flex flex-1 gap-4 overflow-hidden w-full max-w-[1700px] mx-auto items-stretch">
        <aside className="w-64 bg-white rounded-2xl border border-zinc-100 p-5 flex flex-col gap-1 shadow-sm shrink-0 overflow-y-auto">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] px-4 mb-4">Configuration</p>
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id} onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-[13px] font-bold rounded-xl transition-all group",
                  activeTab === item.id ? "bg-zinc-900 text-white shadow-md shadow-zinc-200" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} className={cn(activeTab === item.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-600")} />
                  {item.label}
                </div>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 h-full bg-white rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-y-auto p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {renderTabContent()}
        </main>

        <aside className="hidden xl:block xl:col-span-3 h-full">
          <section className="bg-white rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Test Your Agent</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-700">
                <span className="text-lg leading-none">⋯</span>
              </Button>
            </div>
            <div className="p-5 space-y-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1 h-9 text-xs font-bold rounded-xl border-zinc-200">
                  <Phone size={14} className="text-emerald-500" /> Test Audio
                </Button>
                <Button variant="outline" className="flex-1 h-9 text-xs font-bold rounded-xl border-zinc-200">
                  <MessageCircle size={14} className="text-blue-500" /> Test Chat
                </Button>
              </div>
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 flex flex-col items-center justify-center text-center gap-2 flex-1 min-h-[220px]">
                <div className="h-12 w-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                  <Phone size={18} className="text-zinc-400" />
                </div>
                <p className="text-xs font-semibold text-zinc-600">Start a test call</p>
                <p className="text-[10px] text-zinc-400 max-w-[180px]">
                  Validate audio quality and timing before you launch.
                </p>
              </div>
              <Button className="w-full h-9 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800">
                Test
              </Button>
              <p className="text-[10px] text-zinc-400 text-center">
                Call transfer isn’t supported in webcall.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div >
  );
};

export default CreateAgentPage;
