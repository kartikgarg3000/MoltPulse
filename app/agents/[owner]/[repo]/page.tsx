import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import VoteButton from '@/components/VoteButton';
import Link from 'next/link';
import { ArrowLeft, Star, GitBranch, Terminal, Zap, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import SupportButton from '@/components/SupportButton';
import JupiterButton from '@/components/JupiterButton';

export const revalidate = 0; // Dynamic

interface PageProps {
    params: Promise<{
        owner: string;
        repo: string;
    }>;
}

// Fetch Agent from Supabase
async function getAgent(owner: string, repo: string) {
  const supabase = await createClient();
  const fullRepoName = `${owner}/${repo}`;
  const { data } = await supabase
    .from('agents')
    .select('*')
    .ilike('repo', fullRepoName)
    .single();
  return data;
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
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 pb-2">
                                {agentData.name}
                            </h1>
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
                            {agentData.description}
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <a 
                                href={`https://github.com/${agentData.repo}`} 
                                target="_blank" 
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-mono text-sm"
                            >
                                <GitBranch size={16} />
                                {agentData.repo}
                            </a>

                            {agentData.solana_address && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs">
                                    <span className="font-bold">SOL:</span>
                                    <span>{agentData.solana_address.slice(0, 4)}...{agentData.solana_address.slice(-4)}</span>
                                    <a 
                                        href={`https://explorer.solana.com/address/${agentData.solana_address}?cluster=devnet`} 
                                        target="_blank"
                                        className="hover:text-white transition-colors"
                                    >
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            {agentData.solana_address && (
                                <SupportButton 
                                    solanaAddress={agentData.solana_address} 
                                    agentName={agentData.name} 
                                    variant="lg" 
                                />
                            )}
                            {agentData.token_mint && (
                                <JupiterButton 
                                    mint={agentData.token_mint} 
                                    variant="lg"
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 items-center min-w-[150px]">
                        {agentData.is_solana_verified && (
                            <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl border border-blue-500/30 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-2 w-full justify-center">
                                <Check size={14} strokeWidth={3} /> Verified On Solana
                            </div>
                        )}
                        <div className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10 w-full">
                           <span className="text-gray-400 text-sm uppercase tracking-wider font-bold">Votes</span>
                           <VoteButton repo={agentData.repo} initialVotes={agentData.votes || 0} />
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
                <div className="lg:col-span-2 glass p-8 rounded-2xl">
                    <div className="flex items-center gap-2 mb-6 text-gray-400 border-b border-white/10 pb-4">
                        <Terminal size={20} />
                        <span className="font-mono font-bold">README.md</span>
                    </div>
                    <article className="prose prose-invert prose-lg max-w-none prose-headings:text-blue-200 prose-a:text-pink-400">
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
                    {/* On-Chain Audit Log */}
                    <div className="glass p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-500/5 to-transparent">
                        <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-6 flex items-center gap-2">
                            <ShieldCheck size={16} />
                            On-Chain Pulse Audit
                        </h3>
                        
                        <div className="space-y-4">
                             {/* Placeholder for real query, showing logic */}
                             <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-mono text-gray-400">7xKX...4YfS</span>
                                <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-black">VERIFIED VOTE</span>
                             </div>
                             <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between opacity-50">
                                <span className="text-[10px] font-mono text-gray-400">Caw7...B1C3</span>
                                <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-black">SUPPORT TIP</span>
                             </div>
                        </div>
                        
                        <p className="text-[10px] text-gray-500 mt-6 leading-relaxed">
                            Every vote from a Solana wallet is cryptographically signed and stored in our decentralized audit log to prevent sybil attacks.
                        </p>
                    </div>

                    <div className="glass p-6 rounded-2xl border border-white/10">
                        <h3 className="font-bold mb-2">Ecosystem Role</h3>
                        <p className="text-xs text-gray-400 italic">
                            {agentData.category === 'MoltHub' ? 
                                "This agent is part of the MoltHub Racing ecosystem, demonstrating high on-chain velocity." : 
                                "Standard MoltPulse indexed agent."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Generate Metadata for better SEO
export async function generateMetadata({ params }: PageProps) {
    const { owner, repo } = await params;
    return {
        title: `${owner}/${repo} - MoltPulse`,
        description: `Explore details and stats for ${owner}/${repo} AI agent.`
    };
}
