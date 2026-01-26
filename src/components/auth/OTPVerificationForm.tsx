import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';

interface OTPProps {
  title: string;
  description: string;
  onSubmit: (otp: string) => Promise<void>;
  isLoading: boolean;
}

const OTPVerificationForm: React.FC<OTPProps> = ({ title, description, onSubmit, isLoading }) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) onSubmit(otp);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">{title}</h2>
        <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Verification Code</Label>
          <div className="relative group">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <Input
              required
              maxLength={6}
              placeholder="000000"
              className="pl-11 h-12 bg-zinc-50/50 border-zinc-100 rounded-xl focus:ring-0 focus:border-blue-500 transition-all text-center tracking-[1em] font-mono text-lg shadow-none"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>

        <Button disabled={isLoading || otp.length < 6} className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold shadow-md transition-all active:scale-[0.98]">
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
            <div className="flex items-center gap-2 text-xs">Verify Code <ArrowRight size={16} /></div>
          )}
        </Button>
      </form>
    </div>
  );
};

export default OTPVerificationForm;