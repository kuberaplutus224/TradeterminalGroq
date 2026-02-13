import { Trade } from '../types';
import { supabase } from './supabaseClient';
import * as XLSX from 'xlsx';

// SEC-08: Trimmed demo data — only 10 representative rows for fallback when Supabase is empty
const RAW_CSV = `Time,Ticker (#T),TP,Sector,Industry,Sh,$$,RS,PCT,R,Last
6:08:50 PM,GE,324.32,Industrials,Industrial Conglomerates,72630,23555362,7.46,98.0,,2026-01-02
6:05:02 PM,ABBV,220.18,Healthcare,Drug Manufacturers,1111061,244633411,23.53,99.67,,2025-12-29
6:05:02 PM,AMZN,233.06,Consumer Disc,Internet and Direct Marketing Retail,870377,202850064,8.84,97.86,,2026-01-02
6:05:02 PM,NVDA,188.12,Technology,Semis,1392228,261905931,19.87,99.0,,2026-01-02
6:05:02 PM,T,24.71,Comm Services,Diversified Telecom Services,4975047,122933411,29.54,99.6,,2025-12-31
6:05:02 PM,GOOGL,316.54,Comm Services,Interactive Media and Services,573214,181445160,5.95,96.0,,2026-01-02
6:05:02 PM,PM,159.86,Consumer Staples,Tobacco,765367,122351569,12.5,99.0,,2026-01-02
6:05:02 PM,QGEN,48.94,Healthcare,Life Sciences Tools and Services,1613834,78975957,31.09,99.98,3.0,2018-01-09
5:35:27 PM,MSFT,472.85,Technology,Software,196760,93037966,7.98,98.0,,2026-01-02
4:19:18 PM,TSLA,451.67,Consumer Disc,Automobiles,501907,226696335,10.16,98.24,,2026-01-02`;

// In-memory cache
let allTradesCache: Trade[] = [];

// Initialize function
export const initializeDataService = async () => {
  await syncCacheFromSupabase();
};

const syncCacheFromSupabase = async () => {
  try {
    // SEC-09: Limit query results to prevent unbounded data fetches
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('last_date', { ascending: false })
      .limit(5000);

    if (error) {
      console.error("Supabase Fetch Error:", error);
      return;
    }

    if (data && data.length > 0) {
      allTradesCache = data.map((t: any) => ({
        id: t.id,
        ticker: t.ticker,
        tradePrice: t.trade_price,
        sector: t.sector,
        industry: t.industry,
        shares: t.shares,
        value: t.value * 1,
        rs: t.rs * 1,
        pct: t.pct * 1,
        rank: t.rank,
        lastDate: t.last_date,
        time: t.time,
        hash: "0x" + Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0'),
        convictionScore: 0,
        whaleForceScore: 0,
        defenseScore: 1,
        sentimentCategory: 'MOMENTUM',
        sentimentVibe: ''
      }));
    }
  } catch (e) {
    console.error("Critical Sync Error:", e);
  }
};

export interface UploadResult {
  success: boolean;
  message?: string;
}

const cleanseData = (data: any[]): any[] => {
  if (!data.length) return data;
  const forbiddenPatterns = [/^(cp|current[\s_]*price)$/i];

  return data.map(row => {
    const cleanRow: any = {};
    Object.keys(row).forEach(key => {
      const isForbidden = forbiddenPatterns.some(pattern => pattern.test(key));
      if (!isForbidden) {
        cleanRow[key] = row[key];
      }
    });
    return cleanRow;
  });
};

const findKey = (row: any, patterns: (string | RegExp)[]): string | undefined => {
  const keys = Object.keys(row);
  for (const pattern of patterns) {
    const found = keys.find(k => {
      if (typeof pattern === 'string') {
        return k.toLowerCase().includes(pattern.toLowerCase());
      }
      return pattern.test(k);
    });
    if (found) return found;
  }
  return undefined;
};

const getValue = (row: any, patterns: (string | RegExp)[], defaultValue: any = null) => {
  const key = findKey(row, patterns);
  return key ? row[key] : defaultValue;
};

