
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Star, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WatchlistButtonProps {
  repo: string;
  variant?: 'compact' | 'large';
}

export default function WatchlistButton({ repo, variant = 'compact' }: WatchlistButtonProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkWatchStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('watchlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('agent_repo', repo)
          .maybeSingle();
        
        if (data) setIsWatching(true);
      }
      setChecking(false);
    };
    checkWatchStatus();
  }, [repo]);

  const handleToggleWatch = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || checking) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      if (isWatching) {
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('agent_repo', repo);
        
        if (error) throw error;
        setIsWatching(false);
      } else {
        const { error } = await supabase
          .from('watchlist')
          .insert([{ user_id: user.id, agent_repo: repo }]);
        
        if (error) throw error;
        setIsWatching(true);
      }
    } catch (err: any) {
      console.error("Watchlist error:", err.message);
      alert(`Failed to update watchlist: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isLarge = variant === 'large';

  return (
    <button
      disabled={checking}
      onClick={handleToggleWatch}
      className={`group flex items-center transition-all duration-300 rounded-full border 
        ${isWatching 
          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' 
          : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
        } ${isLarge ? 'px-6 py-3 gap-3 text-sm font-bold' : 'p-2'}`}
      title={isWatching ? "Remove from watchlist" : "Add to watchlist"}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={isLarge ? 20 : 16} />
      ) : (
        <Star 
          size={isLarge ? 20 : 16} 
          className={`${isWatching ? 'fill-yellow-500' : 'group-hover:scale-110 transition-transform'}`} 
        />
      )}
      {isLarge && (isWatching ? "Watching Agent" : "Add to Watchlist")}
    </button>
  );
}
