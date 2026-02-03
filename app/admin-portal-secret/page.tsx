import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Check, X, ExternalLink, Github, Clock, User, Trash2 } from 'lucide-react';

export default function AdminPortal() {
  const supabase = createClient();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    setSubmissions(data || []);
    setLoading(false);
  };

  const handleApprove = async (sub: any) => {
    // In a real app, this would trigger the scraper to fetch data and insert into 'agents'
    // For now, we'll just mark it as approved in the submissions table.
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('id', sub.id);
    
    if (!error) {
       alert("Approved! (Note: Manual step - run scraper to fully ingest if needed, or I can automate this next phase).");
       fetchSubmissions();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'rejected' })
      .eq('id', id);
    
    if (!error) fetchSubmissions();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', id);
    
    if (!error) fetchSubmissions();
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center bg-white/5 p-8 rounded-3xl border border-white/10 glass">
        <div>
          <h1 className="text-3xl font-black">Admin Portal</h1>
          <p className="text-gray-400">Manage community agent submissions.</p>
        </div>
        <button 
          onClick={fetchSubmissions}
          className="px-6 py-2 bg-blue-600 rounded-full font-bold text-sm hover:bg-blue-500 transition-colors"
        >
          Refresh Feed
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {[1,2,3,4].map(i => (
             <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse"></div>
           ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-20 text-center glass rounded-3xl border border-dashed border-gray-800">
           <p className="text-gray-500">No submissions yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {submissions.map((sub) => (
            <div key={sub.id} className={`p-6 rounded-3xl border transition-all ${
              sub.status === 'approved' ? 'bg-green-500/5 border-green-500/20' :
              sub.status === 'rejected' ? 'bg-red-500/5 border-red-500/20' :
              'bg-white/5 border-white/10'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Github size={16} className="text-gray-500" />
                    <a href={sub.repo} target="_blank" className="text-lg font-bold hover:text-blue-400 transition-colors">
                       {sub.repo.replace('https://github.com/', '')}
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 font-mono italic">{sub.repo}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  sub.status === 'approved' ? 'bg-green-500 text-white' :
                  sub.status === 'rejected' ? 'bg-red-500 text-white' :
                  'bg-yellow-500 text-black'
                }`}>
                  {sub.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="flex items-center gap-2 text-sm text-gray-400">
                    <User size={14} className="text-blue-500" />
                    <span className="truncate">{sub.submitter_name}</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={14} className="text-purple-500" />
                    <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                 </div>
              </div>

              <div className="flex gap-2">
                {sub.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleApprove(sub)}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => handleReject(sub.id)}
                      className="flex-1 py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl font-bold text-sm transition-all border border-red-500/20"
                    >
                      <X size={16} /> Reject
                    </button>
                  </>
                )}
                {sub.status !== 'pending' && (
                  <button 
                  onClick={() => handleDelete(sub.id)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-red-900 rounded-xl font-bold text-sm transition-all text-gray-400 hover:text-white flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Delete Entry
                </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
