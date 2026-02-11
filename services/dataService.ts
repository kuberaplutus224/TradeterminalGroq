import { Trade } from '../types';

const RAW_CSV = `Time,Ticker (#T),TP,Sector,Industry,Sh,$$,RS,PCT,R,Last
6:08:50 PM,GE,324.32,Industrials,Industrial Conglomerates,72630,23555362,7.46,98.0,,2026-01-02
6:05:02 PM,ABBV,220.18,Healthcare,Drug Manufacturers,1111061,244633411,23.53,99.67,,2025-12-29
6:05:02 PM,AMZN,233.06,Consumer Disc,Internet and Direct Marketing Retail,870377,202850064,8.84,97.86,,2026-01-02
6:05:02 PM,COP,99.2,Energy,"Oil, Gas and Consumable Fuels",318105,31556016,5.68,96.0,,2026-01-02
6:05:02 PM,GRAB,5.09,Financial Services,Asset Management,8000000,40720000,12.37,99.0,44.0,2025-12-30
6:05:02 PM,NVDA,188.12,Technology,Semis,1392228,261905931,19.87,99.0,,2026-01-02
6:05:02 PM,T,24.71,Comm Services,Diversified Telecom Services,4975047,122933411,29.54,99.6,,2025-12-31
6:05:02 PM,GD,355.56,Industrials,Aerospace and Defense,291696,103715430,13.02,99.57,,2025-12-29
6:05:02 PM,GOOGL,316.54,Comm Services,Interactive Media and Services,573214,181445160,5.95,96.0,,2026-01-02
6:05:02 PM,INTU,633.84,Technology,Software,197234,125014799,11.2,98.0,,2026-01-02
6:05:02 PM,PM,159.86,Consumer Staples,Tobacco,765367,122351569,12.5,99.0,,2026-01-02
6:05:02 PM,QGEN,48.94,Healthcare,Life Sciences Tools and Services,1613834,78975957,31.09,99.98,3.0,2018-01-09
5:35:28 PM,HLN,10.11,Healthcare,Drug Manufacturers - Specialty and Generic,1611640,16293680,7.82,99.0,19.0,2025-12-24
5:35:27 PM,ABBV,220.18,Healthcare,Drug Manufacturers,559000,123080620,11.84,98.0,,2026-01-02
5:35:27 PM,ACHR,8.56,Industrials,Aerospace and Defense,7679713,65738343,27.12,99.88,6.0,2025-09-19
5:35:27 PM,AMD,221.08,Technology,Semis,393200,86928656,19.98,99.0,,2026-01-02
5:35:27 PM,BMY,53.06,Healthcare,Pharma,610800,32409048,6.39,97.0,,2026-01-02
5:35:27 PM,CCJ,100.17,Energy,"Oil, Gas and Consumable Fuels",119200,11940264,5.51,98.0,,2026-01-02
5:35:27 PM,CFLT,30.15,Technology,Software - Infrastructure,2259200,68114880,22.64,99.78,23.0,2025-12-15
5:35:27 PM,CM,92.79,Financial Services,Banks,444900,41282271,6.48,97.0,,2025-12-30
5:35:27 PM,CSX,35.91,Industrials,Road and Rail,3294300,118298313,26.04,99.81,,2025-12-19
5:35:27 PM,EME,653.57,Industrials,Construction and Engineering,50120,32756928,5.36,97.5,,2025-12-31
5:35:27 PM,GLW,88.69,Technology,"Electronic Equipment, Instruments and Components",446500,39600085,12.97,99.0,,2026-01-02
5:35:27 PM,JD,29.65,Consumer Disc,Internet and Direct Marketing Retail,596056,17673060,5.18,96.58,,2026-01-02
5:35:27 PM,MSFT,472.85,Technology,Software,196760,93037966,7.98,98.0,,2026-01-02
5:35:27 PM,PM,159.86,Consumer Staples,Tobacco,562800,89969208,9.19,98.0,,2026-01-02
5:35:27 PM,SMCI,30.07,Technology,"Technology Hardware, Storage and Peripherals",1864535,56066567,12.94,98.56,,2026-01-02
5:35:27 PM,STT,133.01,Financial Services,Capital Markets,157600,20962376,5.04,96.0,,2026-01-02
5:35:27 PM,WBD,28.53,Comm Services,Entertainment,4736300,135126639,30.14,99.78,44.0,2026-01-02
5:35:27 PM,XOM,125.36,Energy,"Oil, Gas and Consumable Fuels",531200,66591232,9.86,97.0,,2026-01-02
5:35:27 PM,YETI,46.24,Consumer Cyclical,,581966,26910108,8.27,99.0,56.0,2025-12-19
5:35:26 PM,BK,121.04,Financial Services,Capital Markets,492200,59575888,15.1,99.0,,2025-12-31
5:35:26 PM,BX,162.35,Financial Services,Asset Management,307900,49987565,8.12,98.0,,2026-01-02
5:35:26 PM,CAH,205.45,Healthcare,Health Care Providers and Services,233400,47952030,12.33,99.0,,2025-12-31
5:35:26 PM,CAT,616.1,Industrials,Machinery,274440,169082484,22.51,99.66,,2026-01-02
5:35:26 PM,CLS,293.24,Technology,"Electronic Equipment, Instruments and Components",194200,56947208,15.36,100.0,24.0,2026-01-02
5:35:26 PM,ERIC,9.54,Technology,Communications Equipment,1770959,16894949,8.3,99.0,,2025-12-16
5:35:26 PM,ETN,322.26,Industrials,Electrical Equipment,157675,50812346,7.69,98.0,,2026-01-02
5:35:26 PM,GOOG,317.32,Comm Services,Interactive Media and Services,605800,192232456,6.82,96.77,,2026-01-02
5:35:26 PM,GS,948.44,Financial Services,Capital Markets,58549,55530214,5.02,95.75,,2026-01-02
5:35:26 PM,HPQ,21.66,Technology,"Technology Hardware, Storage and Peripherals",1310198,28378889,9.26,98.0,,2026-01-02
5:35:26 PM,KDP,27.32,Consumer Staples,Beverages,2157001,58929267,10.63,98.72,,2025-12-30
5:35:26 PM,MDT,97.36,Healthcare,Health Care Equipment and Supplies,685600,66750016,13.85,99.0,,2025-12-31
5:35:26 PM,ONON,49.0,Consumer Cyclical,Apparel Retail,350106,17155194,6.18,97.5,,2025-12-29
5:35:26 PM,OXY,41.23,Energy,"Oil, Gas and Consumable Fuels",628754,25923527,6.44,96.76,,2026-01-02
5:35:26 PM,PCAR,112.92,Industrials,Machinery,384687,43438856,8.96,98.0,,2026-01-02
5:35:26 PM,PEG,79.34,Utilities,Multi-Utilities,494800,39257432,9.1,98.64,,2026-01-02
5:35:26 PM,PLTR,174.04,Technology,Software - Infrastructure,300800,52351232,10.3,99.0,,2026-01-02
5:35:26 PM,PNC,215.8,Financial Services,Banks,198698,42879028,6.74,97.0,,2026-01-02
5:35:26 PM,PSN,66.53,Industrials,Specialty Industrial Machinery,284339,18917074,5.43,98.68,67.0,2025-12-19
5:35:26 PM,PYPL,59.29,Financial Services,Credit Services,970700,57552803,7.17,96.63,,2026-01-02
5:35:26 PM,QS,11.33,Consumer Cyclical,Auto Parts,2637819,29886489,14.88,99.6,38.0,2025-12-19
5:35:26 PM,RIVN,19.59,Consumer Cyclical,Auto Manufacturers,1262105,24724637,8.46,98.73,,2026-01-02
5:35:26 PM,SAP,240.44,Technology,Software,210760,50675134,15.28,99.71,91.0,2025-12-22
5:35:26 PM,STM,27.41,Technology,Semis,1576200,43203642,14.99,99.84,25.0,2025-12-19
5:35:26 PM,SYK,348.79,Healthcare,Health Care Equipment and Supplies,103200,35995128,5.07,95.0,,2026-01-02
5:35:26 PM,TFC,50.48,Financial Services,Banks,1316496,66456718,11.87,99.0,,2025-12-29
5:35:26 PM,UBER,80.74,Technology,Software - Application,445471,35967329,7.52,97.71,,2026-01-02
5:35:26 PM,WMS,151.78,Consumer Cyclical,Autos,186623,28325639,6.02,98.82,56.0,2025-12-19
5:35:26 PM,YUM,150.29,Consumer Disc,"Hotels, Restaurants and Leisure",454381,68288920,14.16,99.53,,2025-12-29
5:32:20 PM,QSR,66.74,Consumer Disc,"Hotels, Restaurants and Leisure",325646,21733614,5.58,97.0,,2026-01-02
5:16:12 PM,QCOM,176.31,Technology,Semis,315000,55537650,9.46,98.0,,2026-01-02
5:16:00 PM,C,123.3,Financial Services,Banks,464000,57211200,19.67,99.0,,2026-01-02
5:16:00 PM,HD,344.09,Consumer Disc,Specialty Retail,157000,54022130,6.59,97.0,,2026-01-02
5:16:00 PM,JNJ,204.31,Healthcare,Pharma,296000,60475760,7.2,97.0,,2026-01-02
5:16:00 PM,MSFT,472.85,Technology,Software,145000,68563250,5.88,98.0,,2026-01-02
5:16:00 PM,PLTR,174.04,Technology,Software - Infrastructure,279000,48557160,9.55,99.0,,2026-01-02
5:12:15 PM,C,123.3,Financial Services,Banks,124676,15372551,5.29,97.0,,2026-01-02
4:48:42 PM,CRWV,76.86,Technology,Software - Infrastructure,1795606,138010277,26.0,99.7,29.0,2026-01-02
4:48:42 PM,GLW,88.69,Technology,"Electronic Equipment, Instruments and Components",208390,18482109,6.05,97.33,,2026-01-02
4:33:21 PM,SNY,47.51,Healthcare,Pharma,641360,30471014,8.11,98.95,,2025-12-19
4:33:20 PM,CPNG,22.89,Consumer Cyclical,Internet Retail,961927,22018509,6.08,97.48,,2026-01-02
4:33:20 PM,MIRM,75.56,Healthcare,Biotech,266435,20131829,7.05,98.78,26.0,2026-01-02
4:33:19 PM,AMD,221.08,Technology,Semis,131533,29079316,6.68,97.89,,2026-01-02
4:33:19 PM,C,123.3,Financial Services,Banks,1453362,179199535,61.63,99.92,,2025-12-30
4:33:19 PM,CFG,61.05,Financial Services,Banks,462401,28229581,6.79,97.63,,2026-01-02
4:33:19 PM,GOOGL,316.54,Comm Services,Interactive Media and Services,587097,185839684,6.09,96.44,,2026-01-02
4:33:18 PM,AMZN,233.06,Consumer Disc,Internet and Direct Marketing Retail,647294,150858340,6.57,97.21,,2026-01-02
4:33:18 PM,FIVE,196.64,Consumer Disc,Specialty Retail,125446,24667701,6.16,98.69,,2025-12-29
4:33:18 PM,ICE,165.62,Financial Services,Brokers and Exchanges,286560,47460067,5.84,96.59,,2026-01-02
4:33:18 PM,NVDA,188.12,Technology,Semis,980372,184427581,13.99,98.95,,2026-01-02
4:33:18 PM,WMT,112.71,Consumer Staples,Food and Staples Retailing,364828,41119764,8.63,98.06,,2026-01-02
4:33:17 PM,MU,312.15,Technology,Semis,122133,38123816,8.76,98.18,,2026-01-02
4:33:16 PM,PLTR,174.04,Technology,Software - Infrastructure,284282,49476439,9.73,98.7,,2026-01-02
4:33:15 PM,NU,17.94,Financial Services,Banks - Diversified,1399597,25108770,6.93,97.59,,2026-01-02
4:26:43 PM,BNTX,96.85,Healthcare,Biotech,478267,46320159,10.62,99.66,17.0,2025-09-19
4:22:32 PM,QCOM,176.31,Technology,Semis,329065,58017450,9.89,98.28,,2026-01-02
4:21:45 PM,CM,92.79,Financial Services,Banks,479929,44532612,6.99,97.16,,2025-12-29
4:19:18 PM,TSLA,451.67,Consumer Disc,Automobiles,501907,226696335,10.16,98.24,,2026-01-02
4:18:28 PM,AMAT,284.32,Technology,Semis,233000,66246560,11.53,98.43,,2026-01-02
4:18:27 PM,WDAY,208.9,Technology,Application Software,258851,54073974,6.02,97.26,,2026-01-02
4:17:35 PM,RBLX,81.04,Comm Services,Entertainment,685106,55520990,12.91,98.91,,2025-12-31
4:16:25 PM,MU,312.15,Technology,Semis,382259,119322147,27.42,99.52,,2026-01-02
4:15:59 PM,LGN,44.53,Industrials,Engineering and Construction,371010,16521075,5.39,97.68,10.0,2026-01-02
4:14:06 PM,VLO,180.57,Energy,"Oil, Gas and Consumable Fuels",143717,25950979,6.37,96.99,,2026-01-02
4:12:46 PM,HESM,33.7,Energy,"Oil, Gas and Consumable Fuels",834294,28115708,10.1,99.31,20.0,2025-12-19
4:12:31 PM,KVYO,29.09,Technology,Software - Infrastructure,2578951,75021685,25.64,100.0,1.0,
4:12:17 PM,MNDY,142.77,Technology,,452299,64574728,8.86,99.65,10.0,2025-09-15
4:12:00 PM,SNY,47.51,Healthcare,Pharma,693720,32958637,8.77,99.12,,2025-12-19
4:11:33 PM,MU,312.15,Technology,Semis,150000,46822500,10.76,98.49,,2026-01-02`;

