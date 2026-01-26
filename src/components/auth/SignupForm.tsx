import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';

interface SignupFormProps {
  onSubmit: (data: any) => Promise<void>;
  onBackToLogin: () => void;
  isLoading: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, onBackToLogin, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '', // Maps to email in your Java DTO
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Directly submit name, username (email), and password
    onSubmit(formData);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Create an account</h2>
        <p className="text-xs text-zinc-500 mt-1.5 font-medium">
          Step 1 of 4: Account Details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* FULL NAME */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Full Name</Label>
          <div className="relative group">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={17} />
            <Input
              required
              placeholder="John Doe"
              autoComplete="off"
              className="pl-11 h-11 bg-zinc-50/50 border-zinc-100 rounded-xl focus:ring-0 focus:border-blue-500 transition-all text-sm shadow-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        {/* EMAIL (USERNAME) */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</Label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={17} />
            <Input
              required
              type="email"
              autoComplete="off"
              placeholder="name@company.com"
              className="pl-11 h-11 bg-zinc-50/50 border-zinc-100 rounded-xl focus:ring-0 focus:border-blue-500 transition-all text-sm shadow-none"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Password</Label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={17} />
            <Input
              required
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="pl-11 h-11 bg-zinc-50/50 border-zinc-100 rounded-xl focus:ring-0 focus:border-blue-500 transition-all text-sm shadow-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <Button 
          disabled={isLoading}
          className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold shadow-md transition-all active:scale-[0.98] mt-4"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <div className="flex items-center gap-2 text-xs">
              Continue to Verify Email <ArrowRight size={16} />
            </div>
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-zinc-50 text-center">
        <p className="text-[13px] text-zinc-500">
          Already have an account?{' '}
          <button 
            onClick={onBackToLogin}
            className="text-zinc-900 font-bold hover:underline underline-offset-4"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;