
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Calendar, Vote, Heart, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch user's votes with agent details
  const { data: userVotes } = await supabase
    .from('agent_votes')
    .select(`
      created_at,
      agent_repo,
      agents (
        name,
        description,
        category
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const avatarUrl = user.user_metadata?.avatar_url
  const fullName = user.user_metadata?.full_name || user.email
  const githubUsername = user.user_metadata?.preferred_username || user.email

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in fade-in duration-700">
      {/* Profile Header */}
      <header className="glass p-8 md:p-12 rounded-[3rem] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <img 
            src={avatarUrl} 
            alt={fullName} 
            className="w-32 h-32 rounded-3xl border-2 border-white/20 shadow-2xl"
          />
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-black">{fullName}</h1>
              <p className="text-blue-400 font-mono flex items-center justify-center md:justify-start gap-2">
                @{githubUsername}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail size={16} className="text-purple-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Calendar size={16} className="text-blue-500" />
                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center px-8">
               <p className="text-2xl font-black text-white">{userVotes?.length || 0}</p>
               <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Votes</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Stats & Settings */}
        <div className="lg:col-span-1 space-y-8">
           <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Heart size={20} className="text-pink-500" />
                Pulse Stats
              </h2>
              <div className="space-y-3">
                 <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-sm">
                    <span className="text-gray-400">Contribution Rank</span>
                    <span className="text-white font-bold">#2,401</span>
                 </div>
                 <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-sm">
                    <span className="text-gray-400">Reputation Score</span>
                    <span className="text-white font-bold">120 pts</span>
                 </div>
              </div>
           </section>

           <Link 
             href="/settings"
             className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all font-bold"
           >
             Edit Profile Settings
           </Link>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-2 space-y-8">
           <section className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Vote size={20} className="text-blue-500" />
                Recent Voting Activity
              </h2>

              {!userVotes || userVotes.length === 0 ? (
                <div className="py-20 bg-white/5 rounded-3xl border border-dashed border-gray-800 text-center">
                   <p className="text-gray-500">Your pulse is quiet. Start voting to see activity!</p>
                   <Link href="/agents" className="inline-block mt-4 text-blue-400 hover:underline">Browse agents</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userVotes.map((vote: any) => (
                    <div key={vote.agent_repo} className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all group">
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                                   {vote.agents.name}
                                </h3>
                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                   {vote.agents.category}
                                </span>
                             </div>
                             <p className="text-sm text-gray-400 line-clamp-1">{vote.agents.description}</p>
                          </div>
                          <Link href={`/agents/${vote.agent_repo}`} className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                             <ExternalLink size={16} />
                          </Link>
                       </div>
                       <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                          <Vote size={12} className="text-green-500" />
                          Upvoted on {new Date(vote.created_at).toLocaleDateString()}
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </section>
        </div>
      </div>
    </div>
  )
}