// Store uploaded files metadata and content
interface UploadedFile {
  date: string;
  name: string;
  content: string; // Dynamic CSV content
  timestamp: number;
}

// --- INDEXED DB HELPER ---
const DB_NAME = 'InstiTradeDB';
const STORE_NAME = 'uploads';
const DB_VERSION = 1;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'date' });
      }
    };
  });
};

const saveToDB = async (file: UploadedFile): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(file);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const loadFromDB = async (): Promise<UploadedFile[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

// In-memory cache
let uploadedFiles: UploadedFile[] = [];

// Initialize function to populate cache on app start
export const initializeDataService = async () => {
  try {
    uploadedFiles = await loadFromDB();
  } catch (e) {
    console.error("Failed to load from IndexedDB", e);
  }
};

export interface UploadResult {
  success: boolean;
  message?: string;
}

export const registerUpload = async (date: string, fileName: string, content?: string): Promise<UploadResult> => {
  const newFile = {
    date,
    name: fileName,
    content: content || "",
    timestamp: Date.now()
  };

  try {
    // Save to DB first
    await saveToDB(newFile);
    
    // Update memory
    const existingIdx = uploadedFiles.findIndex(f => f.date === date);
    if (existingIdx !== -1) {
      uploadedFiles[existingIdx] = newFile;
    } else {
      uploadedFiles.push(newFile);
    }
    
    return { success: true };
  } catch (e: any) {
    console.error("Failed to save uploads to DB", e);
    return { success: false, message: "Storage failed. Check browser quota." };
  }
};

export const getUploadsForDate = (date: string) => {
  return uploadedFiles.filter(f => f.date === date);
};

// Helper: Raw Parsing
const parseCSVContent = (content: string, forceDate?: string): any[] => {
  const lines = content.split('\n');
  const temp: any[] = [];
  
  // Basic CSV parser
  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let start = 0;
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === ',' && !inQuotes) {
        result.push(line.substring(start, i).replace(/^"|"$/g, ''));
        start = i + 1;
      }
    }
    result.push(line.substring(start).replace(/^"|"$/g, ''));
    return result;
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseCSVLine(line);
    
    // Safety check for malformed lines
    if (cols.length < 5) continue; 
    
    const rank = cols[9] ? parseInt(cols[9]) : null;
    const rs = parseFloat(cols[7]);
    const val = parseInt(cols[6]);
    const ticker = cols[1];

    const pseudoHash = "0x" + Math.floor(Math.random() * 16777215).toString(16).padEnd(6, '0') + "..." + Math.floor(Math.random() * 65535).toString(16);
    
    temp.push({
      id: `${ticker}-${i}-${Math.random()}`, // Unique ID
      hash: pseudoHash,
      time: cols[0],
      ticker: ticker,
      tradePrice: parseFloat(cols[2]),
      sector: cols[3],
      industry: cols[4],
      shares: parseInt(cols[5]),
      value: val,
      rs: rs,
      pct: parseFloat(cols[8]),
      rank: rank,
      lastDate: forceDate || cols[10] || '2026-01-05', 
    });
  }
  return temp;
};

