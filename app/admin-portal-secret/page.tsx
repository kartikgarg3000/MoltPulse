'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Check, X, ExternalLink, Github, Clock, User, Trash2, Shield, ShieldCheck, Eye, EyeOff, RefreshCw, AlertTriangle } from 'lucide-react';

type Tab = 'submissions' | 'agents';

export default function AdminPortal() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<Tab>('agents');
  
  // Submissions state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [subLoading, setSubLoading] = useState(true);

  // Agents state
  const [agents, setAgents] = useState<any[]>([]);
  const [agentLoading, setAgentLoading] = useState(true);
  const [agentSearch, setAgentSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [bulkThreshold, setBulkThreshold] = useState(30);

  useEffect(() => {
    if (activeTab === 'submissions') fetchSubmissions();
    else fetchAgents();
  }, [activeTab]);

  // --- Submissions ---
  const fetchSubmissions = async () => {
    setSubLoading(true);
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    setSubmissions(data || []);
    setSubLoading(false);
  };

  const handleApprove = async (sub: any) => {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('id', sub.id);
    
    if (!error) {
       alert("Approved! (Note: Run scraper to fully ingest, or manually add to agents table).");
       fetchSubmissions();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'rejected' })
      .eq('id', id);
    
    if (!error) fetchSubmissions();
  };

  const handleDeleteSubmission = async (id: string) => {
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', id);
    
    if (!error) fetchSubmissions();
  };

  // --- Agents Management ---
  const fetchAgents = async () => {
    setAgentLoading(true);
    const { data } = await supabase
      .from('agents')
      .select('*')
      .order('quality_score', { ascending: false, nullsFirst: false });
    
    setAgents(data || []);
    setAgentLoading(false);
  };

  const toggleVerified = async (repo: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('agents')
      .update({ is_verified: !currentValue })
      .eq('repo', repo);
    
    if (!error) {
      setAgents(prev => prev.map(a => 
        a.repo === repo ? { ...a, is_verified: !currentValue } : a
      ));
    }
  };

  const toggleVisible = async (repo: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('agents')
      .update({ is_visible: !currentValue })
      .eq('repo', repo);
    
    if (!error) {
      setAgents(prev => prev.map(a => 
        a.repo === repo ? { ...a, is_visible: !currentValue } : a
      ));
    }
  };

  const bulkHideBelow = async () => {
    const toHide = agents.filter(a => (a.quality_score || 0) < bulkThreshold && a.is_visible !== false);
    if (toHide.length === 0) {
      alert('No agents to hide at this threshold.');
      return;
    }
    
    if (!confirm(`This will hide ${toHide.length} agents with quality score below ${bulkThreshold}. Continue?`)) return;

    const repos = toHide.map(a => a.repo);
    const { error } = await supabase
      .from('agents')
      .update({ is_visible: false })
      .in('repo', repos);
    
    if (!error) {
      alert(`Hidden ${toHide.length} agents.`);
      fetchAgents();
    } else {
      alert('Error: ' + error.message);
    }
  };

  const filteredAgents = agents.filter(a => {
    const matchesSearch = 
      a.name?.toLowerCase().includes(agentSearch.toLowerCase()) ||
      a.repo?.toLowerCase().includes(agentSearch.toLowerCase());
    const matchesVisibility = showHidden || a.is_visible !== false;
    return matchesSearch && matchesVisibility;
  });

  const stats = {
    total: agents.length,
    visible: agents.filter(a => a.is_visible !== false).length,
    hidden: agents.filter(a => a.is_visible === false).length,
    verified: agents.filter(a => a.is_verified === true).length,
    avgQuality: agents.length > 0 
      ? (agents.reduce((sum, a) => sum + (a.quality_score || 0), 0) / agents.length).toFixed(1)
      : '0',
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center bg-white/5 p-8 rounded-3xl border border-white/10 glass">
        <div>
          <h1 className="text-3xl font-black">Admin Portal</h1>
          <p className="text-gray-400">Manage directory quality & community submissions.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all border ${
              activeTab === 'agents' 
              ? 'bg-blue-600 border-blue-500 text-white' 
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            Agents ({agents.length})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all border ${
              activeTab === 'submissions' 
              ? 'bg-blue-600 border-blue-500 text-white' 
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            Submissions
          </button>
        </div>
      </header>

      {/* ============ AGENTS TAB ============ */}
      {activeTab === 'agents' && (
        <div className="space-y-6">
          {/* Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total', value: stats.total, color: 'text-white' },
              { label: 'Visible', value: stats.visible, color: 'text-green-400' },
              { label: 'Hidden', value: stats.hidden, color: 'text-red-400' },
              { label: 'Verified', value: stats.verified, color: 'text-emerald-400' },
              { label: 'Avg Quality', value: stats.avgQuality, color: 'text-blue-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 rounded-2xl border border-white/10 p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-bold">{stat.label}</div>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search agents..."
                value={agentSearch}
                onChange={e => setAgentSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full md:w-64"
              />
              <button
                onClick={() => setShowHidden(!showHidden)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                  showHidden 
                  ? 'bg-red-500/20 border-red-400/30 text-red-400' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {showHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                {showHidden ? 'Showing Hidden' : 'Show Hidden'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <AlertTriangle size={14} className="text-yellow-500" />
                <span>Bulk hide below score:</span>
                <input
                  type="number"
                  value={bulkThreshold}
                  onChange={e => setBulkThreshold(Number(e.target.value))}
                  className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  min={0}
                  max={100}
                />
                <button
                  onClick={bulkHideBelow}
                  className="px-4 py-1.5 bg-red-600/20 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                >
                  Apply
                </button>
              </div>
              <button
                onClick={fetchAgents}
                className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-gray-400 hover:text-white"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Agent Table */}
          {agentLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-white/5 border-b border-white/10 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Agent</div>
                <div className="col-span-1 text-center">Stars</div>
                <div className="col-span-2 text-center">Quality</div>
                <div className="col-span-1 text-center">Verified</div>
                <div className="col-span-1 text-center">Visible</div>
                <div className="col-span-1 text-center">Category</div>
                <div className="col-span-2 text-center">Actions</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                {filteredAgents.map(agent => (
                  <div 
                    key={agent.repo} 
                    className={`grid grid-cols-12 gap-4 px-6 py-3 items-center transition-all hover:bg-white/5 ${
                      agent.is_visible === false ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Name + Repo */}
                    <div className="col-span-4">
                      <div className="font-bold text-sm text-white truncate">{agent.name}</div>
                      <a 
                        href={`https://github.com/${agent.repo}`} 
                        target="_blank"
                        className="text-xs text-gray-500 font-mono hover:text-blue-400 transition-colors truncate block"
                      >
                        {agent.repo}
                      </a>
                    </div>

                    {/* Stars */}
                    <div className="col-span-1 text-center text-sm font-mono text-yellow-400">
                      {agent.stars >= 1000 ? (agent.stars / 1000).toFixed(1) + 'k' : agent.stars}
                    </div>

                    {/* Quality Score */}
                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              (agent.quality_score || 0) >= 70 ? 'bg-emerald-500' :
                              (agent.quality_score || 0) >= 30 ? 'bg-blue-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, agent.quality_score || 0)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${
                          (agent.quality_score || 0) >= 70 ? 'text-emerald-400' :
                          (agent.quality_score || 0) >= 30 ? 'text-blue-400' :
                          'text-red-400'
                        }`}>
                          {(agent.quality_score || 0).toFixed(0)}
                        </span>
                      </div>
                    </div>

                    {/* Verified Toggle */}
                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => toggleVerified(agent.repo, agent.is_verified)}
                        className={`p-1.5 rounded-lg transition-all border ${
                          agent.is_verified 
                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                          : 'bg-white/5 border-white/10 text-gray-600 hover:text-white hover:bg-white/10'
                        }`}
                        title={agent.is_verified ? 'Unverify' : 'Verify'}
                      >
                        {agent.is_verified ? <ShieldCheck size={14} /> : <Shield size={14} />}
                      </button>
                    </div>

                    {/* Visible Toggle */}
                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => toggleVisible(agent.repo, agent.is_visible !== false)}
                        className={`p-1.5 rounded-lg transition-all border ${
                          agent.is_visible !== false 
                          ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                          : 'bg-red-500/20 border-red-500/30 text-red-400'
                        }`}
                        title={agent.is_visible !== false ? 'Hide from directory' : 'Show in directory'}
                      >
                        {agent.is_visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>

                    {/* Category */}
                    <div className="col-span-1 text-center">
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-400 border border-white/5">
                        {agent.category || '—'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-center gap-2">
                      <a
                        href={`https://github.com/${agent.repo}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        title="View on GitHub"
                      >
                        <ExternalLink size={12} />
                      </a>
                      <a
                        href={`/agents/${agent.repo}`}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                        title="View on MoltPulse"
                      >
                        <Eye size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAgents.length === 0 && (
                <div className="p-12 text-center text-gray-600 text-sm">
                  No agents match your filters.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============ SUBMISSIONS TAB ============ */}
      {activeTab === 'submissions' && (
        <>
          <div className="flex justify-end">
            <button 
              onClick={fetchSubmissions}
              className="px-6 py-2 bg-blue-600 rounded-full font-bold text-sm hover:bg-blue-500 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Refresh Feed
            </button>
          </div>
          
          {subLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[1,2,3,4].map(i => (
                 <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse"></div>
               ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-20 text-center glass rounded-3xl border border-dashed border-gray-800">
               <p className="text-gray-500">No submissions yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {submissions.map((sub) => (
                <div key={sub.id} className={`p-6 rounded-3xl border transition-all ${
                  sub.status === 'approved' ? 'bg-green-500/5 border-green-500/20' :
                  sub.status === 'rejected' ? 'bg-red-500/5 border-red-500/20' :
                  'bg-white/5 border-white/10'
                }`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Github size={16} className="text-gray-500" />
                        <a href={sub.repo} target="_blank" className="text-lg font-bold hover:text-blue-400 transition-colors">
                           {sub.repo.replace('https://github.com/', '')}
                        </a>
                      </div>
                      <p className="text-xs text-gray-500 font-mono italic">{sub.repo}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      sub.status === 'approved' ? 'bg-green-500 text-white' :
                      sub.status === 'rejected' ? 'bg-red-500 text-white' :
                      'bg-yellow-500 text-black'
                    }`}>
                      {sub.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User size={14} className="text-blue-500" />
                        <span className="truncate">{sub.submitter_name}</span>
                     </div>
                     <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock size={14} className="text-purple-500" />
                        <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                     </div>
                  </div>

                  <div className="flex gap-2">
                    {sub.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(sub)}
                          className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button 
                          onClick={() => handleReject(sub.id)}
                          className="flex-1 py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl font-bold text-sm transition-all border border-red-500/20"
                        >
                          <X size={16} /> Reject
                        </button>
                      </>
                    )}
                    {sub.status !== 'pending' && (
                      <button 
                      onClick={() => handleDeleteSubmission(sub.id)}
                      className="flex-1 py-3 bg-gray-800 hover:bg-red-900 rounded-xl font-bold text-sm transition-all text-gray-400 hover:text-white flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Delete Entry
                    </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
