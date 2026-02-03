
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Zap, Vote, Star, ExternalLink, User } from 'lucide-react';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'vote' | 'watch';
  user_name: string;
  user_avatar: string;
  agent_name: string;
  agent_repo: string;
  created_at: string;
}

export default function PulseActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // 1. Load initial activity (last 5 votes)
    const fetchInitialLogs = async () => {
      const { data } = await supabase
        .from('agent_votes')
        .select(`
          id,
          created_at,
          agent_repo,
          user_id,
          agents (name),
          profiles:user_id (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        const logs: Activity[] = (data as any[]).map((d: any) => ({
          id: d.id,
          type: 'vote',
          user_name: d.profiles?.full_name || 'Anonymous',
          user_avatar: d.profiles?.avatar_url || '',
          agent_name: d.agents?.name || d.agent_repo,
          agent_repo: d.agent_repo,
          created_at: d.created_at,
        }));
        setActivities(logs);
      }
    };

    fetchInitialLogs();

    // 2. Listen for Realtime inserts
    const channel = supabase
      .channel('public:agent_votes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'agent_votes' 
      }, async (payload) => {
        // Fetch details for the new activity
        const { data } = await supabase
          .from('agent_votes')
          .select(`
            id,
            created_at,
            agent_repo,
            agents (name),
            profiles:user_id (full_name, avatar_url)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          const joinedData = data as any;
          const newActivity: Activity = {
            id: joinedData.id,
            type: 'vote',
            user_name: joinedData.profiles?.full_name || 'Anonymous',
            user_avatar: joinedData.profiles?.avatar_url || '',
            agent_name: joinedData.agents?.name || joinedData.agent_repo,
            agent_repo: joinedData.agent_repo,
            created_at: joinedData.created_at,
          };
          setActivities(prev => [newActivity, ...prev].slice(0, 5));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="glass rounded-[2rem] border border-white/10 overflow-hidden h-fit">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
           <Zap className="text-yellow-500 fill-yellow-500" size={20} />
           Live Pulse Feed
        </h2>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
           Live
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {activities.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            Waiting for community activity...
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-white/5 transition-colors group">
               <div className="flex items-start gap-3">
                  <div className="relative">
                    {activity.user_avatar ? (
                      <img src={activity.user_avatar} alt={activity.user_name} className="w-8 h-8 rounded-full border border-white/10" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                         <User size={14} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-black">
                       <Vote size={10} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 leading-relaxed">
                       <span className="text-white font-bold">{activity.user_name}</span> 
                       {' '}upvoted{' '}
                       <Link href={`/agents/${activity.agent_repo}`} className="text-blue-400 hover:underline font-bold">
                          {activity.agent_name}
                       </Link>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">
                       {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <Link href={`/agents/${activity.agent_repo}`} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg text-gray-400">
                     <ExternalLink size={14} />
                  </Link>
               </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 bg-white/5 text-center">
         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            {activities.length} Recent actions captured
         </p>
      </div>
    </div>
  );
}