// Now async to support lazy loading if needed, though we cache in memory
export const fetchAllTrades = async (): Promise<Trade[]> => {
    // Ensure cache is loaded if empty (fallback)
    if (uploadedFiles.length === 0) {
        await initializeDataService();
    }
    return processTradesFromSources();
};

const processTradesFromSources = (): Trade[] => {
  let tempTrades: any[] = [];

  // Check if we have an upload for the default hardcoded date
  const hasHardcodedDateUpload = uploadedFiles.some(f => f.date === '2026-01-05');

  // 1. Parse Hardcoded Data (Only if no upload exists for this date)
  if (!hasHardcodedDateUpload) {
    const staticTrades = parseCSVContent(RAW_CSV, '2026-01-05');
    tempTrades = [...staticTrades];
  }

  // 2. Parse Dynamic Uploads
  uploadedFiles.forEach(file => {
    if (file.content) {
        // We use the stamped date for these uploads
        const dynamicTrades = parseCSVContent(file.content, file.date);
        tempTrades = [...tempTrades, ...dynamicTrades];
    }
  });

  // Calculate Maximums for Scoring
  let maxRS = 0;
  let maxVal = 0;
  let minVal = Infinity;

  tempTrades.forEach(t => {
      if (t.rs > maxRS) maxRS = t.rs;
      if (t.value > maxVal) maxVal = t.value;
      if (t.value < minVal) minVal = t.value;
  });

  // Calculate Max Log Value
  const maxLogValue = Math.log10(maxVal > 0 ? maxVal : 1);
  const minLogValue = Math.log10(minVal > 0 ? minVal : 1000000); 

  // PASS 2: Calculate Scores & Intelligence Logic
  const processedTrades = tempTrades.map(t => {
    // Legacy Score
    let convictionScore = t.rs * 2;
    if (t.rank !== null) {
      convictionScore += (100 - t.rank) * 2.5; 
    }

    // Whale Force Score
    const logVal = Math.log10(t.value > 0 ? t.value : 1);
    const rsPart = (t.rs / (maxRS || 1)) * 60;
    const valPart = (logVal / (maxLogValue || 1)) * 40;
    const whaleForceScore = rsPart + valPart;

    // Defense Score
    const range = maxLogValue - minLogValue;
    let defenseScore = 1;
    if (range > 0) {
      const normalized = (logVal - minLogValue) / range;
      defenseScore = Math.floor(normalized * 9) + 1;
    }
    defenseScore = Math.max(1, Math.min(10, defenseScore));

    // --- SENTIMENT TRANSLATOR LOGIC ---
    // Updated for RS = Relative Size (Volume metric)
    let sentimentCategory: 'MOMENTUM' | 'CONTRARIAN' | 'STEALTH' = 'MOMENTUM';
    let sentimentVibe = "ALIGNING WITH SECTOR FLOW.";

    const sectorLower = (t.sector || "").toLowerCase();
    const isTech = sectorLower.includes('tech') || sectorLower.includes('semis') || sectorLower.includes('software');
    const isEnergy = sectorLower.includes('energy') || sectorLower.includes('oil');
    
    if (t.rs > 20) {
      // Very large relative size
      sentimentCategory = 'MOMENTUM';
      sentimentVibe = "MAXIMUM IMPACT BLOCK TRADE. HIGH CONVICTION ENTRY.";
    } else if (t.rs < 5 && t.value > 10000000) {
      // Low relative size but high value (means average trade for this ticker is huge)
      sentimentCategory = 'CONTRARIAN';
      sentimentVibe = "HIGH VALUE FLOW EXECUTED ALGORITHMICALLY.";
    } else if (t.rs > 15 && (t.rank === null || t.rank > 50)) {
       // Big size in a low ranked stock
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
      convictionScore,
      whaleForceScore,
      defenseScore,
      sentimentCategory,
      sentimentVibe
    };
  });

  // --- WHALE DNA LOGIC ---
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

      if (totalGroupVal > 100000000) {
        t.behavioralTag = "WHALE";
      } else if (avgRank < 20) {
        t.behavioralTag = "BLITZ";
      } else {
        t.behavioralTag = "ACCUMULATOR";
      }
    }
  });

  // --- INSTITUTIONAL SHADOW TRACKING ---
  const industryGroups: Record<string, Trade[]> = {};
  processedTrades.forEach(t => {
    const ind = t.industry || "Unknown";
    if (!industryGroups[ind]) industryGroups[ind] = [];
    industryGroups[ind].push(t);
  });

  Object.values(industryGroups).forEach(group => {
    // Updated threshold for Relative Size
    const highRSTrades = group.filter(t => t.rs > 10);
    if (highRSTrades.length > 3) {
      highRSTrades.forEach(t => {
        t.shadowCluster = true;
      });
    }
  });

  // --- CAPITAL GRAVITY LOGIC ---
  Object.values(tickerGroups).forEach(group => {
    group.sort((a, b) => a.tradePrice - b.tradePrice);
    for (let i = 0; i < group.length; i++) {
      const current = group[i];
      let clusterVol = current.value;
      let clusterCount = 1;
      
      for (let j = i + 1; j < group.length; j++) {
        const next = group[j];
        const variance = Math.abs((next.tradePrice - current.tradePrice) / current.tradePrice);
        
        if (variance <= 0.01) { 
           clusterVol += next.value;
           clusterCount++;
        }
      }

      if (clusterCount > 1) {
        current.gravity = {
          isAnchor: true,
          totalVolumeAtLevel: clusterVol,
          clusterCount: clusterCount
        };
        delete current.behavioralTag;
      }
    }
  });

  return processedTrades;
};

