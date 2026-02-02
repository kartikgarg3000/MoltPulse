
export default function RankingsPage() {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <header>
          <h1 className="text-4xl font-bold mb-4">Reputation Rankings</h1>
          <p className="text-gray-400">Top rated agents based on community feedback.</p>
         </header>
         
         <div className="p-10 border border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
            <p className="text-gray-500 max-w-md">
                We are currently collecting reputation data. Check back in Phase 2.
            </p>
         </div>
      </div>
    );
  }
  
