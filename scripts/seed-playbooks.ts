
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Ideally use SERVICE_ROLE_KEY for writing, but let's try ANON first if RLS allows, 
// otherwise we assume the user running this has the right env vars.
// For a script, SERVICE_ROLE is better.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const playbooks = [
    {
        title: "Zero to Hero: Building Your First Agent",
        slug: "zero-to-hero-agent-building",
        description: "A comprehensive guide to scaffolding, coding, and deploying your first autonomous agent using modern frameworks.",
        category: "Development",
        difficulty: "Beginner",
        content: `
# Building Your First Agent

Welcome to the **MoltPulse** guide on building autonomous agents. In this playbook, we'll cover the essentials of creating an agent that can interact with the world.

## Prerequisites

- Node.js v18+
- TypeScript knowledge
- An OpenAI API Key

## Step 1: choosing a Framework

There are several great frameworks for building agents:

1. **LangChain**: Great for chaining LLM calls.
2. **AutoGPT**: Good for autonomous loops.
3. **BabyAGI**: Simple and effective task management.

## Step 2: The Loop

Every agent operates on a core loop:
1. **Perceive**: Read input or environment state.
2. **Think**: Use an LLM to decide on an action.
3. **Act**: Execute the action (HTTP request, file write, etc.).

\`\`\`typescript
while (true) {
  const state = await perceive();
  const action = await think(state);
  await act(action);
}
\`\`\`

## Step 3: Deployment

Deploy your agent to a cloud provider like Vercel or Railway. Ensure your environment variables are set securely.
    `
    },
    {
        title: "Monetization Patterns for 2024",
        slug: "agent-monetization-patterns",
        description: "Explore the emerging business models for AI agents, from token-gating to SaaS subscriptions.",
        category: "Business",
        difficulty: "Intermediate",
        content: `
# Monetizing Your Agent

So you've built a great agent. How do you make it sustainable?

## 1. The SaaS Model

Charge a monthly subscription for access to your agent. This is the most common model for tools like productivity assistants.

## 2. Usage-Based Pricing

Charge per token or per task. This aligns your revenue with your costs (LLM API fees).

## 3. Token Gating (Web3)

For crypto-native agents, require users to hold a specific NFT or token to access premium features. 
*Note: MoltPulse supports tracking these agents!*

## 4. Affiliate & Tipping

Free-to-use agents can generate revenue through affiliate links or direct tips (if integrated with a wallet).
    `
    }
];

async function seed() {
    console.log("Seeding playbooks...");

    for (const p of playbooks) {
        const { error } = await supabase
            .from('playbooks')
            .upsert(p, { onConflict: 'slug' });

        if (error) {
            console.error(`Error seeding ${p.title}:`, error);
        } else {
            console.log(`Seeded: ${p.title}`);
        }
    }
}

seed();
