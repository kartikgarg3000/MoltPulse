import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AgentCard from '@/components/AgentCard'
import { Star, Zap, ArrowRight, LayoutGrid, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0;

export default async function WatchlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch agents in the user's watchlist with a more explicit join if needed
  const { data: watchedAgents, error: fetchError } = await supabase
    .from('watchlist')
    .select(`
      agent_repo,
      agents:agents!inner (
        repo,
        name,
        description,
        stars,
        trend,
        votes,
        category,
        last_update
      )
    `)
    .eq('user_id', user.id);

  if (fetchError) {
    console.error("Watchlist fetch error:", fetchError);
  }

  // Debug: Log the count of items found
  console.log(`Watchlist items for user ${user.id}:`, watchedAgents?.length || 0);

  const agents = watchedAgents?.map((w: any) => w.agents).filter(Boolean) || [];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-12 animate-in fade-in duration-700">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
            <Star className="text-yellow-500 fill-yellow-500" size={24} />
          </div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-400 to-gray-600">
            My Pulse Watchlist
          </h1>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl">
          Tracking the growth and activity of agents you've shortlisted. Your personal view into the AI explosion.
        </p>
      </header>

      {agents.length === 0 ? (
        <div className="py-32 text-center glass rounded-[3rem] border border-dashed border-white/10 space-y-8">
           <div className="flex justify-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
                 <LayoutGrid className="text-gray-600" size={40} />
              </div>
           </div>
           <div className="space-y-2">
              <h2 className="text-2xl font-bold">Your watchlist is empty</h2>
              <p className="text-gray-500 max-w-sm mx-auto">
                Shortlist agents from the directory to track their real-time performance here.
              </p>
           </div>
           <Link 
             href="/agents" 
             className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all group"
           >
             Browse Directory
             <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent: any) => (
            <AgentCard key={agent.repo} agent={agent} />
          ))}
        </div>
      )}

      {agents.length > 0 && (
        <div className="p-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="space-y-1">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Zap className="text-blue-500" size={18} />
                Want more granular data?
              </h3>
              <p className="text-sm text-gray-500">Enable real-time GitHub notifications for these agents (Upcoming feature).</p>
           </div>
           <button className="px-6 py-3 bg-white/10 rounded-full text-sm font-bold hover:bg-white/20 transition-all">
             Configure Alerts
           </button>
        </div>
      )}
    </div>
  )
}
