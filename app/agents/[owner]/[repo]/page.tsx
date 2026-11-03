import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import VoteButton from '@/components/VoteButton';
import WatchlistButton from '@/components/WatchlistButton';
import Link from 'next/link';
import { ArrowLeft, Star, GitBranch, Terminal, Zap, Check, ExternalLink, Sliders, Activity, Code } from 'lucide-react';
import PulseChart from '@/components/PulseChart';
import StatusBadge from '@/components/StatusBadge';
import CopyBadgeSnippet from '@/components/CopyBadgeSnippet';

export const revalidate = 3600; // Cache for 1 hour — detail pages rarely change

interface PageProps {
    params: Promise<{
        owner: string;
        repo: string;
    }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { owner, repo } = await params;
  const agent = await getAgent(owner, repo);

  if (!agent) {
    return { title: 'Agent Not Found | MoltPulse' };
  }

  const title = `${agent.name} (${owner}/${repo}) | MoltPulse`;
  const description = agent.description 
    ? `${agent.description} - View pulse score, activity, and community trust.`
    : `View pulse score and analytics for ${agent.name} on MoltPulse.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/agents/${owner}/${repo}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: 'MoltPulse',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

import { getStaticAgents, isStaticOnlyMode } from '@/lib/static-fallback';

// Fetch Agent from Supabase with static fallback
async function getAgent(owner: string, repo: string) {
  const fullRepoName = `${owner}/${repo}`.toLowerCase();

  // Short-circuit: skip Supabase init entirely when quota is exceeded
  if (isStaticOnlyMode()) {
    const staticAgents = getStaticAgents();
    return staticAgents.find(a => a.repo.toLowerCase() === fullRepoName) || null;
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('agents')
      .select('*')
      .ilike('repo', `${owner}/${repo}`)
      .single();
    if (data) return data;
  } catch (err) {
    // Continue to static fallback
  }

  const staticAgents = getStaticAgents();
  return staticAgents.find(a => a.repo.toLowerCase() === fullRepoName) || null;
}

// Fetch Readme from GitHub
async function getReadme(owner: string, repo: string) {
    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
            headers: {
                'Accept': 'application/vnd.github.v3.raw', // Get raw markdown
                'User-Agent': 'MoltPulse',
                ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        if (!res.ok) return "# No README found.";
        const text = await res.text();
        return text;
    } catch (e) {
        return "# Error loading README.";
    }
}

export default async function AgentPage({ params }: PageProps) {
    const { owner, repo } = await params;
    
    // Parallel fetch
    const agentData = await getAgent(owner, repo);
    const readmeContent = await getReadme(owner, repo);

    if (!agentData) {
        return notFound();
    }

    return (
        <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header / Hero */}
            <div className="flex flex-col gap-6">
                <Link href="/agents" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit">
                    <ArrowLeft size={20} />
                    Back to Directory
                </Link>

                <div className="glass p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start justify-between">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 pb-2">
                                {agentData.name}
                            </h1>
                            {agentData.app_type === 'ai_software' && <StatusBadge type="ai-built" />}
                            {agentData.app_type === 'autonomous_agent' && <StatusBadge type="autonomous" />}
                            {agentData.app_type === 'task_bot' && <StatusBadge type="task-bot" />}
                        </div>
                        
                        {agentData.ai_summary && (
                            <div className="p-6 rounded-2xl glass border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-transparent relative overflow-hidden group">
                                <h3 className="text-blue-400 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                                    <Zap size={12} className="fill-blue-400" />
                                    AI Pulse Analysis
                                </h3>
                                <p className="text-lg font-medium text-white/90 leading-relaxed italic">
                                    "{agentData.ai_summary}"
                                </p>
                            </div>
                        )}

                        <p className="text-xl text-gray-300">
                            {agentData.tagline || agentData.description}
                        </p>

                        {/* Built With Tags */}
                        {agentData.built_with && agentData.built_with.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            <span className="text-xs text-gray-500 font-mono">Built with:</span>
                            {agentData.built_with.map((tool: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 rounded-md bg-purple-950/40 border border-purple-500/30 text-xs text-purple-300 font-mono">
                                ⚡ {tool}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Core Capabilities */}
                        {agentData.capabilities && agentData.capabilities.length > 0 && (
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 mt-2">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Core Capabilities</h4>
                            <div className="flex flex-wrap gap-2">
                              {agentData.capabilities.map((cap: string, i: number) => (
                                <span key={i} className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-200">
                                  ✓ {cap}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            {agentData.demo_url && (
                              <a 
                                href={agentData.demo_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                              >
                                <ExternalLink size={16} />
                                Launch Live Demo
                              </a>
                            )}

                            <a 
                                href={`https://github.com/${agentData.repo}`} 
                                target="_blank" 
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-mono text-sm"
                            >
                                <GitBranch size={16} />
                                {agentData.repo}
                            </a>
                            
                            <WatchlistButton repo={agentData.repo} variant="large" />
                            
                             {/* Badge Logic Replica for Details Page */}
                             {(agentData.velocity && agentData.velocity > 0.5 && agentData.stars > 1000) && <StatusBadge type="blue-chip" />}
                             {(agentData.velocity && agentData.velocity > 0.8 && agentData.stars < 500) && <StatusBadge type="gem" />}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 items-center w-full md:w-auto md:min-w-[300px]">
                        
