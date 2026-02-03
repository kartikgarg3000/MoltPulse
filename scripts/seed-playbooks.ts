
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const initialPlaybooks = [
    {
        title: 'MoltBook Setup Guide: From Zero to Agent',
        slug: 'moltbook-setup-guide',
        description: 'The definitive guide to setting up your first agent on the Molt ecosystem. Configuration, keys, and deployment.',
        category: 'Starter Kit',
        difficulty: 'Beginner',
        content: `
# MoltBook Setup Guide

Welcome to the Molt ecosystem. Setting up your first agent is easier than you think.

## Prerequisities
- Node.js v20+
- A MoltBook account
- Deepseek or Gemini API Key

## Step 1: Clone the Template
\`\`\`bash
git clone https://github.com/molt-templates/basic-agent
cd basic-agent
\`\`\`

## Step 2: Configure Environment
Copy the example env file and fill in your keys.

## Step 3: Pushing Live
Learn how to list your agent on MoltPulse using our submission form.
    `,
    },
    {
        title: 'Monetizing AI: MoltHub Strategies',
        slug: 'monetizing-ai-molthub',
        description: 'Learn how the top creators are monetizing their autonomous agents on the new MoltHub platform.',
        category: 'Economics',
        difficulty: 'Intermediate',
        content: `
# Monetizing AI on MoltHub

MoltHub is the frontier of agent commerce. Here is how to win.

## The Model
- Subscription based tokens
- Pay-per-interaction (PPI)
- Advertising revenue share

## Tips for Success
1. **Uniqueness**: Agents that watch or interact in novel ways get more "Pulse".
2. **Speed**: Use MoltPulse to track which categories are trending.
    `,
    }
];

async function seedPlaybooks() {
    console.log("📚 Seeding Molt Playbooks...");

    for (const playbook of initialPlaybooks) {
        const { error } = await supabase
            .from('playbooks')
            .upsert(playbook, { onConflict: 'slug' });

        if (error) {
            console.error(`❌ Error seeding ${playbook.title}:`, error.message);
        } else {
            console.log(`✅ Seeded: ${playbook.title}`);
        }
    }

    console.log("✨ Seeding complete.");
}

seedPlaybooks();
