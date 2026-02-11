import React, { useState } from 'react';
import { Trade } from '../types';
import ConvictionBadge from './ConvictionBadge';
import { generateTradeNarrative, generatePeerReview } from '../services/aiService';

interface TradeCardProps {
  trade: Trade;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: "compact",
    compactDisplay: "short"
  }).format(val);
};

const formatPrice = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const getSentimentConfig = (category: string) => {
  switch (category) {
    case 'MOMENTUM':
      return {
        color: 'text-alpha-money',
        border: 'group-hover/tag:border-alpha-money/50',
        bg: 'group-hover/tag:bg-alpha-money/5',
        desc: 'High velocity price action supported by strong RS. Trend following.'
      };
    case 'CONTRARIAN':
      return {
        color: 'text-amber-500',
        border: 'group-hover/tag:border-amber-500/50',
        bg: 'group-hover/tag:bg-amber-500/5',
        desc: 'Accumulation into weakness. Betting on a structural reversal.'
      };
    case 'STEALTH':
      return {
        color: 'text-blue-400',
        border: 'group-hover/tag:border-blue-400/50',
        bg: 'group-hover/tag:bg-blue-400/5',
        desc: 'Quiet accumulation below the radar. High conviction, low visibility.'
      };
    default:
      return {
        color: 'text-white',
        border: 'group-hover/tag:border-white/50',
        bg: '',
        desc: 'Standard institutional positioning.'
      };
  }
};

