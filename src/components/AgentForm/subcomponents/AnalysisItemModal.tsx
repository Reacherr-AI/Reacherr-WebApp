import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus } from 'lucide-react';

export const AnalysisItemModal = ({ isOpen, onClose, onSave, initialData, type }: any) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    isOptional: true,
    options: ['']
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-white rounded-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="capitalize">{type}</DialogTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Optional</span>
              <Switch checked={formData.isOptional} onCheckedChange={(v) => setFormData({...formData, isOptional: v})} />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-bold">Name</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. appointment_booked" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-bold">Description</Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe what to extract..." 
              className="resize-none h-24"
            />
          </div>

          {type === 'selector' && (
            <div className="space-y-2">
              <Label className="text-sm font-bold">Choices</Label>
              {formData.options.map((opt: string, i: number) => (
                <div key={i} className="flex gap-2">
                  <Input 
                    value={opt} 
                    onChange={(e) => {
                      const newOpts = [...formData.options];
                      newOpts[i] = e.target.value;
                      setFormData({...formData, options: newOpts});
                    }}
                  />
                  <Button variant="ghost" size="icon" onClick={() => {
                    const newOpts = formData.options.filter((_: any, idx: number) => idx !== i);
                    setFormData({...formData, options: newOpts});
                  }}><Trash2 size={14}/></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setFormData({...formData, options: [...formData.options, '']})} className="w-full gap-2">
                <Plus size={14}/> Add Choice
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave({...formData, type}); onClose(); }} className="bg-zinc-900 text-white">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};