import { createClient } from '@/utils/supabase/server';
import AgentCard from '@/components/AgentCard';
import PulseActivity from '@/components/PulseActivity';

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
  const supabase = await createClient();
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
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12 items-start">
        <section className="xl:col-span-3">
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

        <aside className="xl:col-span-1 space-y-8 sticky top-8">
           <PulseActivity />
           
           <div className="glass p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
              <h3 className="font-bold mb-2">Beta Pulse</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                MoltPulse is tracking the frontier of AI growth. Every vote and star shapes the rankings in real-time.
              </p>
           </div>
        </aside>
      </div>
    </div>
  );
}
