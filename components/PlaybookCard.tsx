"use client";

import Link from 'next/link';
import { BookOpen, Sparkles, Clock, ArrowRight } from 'lucide-react';

interface Playbook {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  created_at: string;
}

export default function PlaybookCard({ playbook }: { playbook: Playbook }) {
  
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'beginner': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'intermediate': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'advanced': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <Link href={`/playbooks/${playbook.slug}`} className="group block h-full">
      <div className="h-full glass rounded-[2rem] p-8 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all duration-500 flex flex-col relative overflow-hidden">
        
        {/* Glow Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full group-hover:bg-blue-500/20 transition-all" />

        <div className="mb-6 flex items-start justify-between relative z-10">
           <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getDifficultyColor(playbook.difficulty)}`}>
              {playbook.difficulty}
           </div>
           <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
              <BookOpen size={18} />
           </div>
        </div>

        <div className="flex-1 relative z-10">
           <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
             {playbook.title}
           </h3>
           <p className="text-gray-400 leading-relaxed text-sm">
             {playbook.description}
           </p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-500 relative z-10">
           <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-blue-400" />
              <span>{playbook.category}</span>
           </div>
           <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform text-white">
              <span>Read Guide</span>
              <ArrowRight size={12} />
           </div>
        </div>

      </div>
    </Link>
  );
}
