'use client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyBadgeSnippet({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex items-stretch rounded-lg border border-white/10 bg-[#0a0a0a] overflow-hidden">
        <div className="text-[10px] text-gray-300 p-3 overflow-x-auto whitespace-pre font-mono flex-1 border-r border-white/10 custom-scrollbar">
            {textToCopy}
        </div>
        <button 
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center justify-center gap-1.5 px-4 bg-[#111] hover:bg-[#1a1a1a] text-gray-300 hover:text-white transition-colors"
            title="Copy to clipboard"
        >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
    </div>
  );
}
