import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from "lucide-react";

export const SMSModal = ({ isOpen, onClose, data, onChange }: any) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-md">
      <DialogHeader >
        <DialogTitle className="flex items-center gap-2 text-zinc-900">
            <MessageSquare size={18} className="text-blue-600" /> SMS Notification
          </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-zinc-500 uppercase">Name</Label>
          <Input 
            value={data.name}
            placeholder='e.g. send_sms_notification' 
            onChange={(e) => onChange('name', e.target.value)}
            className="bg-zinc-50" 
            />
        </div>
        <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Description</Label>
            <Textarea 
                placeholder="e.g. Transfer to agent when user requests specialized help" 
                value={data.description}
                onChange={(e) => onChange('description', e.target.value)}
                className="h-20 resize-none border-zinc-200 focus:ring-1 text-sm leading-relaxed"
            />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-zinc-500 uppercase">SMS Content</Label>
          <Tabs defaultValue="static" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
              <TabsTrigger value="static">Static Sentence</TabsTrigger>
            </TabsList>
            <Textarea 
              placeholder="e.g. Hi, you have successfully booked an appointment." 
              value={data.content}
              onChange={(e) => onChange('content', e.target.value)}
              className="h-24 resize-none"
            />
          </Tabs>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button className="bg-zinc-900" onClick={onClose}>Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);