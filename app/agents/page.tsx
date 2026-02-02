import { supabase } from '@/lib/supabase';
import AgentCard from '@/components/AgentCard';

export const revalidate = 0;

async function getAgents() {
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
        <h1 className="text-4xl font-bold mb-4">Agent Directory</h1>
        <p className="text-gray-400">Browse all tracked AI agents.</p>
       </header>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
             <AgentCard key={agent.repo} agent={agent as any} />
          ))}
       </div>
    </div>
  );
}
