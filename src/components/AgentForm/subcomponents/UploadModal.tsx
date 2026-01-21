import React, { useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KnowledgeItemUi } from '../AgentForm.types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: KnowledgeItemUi) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSave }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = () => {
    if (!file) return;
    
    const newItem: KnowledgeItemUi = {
      id: Date.now().toString(),
      type: 'pdf',
      name: file.name,
      description: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      fileData: file,
      status: 'pending_upload'
    };
    
    onSave(newItem);
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={20} className="text-red-500" /> Upload Document
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-200 border-dashed rounded-lg cursor-pointer bg-zinc-50 hover:bg-zinc-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-zinc-400" />
                <p className="text-sm text-zinc-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-zinc-400">PDF (MAX. 10MB)</p>
              </div>
              <Input id="dropzone-file" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          {file && (
            <div className="text-sm flex items-center gap-2 bg-blue-50 p-2 rounded text-blue-700">
              <FileText size={14} /> Selected: <span className="font-semibold">{file.name}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!file} className="bg-zinc-900">Attach File</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};