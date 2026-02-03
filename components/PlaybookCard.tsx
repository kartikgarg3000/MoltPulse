
'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, BarChart, ArrowRight } from 'lucide-react';

interface Playbook {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  thumbnail_url?: string;
}

interface PlaybookCardProps {
  playbook: Playbook;
}

export default function PlaybookCard({ playbook }: PlaybookCardProps) {
  return (
    <Link href={`/playbooks/${playbook.slug}`} className="group block h-full">
      <div className="glass rounded-[2rem] p-8 border border-white/10 hover:border-blue-500/30 transition-all duration-500 flex flex-col h-full bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
        
        {/* Category Badge */}
        <div className="flex justify-between items-start mb-6">
           <span className="text-[10px] uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
             {playbook.category}
           </span>
           <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all duration-500">
             <BookOpen size={20} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
           </div>
        </div>

        <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors mb-4 leading-tight">
          {playbook.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-8 line-clamp-3 leading-relaxed">
          {playbook.description}
        </p>

        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <div className="flex items-center gap-1.5">
                 <Clock size={14} className="text-gray-600" />
                 <span>5 min</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <BarChart size={14} className="text-gray-600" />
                 <span>{playbook.difficulty}</span>
              </div>
           </div>
           
           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
              <ArrowRight size={16} />
           </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full group-hover:bg-blue-500/10 transition-all duration-500" />
      </div>
    </Link>
  );
}
