import fs from 'fs';
import dotenv from 'dotenv';
if (fs.existsSync('d:/moltpulse/.env.local')) {
    dotenv.config({ path: 'd:/moltpulse/.env.local' });
}
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

async function main() {
    const { data: agents, error } = await supabase
        .from('agents')
        .select('repo, name, is_visible, quality_score, stars, category, pulse_score, trend')
        .in('repo', ['vaibhavarora14/job-application-agent', 'memdeklaro/memdeklaro.github.io']);
    
    if (error) {
        console.error("Error:", error);
    } else {
        console.log(JSON.stringify(agents, null, 2));
    }
}
main();