const TradeCard: React.FC<TradeCardProps> = ({ trade }) => {
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Peer Review State
  const [peerReview, setPeerReview] = useState<string | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const isRank1 = trade.rank === 1;
  const sentimentConfig = getSentimentConfig(trade.sentimentCategory);
  const btcContext = trade.btcContext;

  // Rank 1 gets a white border, BTC gets Orange, others standard
  let containerClass = "bg-black border-2 border-alpha-border hover:border-alpha-dim transition-colors";
  
  if (isRank1) {
    containerClass = "bg-black border-2 border-white relative z-10";
  } else if (btcContext?.active) {
    containerClass = "bg-black border-2 border-alpha-bitcoin/50 hover:border-alpha-bitcoin shadow-[0_0_15px_rgba(247,147,26,0.1)] relative z-10";
  }

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (narrative) return; // Don't fetch again if already exists
    
    setLoading(true);
    const result = await generateTradeNarrative(trade);
    setNarrative(result);
    setLoading(false);
  };

  const handlePeerReview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReview(true);
    if (peerReview) return;

    setIsReviewLoading(true);
    const result = await generatePeerReview(trade);
    setPeerReview(result);
    setIsReviewLoading(false);
  };

  return (
    <div className={`${containerClass} p-5 flex flex-col justify-between h-full group rounded-lg relative overflow-visible`}>
      
      {/* Top Right Tags: Whale DNA & Sentiment */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
        
        {/* Sentiment Tag (Translator) - Redesigned with Tooltip */}
        <div className={`relative group/tag cursor-help flex items-center border border-alpha-border rounded-sm bg-black transition-all duration-300 ${sentimentConfig.border} ${sentimentConfig.bg}`}>
           {/* Label Side */}
           <div className="px-1.5 py-1 border-r border-alpha-border/50">
             <span className="font-mono text-[9px] font-bold text-alpha-dim uppercase tracking-wider leading-none">TAG</span>
           </div>
           {/* Value Side */}
           <div className="px-2 py-1">
             <span className={`font-mono text-[9px] font-bold tracking-widest leading-none ${sentimentConfig.color}`}>
               {trade.sentimentCategory}
             </span>
           </div>

           {/* Tooltip */}
           <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-black border border-alpha-border text-left shadow-[0_4px_20px_rgba(0,0,0,0.8)] opacity-0 group-hover/tag:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-1 border-b border-alpha-border/50 pb-1">
                 <div className={`w-1.5 h-1.5 rounded-full ${sentimentConfig.color.replace('text-', 'bg-')}`}></div>
                 <span className={`text-[10px] font-bold uppercase ${sentimentConfig.color}`}>{trade.sentimentCategory}</span>
              </div>
              <p className="text-[9px] text-alpha-dim font-mono leading-relaxed">
                {sentimentConfig.desc}
              </p>
           </div>
        </div>

        {/* Whale DNA Tag (Existing) */}
        {trade.behavioralTag && (
          <div className="flex items-center border border-white/20 rounded-sm overflow-hidden bg-white/5 backdrop-blur-sm h-[22px] shadow-sm">
             <div className="h-full px-2 flex items-center justify-center">
               <span className="font-sans text-[9px] font-bold text-white/90 uppercase tracking-widest leading-none">
                 {trade.behavioralTag}
               </span>
             </div>
          </div>
        )}
      </div>

      {/* Header: Ticker & Time */}
      <div className="flex flex-col mb-6">
        <div className="flex items-center gap-2">
           <h2 className={`text-3xl font-display font-bold tracking-tight leading-none ${btcContext?.active ? 'text-alpha-bitcoin' : 'text-white'}`}>
              {trade.ticker}
           </h2>
           
           {/* Bitcoin Context Icon */}
           {btcContext?.active && (
             <div className="bg-alpha-bitcoin text-black w-5 h-5 flex items-center justify-center rounded-full font-black text-xs shadow-[0_0_10px_rgba(247,147,26,0.8)] animate-pulse" title="Block-Chain Context Active">
                ₿
             </div>
           )}
        </div>

        <div className="flex items-center gap-3 mt-2">
           <span className="text-[10px] font-mono text-alpha-dim border border-alpha-border px-1.5 py-0.5 rounded-sm">{trade.time}</span>
           <span className="text-[10px] font-mono text-alpha-dim opacity-50 truncate max-w-[100px]">{trade.hash}</span>
        </div>
      </div>

      {/* Big Print Data */}
      <div className="flex flex-col gap-3 mb-6 flex-grow">
        
        {/* Power Level */}
        <div className="flex justify-between items-center border-b-2 border-dashed border-alpha-border pb-2 mb-1">
          <span className="text-[11px] text-alpha-dim font-display font-bold uppercase tracking-wide">Power Level</span>
          <div className="flex items-center gap-3">
             <div className="w-12 h-1.5 bg-alpha-border rounded-full overflow-hidden">
                <div className={`h-full ${btcContext?.active ? 'bg-alpha-bitcoin' : 'bg-white'}`} style={{ width: `${trade.whaleForceScore}%` }}></div>
             </div>
             <span className={`text-xl font-mono font-bold ${btcContext?.active ? 'text-alpha-bitcoin' : 'text-white'}`}>
                {trade.whaleForceScore.toFixed(0)}
             </span>
          </div>
        </div>

        {/* Entry Point & Gravity Anchor */}
        <div className="flex justify-between items-baseline border-b-2 border-dashed border-alpha-border pb-2 group/entry relative">
          <span className="text-[11px] text-alpha-dim font-display font-bold uppercase tracking-wide flex items-center gap-1">
            Entry Point
            {trade.gravity?.isAnchor && (
              <span className="ml-1 text-[8px] text-alpha-money border border-alpha-money px-1 rounded-full cursor-help">
                ⚓
              </span>
            )}
          </span>
          <span className="text-xl font-mono text-white opacity-80">${formatPrice(trade.tradePrice)}</span>
          
          {/* Gravity Tooltip */}
          {trade.gravity?.isAnchor && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-black border border-white p-3 shadow-2xl z-50 opacity-0 group-hover/entry:opacity-100 transition-opacity pointer-events-none">
               <h4 className="text-[10px] font-bold text-white uppercase mb-1">Gravity Anchor Detected</h4>
               <p className="text-[9px] text-alpha-dim font-mono leading-tight mb-2">
                 Institutional inventory is stacking at this level.
               </p>
               <div className="flex justify-between border-t border-alpha-border pt-1">
                  <span className="text-[9px] text-alpha-dim">Net Vol:</span>
                  <span className="text-[9px] text-white font-bold">{formatCurrency(trade.gravity.totalVolumeAtLevel)}</span>
               </div>
            </div>
          )}
        </div>

        {/* Total Value */}
        <div className="flex justify-between items-baseline pt-1">
           <span className="text-[11px] text-alpha-dim font-display font-bold uppercase tracking-wide">Total Value</span>
           <span className="text-3xl font-mono font-bold text-alpha-money tracking-tighter">{formatCurrency(trade.value)}</span>
        </div>
      </div>
      
      {/* Intel Tags (Shadow Tracking & BTC) */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* BTC Context Tag */}
        {btcContext?.active && (
           <div className="relative group/btc cursor-help">
              <div className="border border-alpha-bitcoin/50 bg-alpha-bitcoin/10 px-1.5 py-0.5 flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-bold text-alpha-bitcoin uppercase tracking-tight">{btcContext.tag}</span>
              </div>
               {/* BTC Tooltip */}
               <div className="absolute bottom-full left-0 mb-2 w-56 bg-black border border-alpha-bitcoin p-3 shadow-2xl z-50 opacity-0 group-hover/btc:opacity-100 transition-opacity pointer-events-none">
                  <h4 className="text-[10px] font-bold text-alpha-bitcoin uppercase mb-1">Block-Chain Context</h4>
                  <p className="text-[9px] text-white font-mono leading-tight mb-2">
                    {btcContext.reason}
                  </p>
                  <div className="flex justify-between border-t border-alpha-border pt-1">
                    <span className="text-[9px] text-alpha-dim">Simulated BTC:</span>
                    <span className={`text-[9px] font-bold ${btcContext.btcMove > 0 ? 'text-alpha-money' : 'text-amber-500'}`}>
                        {btcContext.btcMove > 0 ? '+' : ''}{btcContext.btcMove}%
                    </span>
                  </div>
               </div>
           </div>
        )}

        <div className="border border-alpha-dim px-1.5 py-0.5 flex items-center gap-1.5" title="Defense Score: Entry price magnet strength (1-10)">
           <span className="text-[9px] font-mono text-alpha-dim uppercase">DEF:</span>
           <span className="text-[9px] font-mono font-bold text-white">{trade.defenseScore}/10</span>
        </div>
        
        {trade.shadowCluster && (
           <div className="relative group/shadow cursor-help">
             <div className="border border-alpha-money/50 bg-alpha-money/5 px-1.5 py-0.5 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 bg-alpha-money rounded-full"></span>
                <span className="text-[9px] font-mono font-bold text-alpha-money uppercase tracking-tight">SHADOW CLUSTER</span>
             </div>

             {/* Shadow Tooltip */}
             <div className="absolute bottom-full left-0 mb-2 w-56 bg-black border border-alpha-money p-3 shadow-2xl z-50 opacity-0 group-hover/shadow:opacity-100 transition-opacity pointer-events-none">
                <h4 className="text-[10px] font-bold text-alpha-money uppercase mb-1">Sector Rotation Alert</h4>
                <p className="text-[9px] text-white font-mono leading-tight">
                  High concentration of strong RS trades detected in <span className="text-alpha-money">{trade.industry}</span>. Money is rotating here.
                </p>
             </div>
           </div>
        )}
      </div>

      {/* Translator Footer (Vibe Check) */}
      <div className="mb-4 border-t border-dashed border-alpha-border pt-2">
         <p className="font-mono text-[9px] text-white/70 uppercase leading-relaxed tracking-wide">
           <span className="text-alpha-dim mr-1">VIBE CHECK //</span> 
           {trade.sentimentVibe}
         </p>
      </div>

      {/* AI Action Deck */}
      <div className="mb-4 space-y-3">
        {/* Buttons Row */}
        <div className="flex gap-2">
           {!narrative && !loading && (
              <button 
                onClick={handleAnalyze}
                className="text-[10px] font-black uppercase tracking-widest text-alpha-dim hover:text-white border border-alpha-border hover:border-white px-2 py-1 transition-all flex items-center gap-2 flex-1 justify-center"
              >
                <span className="w-1.5 h-1.5 bg-alpha-money rounded-full"></span>
                Req AI Narrative
              </button>
           )}

           {!showReview && (
              <button 
                 onClick={handlePeerReview}
                 className="text-[10px] font-black uppercase tracking-widest text-red-800 hover:text-red-500 border border-red-900/50 hover:border-red-500 px-2 py-1 transition-all flex items-center gap-2 flex-1 justify-center"
              >
                 <span className="text-xs">⚠</span>
                 AI Peer Review
              </button>
           )}
        </div>
        
        {/* Loading States */}
        {loading && (
           <div className="flex items-center gap-2 px-2">
              <span className="w-2 h-2 bg-white animate-spin"></span>
              <span className="text-[10px] font-mono text-alpha-dim">Computing conviction...</span>
           </div>
        )}
        
        {isReviewLoading && (
           <div className="flex items-center gap-2 px-2">
              <span className="w-2 h-2 border border-red-500 border-t-transparent rounded-full animate-spin"></span>
              <span className="text-[10px] font-mono text-red-500">Running bear case simulation...</span>
           </div>
        )}

        {/* Narrative Result */}
        {narrative && (
          <div className="bg-alpha-surface border border-alpha-border p-3 relative">
             <span className="absolute -top-2 left-2 text-[8px] bg-black px-1 text-alpha-money border border-alpha-border uppercase">AI Insight</span>
             <p className="text-xs text-white font-medium leading-tight">
               "{narrative}"
             </p>
          </div>
        )}

        {/* Peer Review Result (System Warning) */}
        {showReview && peerReview && (
           <div className="mt-2 bg-black border-2 border-dashed border-red-500/80 p-3 relative animate-pulse-slow">
             <div className="absolute -top-2.5 left-2 bg-black px-2 text-[9px] font-mono font-black text-red-500 tracking-widest uppercase border border-red-500/50">
                // CRITICAL_REVIEW_INITIATED
             </div>
             <p className="text-[10px] font-mono text-red-400 leading-relaxed mt-1">
               {peerReview}
             </p>
             <button 
                onClick={(e) => { e.stopPropagation(); setShowReview(false); }} 
                className="absolute -top-2 right-2 bg-black text-red-500 hover:text-red-300 border border-red-500/50 px-1.5 text-[10px] leading-none"
                title="Dismiss Warning"
             >
               ×
             </button>
           </div>
        )}
      </div>

      {/* Footer: Sector & Badge */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] text-white font-display font-bold uppercase tracking-wider max-w-[120px] truncate">
            {trade.sector}
          </span>
          <span className="text-[10px] text-alpha-dim truncate max-w-[120px] font-medium">
            {trade.industry}
          </span>
        </div>
        
        <ConvictionBadge rank={trade.rank} rs={trade.rs} />
      </div>
    </div>
  );
};

export default TradeCard;