import React from 'react';
import { Trade } from '../types';

interface SectorLeaderboardProps {
  trades: Trade[];
  onSectorClick: (sector: string) => void;
  selectedSectors: string[];
}

const SectorLeaderboard: React.FC<SectorLeaderboardProps> = ({ trades, onSectorClick, selectedSectors }) => {
  const sectorData = React.useMemo(() => {
    const agg: Record<string, number> = {};
    trades.forEach(t => {
      // Normalize sector name to avoid duplicates if any
      const sector = t.sector || 'Unclassified';
      agg[sector] = (agg[sector] || 0) + t.value;
    });

    return Object.entries(agg)
      .sort(([, a], [, b]) => b - a) // Sort descending by value
      .slice(0, 5); // Take top 5
  }, [trades]);

  const maxVal = sectorData.length > 0 ? sectorData[0][1] : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
      {sectorData.map(([sector, value], idx) => {
        const percent = (value / maxVal) * 100;
        const isSelected = selectedSectors.includes(sector);
        
        return (
          <button 
            key={sector} 
            onClick={() => onSectorClick(sector)}
            className={`
              p-3 rounded-sm flex flex-col justify-between group transition-all cursor-pointer text-left w-full border-2 relative overflow-hidden
              ${isSelected 
                ? 'bg-alpha-money/10 border-alpha-money shadow-[0_0_15px_rgba(0,255,65,0.15)]' 
                : 'bg-alpha-surface border-alpha-border hover:border-alpha-money/50 hover:bg-alpha-border/20'
              }
            `}
          >
            {isSelected && (
              <div className="absolute top-0 right-0 p-1">
                <div className="w-1.5 h-1.5 bg-alpha-money rounded-full shadow-[0_0_5px_rgba(0,255,65,0.8)]"></div>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-2 w-full relative z-10">
              <span className={`text-[10px] font-bold tracking-wider transition-colors ${isSelected ? 'text-white' : 'text-alpha-dim group-hover:text-white'}`}>
                0{idx + 1}
              </span>
              <span className={`text-[10px] font-mono ${isSelected ? 'text-white' : 'text-alpha-money'}`}>
                ${(value / 1000000).toFixed(1)}M
              </span>
            </div>
            
            <div className="w-full relative z-10">
              <h3 className={`text-xs font-bold uppercase truncate mb-1.5 transition-colors ${isSelected ? 'text-alpha-money' : 'text-white group-hover:text-alpha-money'}`} title={sector}>
                {sector}
              </h3>
              <div className="w-full bg-alpha-border h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${isSelected ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-alpha-money'}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  );
};

export default SectorLeaderboard;