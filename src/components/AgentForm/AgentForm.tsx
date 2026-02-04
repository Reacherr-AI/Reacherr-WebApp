import React from 'react';
import {
  BrainCircuit,
  Sparkles
} from 'lucide-react';
import { AgentFormProps } from './AgentForm.types';
import { Button } from '@/ui/button';
import TextareaField from './subcomponents/TextareaField';

const AgentForm: React.FC<AgentFormProps> = ({
  data, onChange
}) => {

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
    <div className="mx-auto space-y-6 animate-in fade-in duration-700 pb-10">
      {/* <div className="space-y-1.5 px-1 mb-4">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Agent Personality</h2>
        <p className="text-sm text-zinc-500 font-medium">Define core instructions and behavioral guardrails for your agent.</p>
      </div> */}

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
  );
};

export default AgentForm;