// --- BITCOIN CONTEXT ENGINE ---
// Simulates an AI-Check on Bitcoin price movement alignment
export const applyBitcoinIntel = (trades: Trade[], date: string): Trade[] => {
   // Simulated BTC Moves for known dates (Mock Oracle)
   const btcMoves: Record<string, number> = {
      '2026-01-02': 1.2, // Stable Up
      '2026-01-05': -0.4, // Flat
      '2026-01-06': -2.5, // Dip
      '2026-01-07': 5.4, // Pump
      '2026-01-08': -0.8 // Flat
   };
   
   // Default to small random move if date unknown to simulate 'live' feed
   const move = btcMoves[date] !== undefined ? btcMoves[date] : (Math.random() * 2 - 1);
   
   return trades.map(t => {
      const sector = (t.sector || "").toLowerCase();
      const isCorrelatedSector = sector.includes('tech') || sector.includes('financial') || sector.includes('comm');
      const isCryptoProxy = ['COIN','MSTR','SQ','HOOD','RIOT','MARA','CLSK','PYPL'].includes(t.ticker);
      
      let ctx = undefined;

      // Logic: If Crypto Proxy OR (Tech/Fin Sector AND BTC Move is significant)
      if (isCryptoProxy || (isCorrelatedSector && Math.abs(move) > 1.5)) {
          
          if (move > 2 && t.rs > 15) { // Adjusted RS threshold for "High Size" context
             ctx = { 
               active: true, 
               tag: 'BTC_SYMPATHY_PLAY', 
               trend: 'UP', 
               reason: `Aligned with BTC +${move}% surge`,
               btcMove: move
             };
          } else if (move < -2 && t.rs < 5) {
             ctx = { 
               active: true, 
               tag: 'CRYPTO_DRAG', 
               trend: 'DOWN', 
               reason: `Weighed down by BTC ${move}% drop`,
               btcMove: move
             };
          } else if (isCryptoProxy) {
             ctx = { 
               active: true, 
               tag: 'BLOCKCHAIN_BETA', 
               trend: move > 0 ? 'UP' : 'DOWN', 
               reason: 'Direct crypto ecosystem exposure',
               btcMove: move
             };
          }
      }
      
      return { ...t, btcContext: ctx } as Trade;
   });
}