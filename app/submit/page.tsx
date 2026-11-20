"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Send, CheckCircle2, AlertCircle, Sparkles, Loader2, Bot, Layers, Zap, Flame, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AppType } from '@/types';

type SubmissionPlan = 'free' | 'priority' | 'featured';

function SubmitFormContent() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const paidPlan = searchParams.get('plan');
  const paidProduct = searchParams.get('product');

  const supabase = createClient();
  const [appType, setAppType] = useState<AppType>('ai_software');
  const [selectedPlan, setSelectedPlan] = useState<SubmissionPlan>('priority');
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

    let submissionId: string | undefined;

    try {
      const { data, error: insertError } = await supabase
        .from('submissions')
        .insert([
          { 
            repo: repo.trim() || (demoUrl.trim() ? `web/${demoUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}` : 'unknown/product'), 
            submitter_name: `${name.trim() || 'Anonymous'}${productName ? ` [${productName}]` : ''}${builtWith ? ` (Built with: ${builtWith})` : ''}`,
            submitter_contact: `${contact.trim() || 'N/A'} | Plan: ${selectedPlan.toUpperCase()} | Type: ${appType} | Demo: ${demoUrl}`,
            status: 'pending',
            notes: `Selected Plan: ${selectedPlan.toUpperCase()}`
          }
        ])
        .select('id')
        .single();

      if (!insertError && data) {
        submissionId = data.id;
      }
    } catch (err: any) {
      console.warn("Database notice:", err);
    }

    // If paid plan selected, redirect to Dodo Payments Checkout
    if (selectedPlan === 'priority' || selectedPlan === 'featured') {
      try {
        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: selectedPlan,
            productName: productName.trim() || 'AI Product',
            repo: repo.trim(),
            demoUrl: demoUrl.trim(),
            email: contact.trim(),
            submissionId,
          }),
        });

        const checkoutData = await checkoutRes.json();

        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        } else {
          console.warn("Checkout error:", checkoutData.error);
          // If checkout fails (e.g. keys not set), still show confirmation
          setSuccess(true);
        }
      } catch (checkoutErr) {
        console.error("Redirect to checkout failed:", checkoutErr);
        setSuccess(true);
      } finally {
        setLoading(false);
      }
    } else {
      // Free plan
      setSuccess(true);
      setLoading(false);
    }
  };

  // Payment Success Screen (Returned from Stripe Checkout)
  if (paymentStatus === 'success') {
    const isFeatured = paidPlan === 'featured';
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-tr from-cyan-500/30 to-blue-500/20 rounded-full flex items-center justify-center border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/30">
            {isFeatured ? <Flame className="text-orange-400" size={48} /> : <Zap className="text-cyan-400" size={48} />}
          </div>
        </div>
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
            Payment Confirmed • {isFeatured ? '48h Featured Spotlight' : 'Priority Queue 24h'}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">
            {paidProduct ? `"${decodeURIComponent(paidProduct)}" is Fast-Tracked!` : 'Your Submission is Fast-Tracked!'}
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto leading-relaxed">
            {isFeatured 
              ? 'Thank you for your launch order! Your product has been bumped to the top review queue and will be pinned in the Featured Spotlight on the homepage & directory for 48 hours.'
              : 'Thank you for your submission! Our automated scoring engine and team will review, calculate your Pulse Score, and index your product within 24 hours.'}
          </p>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/agents" className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-full hover:from-blue-400 hover:to-cyan-400 transition-all shadow-lg shadow-cyan-500/20">
            View Live Directory
          </Link>
          <Link href="/" className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-white font-medium">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Free Submission Success Screen
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
            Thanks for adding to MoltPulse. Your product is now queued in our standard community review backlog.
          </p>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/agents" className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all">
            Explore Directory
          </Link>
          <button 
            onClick={() => { setSuccess(false); setProductName(''); setRepo(''); setDemoUrl(''); setBuiltWith(''); }} 
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-white"
          >
            Submit Another Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles size={12} /> Distribution for AI Builders
        </div>
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 pb-2">
          Submit AI Software &amp; Agents
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Built an AI app with Cursor, Claude, or Lovable? Or created an autonomous task agent? Showcase it to thousands of active tech scouts, builders, and early adopters.
        </p>
      </header>

      {/* Plan Selection Cards */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-white">Choose Your Listing Tier</h2>
          <p className="text-xs text-gray-400">Select standard community review or fast-track your launch</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Free Standard Tier */}
          <div 
            onClick={() => setSelectedPlan('free')}
            className={`p-6 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
              selectedPlan === 'free'
                ? 'bg-white/10 border-white/40 ring-2 ring-white/20'
                : 'bg-white/5 border-white/10 hover:border-white/20 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Standard</span>
                <Clock size={16} className="text-gray-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$0</span>
                <span className="text-xs text-gray-400">/ free</span>
              </div>
              <p className="text-xs text-gray-400">Standard community queue for open-source &amp; hobby projects.</p>
              
              <ul className="space-y-2 pt-2 text-xs text-gray-300">
                <li className="flex items-center gap-2">✓ Regular queue review (7–14 days)</li>
                <li className="flex items-center gap-2">✓ Directory listing once approved</li>
                <li className="flex items-center gap-2">✓ Community voting &amp; Pulse score</li>
              </ul>
            </div>
            <div className="pt-6">
              <div className={`w-full py-2 rounded-lg text-center text-xs font-bold ${selectedPlan === 'free' ? 'bg-white text-black' : 'bg-white/10 text-gray-300'}`}>
                {selectedPlan === 'free' ? 'Selected' : 'Choose Standard'}
              </div>
            </div>
          </div>

          {/* Priority Queue ($10) */}
          <div 
            onClick={() => setSelectedPlan('priority')}
            className={`p-6 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
              selectedPlan === 'priority'
                ? 'bg-cyan-500/10 border-cyan-400 ring-2 ring-cyan-500/30'
                : 'bg-white/5 border-white/10 hover:border-cyan-500/30 opacity-90 hover:opacity-100'
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-black uppercase tracking-wider shadow-lg shadow-cyan-500/30">
              ⚡ Recommended
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Priority Queue</span>
                <Zap size={18} className="text-cyan-400 fill-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$10</span>
                <span className="text-xs text-gray-400">one-time</span>
              </div>
              <p className="text-xs text-gray-300">Fast-track review to start getting users and stars today.</p>
              
              <ul className="space-y-2 pt-2 text-xs text-gray-200">
                <li className="flex items-center gap-2 font-medium text-cyan-300">⚡ Guaranteed 24-hour review</li>
                <li className="flex items-center gap-2">✓ Instant Pulse Score calculation</li>
                <li className="flex items-center gap-2">✓ Custom embed badge for GitHub README</li>
                <li className="flex items-center gap-2">✓ Full tech stack &amp; capabilities indexed</li>
              </ul>
            </div>
            <div className="pt-6">
              <div className={`w-full py-2 rounded-lg text-center text-xs font-bold ${selectedPlan === 'priority' ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20' : 'bg-white/10 text-gray-300'}`}>
                {selectedPlan === 'priority' ? 'Selected' : 'Choose Priority ($10)'}
              </div>
            </div>
          </div>

          {/* Featured Spotlight ($21) */}
          <div 
            onClick={() => setSelectedPlan('featured')}
            className={`p-6 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
              selectedPlan === 'featured'
                ? 'bg-gradient-to-b from-orange-500/15 to-transparent border-orange-500 ring-2 ring-orange-500/30'
                : 'bg-white/5 border-white/10 hover:border-orange-500/30 opacity-90 hover:opacity-100'
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-orange-500/30">
              🔥 Launch Boost
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Featured 48 Hours</span>
                <Flame size={18} className="text-orange-400 fill-orange-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$21</span>
                <span className="text-xs text-gray-400">one-time</span>
              </div>
              <p className="text-xs text-gray-300">Maximum visibility on top of the homepage and directory.</p>
              
              <ul className="space-y-2 pt-2 text-xs text-gray-200">
                <li className="flex items-center gap-2 font-bold text-orange-400">🔥 Pinned on Homepage for 48 Hours</li>
                <li className="flex items-center gap-2">✓ Everything in Priority Queue (24h review)</li>
                <li className="flex items-center gap-2">✓ Glowing "Featured Agent" badge</li>
                <li className="flex items-center gap-2">✓ Top ranking in Directory search</li>
              </ul>
            </div>
            <div className="pt-6">
              <div className={`w-full py-2 rounded-lg text-center text-xs font-bold ${selectedPlan === 'featured' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white/10 text-gray-300'}`}>
                {selectedPlan === 'featured' ? 'Selected' : 'Choose Featured ($21)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Form Card */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 bg-white/5 p-8 lg:p-12 rounded-[2rem] border border-white/10 glass relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none" />

        <div className="lg:col-span-2 space-y-8 relative z-10">
          <div className="space-y-4">
             <h2 className="text-2xl font-bold text-white">Why MoltPulse?</h2>
             <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex-shrink-0 flex items-center justify-center text-xs text-cyan-400 font-bold">1</div>
                  <span>Instant targeted discovery for AI-built SaaS, vibe-coded apps, and autonomous agents.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex-shrink-0 flex items-center justify-center text-xs text-purple-400 font-bold">2</div>
                  <span>Showcase your live demo, architecture diagrams, and the AI models you used to build it.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center text-xs text-blue-400 font-bold">3</div>
                  <span>Real-time community trust scores, Pulse rankings, and GitHub star velocity tracking.</span>
                </li>
             </ul>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
            <h3 className="font-bold flex items-center gap-2 text-sm text-white">
              <Sparkles size={16} className="text-cyan-400" /> What We Showcase
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Vibe-coded tools (ArtCraft), reverse-engineering agents (REA), automated task bots (OpenClaw), and production-grade software engineered with AI.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center gap-3 text-xs text-blue-300">
            <ShieldCheck size={20} className="text-blue-400 flex-shrink-0" />
            <span>Secure global checkout powered by Dodo Payments (Supports Apple Pay, Google Pay &amp; Cards). You will be redirected to complete payment if priority or featured tier is selected.</span>
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
              <label className="text-sm font-bold text-gray-300">Email or X Handle (For Updates) *</label>
              <input 
                required
                type="text"
                placeholder="you@email.com or @handle"
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
            className={`w-full py-4 rounded-xl font-bold transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4 ${
              selectedPlan === 'featured'
                ? 'bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-orange-500/20'
                : selectedPlan === 'priority'
                ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white shadow-cyan-500/20'
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {selectedPlan === 'featured' && <Flame size={18} className="fill-white" />}
                {selectedPlan === 'priority' && <Zap size={18} className="fill-white" />}
                {selectedPlan === 'free' && <Send size={18} />}
                <span>
                  {selectedPlan === 'featured' && 'Proceed to Checkout ($21) • 48h Featured'}
                  {selectedPlan === 'priority' && 'Proceed to Checkout ($10) • Priority 24h'}
                  {selectedPlan === 'free' && 'Submit for Free Community Review'}
                </span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto py-20 text-center text-gray-500">Loading submission portal...</div>}>
      <SubmitFormContent />
    </Suspense>
  );
}
