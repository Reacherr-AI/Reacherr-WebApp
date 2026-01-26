import React, { useState } from 'react';
import { Phone, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';

const AddPhoneForm = ({ onSubmit, isLoading }: { onSubmit: (phone: string) => void, isLoading: boolean }) => {
  const [phone, setPhone] = useState('+91');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Add Phone Number</h2>
        <p className="text-sm text-zinc-500 mt-2">Required for two-factor security and agent telephony.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(phone); }} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Mobile Number</Label>
          <div className="relative group">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <Input
              required
              placeholder="+91 00000 00000"
              className="pl-11 h-12 bg-zinc-50/50 border-zinc-100 rounded-xl focus:ring-0 focus:border-blue-500 transition-all text-sm shadow-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <Button disabled={isLoading} className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold shadow-md transition-all active:scale-[0.98]">
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
            <div className="flex items-center gap-2 text-xs">Send SMS Code <ArrowRight size={16} /></div>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AddPhoneForm;