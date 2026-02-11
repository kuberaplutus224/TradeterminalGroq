import React, { useState } from 'react';
import { parseCommand } from '../services/aiService';
import { NaturalFilter } from '../types';

interface CommandBarProps {
  onFilterChange: (filter: NaturalFilter | null) => void;
  activeFilter: NaturalFilter | null;
}

const CommandBar: React.FC<CommandBarProps> = ({ onFilterChange, activeFilter }) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    const filter = await parseCommand(query);
    setIsProcessing(false);
    
    if (filter) {
      onFilterChange(filter);
      setQuery('');
    }
  };

  const clearFilter = () => {
    onFilterChange(null);
  };

  return (
    <div className="w-full relative z-30">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isProcessing ? (
             <div className="w-4 h-4 border-2 border-alpha-dim border-t-alpha-money rounded-full animate-spin"></div>
          ) : (
            <span className="text-alpha-dim text-lg">›</span>
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask the flow... (e.g. 'Big tech moves with high RS')"
          className="w-full bg-black border border-alpha-border text-white text-sm font-mono py-4 pl-10 pr-4 rounded-sm focus:outline-none focus:border-alpha-money/50 focus:shadow-[0_0_20px_rgba(0,255,65,0.1)] transition-all placeholder:text-alpha-border"
        />
        
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-alpha-dim border border-alpha-border rounded-sm bg-alpha-surface/50">ENTER</kbd>
        </div>
      </form>

      {activeFilter && (
        <div className="absolute top-full left-0 mt-3 flex items-center animate-fade-in-up">
          <div className="bg-alpha-surface border border-alpha-money/30 rounded-full px-4 py-1.5 flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-md">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-alpha-money rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-alpha-white">
                  {activeFilter.description || "Custom Filter Active"}
                </span>
             </div>
             <button 
                onClick={clearFilter}
                className="text-alpha-dim hover:text-white transition-colors"
                title="Clear Filter"
             >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                   <line x1="18" y1="6" x2="6" y2="18"></line>
                   <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandBar;