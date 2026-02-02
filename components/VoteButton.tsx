
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronUp } from 'lucide-react';

interface VoteButtonProps {
    repo: string;
    initialVotes: number;
}

export default function VoteButton({ repo, initialVotes }: VoteButtonProps) {
    const [votes, setVotes] = useState(initialVotes);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleVote = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if inside a Link
        e.stopPropagation();

        if (hasVoted || loading) return;

        setLoading(true);
        
        // Optimistic UI update
        setVotes(v => v + 1);
        setHasVoted(true);

        try {
            const { error } = await supabase.rpc('increment_vote', { repo_id: repo });
            
            if (error) {
                console.error("Vote failed:", error);
                // Revert
                setVotes(v => v - 1);
                setHasVoted(false);
            }
        } catch (e) {
            console.error("Vote error:", e);
            setVotes(v => v - 1);
            setHasVoted(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleVote}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all duration-200 border border-transparent
                ${hasVoted 
                    ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' 
                    : 'hover:bg-white/10 hover:border-white/10 text-gray-400 hover:text-white'
                }`}
        >
            <ChevronUp className={`w-6 h-6 ${hasVoted ? 'stroke-[3px]' : ''}`} />
            <span className="text-sm font-bold">{votes}</span>
        </button>
    );
}
