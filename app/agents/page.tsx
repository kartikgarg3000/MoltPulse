import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import DirectoryFilter from '@/components/DirectoryFilter';

export const revalidate = 0;

async function getAgents() {
  const supabase = await createClient();

  // Try with quality gate filter first
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .or('is_visible.eq.true,is_visible.is.null')
    .order('pulse_score', { ascending: false, nullsFirst: false });

  // If is_visible column doesn't exist yet (pre-migration), fall back to unfiltered
  if (error) {
    const { data: fallback } = await supabase
      .from('agents')
      .select('*')
      .order('stars', { ascending: false });
    return fallback || [];
  }

  return data || [];
}

export default async function AgentsPage() {
  const agents = await getAgents();
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <header>
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Agent Directory
        </h1>
        <p className="text-gray-400">Discover and explore the ever-growing index of AI innovators.</p>
       </header>
       
       <Suspense fallback={<div className="h-96 w-full animate-pulse bg-white/5 rounded-xl"></div>}>
         <DirectoryFilter initialAgents={agents as any} />
       </Suspense>
    </div>
  );
}
