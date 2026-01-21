import React from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  MessageSquare, 
  Info, 
  Clock
} from 'lucide-react';
import { AgentFormProps } from './AgentForm.types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import TextareaField from './subcomponents/TextareaField';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';

const AgentForm: React.FC<AgentFormProps> = ({
  data, onChange
}) => {

  const isUserSpeaker = data.firstSpeaker === 'user';
  const isAiStatic = data.firstSpeaker === 'ai';
  const isStaticAllowed = isAiStatic || (isUserSpeaker && data.userGreetingType === 'static');

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-blue-50/50 rounded-md">
        <Icon size={14} className="text-blue-600" />
      </div>
      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.12em]">
        {title}
      </h3>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-700 pb-12">
      {/* <div className="space-y-1.5 px-1 mb-4">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Agent Personality</h2>
        <p className="text-sm text-zinc-500 font-medium">Define core instructions and behavioral guardrails for your agent.</p>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SYSTEM PROMPT (Span 8) */}
        <div className="lg:col-span-8">
          <section className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6">
                <SectionHeader icon={BrainCircuit} title="System Prompt & Instructions" />
                
                <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-3 text-[10px] font-bold gap-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all rounded-lg border border-transparent hover:border-blue-100"
                  >
                    <Sparkles size={13} className="text-purple-500 animate-pulse" />
                    GENERATE WITH AI
                </Button>
            </div>

            <div className="relative group">
              <TextareaField
                name="description"
                value={data.description}
                onChange={(e: any) => onChange('description', e.target.value)}
                placeholder="Describe the agent's personality, goals, and core instructions in detail..."
                required
                className="min-h-[520px] bg-zinc-50/30 border-zinc-200 resize-none text-zinc-800 text-sm leading-relaxed p-6 group-hover:bg-white transition-all rounded-xl focus:shadow-inner"
              />
              <div className="absolute bottom-4 right-4 text-[9px] font-bold text-zinc-400 font-mono bg-white/90 px-2 py-1 rounded border border-zinc-100 shadow-sm">
                {data.description.length} / 8000 CHARS
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: LOGIC & TIMING (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-7 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <SectionHeader icon={MessageSquare} title="Conversation Logic" />
            <div className="mt-6 space-y-6">
              
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">First Speaker</Label>
                <Select value={data.firstSpeaker} onValueChange={(val) => onChange('firstSpeaker', val)}>
                  <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200 rounded-xl shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-zinc-100">
                    <SelectItem value="user">User speaks first</SelectItem>
                    <SelectItem value="ai">AI speaks first</SelectItem>
                    <SelectItem value="ai_dynamic">AI speaks with dynamic message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label className={cn("text-[10px] font-bold uppercase tracking-tight", isStaticAllowed ? "text-zinc-400" : "text-zinc-300")}>
                    Welcome Message
                </Label>
                <Input
                  name="welcomeMessage"
                  value={data.welcomeMessage}
                  onChange={(e) => onChange('welcomeMessage', e.target.value)}
                  placeholder={isStaticAllowed ? "e.g. Hello, how can I help?" : "Automated based on prompt"}
                  disabled={!isStaticAllowed}
                  className={cn(
                    "h-11 border-zinc-200 transition-all rounded-xl shadow-none",
                    isStaticAllowed ? "bg-white" : "bg-zinc-50 text-zinc-400 border-dashed"
                  )}
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-7 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <SectionHeader icon={Clock} title="Behavioral Timing" />
            <div className="mt-6 bg-zinc-50/50 p-5 rounded-xl border border-zinc-100 space-y-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                   <span className="text-[11px] font-bold text-zinc-600">Initiation Delay</span>
                   <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><Info size={12} className="text-zinc-400" /></TooltipTrigger>
                        <TooltipContent className="text-[10px] font-medium p-3 max-w-[200px] leading-relaxed">
                            Milliseconds the AI waits before delivering the first greeting.
                        </TooltipContent>
                      </Tooltip>
                   </TooltipProvider>
                </div>
                <span className="text-[10px] font-mono font-bold bg-zinc-900 text-white px-2 py-0.5 rounded shadow-sm">
                   {data.waitDuration} sec
                </span>
              </div>
              <Slider 
                value={[data.waitDuration]} 
                max={30} 
                step={1} 
                onValueChange={(vals) => onChange('waitDuration', vals[0])} 
              />
              <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                <span>0</span>
                {/* <span>Natural</span> */}
                <span>30</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AgentForm;
