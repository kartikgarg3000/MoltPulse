'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Github, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(searchParams.get('error'));
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleManualAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    if (!email || !password) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } else {
      if (!fullName) {
        setError('Full name is required for sign up');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email to verify your account! If email confirmations are disabled, you can log in now.');
        setIsLogin(true); // Switch to login view
      }
    }

    setIsLoading(false);
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 py-12">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8">
            <span className="text-white font-black text-4xl">M</span>
        </div>
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-400 to-gray-600">
          Welcome to the Pulse
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Join the community to vote on agents, track your favorites, and contribute to the map.
        </p>
      </div>

      <div className="w-full max-w-md glass p-8 rounded-[2rem] border border-white/10 space-y-6">
        
        {/* Toggle between Sign In and Sign Up */}
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
            <button 
                onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Sign In
            </button>
            <button 
                onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
                Create Account
            </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleManualAuth} className="space-y-4">
          {!isLogin && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  placeholder="John Doe"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email</label>
            <input 
              type="email" 
              name="email" 
              placeholder="you@example.com"
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••"
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          
          <div className="pt-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3.5 rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all active:scale-[0.98] border border-blue-400/20 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
              {isLogin ? 'Sign In to MoltPulse' : 'Create Free Account'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </div>
        </form>

        <div className="relative pt-2 pb-2">
            <div className="absolute inset-0 flex items-center pt-0">
                <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest pt-0">
                <span className="bg-[#0f0f13] px-4 text-gray-600">Or continue with</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => handleOAuth('github')}
            className="w-full flex flex-col items-center justify-center gap-2 bg-white/5 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-all active:scale-[0.98] border border-white/10"
          >
            <Github size={24} />
            <span className="text-xs text-gray-400 font-medium">GitHub</span>
          </button>

          <button 
            type="button"
            onClick={() => handleOAuth('google')}
            className="w-full flex flex-col items-center justify-center gap-2 bg-white/5 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-all active:scale-[0.98] border border-white/10"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden={true}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span className="text-xs text-gray-400 font-medium">Google</span>
          </button>
        </div>

        <p className="text-center text-[10px] uppercase tracking-wider font-bold text-gray-600 pt-2">
          By signing in, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[70vh]"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
      <LoginContent />
    </Suspense>
  );
}
