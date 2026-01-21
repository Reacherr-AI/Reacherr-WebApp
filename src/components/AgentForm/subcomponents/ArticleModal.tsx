import React, { useState } from 'react';
import { PenTool } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KnowledgeItemUi } from '../AgentForm.types';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: KnowledgeItemUi) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (!title || !content) return;

    const newItem: KnowledgeItemUi = {
      id: Date.now().toString(),
      type: 'article',
      name: title,
      // Use first 100 chars as description snippet
      description: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      articleContent: content,
      status: 'pending_upload'
    };
    
    onSave(newItem);
    setTitle(''); setContent('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool size={20} className="text-emerald-500" /> Write Custom Article
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="article-title">Title</Label>
            <Input id="article-title" placeholder="e.g. Company Refund Policy" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="article-content">Content</Label>
            <Textarea id="article-content" placeholder="Paste text here..." className="h-32 resize-none" value={content} onChange={e => setContent(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title || !content} className="bg-zinc-900">Save Article</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};