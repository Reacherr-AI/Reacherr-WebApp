import React, { useState } from 'react';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';

interface LoginFormProps {
  onSubmit: (credentials: any) => Promise<void>;
  onSwitchToSignup: () => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onSwitchToSignup, isLoading }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleGoogleSignIn = () => {
    // Logic to hit your backend oauth endpoint: /api/v1/auth/google
    window.location.href = `http://localhost:8080/oauth2/authorization/google`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Welcome back</h2>
        <p className="text-sm text-zinc-500 mt-2">Sign in to manage your AI voice agents.</p>
      </div>

      {/* GOOGLE SIGN IN OPTION */}
      <Button 
        type="button"
        variant="outline" 
        onClick={handleGoogleSignIn}
        className="w-full h-11 border-zinc-200 rounded-xl font-bold text-xs gap-3 hover:bg-zinc-50 mb-6 shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-100" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
          <span className="bg-white px-3 text-zinc-400">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        {/* EMAIL ADDRESS */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</Label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={17} />
            <Input
              required
              type="email"
              autoComplete="new-email" // Anti-autofill override
              placeholder="name@company.com"
              className="pl-11 h-11 bg-zinc-50/50 border-zinc-100 rounded-xl focus:ring-0 focus:border-blue-500 transition-all text-sm shadow-none"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Password</Label>
            <button 
              type="button"
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline uppercase tracking-tight"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={17} />
            <Input
              required
              type="password"
              autoComplete="new-password" // Specific signal to not pre-fill old passwords
              placeholder="••••••••"
              className="pl-11 h-11 bg-zinc-50/50 border-zinc-100 rounded-xl focus:ring-0 focus:border-blue-500 transition-all text-sm shadow-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <Button disabled={isLoading} className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold shadow-md transition-all active:scale-[0.98] mt-4">
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
            <div className="flex items-center gap-2 text-xs">Sign In <LogIn size={16} /></div>
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-zinc-50 text-center">
        <p className="text-[13px] text-zinc-500">
          New to Reacherr?{' '}
          <button onClick={onSwitchToSignup} className="text-zinc-900 font-bold hover:underline underline-offset-4">
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;