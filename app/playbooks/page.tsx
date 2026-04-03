import { createClient } from '@/utils/supabase/server';
import PlaybookCard from '@/components/PlaybookCard';
import PlaybookLibrary from '@/components/PlaybookLibrary';

import { BookOpen, Search, Sparkles, Layers, Cpu, Code, Target, ArrowRight } from 'lucide-react';

export const revalidate = 3600; // Refresh once per hour

export default async function PlaybooksPage() {
    const supabase = await createClient();
    const { data: playbooks } = await supabase
        .from('playbooks')
        .select('*')
        .order('created_at', { ascending: false });

    return (
      <div className="space-y-20 pb-20 animate-in fade-in duration-700">
         
         {/* Hero Section */}
         <header className="relative pt-32 pb-20 px-4 overflow-hidden border-b border-white/5">
           <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
           
           <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-black uppercase tracking-[0.2em] mb-4">
                 <Sparkles size={14} className="text-yellow-500" />
                 Molt Knowledge Base
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
                Master the <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Agent Economy</span>
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
                The definitive resource for building, deploying, and monetizing autonomous agents in the Molt ecosystem.
              </p>
           </div>
         </header>

         {/* Educational Framework Section (Value-Add) */}
         <section className="max-w-7xl mx-auto px-4">
            <div className="mb-12 flex items-center justify-between border-b border-white/10 pb-4">
               <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Layers className="text-blue-500" />
                  The Agent Framework
               </h2>
               <span className="text-xs font-mono text-gray-500 hidden md:block">CORE CONCEPTS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="glass p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors group">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                     <Cpu size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">1. Architecture</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                     Understand the cognitive loops, memory systems, and tool-use patterns that define modern autonomous agents. Learn how to structure your code for autonomy.
                  </p>
               </div>

               <div className="glass p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-colors group">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                     <Code size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">2. Implementation</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                     Deep dives into frameworks like LangChain, AutoGPT, and custom implementations. Best practices for TypeScript, Python, and deployment.
                  </p>
               </div>

               <div className="glass p-8 rounded-3xl border border-white/5 hover:border-green-500/30 transition-colors group">
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                     <Target size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">3. Monetization</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                     Strategies for sustaining your agents. From token-gated access and SaaS subscriptions to on-chain tipping and affiliate models.
                  </p>
               </div>
            </div>
         </section>

         {/* Learning Paths (Static Roadmap) */}
         <section className="bg-white/5 border-y border-white/5 py-20">
            <div className="max-w-7xl mx-auto px-4">
               <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="md:w-1/2 space-y-6">
                     <h2 className="text-3xl font-bold text-white">Start Your Journey</h2>
                     <p className="text-gray-400 text-lg">
                        Not sure where to begin? Follow our recommended path to go from concept to deployed agent.
                     </p>
                     
                     <div className="space-y-4">
                        <div className="flex items-center gap-4 text-gray-300">
                           <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-black font-bold text-sm">1</div>
                           <span>Read "Zero to Hero" Guide</span>
                        </div>
                        <div className="w-0.5 h-6 bg-white/10 ml-4" />
                        <div className="flex items-center gap-4 text-gray-300">
                           <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">2</div>
                           <span>Fork a Starter Repo</span>
                        </div>
                         <div className="w-0.5 h-6 bg-white/10 ml-4" />
                        <div className="flex items-center gap-4 text-gray-300">
                           <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">3</div>
                           <span>Submit to MoltPulse</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* Visual placeholder for roadmap graphic or just abstract art */}
                  <div className="md:w-1/2 flex justify-center">
                     <div className="relative w-full max-w-sm aspect-square bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl opacity-50" />
                     <div className="absolute glass p-8 rounded-2xl border border-white/10 max-w-xs rotate-3">
                        <h4 className="font-bold text-white mb-2">Curriculum Beta</h4>
                        <p className="text-xs text-gray-400">We are actively building new modules for the Molt Academy.</p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* The Playbook Library Grid */}
         <PlaybookLibrary playbooks={playbooks || []} />
      </div>
    );
}
  
