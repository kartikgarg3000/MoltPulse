
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';

export const revalidate = 3600;

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

export default async function PlaybookPage({ params }: PageProps) {
    const { slug } = await params;
    const playbook = await getPlaybook(slug);

    if (!playbook) {
        return notFound();
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-700">
            <Link href="/playbooks" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Playbooks
            </Link>

            <article className="glass rounded-[3rem] p-8 md:p-12 border border-white/5 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

                <header className="mb-12 space-y-6 relative z-10">
                    <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
                            {playbook.category || 'Guide'}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <Tag size={12} />
                            {playbook.difficulty || 'General'}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                        {playbook.title}
                    </h1>

                    <div className="flex items-center gap-6 text-sm text-gray-500 font-mono border-t border-white/5 pt-6">
                        <div className="flex items-center gap-2">
                             <Calendar size={14} />
                             {new Date(playbook.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                             <User size={14} />
                             Molt Team
                        </div>
                    </div>
                </header>

                <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-a:text-blue-400 prose-code:text-blue-300 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 relative z-10">
                    <ReactMarkdown>{playbook.content}</ReactMarkdown>
                </div>
            </article>
        </div>
    );
}