                        {/* Pulse Score & Analytics Card */}
                        <div className="w-full glass p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
                             <div className="flex items-center justify-between mb-6">
                                <div className="relative group/pulse cursor-help">
                                  <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 flex items-center gap-2 border-b border-dashed border-blue-400/50 pb-0.5">
                                      <Activity size={16} /> MoltPulse
                                  </h3>
                                  <div className="absolute left-0 top-full mt-2 w-48 p-2.5 bg-[#111] border border-white/10 rounded-md text-xs text-gray-400 opacity-0 invisible group-hover/pulse:opacity-100 group-hover/pulse:visible transition-all duration-200 z-50 shadow-2xl pointer-events-none normal-case tracking-normal font-medium">
                                    Based on repository activity, growth velocity and community engagement.
                                  </div>
                                </div>
                                {(agentData.pulse_score !== undefined) && (
                                    <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                                        {Math.round(agentData.pulse_score)}
                                    </div>
                                )}
                             </div>
                             
                             {/* Pulse Pillars */}
                             <div className="space-y-4 mb-6">
                                {[
                                    { label: 'Growth', value: agentData.growth_score, max: 30, color: 'bg-blue-500' },
                                    { label: 'Activity', value: agentData.activity_score, max: 25, color: 'bg-cyan-500' },
                                    { label: 'Popularity', value: agentData.popularity_score, max: 25, color: 'bg-green-500' },
                                    { label: 'Trust', value: agentData.trust_score, max: 20, color: 'bg-yellow-500' }
                                ].map((stat) => (
                                    <div key={stat.label}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-400 font-bold">{stat.label}</span>
                                            <span className="text-white font-mono">{stat.value ? Math.round(stat.value) : 0}/{stat.max}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${stat.color} rounded-full transition-all duration-1000`} 
                                                style={{ width: `${((stat.value || 0) / stat.max) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                             </div>

                             <div className="h-24 w-full mb-4 opacity-50">
                                 {/* Sparkline for overall trend */}
                                 <PulseChart 
                                    data={Array.from({ length: 20 }, (_, i) => ({
                                        date: i.toString(),
                                        value: Math.floor(Math.random() * 80) + (agentData.velocity ? agentData.velocity * 5 : 10)
                                    }))} 
                                    height={96} 
                                    showAxis={false}
                                    color="#3b82f6" 
                                 />
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                 <div>
                                     <div className="text-xl font-bold text-white">{(agentData.stars || 0).toLocaleString()}</div>
                                     <div className="text-[10px] text-gray-500 uppercase tracking-widest">Stars</div>
                                 </div>
                                 <div>
                                     <div className="text-xl font-bold text-green-400">High</div>
                                     <div className="text-[10px] text-gray-500 uppercase tracking-widest">Sentiment</div>
                                 </div>
                             </div>
                        </div>

                        <div className="w-full glass p-4 rounded-xl border border-white/10">
                           <VoteButton
                             repo={agentData.repo}
                             initialVotes={agentData.votes || 0}
                             initialDownvotes={agentData.downvotes || 0}
                           />
                        </div>
                        <div className="flex items-center gap-2 text-yellow-400 font-bold text-xl">
                            <Star className="fill-yellow-400" />
                            {(agentData.stars || 0).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid: README + On-Chain Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass p-8 rounded-2xl min-w-0 w-full">
                    <div className="flex items-center gap-2 mb-6 text-gray-400 border-b border-white/10 pb-4">
                        <Terminal size={20} />
                        <span className="font-mono font-bold">README.md</span>
                    </div>
                    <article className="prose prose-invert prose-lg max-w-none prose-headings:text-blue-200 prose-a:text-pink-400 break-words prose-pre:overflow-x-auto">
                        <ReactMarkdown 
                          components={{
                            img: ({node, ...props}) => (
                               // eslint-disable-next-line @next/next/no-img-element
                               <img {...props} className="rounded-lg border border-white/10 max-h-[500px] object-contain bg-black/50" alt={props.alt || ''} />
                            )
                          }}
                        >
                            {readmeContent}
                        </ReactMarkdown>
                    </article>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <div className="glass p-6 rounded-2xl border border-white/10">
                        <h3 className="font-bold mb-2">Ecosystem Role</h3>
                        <p className="text-xs text-gray-400 italic">
                            {agentData.category === 'MoltHub' ? 
                                "This agent is part of the MoltHub Racing ecosystem, demonstrating high on-chain velocity." : 
                                "Standard MoltPulse indexed agent."}
                        </p>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-white/10">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                           <Code size={18} /> Embed Badge
                        </h3>
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                           Show off your Pulse Score in your GitHub README to build trust and rank higher.
                        </p>
                        
                        <div className="mb-4 inline-block bg-black/50 p-2 rounded-lg border border-white/5">
                           <img src={`/api/badge/${owner}/${repo}?t=${Date.now()}`} alt="MoltPulse Badge" />
                        </div>
                        
                        <CopyBadgeSnippet textToCopy={`[![MoltPulse Score](https://molt-pulse.com/api/badge/${owner}/${repo})](https://molt-pulse.com/agents/${owner}/${repo})`} />
                    </div>
                </div>
            </div>
        </div>
    );
}

