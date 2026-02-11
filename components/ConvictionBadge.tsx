import React from 'react';

interface ConvictionBadgeProps {
  rank: number | null;
  rs: number;
}

const ConvictionBadge: React.FC<ConvictionBadgeProps> = ({ rank, rs }) => {
  // Genesis Badge for Rank 1
  if (rank === 1) {
    return (
      <div className="bg-white text-black px-3 py-1 rounded-full font-display font-black text-[10px] tracking-widest uppercase border border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]">
        Genesis
      </div>
    );
  }

  const isHighConviction = (rank && rank <= 10) || rs > 20;

  return (
    <div className={`
      flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wide
      ${isHighConviction ? 'bg-alpha-border text-white border border-alpha-dim' : 'bg-transparent text-alpha-dim border border-alpha-border'}
    `}>
      <span>RS {rs.toFixed(1)}</span>
      {rank && (
        <>
          <span className="opacity-30">|</span>
          <span className={rank <= 5 ? "text-alpha-white" : ""}>#{rank}</span>
        </>
      )}
    </div>
  );
};

export default ConvictionBadge;