
export default function PlaybooksPage() {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <header>
          <h1 className="text-4xl font-bold mb-4">Agent Playbooks</h1>
          <p className="text-gray-400">Guides and tutorials for using AI agents.</p>
         </header>
         
         <div className="p-10 border border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-bold mb-2">Guides In Progress</h2>
            <p className="text-gray-500 max-w-md">
                The community is writing the best playbooks for you. Launching soon.
            </p>
         </div>
      </div>
    );
  }
  
