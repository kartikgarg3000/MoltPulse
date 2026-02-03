import { createClient } from '@/utils/supabase/server';
import DirectoryFilter from '@/components/DirectoryFilter';

export const revalidate = 0;

async function getAgents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('agents')
    .select('*')
    .order('name');
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
       
       <DirectoryFilter initialAgents={agents as any} />
    </div>
  );
}
