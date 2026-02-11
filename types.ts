
export interface Trade {
  id: string;
  hash: string; // Simulated Tx Hash
  time: string;
  ticker: string;
  tradePrice: number;
  sector: string;
  industry: string;
  shares: number;
  value: number;
  rs: number; // Relative Size (measures size relative to all other trades for the same ticker)
  pct: number;
  rank: number | null; // R
  lastDate: string;
  convictionScore: number; // Legacy score (kept for compatibility)
  whaleForceScore: number; // New Power Level (0-100)
  
  // New Intelligence Fields
  behavioralTag?: string; // Whale DNA (e.g., 'BLITZ', 'ACCUMULATOR')
  gravity?: {
    isAnchor: boolean;
    totalVolumeAtLevel: number;
    clusterCount: number;
  };

  // Shadow Tracking
  defenseScore: number; // 1-10, Value based magnet strength
  shadowCluster?: boolean; // True if part of a High-RS Industry Cluster
  
  // Sentiment Translator
  sentimentCategory: 'MOMENTUM' | 'CONTRARIAN' | 'STEALTH';
  sentimentVibe: string;

  // Block-Chain Context
  btcContext?: {
    active: boolean;
    tag: string;
    trend: 'UP' | 'DOWN' | 'FLAT';
    reason: string;
    btcMove: number;
  };
}

export interface NaturalFilter {
  sector?: string | string[];
  industry?: string;
  min_value?: number;
  max_value?: number; // For "small" or "ignored"
  min_rs?: number;
  max_rs?: number;    // For "weak" or "lagging"
  min_rank?: number;  // For "bottom ranked"
  max_rank?: number;
  ticker?: string;
  description?: string; // Human readable label of what was filtered
}

export type SortOption = 'value' | 'rank' | 'time' | 'rs' | 'force' | 'gravity' | 'defense' | 'momentum' | 'contrarian' | 'stealth';
export type FilterOption = 'all' | 'top5' | 'highConviction';