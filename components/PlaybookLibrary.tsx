"use client";

import React, { useState } from 'react';
import PlaybookCard from './PlaybookCard';
import { BookOpen, Search, Sparkles, Filter, ExternalLink, FileText, PenTool } from 'lucide-react';
import Link from 'next/link';

interface Playbook {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  created_at: string;
}

export default function PlaybookLibrary({ playbooks }: { playbooks: Playbook[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Development', 'Business', 'Security'];

  const filteredPlaybooks = playbooks.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="library" className="max-w-7xl mx-auto px-4 py-12">
      
      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <BookOpen size={20} />
           </div>
           <h2 className="text-3xl font-bold text-white">Library</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search guides..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-full pl-10 pr-6 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all w-full md:w-64"
                />
            </div>
            
            {/* Category Tabs */}
            <div className="flex p-1 bg-white/5 rounded-full border border-white/5">
                {categories.map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setCategory(tab)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                            category === tab 
                            ? 'bg-white text-black shadow-lg' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {filteredPlaybooks.length > 0 ? (
            filteredPlaybooks.map(playbook => (
                <PlaybookCard key={playbook.id} playbook={playbook} />
            ))
        ) : (
            <div className="col-span-full py-20 text-center glass rounded-[2rem] border border-dashed border-white/10">
                <p className="text-gray-500">No playbooks found matching your criteria.</p>
                <button 
                    onClick={() => {setSearch(''); setCategory('All');}}
                    className="mt-4 text-blue-400 text-sm hover:underline"
                >
                    Clear filters
                </button>
            </div>
        )}
        
        {/* Call to Action Card */}
        <div className="glass rounded-[2rem] p-8 border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4 opacity-70 hover:opacity-100 transition-opacity cursor-pointer group min-h-[300px]">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <Sparkles size={24} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-white">Submit a Guide</h3>
            <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
                Authored a great agent tutorial? Share it with the 10k+ Molt community.
            </p>
        </div>
      </div>

      {/* External Resources Section */}
      <div className="border-t border-white/10 pt-20">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <ExternalLink size={18} className="text-gray-500" />
            External Resources
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a href="https://arxiv.org/abs/1706.03762" target="_blank" className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group">
                <FileText className="text-red-400 mb-4" size={24} />
                <h4 className="font-bold text-white mb-1 group-hover:text-red-400 transition-colors">Attention Is All You Need</h4>
                <p className="text-xs text-gray-500">The seminal paper that started the Transformer revolution.</p>
            </a>
            
            <a href="https://langchain.com" target="_blank" className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group">
                <PenTool className="text-green-400 mb-4" size={24} />
                <h4 className="font-bold text-white mb-1 group-hover:text-green-400 transition-colors">LangChain documentation</h4>
                <p className="text-xs text-gray-500">Standard framework for chaining LLM capabilities.</p>
            </a>

            <a href="https://platform.openai.com/docs" target="_blank" className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group">
                <Sparkles className="text-blue-400 mb-4" size={24} />
                <h4 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">OpenAI API Reference</h4>
                <p className="text-xs text-gray-500">Official docs for the most popular LLM endpoints.</p>
            </a>

             <a href="https://github.com/topics/autonomous-agents" target="_blank" className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group">
                <BookOpen className="text-purple-400 mb-4" size={24} />
                <h4 className="font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">Awesome Agents</h4>
                <p className="text-xs text-gray-500">Curated list of autonomous agent projects on GitHub.</p>
            </a>
        </div>
      </div>

    </section>
  );
}
