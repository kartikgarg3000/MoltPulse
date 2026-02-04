
'use client';

import React from 'react';
import { Repeat } from 'lucide-react';

interface JupiterButtonProps {
    mint: string;
    symbol?: string;
    variant?: 'sm' | 'lg';
}

export default function JupiterButton({ mint, symbol = 'Token', variant = 'sm' }: JupiterButtonProps) {
    const swapUrl = `https://jup.ag/swap/SOL-${mint}`;

    if (variant === 'lg') {
        return (
            <a 
                href={swapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group"
            >
                <Repeat size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                Trade ${symbol} on Jupiter
            </a>
        );
    }

    return (
        <a 
            href={swapUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Trade on Jupiter`}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-black group/jup"
        >
            <Repeat size={12} className="group-hover/jup:rotate-180 transition-transform duration-500" />
            Trade
        </a>
    );
}
