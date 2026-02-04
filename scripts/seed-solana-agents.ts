
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const solanaAgents = [
    {
        name: 'Goat Agent',
        repo: 'goat-sdk/goat',
        description: 'The standard for Solana AI Agent development. Execute on-chain actions with LLMs.',
        category: 'Autonomous',
        solana_address: '7xKXm2mcmUvuf67vEAbzJjw8GvXUnP2S652b3FjS4YfS',
        is_solana_verified: true,
        token_mint: 'CzLSujWfsSpguz7oH2F3Ho8Xf68qA5mYq9Q8u6mC0G', // Example $GOAT
        stars: 2500,
    },
    {
        name: 'Terminal of Truths',
        repo: 'truth-terminal/terminal',
        description: 'The AI that manifested a cult following and a billion-dollar meme coin on Solana.',
        category: 'Social',
        solana_address: 'Caw791oR9v7n5pWAc8fFpS6w9Mpj4qS8Z2zW4A2B1C3D',
        is_solana_verified: true,
        token_mint: 'HeLp6SuaFJOsByRKhQgr6AYHLoTS1SgtY8tTHp98A2A', // Example $TRUTH
        stars: 4500,
    },
    {
        name: 'Solana Agent Kit',
        repo: 'sendaifoundation/solana-agent-kit',
        description: 'Connecting any AI agent to Solana protocols (Jupiter, Raydium, Metaplex).',
        category: 'Coding',
        solana_address: 'B2n8yA9v7n5pWAc8fFpS6w9Mpj4qS8Z2zW4A2B1C3D',
        is_solana_verified: true,
        token_mint: 'So11111111111111111111111111111111111111112', // Wrapped SOL as fallback
        stars: 1200
    }
];

async function seedSolanaAgents() {
    console.log("🌊 Seeding Solana Agents...");

    for (const agent of solanaAgents) {
        const { error } = await supabase
            .from('agents')
            .upsert(agent, { onConflict: 'repo' });

        if (error) {
            console.error(`❌ Error seeding ${agent.name}:`, error.message);
        } else {
            console.log(`✅ Seeded: ${agent.name}`);
        }
    }

    console.log("✨ Solana Seeding complete.");
}

seedSolanaAgents();
