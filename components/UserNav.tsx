'use client';

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LogOut, User, Settings, Zap } from 'lucide-react'

export default function UserNav() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) return <div className="h-10 bg-white/5 animate-pulse rounded-xl"></div>

  if (!user) {
    return (
      <Link 
        href="/login"
        className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all text-sm"
      >
        Sign In
      </Link>
    )
  }

  const avatarUrl = user.user_metadata?.avatar_url
  const fullName = user.user_metadata?.full_name || user.email

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
        <img 
          src={avatarUrl} 
          alt={fullName} 
          className="w-10 h-10 rounded-full border border-white/20"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{fullName}</p>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Active Pulse</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1">
        <Link href="/profile" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all text-sm">
          <User size={16} />
          <span>Profile</span>
        </Link>
        <Link href="/watchlist" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all text-sm">
          <Zap size={16} />
          <span>My Watchlist</span>
        </Link>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
