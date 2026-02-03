
import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, BarChart, Share2 } from 'lucide-react';

export const revalidate = 3600; // Cache for 1 hour

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

async function getPlaybook(slug: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('playbooks')
        .select('*')
        .eq('slug', slug)
        .single();
    return data;
}

export default async function PlaybookDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const playbook = await getPlaybook(slug);

    if (!playbook) {
        return notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Navigation Header */}
            <div className="flex flex-col gap-6">
                <Link href="/playbooks" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Playbooks
                </Link>

                <div className="space-y-6">
                    <div className="flex flex-wrap gap-3">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {playbook.category}
                        </span>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-2">
                            <div className="flex items-center gap-1.5">
                                <Clock size={14} className="text-gray-600" />
                                <span>5 min read</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <BarChart size={14} className="text-gray-600" />
                                <span>{playbook.difficulty}</span>
                            </div>
                        </div>
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-gray-500 leading-tight">
                        {playbook.title}
                    </h1>
                    
                    <p className="text-xl text-gray-400 leading-relaxed border-l-4 border-blue-500/30 pl-6 py-2">
                        {playbook.description}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="glass p-8 md:p-12 rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent relative">
                <div className="absolute top-8 right-8 text-gray-700">
                    <BookOpen size={48} />
                </div>
                
                <article className="prose prose-invert prose-lg max-w-none 
                    prose-headings:text-white prose-headings:font-black
                    prose-p:text-gray-300 prose-p:leading-relaxed
                    prose-code:text-blue-400 prose-code:bg-blue-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                    prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl
                    prose-ul:text-gray-300
                    prose-strong:text-white
                    prose-a:text-blue-400 hover:prose-a:text-blue-300 transition-colors">
                    <ReactMarkdown>
                        {playbook.content}
                    </ReactMarkdown>
                </article>

                <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 transition-all text-sm font-bold border border-white/10">
                        <Share2 size={18} />
                        Share Guide
                    </button>
                    <p className="text-xs text-gray-600 italic">
                        Last updated: {new Date(playbook.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Footer Call to Action */}
            <div className="p-12 rounded-[3rem] bg-gradient-to-r from-blue-600 to-purple-600 flex flex-col items-center text-center space-y-6 shadow-2xl shadow-blue-500/20">
                <h2 className="text-3xl font-black text-white">Got an Agent Idea?</h2>
                <p className="text-blue-100 max-w-md">
                    Put your knowledge into practice. Submit your agent to MoltPulse and join the ecosystem growth.
                </p>
                <Link href="/submit" className="px-8 py-4 bg-white text-blue-600 rounded-full font-black hover:scale-105 transition-all shadow-xl">
                    Submit Agent
                </Link>
            </div>
        </div>
    );
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const playbook = await getPlaybook(slug);
    
    return {
        title: playbook ? `${playbook.title} - MoltPulse Playbooks` : 'Playbook - MoltPulse',
        description: playbook?.description || 'Learn how to master the AI agent ecosystem.'
    };
}
