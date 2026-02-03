
'use client';

import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
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
}

interface DirectoryFilterProps {
  initialAgents: Agent[];
}

const CATEGORIES = ["All", "MoltHub", "Coding", "Assistant", "Web Browsing", "Autonomous", "Web3", "General"];

export default function DirectoryFilter({ initialAgents }: DirectoryFilterProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredAgents = useMemo(() => {
    return initialAgents.filter(agent => {
      const matchesSearch = 
        agent.name.toLowerCase().includes(search.toLowerCase()) || 
        agent.repo.toLowerCase().includes(search.toLowerCase()) ||
        (agent.description || "").toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = 
        activeCategory === 'All' || 
        agent.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory, initialAgents]);

  return (
    <div className="space-y-8">
      {/* Search and Filter UI */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between sticky top-0 z-20 bg-black/50 backdrop-blur-md py-4 -mx-4 px-4 rounded-xl border border-white/5">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search agents, repos, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                activeCategory === cat 
                ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
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
        {activeCategory !== 'All' && <span>Filter: <strong className="text-blue-400">{activeCategory}</strong></span>}
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
          <p className="text-gray-500">Try adjusting your search or category filter.</p>
          <button 
            onClick={() => { setSearch(''); setActiveCategory('All'); }}
            className="text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
