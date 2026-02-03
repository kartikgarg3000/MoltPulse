import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import VoteButton from '@/components/VoteButton';
import Link from 'next/link';
import { ArrowLeft, Star, GitBranch, Terminal, Zap } from 'lucide-react';

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
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 items-center min-w-[150px]">
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

            {/* Readme Content */}
            <div className="glass p-8 rounded-2xl">
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
