import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, Cpu, Database, Layers, ExternalLink, 
  FileText, Info 
} from 'lucide-react';
import { LLMSettingsFormProps } from './AgentForm.types';
import { Slider } from '@/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Label } from '@/ui/label';
import { Button } from '@/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/ui/Tooltip';

const FIELD_INFO = {
  maxTokens: "Limits response length. Higher values allow detailed answers but increase latency.",
  topK: "Filters the model to the top 'K' likely words. Lower values increase focus and determinism.",
  temperature: "Controls creativity. 0.0 is factual and focused; 1.0 is creative and diverse."
};

const LLMSettingsForm: React.FC<LLMSettingsFormProps & { availableKBs: any[], capabilities: any }> = ({ 
  data, 
  onChange, 
  availableKBs,
  capabilities
}) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (capabilities?.providers?.length > 0) {
      if (!data.provider) {
        onChange('provider', capabilities.providers[0].slug);
      }
    }
  }, [capabilities, data.provider, onChange]);

  const currentProvider = useMemo(() => {
    return capabilities?.providers?.find((p: any) => p.slug === data.provider);
  }, [capabilities, data.provider]);

  useEffect(() => {
    if (currentProvider?.models?.length > 0) {
      if (!data.model || !currentProvider.models.some((m: any) => m.name === data.model)) {
        onChange('model', currentProvider.models[0].name);
      }
    }
  }, [currentProvider, data.model, onChange]);

  const currentModel = useMemo(() => {
    return currentProvider?.models?.find((m: any) => m.name === data.model);
  }, [currentProvider, data.model]);


  // --- 2. HELPERS ---
  const InfoLabel = ({ label, tooltipKey }: { label: string, tooltipKey: keyof typeof FIELD_INFO }) => (
    <div className="flex items-center gap-1.5">
      <Label className="text-[11px] font-bold text-zinc-700 uppercase">{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="cursor-help outline-none">
              <Info size={12} className="text-zinc-300 hover:text-blue-500 transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[220px] text-[10px] p-2.5 bg-zinc-900 text-white border-none shadow-xl">
            {FIELD_INFO[tooltipKey]}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="px-1">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">LLM Configuration</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Define the intelligence provider, model cluster, and response parameters.</p>
      </div>

      <section className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] group">
        
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-blue-50/50 rounded-md border border-blue-100/30 group-hover:bg-blue-100 transition-colors">
            <Layers size={14} className="text-blue-600" />
          </div>
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">Model Selection</h3>
        </div>

        {/* COMPACT SELECTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-zinc-500 uppercase flex items-center gap-2">
              <Cpu size={13} /> LLM Provider
            </Label>
            <Select value={data.provider} onValueChange={(v) => onChange('provider', v)}>
              <SelectTrigger className="h-10 border-zinc-200 bg-zinc-50/30 rounded-xl shadow-none focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {capabilities?.providers?.map((p: any) => (
                  <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-zinc-500 uppercase flex items-center gap-2">
              <Brain size={13} /> Model Cluster
            </Label>
            <Select value={data.model} onValueChange={(v) => onChange('model', v)}>
              <SelectTrigger className="h-10 border-zinc-200 bg-zinc-50/30 rounded-xl shadow-none focus:ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currentProvider?.models?.map((m: any) => (
                  <SelectItem key={m.name} value={m.name}>{m.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* PERFORMANCE TUNING: TIGHTER FLEX BOXES */}
        <div className="pt-6 border-t border-zinc-50">
          <div className="flex flex-wrap gap-x-10 gap-y-6">
            {currentModel?.configs?.max_tokens && (
              <div className="w-full md:w-[calc(50%-20px)] space-y-3">
                <div className="flex justify-between items-center">
                  <InfoLabel label="Max Tokens" tooltipKey="maxTokens" />
                  <span className="text-[10px] font-mono font-bold bg-zinc-900 text-white px-2 py-0.5 rounded">{data.maxTokens}</span>
                </div>
                <Slider value={[data.maxTokens]} max={2048} min={64} step={32} onValueChange={(v) => onChange('maxTokens', v[0])} />
                <p className="text-[9px] text-zinc-400 font-medium">Higher tokens = longer responses.</p>
              </div>
            )}

            {currentModel?.configs?.top_k && (
              <div className="w-full md:w-[calc(50%-20px)] space-y-3">
                <div className="flex justify-between items-center">
                  <InfoLabel label="Top K" tooltipKey="topK" />
                  <span className="text-[10px] font-mono font-bold bg-zinc-900 text-white px-2 py-0.5 rounded">{data.topK || 40}</span>
                </div>
                <Slider value={[data.topK || 40]} max={100} min={1} step={1} onValueChange={(v) => onChange('topK', v[0])} />
                <p className="text-[9px] text-zinc-400 font-medium">Lower K = more concise responses.</p>
              </div>
            )}

            {currentModel?.configs?.temperature && (
              <div className="w-full md:w-[calc(50%-20px)] space-y-3">
                <div className="flex justify-between items-center">
                  <InfoLabel label="Temperature" tooltipKey="temperature" />
                  <span className="text-[10px] font-mono font-bold bg-zinc-900 text-white px-2 py-0.5 rounded">{data.temperature}</span>
                </div>
                <Slider value={[data.temperature]} max={1.0} min={0} step={0.1} onValueChange={(v) => onChange('temperature', v[0])} />
                <p className="text-[9px] text-zinc-400 font-medium">0.1 for Support, 0.7+ for Sales.</p>
              </div>
            )}
          </div>
        </div>

        {/* COMPACT KNOWLEDGE BASE SECTION */}
        <div className="mt-8 pt-6 border-t border-zinc-50">
           <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={13} className="text-blue-400" />
                  <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">Active Knowledge Base</Label>
                </div>
                <Button 
                  variant="ghost" size="sm" onClick={() => navigate('/knowledge-base')}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 h-6 px-2"
                >
                  Add New <ExternalLink size={10} className="ml-1" />
                </Button>
              </div>
              <Select 
                value={data.knowledgeBase[0]?.id || ""} 
                onValueChange={(kbId) => {
                  const selected = availableKBs.find(kb => kb.id === kbId);
                  if (selected) onChange('knowledgeBase', [selected]);
                }}
              >
                <SelectTrigger className="h-10 border-zinc-200 bg-white rounded-xl shadow-none">
                  <SelectValue placeholder="Search or select source..." />
                </SelectTrigger>
                <SelectContent>
                  {availableKBs.length === 0 ? (
                    <div className="p-4 text-center text-zinc-400 text-xs">No files available.</div>
                  ) : (
                    availableKBs.map((kb) => (
                      <SelectItem key={kb.id} value={kb.id}>{kb.name} ({kb.type})</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
           </div>
        </div>
      </section>
    </div>
  );
};

export default LLMSettingsForm;