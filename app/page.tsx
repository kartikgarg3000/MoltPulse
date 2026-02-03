
import { supabase } from '@/lib/supabase';
import AgentCard from '@/components/AgentCard';

export const revalidate = 0; // Disable static caching for real-time updates

interface Agent {
  name: string;
  repo: string;
  description: string | null;
  stars: number;
  last_update: string;
  trend: string;
  category?: string;
}

async function getAgents(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('stars', { ascending: false });

  if (error) {
    console.error("Failed to fetch agents:", error);
    return [];
  }

  return data as Agent[];
}

export default async function Home() {
  const agents = await getAgents();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 w-fit">
          Agent Pulse
        </h1>
        <p className="text-gray-400">
          Real-time tracking of the most active AI agents.
        </p>
      </header>
      
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.length > 0 ? (
            agents.map((agent) => (
              <AgentCard key={agent.repo} agent={agent} />
            ))
          ) : (
            <div className="col-span-full p-10 text-center text-gray-500 glass rounded-xl">
              <p>No agent data found. Database might be empty or connecting...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
