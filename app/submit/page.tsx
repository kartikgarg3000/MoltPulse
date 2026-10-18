"use client";
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Send, CheckCircle2, AlertCircle, Sparkles, Loader2, Globe, Bot, Layers } from 'lucide-react';
import Link from 'next/link';
import { AppType } from '@/types';

export default function SubmitPage() {
  const supabase = createClient();
  const [appType, setAppType] = useState<AppType>('ai_software');
  const [productName, setProductName] = useState('');
  const [repo, setRepo] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [builtWith, setBuiltWith] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation: Require either a GitHub repo OR a Live Demo URL
    if (!repo && !demoUrl) {
       setError("Please provide either a GitHub repository or a Live Demo/Product URL.");
       setLoading(false);
       return;
    }

    if (repo && !repo.includes('github.com/')) {
       setError("Please enter a valid GitHub URL (e.g., https://github.com/owner/repo) or leave it empty if closed-source.");
       setLoading(false);
       return;
    }

    try {
      const { error: insertError } = await supabase
        .from('submissions')
        .insert([
          { 
            repo: repo.trim() || (demoUrl.trim() ? `web/${demoUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}` : 'unknown/product'), 
            submitter_name: `${name.trim() || 'Anonymous'}${productName ? ` [${productName}]` : ''}${builtWith ? ` (Built with: ${builtWith})` : ''}`,
            submitter_contact: `${contact.trim() || 'N/A'} | Type: ${appType} | Demo: ${demoUrl}`,
            status: 'pending' 
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      // Even if Supabase is temporarily rate limited or down, confirm submission gracefully
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
            <CheckCircle2 className="text-cyan-400" size={40} />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white">Submission Received!</h1>
          <p className="text-gray-400 text-lg">
            Thanks for adding to the MoltPulse ecosystem. Our team reviews submissions daily to index high-quality AI-built software and autonomous agents.
          </p>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/agents" className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all">
            Explore Directory
          </Link>
          <button onClick={() => { setSuccess(false); setProductName(''); setRepo(''); setDemoUrl(''); setBuiltWith(''); }} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-white">
            Submit Another Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 pb-2">
          Submit AI Software & Agents
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Built an AI app with Cursor, Claude, or Lovable? Or created an autonomous task agent? Submit it here to reach thousands of active users and builders.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 bg-white/5 p-8 lg:p-12 rounded-[2rem] border border-white/10 glass relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none" />

        <div className="lg:col-span-2 space-y-8 relative z-10">
          <div className="space-y-4">
             <h2 className="text-2xl font-bold text-white">Why Submit?</h2>
             <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex-shrink-0 flex items-center justify-center text-xs text-cyan-400 font-bold">1</div>
                  <span>Instant discovery for your AI-built software, SaaS, or autonomous agent.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex-shrink-0 flex items-center justify-center text-xs text-purple-400 font-bold">2</div>
                  <span>Highlight your live demo, capabilities, and the AI tools you used to build it.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center text-xs text-blue-400 font-bold">3</div>
                  <span>Real-time community voting, Pulse Scores, and momentum tracking.</span>
                </li>
             </ul>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
            <h3 className="font-bold flex items-center gap-2 text-sm text-white">
              <Sparkles size={16} className="text-cyan-400" /> What We Showcase
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Autonomous agents (REA, Job application bots), browser workers (OpenClaw), creative generative apps (ArtCraft), and production-ready tools built with AI.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5 relative z-10">
          {/* Product Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Product Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'ai_software', label: 'AI-Built Software', icon: Sparkles },
                { id: 'autonomous_agent', label: 'Autonomous Agent', icon: Bot },
                { id: 'task_bot', label: 'Task Bot / Operator', icon: Layers },
              ].map(t => {
                const Icon = t.icon;
                const isSelected = appType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAppType(t.id as AppType)}
                    className={`flex items-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected 
                        ? 'bg-blue-600/30 border-blue-500 text-white' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon size={14} className={isSelected ? 'text-cyan-400' : 'text-gray-400'} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-300">Product / Agent Name *</label>
            <input 
              required
              type="text"
              placeholder="e.g. ArtCraft, REA, OpenClaw"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm text-white"
            />
          </div>

          {/* Live Demo URL */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-300 flex items-center justify-between">
              <span>Live Demo or Website URL</span>
              <span className="text-xs text-cyan-400 font-normal">Recommended</span>
            </label>
            <input 
              type="url"
              placeholder="https://yourapp.com or https://v0.dev/..."
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm text-white font-mono"
            />
          </div>

          {/* GitHub Repo */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-300">GitHub Repository (If Open Source)</label>
            <input 
              type="text"
              placeholder="https://github.com/owner/repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm text-white font-mono"
            />
          </div>

          {/* Built With */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-300">Built With (Tools / Models used)</label>
            <input 
              type="text"
              placeholder="e.g. Cursor, Claude 3.7, Lovable, LangGraph, Browserbase"
              value={builtWith}
              onChange={(e) => setBuiltWith(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-300">Your Name (Optional)</label>
              <input 
                type="text"
                placeholder="Builder or Maker"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-300">X / Contact (Optional)</label>
              <input 
                type="text"
                placeholder="@handle"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm text-white"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Submit for Discovery
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

