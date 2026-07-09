import fs from 'fs';
import dotenv from 'dotenv';
if (fs.existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
}
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TRADING_AGENTS = [
  {
    repo: 'freqtrade/freqtrade',
    name: 'Freqtrade',
    description: 'Free, open source crypto trading bot',
    category: 'Trading'
  },
  {
    repo: 'hummingbot/hummingbot',
    name: 'Hummingbot',
    description: 'Open source software that helps you build high-frequency crypto trading bots',
    category: 'Trading'
  },
  {
    repo: 'jesse-ai/jesse',
    name: 'Jesse',
    description: 'An advanced crypto trading bot written in Python',
    category: 'Trading'
  },
  {
    repo: 'ccxt/ccxt',
    name: 'CCXT',
    description: 'A JavaScript / Python / PHP cryptocurrency trading API with support for more than 100 bitcoin/altcoin exchanges',
    category: 'Trading'
  }
];

async function main() {
  console.log('Seeding Trading Agents...');
  
  for (const agent of TRADING_AGENTS) {
    const { error } = await supabase
      .from('agents')
      .update({ category: 'Trading' })
      .eq('repo', agent.repo);

    if (error) {
      console.error(`Error updating ${agent.repo}:`, error);
    } else {
      console.log(`Updated ${agent.repo} to Trading category.`);
    }
    
    // Just to be safe, also do an insert if they don't exist
    const { data } = await supabase.from('agents').select('repo').eq('repo', agent.repo).single();
    if (!data) {
        console.log(`Inserting ${agent.repo} since it does not exist...`);
        await supabase.from('agents').insert([{
            repo: agent.repo,
            name: agent.name,
            description: agent.description,
            category: 'Trading',
            stars: 0,
            last_update: new Date().toISOString(),
            trend: 'New',
            quality_score: 80,
            is_visible: true,
            is_verified: true
        }]);
    }
  }
  
  console.log('Done!');
}

main();
