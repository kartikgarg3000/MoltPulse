"use client";
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Send, CheckCircle2, AlertCircle, Github, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SubmitPage() {
  const supabase = createClient();
  const [repo, setRepo] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (!repo.includes('github.com/')) {
       setError("Please provide a valid GitHub repository URL.");
       setLoading(false);
       return;
    }

    try {
      const { error: insertError } = await supabase
        .from('submissions')
        .insert([
          { 
            repo: repo.trim(), 
            submitter_name: name.trim() || 'Anonymous',
            submitter_contact: contact.trim() || 'N/A',
            status: 'pending' 
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
            <CheckCircle2 className="text-green-400" size={40} />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black">Submission Received!</h1>
          <p className="text-gray-400 text-lg">
            Thanks for contributing to the pulse. Our team will review the repository and add it to the map if it meets our criteria.
          </p>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/agents" className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all">
            Browse Directory
          </Link>
          <button onClick={() => setSuccess(false)} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 pb-2">
          Add an Agent to the Map
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Know a repository that belongs on MoltPulse? Submit it here for review and join the curator network.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 bg-white/5 p-8 lg:p-12 rounded-[2rem] border border-white/10 glass relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none" />

        <div className="lg:col-span-2 space-y-8 relative z-10">
          <div className="space-y-4">
             <h2 className="text-2xl font-bold">Why Submit?</h2>
             <ul className="space-y-4 text-gray-400">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center text-xs text-blue-400 font-bold">1</div>
                  <span>Get visibility for your AI open-source projects.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center text-xs text-blue-400 font-bold">2</div>
                  <span>Help the community discover the best horizontal agents.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center text-xs text-blue-400 font-bold">3</div>
                  <span>Enable real-time tracking of your tool's growth.</span>
                </li>
             </ul>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <Github size={16} /> Repository Guidelines
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We focus on Autonomous Agents, frameworks, and developer tools. Please ensure the repo has a README and is actively maintained.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">GitHub Repository URL *</label>
            <input 
              required
              type="text"
              placeholder="https://github.com/owner/repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300">Your Name (Optional)</label>
              <input 
                type="text"
                placeholder="Agent Maker"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300">X / Contact (Optional)</label>
              <input 
                type="text"
                placeholder="@handle"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-5 rounded-xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Submit Agent for Review
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            * Submissions are manually vetted before appearing in the directory.
          </p>
        </form>
      </div>
    </div>
  );
}
