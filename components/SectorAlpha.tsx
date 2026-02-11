import React from 'react';
import { Trade } from '../types';

interface SectorAlphaProps {
  trades: Trade[];
}

const formatCompact = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: "compact",
    compactDisplay: "short"
  }).format(val);
};

const SectorAlpha: React.FC<SectorAlphaProps> = ({ trades }) => {
  const stats = React.useMemo(() => {
    let tech = 0;
    let health = 0;
    
    trades.forEach(t => {
      const s = t.sector.toLowerCase();
      if (s.includes('technology') || s.includes('tech')) {
        tech += t.value;
      } else if (s.includes('healthcare') || s.includes('health')) {
        health += t.value;
      }
    });

    return { tech, health };
  }, [trades]);

  return (
    <div className="grid grid-cols-2 gap-4 w-full mb-8">
      {/* Technology Block */}
      <div className="bg-black border-2 border-white p-4 flex flex-col justify-between h-24 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
           <span className="text-4xl">💻</span>
        </div>
        <span className="text-[10px] font-display font-black uppercase tracking-widest text-alpha-dim">Technology</span>
        <span className="text-3xl font-mono font-bold text-white tracking-tighter">{formatCompact(stats.tech)}</span>
      </div>

      {/* Healthcare Block */}
      <div className="bg-black border-2 border-white p-4 flex flex-col justify-between h-24 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
           <span className="text-4xl">❤️</span>
        </div>
        <span className="text-[10px] font-display font-black uppercase tracking-widest text-alpha-dim">Healthcare</span>
        <span className="text-3xl font-mono font-bold text-white tracking-tighter">{formatCompact(stats.health)}</span>
      </div>
    </div>
  );
};

export default SectorAlpha;