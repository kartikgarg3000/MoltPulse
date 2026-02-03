
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ChevronUp, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VoteButtonProps {
    repo: string;
    initialVotes: number;
}

export default function VoteButton({ repo, initialVotes }: VoteButtonProps) {
    const [votes, setVotes] = useState(initialVotes);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkVoteStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('agent_votes')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('agent_repo', repo)
                    .maybeSingle();
                
                if (data) setHasVoted(true);
            }
            setChecking(false);
        };
        checkVoteStatus();

        // Realtime sync for global vote count
        const channel = supabase
            .channel(`agent_votes_${repo}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'agents',
                filter: `repo=eq.${repo}`
            }, (payload) => {
                if (payload.new && payload.new.votes !== undefined) {
                    setVotes(payload.new.votes);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [repo]);

    const handleVote = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading || checking) return;

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            router.push('/login');
            return;
        }

        if (hasVoted) {
            // Optional: Implement Unvote
            return;
        }

        setLoading(true);
        
        // Optimistic UI update
        setVotes(v => v + 1);
        setHasVoted(true);

        try {
            // 1. Record the unique vote
            const { error: voteError } = await supabase
                .from('agent_votes')
                .insert([{ user_id: user.id, agent_repo: repo }]);

            if (voteError) throw voteError;

            // 2. Increment the total count (Ideally triggered via DB function)
            const { error: rpcError } = await supabase.rpc('increment_vote', { repo_id: repo });
            
            if (rpcError) throw rpcError;

        } catch (e: any) {
            console.error("Vote failed:", e.message);
            // Revert
            setVotes(v => v - 1);
            setHasVoted(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            disabled={checking}
            onClick={handleVote}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all duration-200 border border-transparent
                ${hasVoted 
                    ? 'bg-orange-500/20 text-orange-500 border-orange-500/30 shadow-lg shadow-orange-500/10' 
                    : 'hover:bg-white/10 hover:border-white/10 text-gray-400 hover:text-white'
                } ${loading ? 'opacity-70 animate-pulse' : ''}`}
        >
            <ChevronUp className={`w-6 h-6 ${hasVoted ? 'stroke-[3px]' : ''}`} />
            <span className="text-sm font-bold">{votes}</span>
        </button>
    );
}
