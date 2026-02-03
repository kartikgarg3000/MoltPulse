import { createClient } from '@/utils/supabase/server';
import PlaybookCard from '@/components/PlaybookCard';
import { BookOpen, Search, Sparkles } from 'lucide-react';

export const revalidate = 3600; // Refresh once per hour

export default async function PlaybooksPage() {
    const supabase = await createClient();
    const { data: playbooks } = await supabase
        .from('playbooks')
        .select('*')
        .order('created_at', { ascending: false });

    return (
      <div className="max-w-7xl mx-auto py-12 px-4 space-y-12 animate-in fade-in duration-700">
         <header className="relative py-20 px-8 rounded-[3rem] bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent border border-white/10 overflow-hidden">
           <div className="max-w-3xl space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
                 <Sparkles size={14} />
                 Molt Knowledge Base
              </div>
              <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-gray-500 leading-tight">
                Master the Agent Economy.
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                Actionable playbooks, monetization strategies, and setup guides for the rapidly evolving Molt ecosystem.
              </p>
           </div>
           
           {/* Abstract background blobs */}
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full" />
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-600/10 blur-[120px] rounded-full" />
         </header>

         {(!playbooks || playbooks.length === 0) ? (
            <div className="py-32 text-center glass rounded-[3rem] border border-dashed border-white/10 space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                        <BookOpen className="text-gray-600" size={32} />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Curating Knowledge...</h2>
                    <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                        The elite guides for MoltBook and MoltHub are being generated. Stay tuned.
                    </p>
                </div>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {playbooks.map((playbook: any) => (
                  <PlaybookCard key={playbook.id} playbook={playbook} />
               ))}
            </div>
         )}
      </div>
    );
}
  
