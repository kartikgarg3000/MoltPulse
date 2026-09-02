
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VoteButtonProps {
    repo: string;
    initialVotes: number;
    initialDownvotes?: number;
    /** compact=true → inline icon-only variant for AgentCard footer */
    compact?: boolean;
}

export default function VoteButton({ repo, initialVotes, initialDownvotes = 0, compact = false }: VoteButtonProps) {
    const [upvotes, setUpvotes]     = useState(initialVotes);
    const [downvotes, setDownvotes] = useState(initialDownvotes);
    const [voteType, setVoteType]   = useState<'up' | 'down' | null>(null); // what the user cast
    const [loading, setLoading]     = useState(false);
    const [checking, setChecking]   = useState(true);
    const [showThanks, setShowThanks] = useState(false);

    const supabase = createClient();
    const router   = useRouter();

    // On mount: check if this user already voted and which direction
    useEffect(() => {
        let mounted = true;
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !mounted) { setChecking(false); return; }

            const { data } = await supabase
                .from('agent_votes')
                .select('vote_type')
                .eq('agent_repo', repo)
                .eq('user_id', user.id)
                .maybeSingle();

            if (data && mounted) setVoteType(data.vote_type === 'down' ? 'down' : 'up');
            if (mounted) setChecking(false);
        })();
        return () => { mounted = false; };
    }, [repo]);

    const handleVote = async (e: React.MouseEvent, type: 'up' | 'down') => {
        e.preventDefault();
        e.stopPropagation();
        if (loading || checking || voteType !== null) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }

        setLoading(true);
        try {
            // 1. Record the unique vote row (with vote_type column)
            const { error: insertErr } = await supabase
                .from('agent_votes')
                .insert([{ agent_repo: repo, user_id: user.id, vote_type: type }]);
            if (insertErr) throw insertErr;

            // 2. Increment the right counter via RPC
            if (type === 'up') {
                const { error } = await supabase.rpc('increment_vote', { repo_id: repo });
                if (error) throw error;
                setUpvotes(v => v + 1);
            } else {
                const { error } = await supabase.rpc('decrement_vote', { repo_id: repo });
                if (error) throw error;
                setDownvotes(v => v + 1);
            }

            setVoteType(type);
            setShowThanks(true);
            setTimeout(() => setShowThanks(false), 2500);
        } catch (err: any) {
            console.error('Vote failed:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const hasVoted = voteType !== null;

    // ── Compact variant (for AgentCard footer) ───────────────────────────────
    if (compact) {
        return (
            <div className="flex items-center gap-1.5" onClick={e => e.preventDefault()}>
                <button
                    disabled={checking || loading || hasVoted}
                    onClick={e => handleVote(e, 'up')}
                    title="Yes, this is an AI agent"
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition-all duration-150 border
                        ${voteType === 'up'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-white/5 text-gray-500 border-white/5 hover:text-green-400 hover:border-green-500/20 hover:bg-green-500/10'
                        } disabled:cursor-default`}
                >
                    <ThumbsUp size={11} className={voteType === 'up' ? 'fill-green-400' : ''} />
                    <span>{upvotes}</span>
                </button>

                <button
                    disabled={checking || loading || hasVoted}
                    onClick={e => handleVote(e, 'down')}
                    title="No, this is not an AI agent"
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition-all duration-150 border
                        ${voteType === 'down'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-white/5 text-gray-500 border-white/5 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/10'
                        } disabled:cursor-default`}
                >
                    <ThumbsDown size={11} className={voteType === 'down' ? 'fill-red-400' : ''} />
                    <span>{downvotes}</span>
                </button>
            </div>
        );
    }

    // ── Full variant (for agent detail page) ────────────────────────────────
    return (
        <div className="w-full space-y-3" onClick={e => e.preventDefault()}>
            {/* Prompt */}
            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold text-center">
                Is this actually an AI agent?
            </p>

            {showThanks ? (
                <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white animate-in fade-in duration-300">
                    {voteType === 'up'
                        ? <span className="text-green-400">👍 Thanks for the signal!</span>
                        : <span className="text-red-400">👎 Noted — helps our classifier.</span>
                    }
                </div>
            ) : (
                <div className="flex items-center gap-3 justify-center">
                    {/* YES */}
                    <button
                        disabled={checking || loading || hasVoted}
                        onClick={e => handleVote(e, 'up')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 border
                            ${voteType === 'up'
                                ? 'bg-green-500/20 text-green-400 border-green-500/40 shadow-lg shadow-green-500/10'
                                : hasVoted
                                    ? 'bg-white/3 text-gray-600 border-white/5 cursor-default'
                                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-green-500/15 hover:text-green-400 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5'
                            } disabled:cursor-default`}
                    >
                        {loading && voteType === null ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <ThumbsUp size={16} className={voteType === 'up' ? 'fill-green-400' : ''} />
                        )}
                        <span>Yes</span>
                        {upvotes > 0 && (
                            <span className={`text-xs font-mono ${voteType === 'up' ? 'text-green-500' : 'text-gray-600'}`}>
                                {upvotes}
                            </span>
                        )}
                    </button>

                    {/* NO */}
                    <button
                        disabled={checking || loading || hasVoted}
                        onClick={e => handleVote(e, 'down')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 border
                            ${voteType === 'down'
                                ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/10'
                                : hasVoted
                                    ? 'bg-white/3 text-gray-600 border-white/5 cursor-default'
                                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5'
                            } disabled:cursor-default`}
                    >
                        {loading && voteType === null ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <ThumbsDown size={16} className={voteType === 'down' ? 'fill-red-400' : ''} />
                        )}
                        <span>No</span>
                        {downvotes > 0 && (
                            <span className={`text-xs font-mono ${voteType === 'down' ? 'text-red-500' : 'text-gray-600'}`}>
                                {downvotes}
                            </span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

