import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import DirectoryFilter from '@/components/DirectoryFilter';
import { getStaticAgents, isStaticOnlyMode } from '@/lib/static-fallback';

// Bump to 1 hour — agents list changes infrequently; avoids spinning compute every 5 min
export const revalidate = 3600;

async function getAgents() {
  // Short-circuit: skip Supabase init entirely when quota is exceeded
  if (isStaticOnlyMode()) return getStaticAgents();

  const supabase = await createClient();

  const AGENT_FIELDS = 'name,repo,description,stars,last_update,created_at,category,velocity,pulse_score,growth_score,votes,downvotes,is_verified,is_visible,quality_score,language,topics';

  try {
    const { data, error } = await supabase
      .from('agents')
      .select(AGENT_FIELDS)
      .or('is_visible.eq.true,is_visible.is.null')
      .order('pulse_score', { ascending: false, nullsFirst: false });

    if (error) throw error;
    if (data && data.length > 0) return data;
  } catch {
    console.warn('[Fallback] Supabase unavailable, serving from agents-static.json');
  }

  return getStaticAgents();
}

export default async function AgentsPage() {
  const agents = await getAgents();
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <header>
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
          AI Software &amp; Agent Directory
        </h1>
        <p className="text-gray-400">Discover and explore cutting-edge AI-built applications, autonomous task agents, and intelligent tools.</p>
       </header>
       
       <Suspense fallback={<div className="h-96 w-full animate-pulse bg-white/5 rounded-xl"></div>}>
         <DirectoryFilter initialAgents={agents as any} />
       </Suspense>
    </div>
  );
}
