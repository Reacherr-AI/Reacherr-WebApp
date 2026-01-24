import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, DialogContent, DialogTitle
} from '@/ui/dialog';
import { Button } from '@/ui/button';
import { 
  MessageSquare, Waypoints, LayoutGrid, X, 
  Sparkles 
} from 'lucide-react';
import { getTemplates } from '@/api/client';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  description: string;
}

const CreateAgentModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [architecture, setArchitecture] = useState<'single-prompt' | 'conversational'>('single-prompt');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('blank');
  const navigate = useNavigate();

  // Fetch templates from the dynamic API
  useEffect(() => {
    if (isOpen) {
      getTemplates()
        .then((res) => setTemplates(res.data))
        .catch((err) => console.error("Failed to load templates", err));
    }
  }, [isOpen]);

  const handleCreate = () => {
    navigate('/agents/create', { 
      state: { architecture, templateId: selectedTemplateId } 
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[640px] p-0 gap-0 border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] rounded-[24px] overflow-hidden bg-white dark:bg-zinc-950 transition-all">
        
        {/* REFINED HEADER - Single Close Icon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
              <Sparkles size={18} className="text-blue-600" />
            </div>
            <div>
               <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                 Create New Agent
               </DialogTitle>
               <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">Select architecture and starting template</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <X size={18} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* ARCHITECTURE SELECTION - Floating Selected State with Gray Border */}
          <section className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">
              Agent Architecture
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'single-prompt', title: 'Single Prompt', desc: 'Instruction-driven LLM execution for simple tasks.', icon: MessageSquare },
                { id: 'conversational', title: 'Conversational Flow', desc: 'Node-based logic for complex flows.', icon: Waypoints }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setArchitecture(type.id as any)}
                  className={cn(
                    "relative flex flex-col text-left p-4 rounded-xl border transition-all duration-300",
                    architecture === type.id 
                      ? "border-zinc-400 dark:border-zinc-700 bg-white dark:bg-zinc-900 -translate-y-1.5 shadow-xl" // Floating & Gray Border
                      : "border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:border-zinc-200 shadow-sm"
                  )}
                >
                  <div className="mb-3">
                    <div className="p-1.5 bg-zinc-50 dark:bg-zinc-800 w-fit rounded-lg shadow-sm">
                      <type.icon size={16} className="text-blue-600" />
                    </div>
                  </div>
                  <h4 className={cn("text-sm font-bold transition-colors", architecture === type.id ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500")}>{type.title}</h4>
                  <p className="text-xs mt-1 text-zinc-500 dark:text-zinc-400 leading-relaxed">{type.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* INDUSTRY TEMPLATE SELECTION - Floating Selected State with Gray Border */}
          <section className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">
              Industry Template
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Blank Agent Option */}
              <button
                onClick={() => setSelectedTemplateId('blank')}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all h-28 flex flex-col justify-between",
                  selectedTemplateId === 'blank' 
                    ? "border-zinc-400 dark:border-zinc-700 bg-white dark:bg-zinc-900 -translate-y-1.5 shadow-xl" 
                    : "border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:border-zinc-200 shadow-sm"
                )}
              >
                <div className="p-1.5 bg-zinc-50 dark:bg-zinc-800 w-fit rounded-lg shadow-sm">
                  <LayoutGrid size={16} className="text-blue-600" />
                </div>
                <div>
                  <h5 className={cn("text-sm font-bold transition-colors", selectedTemplateId === 'blank' ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500")}>Blank Agent</h5>
                  <p className="text-xs text-zinc-400 mt-0.5">Start from scratch</p>
                </div>
              </button>

              {/* Dynamic Templates from API */}
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all h-28 flex flex-col justify-end",
                    selectedTemplateId === template.id 
                      ? "border-zinc-400 dark:border-zinc-700 bg-white dark:bg-zinc-900 -translate-y-1.5 shadow-xl" 
                      : "border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:border-zinc-200 shadow-sm"
                  )}
                >
                  <div className="overflow-hidden">
                    <h5 className={cn("text-sm font-bold transition-colors", selectedTemplateId === template.id ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500")}>{template.name}</h5>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-snug">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* TIGHT FOOTER */}
        <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/20 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="text-xs font-bold text-zinc-500 h-9 px-5 rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 h-9 px-7 rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-all"
          >
            Create Agent
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default  CreateAgentModal;