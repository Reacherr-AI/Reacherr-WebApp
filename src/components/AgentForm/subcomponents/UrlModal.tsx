import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KnowledgeItemUi } from '../AgentForm.types';

interface UrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: KnowledgeItemUi) => void;
}

export const UrlModal: React.FC<UrlModalProps> = ({ isOpen, onClose, onSave }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!url || !name) return;
    
    const newItem: KnowledgeItemUi = {
      id: Date.now().toString(),
      type: 'url',
      name: name,
      description: url,
      urlData: url,
      status: 'pending_upload' // Or 'ready' if URLs don't need uploading
    };
    
    onSave(newItem);
    setUrl(''); setName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 size={20} className="text-blue-500" /> Add Web Resource
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url-name">Resource Name</Label>
            <Input id="url-name" placeholder="e.g. Pricing Page" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url-link">URL</Label>
            <Input id="url-link" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!url || !name} className="bg-zinc-900">Attach URL</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};