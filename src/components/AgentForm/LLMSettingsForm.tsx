import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Cpu, Database, Info, Layers, ExternalLink, FileText } from 'lucide-react';
import { LLMSettingsFormProps } from './AgentForm.types';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const LLM_CONFIG = {
  providers: [
    { name: "Azure OpenAI", slug: "azure", models: ["gpt-4o", "gpt-4.1-mini cluster", "gpt-35-turbo"] },
    { name: "OpenAI", slug: "openai", models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"] },
    { name: "Anthropic", slug: "anthropic", models: ["claude-3-5-sonnet", "claude-3-opus"] }
  ]
};

const LLMSettingsForm: React.FC<LLMSettingsFormProps & { availableKBs: any[] }> = ({ 
  data, 
  onChange, 
  availableKBs 
}) => {
  const navigate = useNavigate();
  const currentProvider = LLM_CONFIG.providers.find(p => p.slug === data.provider);

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-6">
      <div className="p-1.5 bg-blue-50/50 rounded-md border border-blue-100/30">
        <Icon size={14} className="text-blue-600" />
      </div>
      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">{title}</h3>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 pb-16">
      <section className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <SectionHeader icon={Layers} title="Model Configuration" />

        {/* 1. SELECTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
               <Cpu size={14} className="text-zinc-400" />
               <Label className="text-[11px] font-bold text-zinc-500 uppercase">LLM Provider</Label>
            </div>
            <Select value={data.provider} onValueChange={(v) => onChange('provider', v)}>
              <SelectTrigger className="h-12 border-zinc-200 bg-zinc-50/30 rounded-xl shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-100 shadow-xl">
                {LLM_CONFIG.providers.map(p => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
               <Brain size={14} className="text-zinc-400" />
               <Label className="text-[11px] font-bold text-zinc-500 uppercase">Model Cluster</Label>
            </div>
            <Select value={data.model} onValueChange={(v) => onChange('model', v)}>
              <SelectTrigger className="h-12 border-zinc-200 bg-zinc-50/30 rounded-xl shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-100 shadow-xl">
                {currentProvider?.models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 2. PERFORMANCE SLIDERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-zinc-50">
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <Label className="text-[11px] font-bold text-zinc-700 uppercase">Max Tokens</Label>
              <span className="text-[10px] font-mono font-bold bg-zinc-900 text-white px-2 py-0.5 rounded shadow-sm">{data.maxTokens}</span>
            </div>
            <Slider value={[data.maxTokens]} max={2048} min={64} step={32} onValueChange={(v) => onChange('maxTokens', v[0])} />
          </div>

          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <Label className="text-[11px] font-bold text-zinc-700 uppercase">Temperature</Label>
              <span className="text-[10px] font-mono font-bold bg-zinc-900 text-white px-2 py-0.5 rounded shadow-sm">{data.temperature}</span>
            </div>
            <Slider value={[data.temperature]} max={1.0} min={0} step={0.1} onValueChange={(v) => onChange('temperature', v[0])} />
          </div>
        </div>

        {/* 3. DYNAMIC KNOWLEDGE BASE */}
        <div className="mt-10 pt-10 border-t border-zinc-50">
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={14} className="text-blue-400" />
                  <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">Active Knowledge Base</Label>
                </div>
                {/* GLOBAL ROUTE LINK */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/knowledge-base')}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1.5 h-7 px-2"
                >
                  Add Knowledge Base <ExternalLink size={10} />
                </Button>
              </div>

              {/* DYNAMIC LIST FROM DB */}
              <Select 
                value={data.knowledgeBase[0]?.id || ""} 
                onValueChange={(kbId) => {
                  const selected = availableKBs.find(kb => kb.id === kbId);
                  if (selected) onChange('knowledgeBase', [selected]);
                }}
              >
                <SelectTrigger className="h-12 border-zinc-200 bg-white rounded-xl shadow-none">
                  <SelectValue placeholder="Search or select from your uploaded files..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-100 shadow-2xl">
                  {availableKBs.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                       <Database size={24} className="text-zinc-200 mx-auto" />
                       <p className="text-xs text-zinc-400 font-medium">No files found in database.</p>
                    </div>
                  ) : (
                    availableKBs.map((kb) => (
                      <SelectItem key={kb.id} value={kb.id}>
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-zinc-400" />
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-semibold text-zinc-700">{kb.name}</span>
                            <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-tighter">
                              {kb.type} • Last Indexed: {new Date(kb.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
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