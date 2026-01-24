import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { Button } from "@/ui/button";
import { Switch } from "@/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Plus, Trash2, Wand2 } from 'lucide-react';

// Helper type for headers UI
type HeaderPair = { key: string; value: string };

export const CustomFunctionModal = ({ isOpen, onClose, onSave, initialData }: any) => {

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endpointUrl: '',
    method: 'POST',
    parametersJson: '{\n  "type": "object",\n  "properties": {}\n}',
    speakDuringExecution: true,
    speakDuringMessage: 'Let me check that for you...', // Default message
    speakAfterExecution: true
  });

  const [headers, setHeaders] = useState<HeaderPair[]>([{ key: '', value: '' }]);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        endpointUrl: initialData.url, // Note: mapped from 'url' to 'endpointUrl'
        method: initialData.method,
        parametersJson: JSON.stringify(initialData.parameters_schema || {}, null, 2),
        speakDuringExecution: initialData.speak_during,
        speakDuringMessage: initialData.speak_during_message || 'Let me check that for you...',
        speakAfterExecution: initialData.speak_after,
      });

      // Convert stored JSON headers back to Array for UI
      if (initialData.headers) {
        const headerArray = Object.entries(initialData.headers).map(([key, value]) => ({ 
          key, 
          value: String(value) 
        }));
        setHeaders(headerArray.length > 0 ? headerArray : [{ key: '', value: '' }]);
      }
    }
  }, [initialData]);

  // --- Handlers ---
  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  
  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const pasteExampleSchema = () => {
    const example = {
      "type": "object",
      "properties": {
        "order_id": {
          "type": "string",
          "description": "The unique order ID given by the user, e.g., 'ORD-123'."
        }
      },
      "required": ["order_id"]
    };
    setFormData({ ...formData, parametersJson: JSON.stringify(example, null, 2) });
  };

  const handleSave = () => {
    // 1. Convert Headers Array -> Object
    const headersObj = headers.reduce((acc, curr) => {
      if (curr.key.trim()) acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    // 2. Validate JSON Schema
    let parsedSchema = {};
    try {
      parsedSchema = JSON.parse(formData.parametersJson);
    } catch (e) {
      alert("Invalid JSON in Parameters Schema");
      return;
    }

    // 3. Send to Parent
    onSave({
      ...formData,
      headers: headersObj,
      parameters_schema: parsedSchema,
      // Map frontend names back to DB names if needed
      url: formData.endpointUrl, 
      speak_during: formData.speakDuringExecution,
      speak_during_message: formData.speakDuringMessage,
      speak_after: formData.speakAfterExecution
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold">
            {initialData ? 'Edit Function' : 'New Custom Function'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* 1. Basic Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-bold text-zinc-500 uppercase">Function Name</Label>
              <Input 
                placeholder="e.g. check_order_status" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-500 uppercase">Method</Label>
              <Select value={formData.method} onValueChange={v => setFormData({...formData, method: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 2. Endpoint */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-500 uppercase">API Endpoint URL</Label>
            <Input 
              placeholder="https://api.yourdomain.com/v1/orders" 
              value={formData.endpointUrl} 
              onChange={e => setFormData({...formData, endpointUrl: e.target.value})} 
            />
          </div>

          {/* 3. Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-500 uppercase">Description</Label>
            <Textarea 
              placeholder="When should the AI call this? (e.g. 'Use this when the user asks for their order status')" 
              className="h-20 resize-none" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          {/* 4. Headers Builder (New UI) */}
          <div className="space-y-2">
             <Label className="text-xs font-bold text-zinc-500 uppercase">Headers</Label>
             <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      placeholder="Key (e.g. Authorization)" 
                      className="flex-1 h-9 bg-white"
                      value={header.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    />
                    <Input 
                      placeholder="Value (e.g. Bearer 123)" 
                      className="flex-1 h-9 bg-white"
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    />
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-red-500" onClick={() => removeHeader(index)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addHeader} className="text-xs h-8">
                  <Plus size={14} className="mr-1" /> Add Header
                </Button>
             </div>
          </div>

          {/* 5. JSON Schema */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-zinc-500 uppercase">JSON Schema (Parameters)</Label>
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-blue-600 text-[11px]" 
                onClick={pasteExampleSchema}
              >
                <Wand2 size={12} className="mr-1" /> Generate Example
              </Button>
            </div>
            <div className="bg-zinc-900 p-4 rounded-xl">
              <Textarea 
                className="font-mono text-[12px] h-32 bg-transparent text-emerald-400 border-none p-0 focus-visible:ring-0" 
                value={formData.parametersJson} 
                onChange={e => setFormData({...formData, parametersJson: e.target.value})} 
              />
            </div>
          </div>

          {/* 6. Execution Options (Updated) */}
          <div className="space-y-3 pt-2">
            
            {/* Speak During Toggle + Message Input */}
            <div className="p-3 border rounded-lg space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-zinc-800">Speak During Execution</p>
                  <p className="text-[11px] text-zinc-500">The agent will say a filler phrase while waiting for the API.</p>
                </div>
                <Switch 
                  checked={formData.speakDuringExecution} 
                  onCheckedChange={v => setFormData({...formData, speakDuringExecution: v})} 
                />
              </div>
              
              {/* Conditional Input Field */}
              {formData.speakDuringExecution && (
                <div className="animate-in fade-in slide-in-from-top-1">
                   <Input 
                    className="bg-zinc-50 border-zinc-200 text-sm"
                    placeholder="e.g., Let me check that for you..."
                    value={formData.speakDuringMessage}
                    onChange={e => setFormData({...formData, speakDuringMessage: e.target.value})}
                   />
                </div>
              )}
            </div>

            {/* Speak After Toggle */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-zinc-800">Speak After Execution</p>
                <p className="text-[11px] text-zinc-500">Allow the agent to verbally summarize the result.</p>
              </div>
              <Switch 
                checked={formData.speakAfterExecution} 
                onCheckedChange={v => setFormData({...formData, speakAfterExecution: v})} 
              />
            </div>
          </div>

        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-zinc-900 hover:bg-zinc-800 px-6" onClick={handleSave}>
            {initialData ? 'Update Tool' : 'Add Tool'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};