
'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface SupportButtonProps {
    solanaAddress: string;
    agentName: string;
    variant?: 'sm' | 'lg';
}

export default function SupportButton({ solanaAddress, agentName, variant = 'sm' }: SupportButtonProps) {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const handleSupport = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!publicKey) {
            alert("Please connect your Solana wallet first!");
            return;
        }

        try {
            const recipient = new PublicKey(solanaAddress);
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipient,
                    lamports: 0.01 * LAMPORTS_PER_SOL, // Tip 0.01 SOL
                })
            );

            const signature = await sendTransaction(transaction, connection);
            alert(`Success! Support sent to ${agentName}. Signature: ${signature}`);
        } catch (err: any) {
            console.error("Transaction failed:", err);
            alert("Transaction failed: " + err.message);
        }
    };

    if (variant === 'lg') {
        return (
            <button 
                onClick={handleSupport}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black hover:scale-105 transition-all shadow-xl shadow-pink-500/20 active:scale-95 group"
            >
                <Heart size={20} className="fill-white animate-pulse" />
                Support Agent Development (0.01 SOL)
            </button>
        );
    }

    return (
        <button 
            onClick={handleSupport}
            title={`Support ${agentName} (0.01 SOL)`}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500 hover:text-white transition-all text-[10px] font-black group/tip"
        >
            <Heart size={12} className="group-hover/tip:fill-white" />
            Support
        </button>
    );
}
