import React, { useState } from 'react';
import { 
  FileText, CheckCircle2, UserCircle, Hash, Plus, Trash2, Edit2, Webhook, Clock, 
} from 'lucide-react';
import { PostCallAnalysisFormProps, AnalysisExtractionItem } from './AgentForm.types';
import { Switch } from '@/ui/switch';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { AnalysisItemModal } from './subcomponents/AnalysisItemModal';
import { cn } from '@/lib/utils';
import { Label } from '@/ui/label';
import { Slider } from '@/ui/slider';

const PostCallAnalysisForm: React.FC<PostCallAnalysisFormProps> = ({ data, onChange }) => {
  const [modalState, setModalState] = useState<{ open: boolean, type: string, item: any }>({ open: false, type: 'text', item: null });

  const updateItem = (updated: AnalysisExtractionItem) => {
    const exists = data.extractionItems.find(i => i.id === updated.id);
    const newList = exists 
      ? data.extractionItems.map(i => i.id === updated.id ? updated : i)
      : [...data.extractionItems, { ...updated, id: Date.now().toString(), enabled: true }];
    onChange('extractionItems', newList);
  };

  const ExtractionRow = ({ item }: { item: AnalysisExtractionItem }) => (
    <div className="flex items-center justify-between p-3 bg-zinc-50/50 rounded-lg border border-zinc-100 hover:bg-white hover:shadow-sm transition-all group">
      <div className="flex items-center gap-3">
        {item.type === 'text' && <FileText size={16} className="text-zinc-400" />}
        {item.type === 'boolean' && <CheckCircle2 size={16} className="text-zinc-400" />}
        {item.type === 'number' && <Hash size={16} className="text-zinc-400" />}
        {item.type === 'selector' && <UserCircle size={16} className="text-zinc-400" />}
        <span className="text-sm font-semibold text-zinc-700">{item.name || 'Untitled Field'}</span>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setModalState({ open: true, type: item.type, item })}><Edit2 size={14} /></Button>
        {!['summary', 'success'].includes(item.id) && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => onChange('extractionItems', data.extractionItems.filter(i => i.id !== item.id))}><Trash2 size={14} /></Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="px-1">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Post Call Data Retrieval</h2>
        <p className="text-sm text-zinc-500">Define the information you need to extract from the voice conversation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: EXTRACTION LIST (Retell Style) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <div className="space-y-2">
              {data.extractionItems.map(item => <ExtractionRow key={item.id} item={item} />)}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10 px-4 rounded-lg font-bold border-zinc-200 shadow-xs">
                    <Plus size={16} /> Add Field
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem onClick={() => setModalState({ open: true, type: 'text', item: null })}>Text</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setModalState({ open: true, type: 'boolean', item: null })}>Boolean</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setModalState({ open: true, type: 'number', item: null })}>Number</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setModalState({ open: true, type: 'selector', item: null })}>Selector</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* RIGHT: WEBHOOK & TIMEOUT */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-blue-600">
                <Webhook size={18} />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">WebHook Config</h3>
              </div>
              <Switch checked={data.webhookEnabled} onCheckedChange={(v) => onChange('webhookEnabled', v)} />
            </div>

            <div className={cn("space-y-5 transition-opacity", !data.webhookEnabled && "opacity-40 pointer-events-none")}>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-500 uppercase">Webhook URL</Label>
                <Input 
                  value={data.webhookUrl} 
                  onChange={(e) => onChange('webhookUrl', e.target.value)} 
                  placeholder="https://your-api.com/webhooks"
                  className="h-11 border-zinc-200 bg-zinc-50/50"
                />
              </div>
              <div className="space-y-4 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-zinc-400" />
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-tight">Request Timeout</Label>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-600 bg-white border border-zinc-100 px-2 py-0.5 rounded shadow-xs">
                    {data.webhookTimeout}s
                  </span>
                </div>
                <Slider 
                  value={[data.webhookTimeout]} 
                  min={5} 
                  max={120} 
                  step={1} 
                  onValueChange={(vals) => onChange('webhookTimeout', vals[0])} 
                />
                <div className="flex justify-between text-[10px] font-bold text-zinc-300 uppercase">
                  <span>5s</span>
                  <span>Fast</span>
                  <span>Default (45s)</span>
                  <span>120s</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AnalysisItemModal 
        isOpen={modalState.open} 
        onClose={() => setModalState({ ...modalState, open: false })}
        onSave={updateItem}
        initialData={modalState.item}
        type={modalState.type}
      />
    </div>
  );
};

export default PostCallAnalysisForm;