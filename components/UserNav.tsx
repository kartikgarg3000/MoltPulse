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
        className="flex items-center gap-4 px-3 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all duration-300 text-sm whitespace-nowrap overflow-hidden"
      >
        <div className="flex-shrink-0 flex items-center justify-center w-5">
           <User size={20} className="text-black" />
        </div>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Sign In</span>
      </Link>
    )
  }

  const avatarUrl = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`
  const fullName = user.user_metadata?.full_name || user.email

  return (
    <div className="space-y-4">
      {/* Profile Bubble */}
      <div className="flex items-center gap-4 p-2 bg-white/5 rounded-2xl border border-white/10 w-full overflow-hidden transition-all duration-300">
        <img 
          src={avatarUrl} 
          alt={fullName} 
          className="w-8 h-8 rounded-full border border-white/20 flex-shrink-0 ml-1"
        />
        <div className="flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          <p className="text-sm font-bold truncate">{fullName}</p>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest truncate">Active Pulse</p>
        </div>
      </div>

      {/* Nav Actions */}
      <div className="grid grid-cols-1 gap-1">
        <Link href="/profile" className="flex items-center gap-4 px-3 py-3 rounded-md transition-all duration-300 text-sm font-medium whitespace-nowrap overflow-hidden text-gray-400 hover:text-gray-200 hover:bg-[#111] border border-transparent">
          <div className="flex-shrink-0 flex items-center justify-center w-5">
            <User size={20} />
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Profile</span>
        </Link>
        
        <Link href="/watchlist" className="flex items-center gap-4 px-3 py-3 rounded-md transition-all duration-300 text-sm font-medium whitespace-nowrap overflow-hidden text-gray-400 hover:text-gray-200 hover:bg-[#111] border border-transparent">
          <div className="flex-shrink-0 flex items-center justify-center w-5">
            <Zap size={20} />
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">My Watchlist</span>
        </Link>
        
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-4 px-3 py-3 rounded-md transition-all duration-300 text-sm font-medium whitespace-nowrap overflow-hidden text-red-400/70 hover:text-red-400 hover:bg-[#111] border border-transparent w-full text-left"
        >
          <div className="flex-shrink-0 flex items-center justify-center w-5">
            <LogOut size={20} />
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
