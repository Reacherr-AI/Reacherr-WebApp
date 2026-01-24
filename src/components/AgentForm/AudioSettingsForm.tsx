import React, { useMemo, useEffect } from 'react';
import { Play, Mic2, Volume2, Settings2, Pause } from 'lucide-react';
import { AudioSettingsFormProps } from './AgentForm.types';
import { Slider } from '@/ui/slider';
import { Input } from '@/ui/input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/ui/select';
import { Label } from '@/ui/label';
import { Button } from '@/ui/button';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { cn } from '@/lib/utils';
import { getAgentConversationData } from '@/api/client';

const formatLabel = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

const formatVoiceMetadata = (voice: any) => {
  const parts = [
    voice.gender ? formatLabel(voice.gender) : null,
    voice.accent || null
  ].filter(Boolean);

  return parts.join(' • ');
};

const AudioSettingsForm: React.FC<AudioSettingsFormProps> = ({ data, onChange, capabilities }) => {

  const { playing, playingId, isLoading, togglePlay } = useAudioPlayer();

  // 1. DYNAMIC FILTERING LOGIC
  const filteredSTTProviders = useMemo(() => 
    capabilities?.providers.filter(p => 
      p.models.some(m => m.modality === 'STT' && m.languages.includes(data.language))), 
  [data.language, capabilities]);

  const filteredTTSProviders = useMemo(() => 
    capabilities?.providers.filter(p => 
      p.models.some(m => m.modality === 'TTS' && m.languages.includes(data.language))), 
  [data.language, capabilities]);

  const currentSTTModels = useMemo(() => {
    const provider = capabilities?.providers.find(p => p.slug === data.sttProvider);
    return provider?.models.filter(m => m.modality === 'STT' && m.languages.includes(data.language)) || [];
  }, [data.sttProvider, data.language, capabilities]);

  const currentTTSModels = useMemo(() => {
    const provider = capabilities?.providers.find(p => p.slug === data.ttsProvider);
    return provider?.models.filter(m => m.modality === 'TTS' && m.languages.includes(data.language)) || [];
  }, [data.ttsProvider, data.language, capabilities]);

  // Find active models based on current selections
  const activeTTSModel = useMemo(() => 
    currentTTSModels.find(m => m.name === data.ttsModel), 
  [data.ttsModel, currentTTSModels]);

  // Fix: Your API uses 'TTSVoices' instead of 'voices'
  const selectedVoiceObj = useMemo(() => {
    return activeTTSModel?.TTSVoices?.find(v => v.voiceId === data.ttsVoiceId); 
  }, [activeTTSModel, data.ttsVoiceId]);

  const isCurrentVoicePlaying = playing && playingId === data.ttsVoiceId;
  const isCurrentVoiceLoading = isLoading && playingId === data.ttsVoiceId;

  // 2. CASCADING DEFAULTS - Ensures models refresh when provider changes
  useEffect(() => {
    if (!filteredSTTProviders.some(p => p.slug === data.sttProvider) && filteredSTTProviders.length > 0) 
      onChange('sttProvider', filteredSTTProviders[0].slug);
    
    if (!filteredTTSProviders.some(p => p.slug === data.ttsProvider) && filteredTTSProviders.length > 0) 
      onChange('ttsProvider', filteredTTSProviders[0].slug);
  }, [data.language, filteredSTTProviders, filteredTTSProviders]);

  useEffect(() => {
    // When currentSTTModels change (because of provider change), select the first one if current is invalid
    if (!currentSTTModels.some(m => m.name === data.sttModel) && currentSTTModels.length > 0) {
      onChange('sttModel', currentSTTModels[0].name);
    }
  }, [currentSTTModels]);

  useEffect(() => {
    if (!currentTTSModels.some(m => m.name === data.ttsModel) && currentTTSModels.length > 0) {
      onChange('ttsModel', currentTTSModels[0].name);
    }
  }, [currentTTSModels]);

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2.5 mb-6">
      <div className="p-1.5 bg-blue-50/50 rounded-md border border-blue-100/30">
        <Icon size={14} className="text-blue-600" />
      </div>
      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">{title}</h3>
    </div>
  );

  const SliderField = ({ label, value, field, min = 0, max = 1, step = 0.01, suffix = "" }: any) => (
    <div className="bg-zinc-50/30 p-4 rounded-xl border border-transparent hover:bg-zinc-50 hover:border-zinc-100 transition-all">
      <div className="flex justify-between items-center mb-3">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{label}</label>
        <span className="text-[10px] font-mono font-bold text-zinc-600">{value}{suffix}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(field, v[0])} />
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* 1. HEADER */}
      <div className="px-2">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Audio Settings</h2>
        <p className="text-xs text-zinc-500 mt-1">Configure audio synthesis, transcription models, and performance tuning.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: GLOBAL & STT CONFIG (Span 6) */}
        <div className="lg:col-span-6 space-y-6">
          <section className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
            <SectionHeader icon={Settings2} title="Global Configuration" />
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Call Language</Label>
              <Select value={data.language} onValueChange={(v) => onChange('language', v)}>
                <SelectTrigger className="h-11 border-zinc-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {capabilities?.languages.map(l => (
                    <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
            <SectionHeader icon={Mic2} title="Transcriber (STT)" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">Provider</Label>
                <Select value={data.sttProvider} onValueChange={(v) => onChange('sttProvider', v)}>
                  <SelectTrigger className="h-10 border-zinc-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {filteredSTTProviders.map(p => (
                      <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">Model</Label>
                <Select value={data.sttModel} onValueChange={(v) => onChange('sttModel', v)}>
                  <SelectTrigger className="h-10 border-zinc-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {currentSTTModels.map(m => (
                      <SelectItem key={m.name} value={m.name}>{m.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">Recognition Keywords</Label>
              <Input placeholder="e.g. Bruce:100, Medical:90" value={data.sttKeywords} onChange={(e) => onChange('sttKeywords', e.target.value)} className="h-10" />
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: TTS & PERFORMANCE (Span 6) */}
        <div className="lg:col-span-6 space-y-6">
          <section className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
            <SectionHeader icon={Volume2} title="Voice Synthesis (TTS)" />
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">Provider</Label>
                <Select value={data.ttsProvider} onValueChange={(v) => onChange('ttsProvider', v)}>
                  <SelectTrigger className="h-10 border-zinc-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {filteredTTSProviders.map(p => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">Model</Label>
                <Select value={data.ttsModel} onValueChange={(v) => onChange('ttsModel', v)}>
                  <SelectTrigger className="h-10 border-zinc-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {currentTTSModels.map(m => <SelectItem key={m.name} value={m.name}>{m.displayName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">Primary Voice</Label>
              <div className="relative">
                <Select value={data.ttsVoiceId} onValueChange={(v) => onChange('ttsVoiceId', v)}>
                  <SelectTrigger className="h-11 pl-10 border-zinc-200 shadow-sm"><SelectValue placeholder="Select Voice" /></SelectTrigger>
                  <SelectContent>
                    {activeTTSModel?.TTSVoices?.map((v: any) => {
                      const metadata = formatVoiceMetadata(v);
                      return (
                        <SelectItem key={v.voiceId} value={v.voiceId}>
                          <div className="flex flex-col leading-tight py-1">
                            <span className="text-sm font-semibold text-zinc-900">
                              {v.displayName || v.voiceId}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              { metadata && (
                                <span className="text-[10px] text-zinc-400 font-medium">
                                  {metadata}
                                </span>
                              )}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "absolute left-1.5 top-1 h-9 w-9 rounded-lg transition-colors",
                      isCurrentVoicePlaying ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-blue-600 hover:bg-blue-50"
                    )}
                      onClick={() => {
                        if (selectedVoiceObj) {
                          // Pass the full voice object and the ID to the hook
                          togglePlay(selectedVoiceObj, selectedVoiceObj.voiceId);
                        }
                      }}
                  >
                  {isCurrentVoiceLoading ? (
                    <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full" />
                  ) : isCurrentVoicePlaying ? (
                    <Pause size={14} fill="currentColor" />
                  ) : (
                    <Play size={14} fill="currentColor" />
                  )}
                </Button>
              </div>
            </div>

            {/* Performance Tuning Grid */}
            {activeTTSModel && (
              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-zinc-100">
                {(() => {
                  const caps = activeTTSModel.configs as any;
                  return (
                    <>
                      {(caps.speed || caps.speaking_rate) && <SliderField label="Speech Rate" value={data.speed} field="speed" min={0.5} max={2.0} step={0.05} suffix="x" />}
                      {caps.stability && <SliderField label="Stability" value={data.stability} field="stability" />}
                      {caps.similarity_boost && <SliderField label="Similarity Boost" value={data.similarityBoost} field="similarityBoost" />}
                      {(caps.volume || caps.volume_gain_db) && <SliderField label="Volume" value={data.volume} field="volume" min={0} max={200} step={1} suffix="%" />}
                      {caps.temperature && <SliderField label="Temperature" value={data.temperature} field="temperature" />}
                    </>
                  );
                })()}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AudioSettingsForm;