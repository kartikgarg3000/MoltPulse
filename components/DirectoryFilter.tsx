
'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, ArrowUpDown, Shield, Sparkles, Bot, Compass, Wrench, ExternalLink } from 'lucide-react';
import AgentCard from './AgentCard';
import { Agent, AppType } from '@/types';

interface DirectoryFilterProps {
  initialAgents: Agent[];
}

const CATEGORIES = [
  "All", 
  "Creative & Design", 
  "Career & Productivity", 
  "Real Estate & Industry", 
  "Web & Automation", 
  "Autonomous", 
  "Coding & Dev", 
  "Trading", 
  "Framework"
];

const APP_TYPES: { value: 'all' | AppType; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Products', icon: Sparkles },
  { value: 'ai_software', label: 'AI-Built Software', icon: Sparkles },
  { value: 'autonomous_agent', label: 'Autonomous Agents', icon: Bot },
  { value: 'task_bot', label: 'Task Bots', icon: Compass },
  { value: 'dev_tool', label: 'Dev Frameworks', icon: Wrench },
];

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
  const [selectedType, setSelectedType] = useState<'all' | AppType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('pulse');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [demoOnly, setDemoOnly] = useState(false);

  const filteredAgents = useMemo(() => {
    let agents = initialAgents.filter(agent => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        !search ||
        agent.name.toLowerCase().includes(searchLower) || 
        agent.repo.toLowerCase().includes(searchLower) ||
        (agent.description || "").toLowerCase().includes(searchLower) ||
        (agent.tagline || "").toLowerCase().includes(searchLower) ||
        (agent.category || "").toLowerCase().includes(searchLower) ||
        (agent.capabilities || []).some(c => c.toLowerCase().includes(searchLower)) ||
        (agent.built_with || []).some(b => b.toLowerCase().includes(searchLower));
      
      const matchesCategory = 
        activeCategory === 'All' || 
        agent.category === activeCategory ||
        (activeCategory === 'Coding & Dev' && agent.category === 'Coding');

      const matchesType = 
        selectedType === 'all' || 
        agent.app_type === selectedType ||
        (!agent.app_type && selectedType === 'dev_tool');

      const matchesVerified = !verifiedOnly || agent.is_verified === true;
      const matchesDemo = !demoOnly || Boolean(agent.demo_url || agent.website_url);

      return matchesSearch && matchesCategory && matchesType && matchesVerified && matchesDemo;
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
  }, [search, activeCategory, selectedType, sortBy, verifiedOnly, demoOnly, initialAgents]);

  const demoCount = useMemo(() => 
    initialAgents.filter(a => a.demo_url || a.website_url).length,
  [initialAgents]);

  const verifiedCount = useMemo(() => 
    initialAgents.filter(a => a.is_verified).length,
  [initialAgents]);

  return (
    <div className="space-y-6">
      {/* Product Type Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar w-full border-b border-white/10 pb-4">
        {APP_TYPES.map(type => {
          const Icon = type.icon;
          const isSelected = selectedType === type.value;
          return (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected 
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20' 
                  : 'bg-[#0f0f0f] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-white' : 'text-gray-400'} />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search, Sort, and Filter UI */}
      <div className="flex flex-col gap-4">
        
        {/* Row 1: Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text"
              placeholder="Search AI software, agents, capabilities, or built-with tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-md py-2.5 pl-10 pr-10 focus:outline-none focus:border-blue-500/50 transition-all text-sm text-white"
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

          {/* Action Toggles: Live Demo, Verified, Sort */}
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            {/* Live Demo Toggle */}
            <button
              onClick={() => setDemoOnly(!demoOnly)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all border flex-1 md:flex-none ${
                demoOnly 
                ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300' 
                : 'bg-[#111] border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ExternalLink size={13} />
              Live Demo ({demoCount})
            </button>

            {/* Verified Toggle */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all border flex-1 md:flex-none ${
                verifiedOnly 
                ? 'bg-emerald-900/40 border-emerald-500/60 text-emerald-300' 
                : 'bg-[#111] border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Shield size={13} />
              Verified ({verifiedCount})
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex-1 md:flex-none">
              <div className="flex items-center gap-1.5 text-gray-400 bg-[#111] border border-white/10 rounded-md px-3 py-2">
                <ArrowUpDown size={13} />
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

      {/* Results Count & Current Filter Badges */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-500 px-1 gap-2">
        <span>Showing <strong className="text-white font-mono">{filteredAgents.length}</strong> AI software & agents</span>
        <div className="flex items-center gap-3 flex-wrap">
          {selectedType !== 'all' && <span>Type: <strong className="text-purple-400">{APP_TYPES.find(t => t.value === selectedType)?.label}</strong></span>}
          {demoOnly && <span>Filter: <strong className="text-cyan-400">⚡ Live Demo</strong></span>}
          {verifiedOnly && <span>Filter: <strong className="text-emerald-400">✓ Verified</strong></span>}
          {activeCategory !== 'All' && <span>Sector: <strong className="text-blue-400">{activeCategory}</strong></span>}
          <span className="text-gray-600">Sorted by <strong className="text-gray-400">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</strong></span>
        </div>
      </div>

      {/* Grid */}
      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.repo} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 glass rounded-3xl">
          <div className="text-4xl">🔎</div>
          <h3 className="text-xl font-bold">No AI software or agents match your filters</h3>
          <p className="text-gray-500 text-sm max-w-sm">Try broadening your search term, switching categories, or clearing active filters.</p>
          <button 
            onClick={() => { setSearch(''); setActiveCategory('All'); setSelectedType('all'); setVerifiedOnly(false); setDemoOnly(false); setSortBy('pulse'); }}
            className="text-blue-400 hover:underline text-sm font-semibold pt-2"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

