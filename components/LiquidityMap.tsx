import React, { useMemo } from 'react';
import { Trade } from '../types';

interface LiquidityMapProps {
  trades: Trade[];
}

interface SectorBlock {
  id: string;
  name: string;
  value: number;
  formattedValue: string;
  topTicker: Trade | null;
  rect: { x: number; y: number; w: number; h: number };
}

// Helper to format currency
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: "compact",
    compactDisplay: "short"
  }).format(val);
};

// --- TREEMAP ALGORITHM (Slice and Dice) ---
// Recursively splits the rect based on value weight.
// Coordinates are 0-100 percentage based.

function sliceAndDice(items: SectorBlock[], rect: { x: number, y: number, w: number, h: number }, result: SectorBlock[]) {
  if (items.length === 0) return;

  const width = rect.w;
  const height = rect.h;
  
  if (items.length === 1) {
    const item = items[0];
    item.rect = { ...rect };
    result.push(item);
    return;
  }

  // Calculate total value of current set
  const totalValue = items.reduce((acc, i) => acc + i.value, 0);
  
  // Find split point to divide value roughly in half
  let splitIndex = 0;
  let currentSum = 0;
  
  for (let i = 0; i < items.length; i++) {
      currentSum += items[i].value;
      if (currentSum >= totalValue / 2) {
          splitIndex = i + 1; 
          break;
      }
  }
  // Ensure we split at least one item
  if (splitIndex >= items.length) splitIndex = items.length - 1;
  if (splitIndex < 1) splitIndex = 1;

  const groupA = items.slice(0, splitIndex);
  const groupB = items.slice(splitIndex);

  const valueA = groupA.reduce((a, b) => a + b.value, 0);
  const pctA = valueA / totalValue;

  if (width > height) {
      // Split vertically (Left / Right) because width is larger
      const wA = width * pctA;
      sliceAndDice(groupA, { x: rect.x, y: rect.y, w: wA, h: height }, result);
      sliceAndDice(groupB, { x: rect.x + wA, y: rect.y, w: width - wA, h: height }, result);
  } else {
      // Split horizontally (Top / Bottom) because height is larger
      const hA = height * pctA;
      sliceAndDice(groupA, { x: rect.x, y: rect.y, w: width, h: hA }, result);
      sliceAndDice(groupB, { x: rect.x, y: rect.y + hA, w: width, h: height - hA }, result);
  }
}

const LiquidityMap: React.FC<LiquidityMapProps> = ({ trades }) => {
  const mapData = useMemo(() => {
     // 1. Aggregate by Sector
     const sectors: Record<string, { value: number, trades: Trade[] }> = {};
     let totalValue = 0;

     trades.forEach(t => {
         const s = t.sector || "Unclassified";
         if (!sectors[s]) sectors[s] = { value: 0, trades: [] };
         sectors[s].value += t.value;
         sectors[s].trades.push(t);
         totalValue += t.value;
     });

     // 2. Prepare Blocks
     const blocks: SectorBlock[] = Object.entries(sectors).map(([name, data]) => {
         // Find top ticker by Whale Force Score
         const topTicker = data.trades.sort((a, b) => b.whaleForceScore - a.whaleForceScore)[0];
         return {
             id: name,
             name,
             value: data.value,
             formattedValue: formatCurrency(data.value),
             topTicker: topTicker || null,
             rect: { x: 0, y: 0, w: 0, h: 0 } // Computed in step 3
         };
     }).sort((a, b) => b.value - a.value); // Sort descending

     // 3. Compute Layout
     const computedBlocks: SectorBlock[] = [];
     if (blocks.length > 0) {
        // Start with full 100x100 area
        sliceAndDice(blocks, { x: 0, y: 0, w: 100, h: 100 }, computedBlocks);
     }
     
     return computedBlocks;
  }, [trades]);

  if (!trades || trades.length === 0) {
      return (
          <div className="w-full h-[600px] flex items-center justify-center border-2 border-dashed border-alpha-border rounded-lg bg-black">
              <span className="text-alpha-dim font-mono text-sm uppercase tracking-widest">// VOID: No liquidity data found</span>
          </div>
      )
  }

  return (
    <div className="w-full h-[calc(100vh-200px)] min-h-[600px] bg-black relative border-2 border-alpha-border overflow-hidden rounded-sm animate-fade-in-up">
       
       {/* Map Title Overlay */}
       <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <h3 className="text-xl font-display font-black text-white uppercase tracking-tight bg-black px-2 py-1 inline-block border border-alpha-border">
            The Liquidity Map
          </h3>
       </div>

       {mapData.map((block, idx) => {
           const { x, y, w, h } = block.rect;
           
           // Heuristics for visibility based on block size
           const isLarge = Math.min(w, h) > 15;
           const isMedium = Math.min(w, h) > 8;
           const fontSize = isLarge ? 'text-2xl' : isMedium ? 'text-xs' : 'text-[8px]';

           // Grayscale Visibility Logic
           // We alternate slight background shades so blocks are distinct. 
           // Top blocks are lighter (more liquid), lower blocks are darker.
           const lightness = Math.max(5, 20 - (idx * 1.5)); // Start at 20% opacity white, fade down
           const bgStyle = `rgba(255, 255, 255, ${lightness / 100})`;

           return (
             <div
               key={block.id}
               className="absolute border border-black hover:border-2 hover:border-white hover:z-50 hover:bg-alpha-surface/90 transition-all group flex flex-col items-center justify-center text-center p-2 cursor-default overflow-hidden"
               style={{
                   left: `${x}%`,
                   top: `${y}%`,
                   width: `${w}%`,
                   height: `${h}%`,
                   backgroundColor: bgStyle
               }}
             >
                 {/* Sector Name */}
                 <span className={`font-display font-black text-white/60 group-hover:text-white uppercase leading-none ${fontSize} opacity-80 group-hover:opacity-100 transition-opacity truncate max-w-full`}>
                    {block.name}
                 </span>
                 
                 {/* Volume Reveal on Hover */}
                 <span className="absolute top-2 right-2 text-[10px] font-mono font-bold text-white bg-black border border-alpha-border px-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {block.formattedValue}
                 </span>

                 {/* Top Conviction Ticker Details */}
                 {block.topTicker && isMedium && (
                     <div className="mt-2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                         <span className="text-[8px] font-mono text-alpha-money uppercase tracking-widest mb-1">Top Conviction</span>
                         
                         <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-white leading-none">{block.topTicker.ticker}</span>
                            <span className="text-[10px] text-alpha-dim font-mono">RS {block.topTicker.rs.toFixed(0)}</span>
                         </div>
                         
                         <div className="flex items-center gap-1 mt-1.5 w-16">
                             <div className="h-0.5 w-full bg-alpha-dim rounded-full overflow-hidden">
                                 <div className="h-full bg-alpha-money shadow-[0_0_5px_rgba(0,255,65,0.8)]" style={{ width: `${block.topTicker.whaleForceScore}%` }}></div>
                             </div>
                         </div>
                     </div>
                 )}
             </div>
           );
       })}
    </div>
  );
};

export default LiquidityMap;