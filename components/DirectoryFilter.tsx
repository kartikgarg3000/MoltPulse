
'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, ArrowUpDown, CheckCircle2, Shield } from 'lucide-react';
import AgentCard from './AgentCard';

interface Agent {
  name: string;
  repo: string;
  description: string | null;
  stars: number;
  last_update: string;
  trend: string;
  votes?: number;
  category?: string;
  pulse_score?: number;
  quality_score?: number;
  is_verified?: boolean;
  created_at?: string;
  velocity?: number;
}

interface DirectoryFilterProps {
  initialAgents: Agent[];
}

const CATEGORIES = ["All", "MoltHub", "Coding", "Assistant", "Web Browsing", "Autonomous", "Web3", "General"];

type SortOption = 'pulse' | 'stars' | 'newest' | 'activity' | 'quality';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'pulse', label: 'Pulse Score' },
  { value: 'stars', label: 'Stars' },
  { value: 'newest', label: 'Newest' },
  { value: 'activity', label: 'Most Active' },
  { value: 'quality', label: 'Quality Score' },
];

export default function DirectoryFilter({ initialAgents }: DirectoryFilterProps) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState<SortOption>('pulse');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredAgents = useMemo(() => {
    let agents = initialAgents.filter(agent => {
      const matchesSearch = 
        agent.name.toLowerCase().includes(search.toLowerCase()) || 
        agent.repo.toLowerCase().includes(search.toLowerCase()) ||
        (agent.description || "").toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = 
        activeCategory === 'All' || 
        agent.category === activeCategory;

      const matchesVerified = !verifiedOnly || agent.is_verified === true;

      return matchesSearch && matchesCategory && matchesVerified;
    });

    // Sort
    agents = [...agents].sort((a, b) => {
      switch (sortBy) {
        case 'pulse':
          return (b.pulse_score || 0) - (a.pulse_score || 0);
        case 'stars':
          return b.stars - a.stars;
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'activity':
          return new Date(b.last_update).getTime() - new Date(a.last_update).getTime();
        case 'quality':
          return (b.quality_score || 0) - (a.quality_score || 0);
        default:
          return 0;
      }
    });

    return agents;
  }, [search, activeCategory, sortBy, verifiedOnly, initialAgents]);

  const verifiedCount = useMemo(() => 
    initialAgents.filter(a => a.is_verified).length,
  [initialAgents]);

  return (
    <div className="space-y-8">
      {/* Search, Sort, and Filter UI */}
      <div className="flex flex-col gap-4 mb-6">
        
        {/* Row 1: Search + Sort */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text"
              placeholder="Search agents, repos, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-md py-2 pl-10 pr-10 focus:outline-none focus:border-white/30 transition-all text-sm text-white"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort + Verified Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Verified Toggle */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all border flex-1 md:flex-none ${
                verifiedOnly 
                ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' 
                : 'bg-[#111] border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Shield size={14} />
              Verified ({verifiedCount})
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex-1 md:flex-none">
              <div className="flex items-center gap-1.5 text-gray-400 bg-[#111] border border-white/10 rounded-md px-3 py-2">
                <ArrowUpDown size={14} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-xs font-medium text-gray-300 focus:outline-none appearance-none cursor-pointer w-full"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#111] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${
                activeCategory === cat 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-sm text-gray-500 px-2">
        <span>Showing {filteredAgents.length} agents</span>
        <div className="flex items-center gap-3">
          {verifiedOnly && <span>Filter: <strong className="text-emerald-400">✓ Verified</strong></span>}
          {activeCategory !== 'All' && <span>Sector: <strong className="text-blue-400">{activeCategory}</strong></span>}
          <span className="text-gray-600">Sorted by <strong className="text-gray-400">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</strong></span>
        </div>
      </div>

      {/* Grid */}
      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.repo} agent={agent as any} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 glass rounded-3xl">
          <div className="text-4xl">🔎</div>
          <h3 className="text-xl font-bold">No agents found</h3>
          <p className="text-gray-500">Try adjusting your search, category, or filter settings.</p>
          <button 
            onClick={() => { setSearch(''); setActiveCategory('All'); setVerifiedOnly(false); setSortBy('pulse'); }}
            className="text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