const processRowsWithHeaderScanning = (rows: any[][]): any[] => {
  if (rows.length === 0) return [];

  // 1. Find the header row (scan first 10 rows)
  let headerIndex = -1;
  const headerPatterns = [/ticker/i, /symbol/i, /#T/i, /value/i, /\$\$/i, /price/i];

  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    if (Array.isArray(row)) {
      const matches = row.filter(cell =>
        headerPatterns.some(pattern => pattern.test(String(cell)))
      ).length;

      if (matches >= 2) { // Found a row with at least 2 technical keywords
        headerIndex = i;
        break;
      }
    }
  }

  // If no header found, assume row 0
  if (headerIndex === -1) {
    headerIndex = 0;
  }

  const headers = rows[headerIndex].map(h => String(h || "").trim());
  const dataRows = rows.slice(headerIndex + 1);

  return dataRows.map(row => {
    const obj: any = {};
    headers.forEach((header, idx) => {
      if (header) obj[header] = row[idx];
    });
    return obj;
  }).filter(obj => Object.keys(obj).length > 0);
};

export const registerUpload = async (date: string, fileName: string, data: string | ArrayBuffer): Promise<UploadResult> => {
  if (!data) return { success: false, message: "No data provided" };

  try {
    let rawJson: any[] = [];

    if (typeof data === 'string') {
      const workbook = XLSX.read(data, { type: 'string' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      rawJson = processRowsWithHeaderScanning(rows);
    } else {
      const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      rawJson = processRowsWithHeaderScanning(rows);
    }

    const cleanJson = cleanseData(rawJson);

    const dbTrades = cleanJson.map((row: any) => {
      // Prioritize the exact headers provided by the user: Ticker (#T), $$, TP, Sh, etc.
      const ticker = getValue(row, ['Ticker (#T)', /ticker/i, /symbol/i, /#T/i], 'UNKNOWN');
      const valRaw = getValue(row, ['$$', /\$\$/i, /value/i, /amount/i], '0');
      const val = typeof valRaw === 'number' ? valRaw : parseInt(String(valRaw).replace(/[$,]/g, '')) || 0;

      const rsRaw = getValue(row, ['RS', /rs/i, /rel/i, /size/i], '0');
      const rs = typeof rsRaw === 'number' ? rsRaw : parseFloat(String(rsRaw)) || 0;

      const priceRaw = getValue(row, ['TP', /tp/i, /price/i, /cost/i], '0');
      const price = typeof priceRaw === 'number' ? priceRaw : parseFloat(String(priceRaw)) || 0;

      const sharesRaw = getValue(row, ['Sh', /sh/i, /shares/i, /vol/i], '0');
      const shares = typeof sharesRaw === 'number' ? sharesRaw : parseInt(String(sharesRaw).replace(/[,]/g, '')) || 0;

      const pctRaw = getValue(row, ['PCT', /pct/i, /%/i, /percentage/i], '0');
      const pct = typeof pctRaw === 'number' ? pctRaw : parseFloat(String(pctRaw)) || 0;

      const rankValue = getValue(row, ['R', / r /i, /^r$/i, /rank/i], null);

      return {
        ticker: String(ticker).toUpperCase(),
        trade_price: price,
        sector: getValue(row, ['Sector', /sector/i], 'Uncategorized'),
        industry: getValue(row, ['Industry', /industry/i], 'General'),
        shares: shares,
        value: val,
        rs: rs,
        pct: pct,
        rank: rankValue !== null ? parseInt(String(rankValue)) : null,
        last_date: date,
        time: getValue(row, ['Time', /time/i, /clock/i], new Date().toLocaleTimeString())
      };
    }).filter(t => t.ticker !== 'UNKNOWN' && t.value > 0);

    // Deduplicate dbTrades
    const uniqueTradesMap = new Map();
    dbTrades.forEach(t => {
      const key = `${t.ticker}-${t.last_date}-${t.time}-${t.value}`;
      if (!uniqueTradesMap.has(key)) {
        uniqueTradesMap.set(key, t);
      }
    });
    const uniqueDbTrades = Array.from(uniqueTradesMap.values());

    if (uniqueDbTrades.length === 0) {
      return { success: false, message: "No valid trades found. Ensure headers like Ticker and Value are present." };
    }

    const { error } = await supabase
      .from('trades')
      .upsert(uniqueDbTrades, { onConflict: 'ticker,last_date,time,value' });

    if (error) throw error;
    await syncCacheFromSupabase();
    return { success: true };
  } catch (e: any) {
    console.error("Ingestion Error:", e);
    return { success: false, message: e.message || "Data ingestion failed." };
  }
};

export const fetchAllTrades = async (): Promise<Trade[]> => {
  if (allTradesCache.length === 0) {
    await syncCacheFromSupabase();
  }
  return processTradesFromSources();
};

const processTradesFromSources = (): Trade[] => {
  let tempTrades: any[] = [];
  if (allTradesCache.length === 0) {
    // Parser for static data string
    const workbook = XLSX.read(RAW_CSV, { type: 'string' });
    tempTrades = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    // Map static data to normalized format
    tempTrades = tempTrades.map(row => ({
      ticker: row['Ticker (#T)'],
      tradePrice: row['TP'],
      sector: row['Sector'],
      industry: row['Industry'],
      shares: row['Sh'],
      value: row['$$'],
      rs: row['RS'],
      pct: row['PCT'],
      rank: row['R'] || null,
      lastDate: '2026-01-05',
      time: row['Time']
    }));
  } else {
    tempTrades = [...allTradesCache];
  }

  let maxRS = 0; let maxVal = 0; let minVal = Infinity;
  tempTrades.forEach(t => {
    if (t.rs > maxRS) maxRS = t.rs;
    if (t.value > maxVal) maxVal = t.value;
    if (t.value < minVal) minVal = t.value;
  });

  const maxLogValue = Math.log10(maxVal > 0 ? maxVal : 1);
  const minLogValue = Math.log10(minVal > 0 ? minVal : 1000000);

  const processedTrades = tempTrades.map(t => {
    let convictionScore = t.rs * 2;
    if (t.rank !== null) convictionScore += (100 - t.rank) * 2.5;

    const logVal = Math.log10(t.value > 0 ? t.value : 1);
    const rsPart = (t.rs / (maxRS || 1)) * 60;
    const valPart = (logVal / (maxLogValue || 1)) * 40;
    const whaleForceScore = rsPart + valPart;

    const range = maxLogValue - minLogValue;
    let defenseScore = 1;
    if (range > 0) {
      const normalized = (logVal - minLogValue) / range;
      defenseScore = Math.floor(normalized * 9) + 1;
    }
    defenseScore = Math.max(1, Math.min(10, defenseScore));

    let sentimentCategory: 'MOMENTUM' | 'CONTRARIAN' | 'STEALTH' = 'MOMENTUM';
    let sentimentVibe = "ALIGNING WITH SECTOR FLOW.";
    const sectorLower = (t.sector || "").toLowerCase();
    const isTech = sectorLower.includes('tech') || sectorLower.includes('semis') || sectorLower.includes('software');
    const isEnergy = sectorLower.includes('energy') || sectorLower.includes('oil');

    if (t.rs > 20) {
      sentimentCategory = 'MOMENTUM';
      sentimentVibe = "MAXIMUM IMPACT BLOCK TRADE. HIGH CONVICTION ENTRY.";
    } else if (t.rs < 5 && t.value > 10000000) {
      sentimentCategory = 'CONTRARIAN';
      sentimentVibe = "HIGH VALUE FLOW EXECUTED ALGORITHMICALLY.";
    } else if (t.rs > 15 && (t.rank === null || t.rank > 50)) {
      sentimentCategory = 'STEALTH';
      sentimentVibe = "LARGE SIZE ACCUMULATION IN LAGGING NAME.";
    } else if (isTech && t.rs > 10) {
      sentimentCategory = 'MOMENTUM';
      sentimentVibe = "AGGRESSIVE SIZE ALLOCATION IN TECH SECTOR.";
    } else if (isEnergy && t.rs > 10) {
      sentimentCategory = 'CONTRARIAN';
      sentimentVibe = "HEAVY BLOCK TRADING IN CYCLICAL ASSET.";
    } else {
      sentimentCategory = 'MOMENTUM';
      sentimentVibe = "STANDARD INSTITUTIONAL BLOCK SIZE.";
    }

    return {
      ...t,
      id: t.id || `${t.ticker}-${t.time}-${t.lastDate}`,
      hash: t.hash || "0x" + Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0'),
      convictionScore,
      whaleForceScore,
      defenseScore,
      sentimentCategory,
      sentimentVibe
    };
  });

  // DNA & Clusters & Gravity
  const tickerGroups: Record<string, Trade[]> = {};
  processedTrades.forEach(t => {
    if (!tickerGroups[t.ticker]) tickerGroups[t.ticker] = [];
    tickerGroups[t.ticker].push(t);
  });

  processedTrades.forEach(t => {
    const group = tickerGroups[t.ticker];
    if (group.length > 2) {
      const totalGroupVal = group.reduce((sum, item) => sum + item.value, 0);
      const avgRank = group.reduce((sum, item) => sum + (item.rank || 100), 0) / group.length;
      if (totalGroupVal > 100000000) t.behavioralTag = "WHALE";
      else if (avgRank < 20) t.behavioralTag = "BLITZ";
      else t.behavioralTag = "ACCUMULATOR";
    }
  });

  const industryGroups: Record<string, Trade[]> = {};
  processedTrades.forEach(t => {
    const ind = t.industry || "Unknown";
    if (!industryGroups[ind]) industryGroups[ind] = [];
    industryGroups[ind].push(t);
  });

  Object.values(industryGroups).forEach(group => {
    const highRSTrades = group.filter(t => t.rs > 10);
    if (highRSTrades.length > 3) highRSTrades.forEach(t => { t.shadowCluster = true; });
  });

  Object.values(tickerGroups).forEach(group => {
    group.sort((a, b) => a.tradePrice - b.tradePrice);
    for (let i = 0; i < group.length; i++) {
      const current = group[i];
      let clusterVol = current.value;
      let clusterCount = 1;
      for (let j = i + 1; j < group.length; j++) {
        const next = group[j];
        const variance = Math.abs((next.tradePrice - current.tradePrice) / current.tradePrice);
        if (variance <= 0.01) { clusterVol += next.value; clusterCount++; }
      }
      if (clusterCount > 1) {
        current.gravity = { isAnchor: true, totalVolumeAtLevel: clusterVol, clusterCount: clusterCount };
        delete current.behavioralTag;
      }
    }
  });

  return processedTrades;
};

export const applyBitcoinIntel = (trades: Trade[], date: string): Trade[] => {
  const btcMoves: Record<string, number> = {
    '2026-01-02': 1.2, '2026-01-05': -0.4, '2026-01-06': -2.5, '2026-01-07': 5.4, '2026-01-08': -0.8
  };
  const move = btcMoves[date] !== undefined ? btcMoves[date] : (Math.random() * 2 - 1);
  return trades.map(t => {
    const sector = (t.sector || "").toLowerCase();
    const isCorrelatedSector = sector.includes('tech') || sector.includes('financial') || sector.includes('comm');
    const isCryptoProxy = ['COIN', 'MSTR', 'SQ', 'HOOD', 'RIOT', 'MARA', 'CLSK', 'PYPL'].includes(t.ticker);
    let ctx = undefined;
    if (isCryptoProxy || (isCorrelatedSector && Math.abs(move) > 1.5)) {
      if (move > 2 && t.rs > 15) { ctx = { active: true, tag: 'BTC_SYMPATHY_PLAY', trend: 'UP', reason: `Aligned with BTC +${move}% surge`, btcMove: move }; }
      else if (move < -2 && t.rs < 5) { ctx = { active: true, tag: 'CRYPTO_DRAG', trend: 'DOWN', reason: `Weighed down by BTC ${move}% drop`, btcMove: move }; }
      else if (isCryptoProxy) { ctx = { active: true, tag: 'BLOCKCHAIN_BETA', trend: move > 0 ? 'UP' : 'DOWN', reason: 'Direct crypto ecosystem exposure', btcMove: move }; }
    }
    return { ...t, btcContext: ctx } as Trade;
  });
};

export const getUploadsForDate = (date: string) => {
  return allTradesCache.filter(t => t.lastDate === date);
};