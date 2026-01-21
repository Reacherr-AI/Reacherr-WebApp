import React, { useState } from 'react';
import { 
  Search, FileText, Link2, PenTool, Trash2, 
  Database, ExternalLink, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LLMSettingsFormData, KnowledgeItemUi } from '../components/AgentForm/AgentForm.types';
import { UploadModal } from '../components/AgentForm/subcomponents/UploadModal';
import { UrlModal } from '../components/AgentForm/subcomponents/UrlModal';
import { ArticleModal } from '../components/AgentForm/subcomponents/ArticleModal';
import { Label } from '../components/ui/label';

interface KnowledgeBasePageProps {
  data: LLMSettingsFormData; 
  onChange: (field: keyof LLMSettingsFormData, value: any) => void;
}

const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ data, onChange }) => {
  const [activeModal, setActiveModal] = useState<'upload' | 'url' | 'article' | null>(null);

  const items = data.knowledgeBaseItems || [];

  const handleAddItem = (newItem: KnowledgeItemUi) => {
    const updatedItems = [...items, newItem];
    onChange('knowledgeBaseItems', updatedItems);
  };

  const handleRemoveItem = (idToRemove: string) => {
    const updatedItems = items.filter(item => item.id !== idToRemove);
    onChange('knowledgeBaseItems', updatedItems);
  };

  // Helper to render icon based on type
  const getIcon = (type: KnowledgeItemUi['type']) => {
    switch (type) {
      case 'pdf': return <FileText size={18} className="text-red-500" />;
      case 'url': return <Link2 size={18} className="text-blue-500" />;
      case 'article': return <PenTool size={18} className="text-emerald-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="space-y-1 mb-8">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Agent Knowledge</h2>
        <p className="text-sm text-zinc-500">
          Manage the specific documents and resources this agent uses.
        </p>
      </div>

      {/* 1. Search Connector (Visual Placeholder for now) */}
      <section className="space-y-3">
         <div className="flex items-center justify-between">
             <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Search & Attach from Library</Label>
             <Button variant="link" className="text-xs text-blue-600 h-auto p-0 font-normal">
                Go to Global Library <ExternalLink size={10} className="ml-1" />
             </Button>
         </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <Input 
            placeholder="Search existing PDFs, URLs..." 
            className="pl-10 bg-zinc-50/50 border-zinc-200"
            readOnly // Readonly for now as it's a placeholder
          />
        </div>
      </section>

      {/* 2. Quick Add Buttons */}
      <section className="space-y-3 pt-6">
        <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Or Quick Add New</Label>
        <div className="grid grid-cols-3 gap-4">
          <QuickAddButton 
            icon={FileText} label="Upload PDF" colorCls="text-red-500 bg-red-50" 
            onClick={() => setActiveModal('upload')} 
          />
           <QuickAddButton 
            icon={Link2} label="Add URL" colorCls="text-blue-500 bg-blue-50" 
            onClick={() => setActiveModal('url')} 
          />
           <QuickAddButton 
            icon={PenTool} label="Write Article" colorCls="text-emerald-500 bg-emerald-50" 
            onClick={() => setActiveModal('article')} 
          />
        </div>
      </section>

      {/* 3. Attached Items List */}
      <section className="space-y-3 pt-8">
        <div className="flex items-center justify-between px-1">
          <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            Attached Sources ({items.length})
          </Label>
        </div>

        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {items.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-800 line-clamp-1">{item.name}</p>
                       {item.description && (
                          <p className="text-[11px] text-zinc-400 line-clamp-1">{item.description}</p>
                       )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.status === 'pending_upload' ? (
                        <Badge variant="secondary" className="text-[9px] bg-amber-50 text-amber-600 animate-pulse">Pending Save</Badge>
                    ) : (
                        <div className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-bold uppercase">Ready</span>
                        </div>
                    )}
                    
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="h-8 w-8 text-zinc-300 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
              <Database className="text-zinc-200" size={24} />
              <p className="text-sm font-medium text-zinc-400">No knowledge attached yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      <UploadModal isOpen={activeModal === 'upload'} onClose={() => setActiveModal(null)} onSave={handleAddItem} />
      <UrlModal isOpen={activeModal === 'url'} onClose={() => setActiveModal(null)} onSave={handleAddItem} />
      <ArticleModal isOpen={activeModal === 'article'} onClose={() => setActiveModal(null)} onSave={handleAddItem} />
    </div>
  );
};

// Helper Component for Quick Add Buttons
const QuickAddButton = ({ icon: Icon, label, colorCls, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 border border-zinc-200 bg-white rounded-xl hover:border-zinc-300 hover:shadow-sm transition-all active:scale-[0.98] group"
  >
    <div className={cn("p-2.5 rounded-lg mb-2 transition-colors group-hover:bg-zinc-900", colorCls)}>
      <Icon size={20} className={cn("transition-colors group-hover:text-white")} />
    </div>
    <span className="text-xs font-bold text-zinc-700">{label}</span>
  </button>
);

export default KnowledgeBasePage;