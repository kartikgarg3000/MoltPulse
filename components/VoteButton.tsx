
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ChevronUp, Loader2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { ed25519 } from '@noble/curves/ed25519'; // Often available in solana deps

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
    const { publicKey, signMessage } = useWallet();

    useEffect(() => {
        const checkVoteStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            
            // Check by Supabase User OR Solana Wallet
            let query = supabase.from('agent_votes').select('id').eq('agent_repo', repo);
            
            if (user) {
                const { data: userVote } = await query.eq('user_id', user.id).maybeSingle();
                if (userVote) setHasVoted(true);
            } else if (publicKey) {
                const { data: walletVote } = await query.eq('solana_wallet', publicKey.toBase58()).maybeSingle();
                if (walletVote) setHasVoted(true);
            }
            
            setChecking(false);
        };
        checkVoteStatus();

        // ... existing realtime sync ...
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
    }, [repo, publicKey]);

    const handleVote = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading || checking) return;

        // Priority 1: Solana Wallet (Verified)
        // Priority 2: Supabase User (Standard)
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!publicKey && !user) {
            router.push('/login');
            return;
        }

        if (hasVoted) return;

        setLoading(true);
        
        try {
            let voteData: any = { agent_repo: repo };
            
            if (publicKey && signMessage) {
                // Request Signature for Verification
                const message = new TextEncoder().encode(`Pulse Vote for ${repo} at ${Date.now()}`);
                const signature = await signMessage(message);
                
                // signature is Uint8Array, we convert to hex/base58 for storage
                const signatureStr = Buffer.from(signature).toString('hex');
                
                voteData.solana_wallet = publicKey.toBase58();
                voteData.signature = signatureStr;
                voteData.is_verified = true;
            } else if (user) {
                voteData.user_id = user.id;
            }

            // Record the unique vote
            const { error: voteError } = await supabase.from('agent_votes').insert([voteData]);
            if (voteError) throw voteError;

            // Increment the total count
            const { error: rpcError } = await supabase.rpc('increment_vote', { repo_id: repo });
            if (rpcError) throw rpcError;

            setVotes(v => v + 1);
            setHasVoted(true);

        } catch (e: any) {
            console.error("Vote failed:", e.message);
            alert("Verification failed or vote already recorded.");
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
