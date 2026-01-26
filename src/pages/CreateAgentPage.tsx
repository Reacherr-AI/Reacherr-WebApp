import React, { useContext, useState, useMemo, useReducer, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, User, Settings2, BrainCircuit, 
  Variable, BarChart4, Cpu, Edit2, Phone, 
  MessageCircle, Zap, Check
} from 'lucide-react';

import { Button } from '@/ui/button';
import { Skeleton } from '@/ui/skeleton';
import { Input } from '@/ui/input';
import { cn } from '@/lib/utils';

// Shared Components
import SegmentedMetric from '../components/AgentForm/subcomponents/SegmentedMetric';

// Tab Form Components
import AgentForm from '../components/AgentForm/AgentForm';
import LLMSettingsForm from '../components/AgentForm/LLMSettingsForm';
import AudioSettingsForm from '../components/AgentForm/AudioSettingsForm';
import CallSettingsForm from '../components/AgentForm/CallSettingsForm';
import PostCallAnalysisForm from '../components/AgentForm/PostCallAnalysisForm';
import FunctionSettingsForm from '../components/AgentForm/FunctionSettingsForm';

import { agentReducer } from '@/reducers/agentReducer';
import { INITIAL_AGENT_STATE } from '@/constants/initialAgentState';

// API and Contexts
import {
  getAgentConversationData, postAgent,
  createAgentFromTemplate, getReacherrLlm, 
  createReacherrLlm, createVoiceAgent 
} from '@/api/client';
import { 
   AgentFormData, LLMSettingsFormData, 
  AudioSettingsFormData, CallSettingsFormData, PostCallAnalysisData, FunctionSettingsFormData,
  CustomFunction
} from '../components/AgentForm/AgentForm.types';
import { ReacherrLLM, VoiceAgent, Tool, ReacherrLLMRefDto } from '@/types';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LaunchAgentModal from '@/components/AgentForm/subcomponents/LaunchAgentModal';

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
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [appCapabilities, setAppCapabilities] = useState<any>(null);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const auth = useContext(AuthContext);
  const { addToast } = useToast();

  // Helper to update global state via reducer
  const updateField = useCallback((path: string, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', path, value });
  }, []);

  // Handle Template Initialization
  useEffect(() => {
    const initAgent = async () => {
      if (location.state?.templateId) {
        const { templateId } = location.state;
        
        try {
          setIsLoading(true);

          if (templateId === 'blank') {
            // --- BLANK FLOW ---
            const llmPayload: Partial<ReacherrLLM> = {
              beginMessage: "",
              generalTools: [
                {
                  type: "end_call",
                  name: "end_call",
                  description: "End the call when user has to leave (like says bye) or you are instructed to do so."
                } as Tool
              ],
              toolCallStrictMode: false
            };
            
            // 1. Create LLM
            const llmRes = await createReacherrLlm(llmPayload);
            const llmId = llmRes.data.llmId;

            // 2. Create Voice Agent
            const agentPayload: Partial<VoiceAgent> = {
              agentName: "Single-Prompt Agent",
              responseEngine: {
                type: "REACHERR_LLM",
                llmId: llmId,
                version: 0
              }
            };
            
            const agentRes = await createVoiceAgent(agentPayload);
            const agentResponseData = agentRes.data;

            // 3. Hydrate State
            const mergedData = {
              ...INITIAL_AGENT_STATE,
              ...agentResponseData,
              reacherrLlmData: {
                ...INITIAL_AGENT_STATE.reacherrLlmData,
                ...llmPayload,
                ...llmRes.data,
                generalTools: llmRes.data.generalTools || llmPayload.generalTools 
              }
            };

            dispatch({ type: 'LOAD_TEMPLATE', payload: mergedData });
            addToast("Initialized new agent", "success");

          } else {
            // --- TEMPLATE FLOW ---
            // 1. Get Template/Agent Config
            const templateRes = await createAgentFromTemplate(templateId);
            const { responseEngine } = templateRes.data;

            // Check if it's a Reacherr LLM engine
            if (responseEngine && responseEngine.type === 'REACHERR_LLM' && (responseEngine as any).llmId) {
              const llmId = (responseEngine as any).llmId;
              
              // 2. Get LLM Details
              const llmRes = await getReacherrLlm(llmId);
              const llmData = llmRes.data;

              // 3. Hydrate State
              const mergedData = {
                ...INITIAL_AGENT_STATE,
                ...templateRes.data,
                reacherrLlmData: {
                  ...INITIAL_AGENT_STATE.reacherrLlmData,
                  ...llmData
                }
              };

              dispatch({ type: 'LOAD_TEMPLATE', payload: mergedData });
              addToast("Loaded template configuration", "success");
            }
          }
        } catch (error) {
          console.error("Failed to initialize agent:", error);
          addToast("Failed to initialize agent", "error");
        } finally {
          setIsLoading(false);
          // Optional: Clear location state to prevent re-running on refresh if desired, 
          // but usually keeping it is fine or navigating replace.
          // navigate(location.pathname, { replace: true, state: {} });
        }
      }
    };

    initAgent();
  }, [location.state]);

  // Get llm config and voice config
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getAgentConversationData();
        setAppCapabilities(response.data);
        // Console log to see the structure before mapping
        console.log("SUCCESS: Fetched Capabilities Config:", response.data);
      } catch (error) {
        console.error("CORS or Network Error:", error);
        addToast("Failed to connect to backend", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const derivedAgentFormData: AgentFormData = useMemo(() => ({
    name: agentData.agentName,
    description: agentData.reacherrLlmData.generalPrompt,
    numberId: null,
    welcomeMessage: agentData.reacherrLlmData.beginMessage,
    firstSpeaker: agentData.reacherrLlmData.startSpeaker,
    userGreetingType: agentData.userGreetingType as any || 'static',
    waitDuration: agentData.waitDurationMs || 1000
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
      voice:{
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
      case 'welcomeMessage': updateField('reacherrLlmData.beginMessage', value); break;
      case 'firstSpeaker': updateField('reacherrLlmData.startSpeaker', value); break;
      case 'userGreetingType': updateField('userGreetingType', value); break;
      case 'waitDuration': updateField('waitDurationMs', value); break;
    }
  };

  const handleLLMChange = (field: keyof LLMSettingsFormData, value: any) => {
    switch(field) {
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
    switch(field) {
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
    switch(field) {
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

    switch(field) {
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
            headers: f.headers.reduce((acc:any, h) => ({...acc, [h.key]: h.value}), {}),
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

  const handleSubmit = async () => {
    if (!auth?.user?.bId) return;
    setIsSaving(true);
    try {
      // Construct payload from agentData
      await postAgent(agentData); // Assuming API accepts this structure
      addToast('Agent created successfully!', 'success');
      navigate('/agents');
    } catch (err: any) {
      addToast('Error saving agent', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    if (isLoading) return <Skeleton className="h-full w-full rounded-3xl" />;
    switch (activeTab) {
      case 'agent': return <AgentForm data={derivedAgentFormData} onChange={handleAgentFormChange} />;
      case 'llm': return <LLMSettingsForm data={derivedLLMData} onChange={handleLLMChange} availableKBs={[]} capabilities = {appCapabilities.llm} />;
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
                  <Button size="icon" className="h-7 w-7 bg-zinc-900" onClick={() => setIsEditingName(false)}><Check size={14} className="text-white"/></Button>
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
              <span>ACTIVE PIPELINE</span>
              <span className="h-3 w-px bg-zinc-200" />
              <div className="flex items-center gap-1.5 text-blue-600"><Zap size={10} fill="currentColor"/> 1050ms Avg. Latency</div>
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
          onClose={() => setIsLaunchModalOpen(false)}
          onPublish={(finalData: any) => {
            // Logic to hit your /agent/save or publish API
            console.log(finalData)
            handleSubmit();
          }}
        />
      )}

      {/* WORKSPACE */}
      <div className="flex flex-1 gap-4 overflow-hidden w-full max-w-[1700px] mx-auto">
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

        <main className="flex-1 bg-white rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-y-auto p-10">
          <div className="max-w-[1300px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateAgentPage;