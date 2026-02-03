
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function generateInsights() {
    console.log("🤖 Starting AI Pulse Insight generation (Gemini Edition)...");

    // 1. Fetch agents missing summaries
    const { data: agents, error } = await supabase
        .from('agents')
        .select('repo, name, description')
        .is('ai_summary', null)
        .limit(10);

    if (error) {
        console.error("Error fetching agents:", error);
        return;
    }

    if (!agents || agents.length === 0) {
        console.log("✅ All agents have insights. Perfection.");
        return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    for (const agent of agents) {
        try {
            console.log(`🧠 Generating Gemini insight for ${agent.name}...`);

            const prompt = `
        Summarize the following AI Agent project in EXACTLY one punchy, exciting sentence.
        Focus on its utility and impact on the AI ecosystem.
        Project: ${agent.name}
        Description: ${agent.description}
        Repo: ${agent.repo}
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const insight = response.text().trim();

            if (insight) {
                const { error: updateError } = await supabase
                    .from('agents')
                    .update({ ai_summary: insight })
                    .eq('repo', agent.repo);

                if (updateError) throw updateError;
                console.log(`✨ Saved insight for ${agent.name}`);
            }
        } catch (e: any) {
            console.error(`❌ Failed for ${agent.name}:`, e.message);
        }
    }
}

generateInsights();
