import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, User, Settings2, BrainCircuit, 
  Variable, BarChart4, Cpu, Edit2, Phone, 
  MessageCircle, Zap, Check
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Shared Components
import SegmentedMetric from '../components/AgentForm/subcomponents/SegmentedMetric';

// Tab Form Components
import AgentForm from '../components/AgentForm/AgentForm';
import LLMSettingsForm from '../components/AgentForm/LLMSettingsForm';
import AudioSettingsForm from '../components/AgentForm/AudioSettingsForm'; // Renamed from CallSettingsForm
import CallSettingsForm from '../components/AgentForm/CallSettingsForm';   // Renamed from ConversationSettingsForm
import PostCallAnalysisForm from '../components/AgentForm/PostCallAnalysisForm';
import FunctionSettingsForm from '../components/AgentForm/FunctionSettingsForm';

// API and Contexts
import { getPhoneNumbers, getVoices, postAgent } from '../api/client';
import { 
  VoiceDto, AgentFormData, LLMSettingsFormData, 
  AudioSettingsFormData, CallSettingsFormData, PostCallAnalysisData, FunctionSettingsFormData,
  S3MetaDto
} from '../components/AgentForm/AgentForm.types';
import { useAudioPlayer } from '../components/hooks/useAudioPlayer';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface PostAgentRequest {
  businessId: number;
  description: string;
  knowledgeBase: S3MetaDto[];
  lang: string;
  numberId: number;
  name: string;
  voiceId: string;
}

const NAV_ITEMS = [
  { id: 'agent', label: 'Agent Identity', icon: User },
  { id: 'llm', label: 'LLM Configuration', icon: Cpu },
  { id: 'audio-settings', label: 'Audio Settings', icon: Settings2 }, // Renamed ID for clarity
  { id: 'call-settings', label: 'Call Settings', icon: BrainCircuit },  // Renamed ID for clarity
  { id: 'post-call', label: 'Post Call Analysis', icon: BarChart4 },
  { id: 'functions', label: 'Functions', icon: Variable },
];

const CreateAgentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agent');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [agentName, setAgentName] = useState("Healthcare Support AI");

  // Dynamic Support States
  const [availableNumbers, setAvailableNumbers] = useState<Record<string, string>>({});
  const [availableVoices, setAvailableVoices] = useState<VoiceDto[]>([]);

  // 1. DYNAMIC FORM STATES (All 6 tabs)
  const [agentFormData, setAgentFormData] = useState<AgentFormData>({
    name: "",
    description: "",
    numberId: null,
    welcomeMessage: "",
    firstSpeaker: 'ai',
    userGreetingType: 'static',
    waitDuration: 1000
  });

  const [llmData, setLlmData] = useState<LLMSettingsFormData>({
    provider: "azure", 
    model: "gpt-4.1-mini cluster", 
    maxTokens: 450, 
    temperature: 0.2, 
    knowledgeBase: []
  });

  // Renamed from callSettingsData
  const [audioSettingsData, setAudioSettingsData] = useState<AudioSettingsFormData>({
    language: "en", 
    sttProvider: "deepgram", 
    sttModel: "nova-3", 
    sttKeywords: "",
    ttsProvider: "elevenlabs", 
    ttsModel: "eleven_turbo_v2_5", 
    ttsVoiceId: "EXAVITQu4vr4xnSDxMaL",
    voice: { 
      voiceId: "EXAVITQu4vr4xnSDxMaL"
      , displayName: "Rachel"
      , provider: "elevenlabs"
      , gender: "Female"
      , previewUrl: ""
    },
    speed: 1.0, 
    stability: 0.75, 
    similarityBoost: 0.75, 
    styleExaggeration: 0.0, 
    volume: 100, 
    pitch: 0, 
    temperature: 0.7
  });

  // Renamed from conversationData
  const [callSettingsData, setCallSettingsData] = useState<CallSettingsFormData>({
    reEngageEnabled: true,
    reEngageMessage: "Sorry, I couldn't hear you.", 
    ivrHangupEnabled: true,
    reEngageAttempts: 3,
    voicemailDetectionEnabled: false, 
    voicemailAction: 'hangup' as 'hangup' | 'leave_message', 
    voicemailMessage: "",
    noResponseTime: 10.0, 
    maxCallDuration: 10.0, 
    maxRingDuration: 10.0,
  });

  const [postCallData, setPostCallData] = useState<PostCallAnalysisData>({
    extractionItems: [
      { id: 'summary', name: 'Summary', description: 'Summarize call', type: 'text', enabled: true, isOptional: false },
      { id: 'success', name: 'Success', description: 'Was goal met?', type: 'boolean', enabled: true, isOptional: false }
    ],
    webhookEnabled: false,
    webhookUrl: "",
    webhookTimeout: 45
  });

  const [functionData, setFunctionData] = useState<FunctionSettingsFormData>({
    transferEnabled: false, 
    transferDetails: { name:'', description: '', phoneNumber: '', countryCode: '', isoCode: 'IN' },
    smsEnabled: false, 
    smsDetails: { name: '', description: '', smsType: 'static' },
    bookingEnabled: false, 
    bookingDetails: { calComApiKey: '', eventTypeId: '', timezone: 'UTC' },
    checkAvailabilityEnabled: false, 
    checkAvailabilityDetails: { calComApiKey: '', eventTypeId: '', timezone: 'UTC' },
    customFunctions: [],
  });

  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { addToast } = useToast();
  const { togglePlay } = useAudioPlayer();

  // 2. DYNAMIC METRICS CALCULATIONS
  const costSegments = useMemo(() => [
    { label: `STT (${audioSettingsData.sttProvider})`, value: 20, displayValue: "$0.02", color: "bg-emerald-400" },
    { label: `LLM (${llmData.model})`, value: 40, displayValue: "$0.04", color: "bg-orange-400" },
    { label: `TTS (${audioSettingsData.ttsProvider})`, value: 30, displayValue: "$0.03", color: "bg-blue-400" },
    { label: "Platform", value: 10, displayValue: "$0.01", color: "bg-purple-400" },
  ], [llmData.model, audioSettingsData.sttProvider, audioSettingsData.ttsProvider]);

  useEffect(() => {
    const loadPrerequisites = async () => {
      if (!auth?.user?.bId) return;
      try {
        const [numRes, voiceRes] = await Promise.all([getPhoneNumbers(auth.user.bId), getVoices()]);
        setAvailableNumbers(numRes.data || {});
        setAvailableVoices(voiceRes.data || []);
      } catch (err) {
        addToast('Failed to load system prerequisites.', 'error');
      } finally { setIsLoading(false); }
    };
    loadPrerequisites();
  }, [auth?.user?.bId]);

  const handleSubmit = async () => {
    if (!auth?.user?.bId) return;

    setIsSaving(true);
    try {
      // Logic for KnowledgeBase moved to LLMSettings, assuming no file upload for now as type changed
      // If pendingKnowledgeBases was needed, it should be added back to LLMSettingsFormData in types
      const updatedKnowledgeBase: S3MetaDto[] = []; // Placeholder as KB logic updated

      const requestData: PostAgentRequest = {
        businessId: auth.user.bId,
        description: agentFormData.description,
        knowledgeBase: updatedKnowledgeBase,
        lang: audioSettingsData.language,
        numberId: agentFormData.numberId || 0,
        name: agentName,
        voiceId: audioSettingsData.ttsVoiceId,
      };

      await postAgent(requestData);
      addToast('Agent created successfully!', 'success');
      navigate('/agents');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong while saving.';
      addToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    if (isLoading) return <Skeleton className="h-full w-full rounded-3xl" />;
    switch (activeTab) {
      case 'agent': return <AgentForm data={agentFormData} onChange={(f, v) => setAgentFormData(prev => ({...prev, [f]: v}))} />;
      case 'llm': return <LLMSettingsForm data={llmData} onChange={(f, v) => setLlmData(prev => ({...prev, [f]: v}))} availableKBs={[]} />;
      case 'audio-settings': return <AudioSettingsForm data={audioSettingsData} onChange={(f, v) => setAudioSettingsData(prev => ({...prev, [f]: v}))} onVoicePlay={togglePlay} />;
      case 'call-settings': return <CallSettingsForm data={callSettingsData} onChange={(f, v) => setCallSettingsData(prev => ({...prev, [f]: v}))} />;
      case 'post-call': return <PostCallAnalysisForm data={postCallData} onChange={(f, v) => setPostCallData(prev => ({...prev, [f]: v}))} />;
      case 'functions': return <FunctionSettingsForm data={functionData} onChange={(f, v) => setFunctionData(prev => ({...prev, [f]: v}))} />;
      default: return null;
    }
  };

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
                    value={agentName} onChange={(e) => setAgentName(e.target.value)}
                    className="h-8 text-sm font-bold bg-zinc-50 border-zinc-200"
                    onBlur={() => setIsEditingName(false)} autoFocus
                  />
                  <Button size="icon" className="h-7 w-7 bg-zinc-900" onClick={() => setIsEditingName(false)}><Check size={14} className="text-white"/></Button>
                </div>
              ) : (
                <>
                  <h1 className="text-base font-bold text-zinc-900 tracking-tight">{agentName}</h1>
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

        {/* DYNAMIC METRICS */}
        <div className="hidden xl:flex items-center gap-4">
          <SegmentedMetric title="Cost Estimate" total="$0.10" unit="/min" segments={costSegments} />
        </div>

        {/* TEST & ACTIONS */}
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
            onClick={handleSubmit}
            className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 rounded-xl h-11 text-sm font-bold shadow-lg transition-all active:scale-95"
          >
            {isSaving ? 'Saving...' : 'Launch Agent'}
          </Button>
        </div>
      </header>

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