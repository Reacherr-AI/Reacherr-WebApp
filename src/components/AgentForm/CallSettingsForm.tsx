import React from 'react';
import { CallSettingsFormProps } from './AgentForm.types';
import { Slider } from '@/ui/slider';
import { Switch } from '@/ui/switch';
import { Label } from '@/ui/label';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { Textarea } from '@/ui/textarea';
import { cn } from '@/lib/utils';
import { RefreshCcw, Voicemail, Timer, Info, PhoneOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/Tooltip";

const CallSettingsForm: React.FC<CallSettingsFormProps> = ({ data, onChange }) => {
  
  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 bg-blue-50/50 rounded-md border border-blue-100/30">
        <Icon size={14} className="text-blue-600" />
      </div>
      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">{title}</h3>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 animate-in fade-in duration-500 pb-12">
      
      {/* 1. COMPACT PAGE HEADER */}
      <div className="px-1 mb-2">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Conversation Settings</h2>
        <p className="text-xs text-zinc-500 font-medium">Manage agent behavior for silence, voicemail, and automated systems.</p>
      </div>

      {/* 2. RE-ENGAGE SECTION */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
        <div className="flex items-center justify-between mb-5">
            <SectionHeader icon={RefreshCcw} title="Re-engage & Silence Handling" />
            <Switch className="scale-75" checked={data.reEngageEnabled} onCheckedChange={(val) => onChange('reEngageEnabled', val)} />
        </div>

        <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-6 transition-all", !data.reEngageEnabled && "opacity-40 grayscale-[0.5] pointer-events-none")}>
          <div className="lg:col-span-8 space-y-2.5">
             <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Silence Message</Label>
             <Textarea 
                value={data.reEngageMessage} 
                onChange={(e) => onChange('reEngageMessage', e.target.value)}
                placeholder="Message to play if user is silent..."
                className="min-h-[100px] bg-zinc-50/30 border-zinc-200 resize-none text-sm leading-relaxed p-4 focus:bg-white transition-all rounded-xl"
              />
          </div>
          <div className="lg:col-span-4 flex flex-col justify-end">
             <div className="bg-zinc-50/50 p-5 rounded-xl border border-zinc-100">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Attempts</label>
                    <span className="text-[10px] font-mono font-bold text-zinc-600 bg-white border border-zinc-200 px-2 py-1 rounded shadow-sm">{data.reEngageAttempts}</span>
                </div>
                <Slider value={[data.reEngageAttempts]} min={1} max={5} step={1} onValueChange={(v) => onChange('reEngageAttempts' as any, v[0])} />
             </div>
          </div>
        </div>
      </section>

      {/* 3. HORIZONTAL IVR HANGUP */}
      <section className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                    <PhoneOff size={18} className="text-zinc-400" />
                </div>
                <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-zinc-800 tracking-tight">IVR & DTMF Hangup</h3>
                    <p className="text-[11px] text-zinc-400 font-medium">Automatically end the call if an automated system or keypad input is detected.</p>
                </div>
            </div>
            <Switch className="scale-75" checked={data.ivrHangupEnabled} onCheckedChange={(val) => onChange('ivrHangupEnabled' as any, val)} />
        </div>
      </section>

      {/* 4. VOICEMAIL DETECTION LOGIC */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
            <SectionHeader icon={Voicemail} title="Voicemail Logic" />
            <Switch className="scale-75" checked={data.voicemailDetectionEnabled} onCheckedChange={(val) => onChange('voicemailDetectionEnabled', val)} />
        </div>

        {data.voicemailDetectionEnabled && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-top-2">
            <div className="lg:col-span-4 space-y-3">
               <Label className="text-[10px] font-bold text-zinc-400 uppercase">Detection Action</Label>
               <RadioGroup value={data.voicemailAction} onValueChange={(val: any) => onChange('voicemailAction', val)} className="gap-2">
                    <div className={cn("flex items-center space-x-2 p-2.5 rounded-lg border text-xs transition-all", data.voicemailAction === 'hangup' ? "bg-blue-50/30 border-blue-200" : "border-zinc-100")}>
                        <RadioGroupItem value="hangup" id="hangup" className="scale-75" />
                        <Label htmlFor="hangup" className="cursor-pointer font-medium text-zinc-700">Immediate Hangup</Label>
                    </div>
                    <div className={cn("flex items-center space-x-2 p-2.5 rounded-lg border text-xs transition-all", data.voicemailAction === 'leave_message' ? "bg-blue-50/30 border-blue-200" : "border-zinc-100")}>
                        <RadioGroupItem value="leave_message" id="leave_message" className="scale-75" />
                        <Label htmlFor="leave_message" className="cursor-pointer font-medium text-zinc-700">Leave Message</Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="lg:col-span-8">
                {data.voicemailAction === 'leave_message' ? (
                  <Textarea 
                    value={data.voicemailMessage} 
                    onChange={(e) => onChange('voicemailMessage', e.target.value)} 
                    placeholder="Hey {{user_name}}, please call back..." 
                    className="min-h-[104px] bg-zinc-50/30 border-zinc-200 p-4 text-sm rounded-xl" 
                  />
                ) : (
                  <div className="h-full min-h-[104px] flex items-center justify-center border-2 border-dashed border-zinc-50 rounded-xl bg-zinc-50/30">
                    <p className="text-[10px] font-bold text-zinc-300 uppercase">Hangup Logic Enabled</p>
                  </div>
                )}
            </div>
          </div>
        )}
      </section>

      {/* 5. PERFORMANCE TIMINGS */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <SectionHeader icon={Timer} title="System Guardrails" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
                { label: 'No Response', val: data.noResponseTime, f: 'noResponseTime', s: 's', info: 'How long the agent waits for user input before acting.' },
                { label: 'Max Duration', val: data.maxCallDuration, f: 'maxCallDuration', s: 'm', info: 'The hard limit for the total length of a single conversation.' },
                { label: 'Max Ringing', val: data.maxRingDuration, f: 'maxRingDuration', s: 's', info: 'Maximum time the agent will wait for the user to pick up.' }
            ].map(item => (
                <div key={item.f} className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-colors group">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{item.label}</label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger><Info size={13} className="text-zinc-300 group-hover:text-blue-500 transition-colors" /></TooltipTrigger>
                                    <TooltipContent className="text-[10px] bg-zinc-900 text-white border-none p-2 rounded-lg shadow-xl max-w-[180px]">
                                        {item.info}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-zinc-600 bg-white border border-zinc-200 px-2 py-0.5 rounded shadow-sm">
                            {item.val}{item.s}
                        </span>
                    </div>
                    <Slider value={[item.val || 0]} onValueChange={(v) => onChange(item.f as any, v[0])} />
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default CallSettingsForm;