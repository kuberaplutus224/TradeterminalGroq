import React, { useMemo, useState, useEffect } from 'react';
import { fetchAllTrades, initializeDataService, applyBitcoinIntel } from './services/dataService';
import { generateDailyBrief, generateAnomalyDetection } from './services/aiService';
import TradeCard from './components/TradeCard';
import SectorLeaderboard from './components/SectorLeaderboard';
import IntelligenceSidebar from './components/IntelligenceSidebar';
import CommandBar from './components/CommandBar';
import DashboardToggle from './components/DashboardToggle';
import VaultDashboard from './components/VaultDashboard';
import DateSelector from './components/DateSelector';
import LiquidityMap from './components/LiquidityMap';
import { SortOption, FilterOption, NaturalFilter, Trade } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'ledger' | 'vault' | 'map'>('ledger');
  
  const [sortOption, setSortOption] = useState<SortOption>('force');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [naturalFilter, setNaturalFilter] = useState<NaturalFilter | null>(null);
  const [tickerSearch, setTickerSearch] = useState('');
  
  // Data State
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [dataVersion, setDataVersion] = useState(0);
  
  // Bitcoin Context State
  const [isBtcMode, setIsBtcMode] = useState(false);
  const [isProcessingBtc, setIsProcessingBtc] = useState(false);
  
  // AI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIntelTab, setActiveIntelTab] = useState<'brief' | 'anomaly'>('brief');
  
  // Brief State
  const [dailyBrief, setDailyBrief] = useState<string[] | null>(null);
  const [isBriefLoading, setIsBriefLoading] = useState(false);

  // Anomaly State
  const [anomalyReport, setAnomalyReport] = useState<string[] | null>(null);
  const [isAnomalyLoading, setIsAnomalyLoading] = useState(false);

  // Date State
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Async Load trades on mount or update
  useEffect(() => {
    const load = async () => {
        await initializeDataService();
        const trades = await fetchAllTrades();
        setAllTrades(trades);
    };
    load();
  }, [dataVersion]);

  // Extract Available Dates
  const availableDates = useMemo(() => {
    const dates = new Set(allTrades.map(t => t.lastDate).filter(Boolean));
    return Array.from(dates).sort().reverse(); // Descending (Newest first)
  }, [allTrades]);

  // Set default date on load
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const handleDataUpdate = () => {
    setDataVersion(prev => prev + 1);
  };

  const handleBtcToggle = () => {
     if (isBtcMode) {
        setIsBtcMode(false);
     } else {
        setIsProcessingBtc(true);
        // Simulate fetch delay for "AI Check"
        setTimeout(() => {
           setIsBtcMode(true);
           setIsProcessingBtc(false);
        }, 800);
     }
  };

  const handleGenerateBrief = async () => {
    setIsBriefLoading(true);
    // Use current view trades for brief
    const brief = await generateDailyBrief(processedTrades);
    setDailyBrief(brief);
    setIsBriefLoading(false);
  };

  const handleGenerateAnomaly = async () => {
    setIsAnomalyLoading(true);
    // Use current view trades for anomaly
    const report = await generateAnomalyDetection(processedTrades);
    setAnomalyReport(report);
    setIsAnomalyLoading(false);
  };

  const handleOpenSidebar = (tab: 'brief' | 'anomaly') => {
    setActiveIntelTab(tab);
    setIsSidebarOpen(true);
    
    // Auto-generate if empty
    if (tab === 'brief' && !dailyBrief && !isBriefLoading) {
      handleGenerateBrief();
    } else if (tab === 'anomaly' && !anomalyReport && !isAnomalyLoading) {
      handleGenerateAnomaly();
    }
  };

  // Helper to extract currently selected sectors as an array
  const selectedSectors = useMemo(() => {
    if (!naturalFilter || !naturalFilter.sector) return [];
    return Array.isArray(naturalFilter.sector) ? naturalFilter.sector : [naturalFilter.sector];
  }, [naturalFilter]);

  const handleSectorClick = (sector: string) => {
    let newSectors = [...selectedSectors];
    
    // Toggle logic
    if (newSectors.includes(sector)) {
      newSectors = newSectors.filter(s => s !== sector);
    } else {
      newSectors.push(sector);
    }

    if (newSectors.length === 0) {
      if (naturalFilter) {
          const updatedFilter = { ...naturalFilter };
          delete updatedFilter.sector;
          delete updatedFilter.description;
          
          if (Object.keys(updatedFilter).length === 0) {
            setNaturalFilter(null);
          } else {
            setNaturalFilter(updatedFilter);
          }
      }
    } else {
      setNaturalFilter({
        ...naturalFilter,
        sector: newSectors,
        description: `SECTORS: ${newSectors.length} SELECTED`
      });
    }
    setTickerSearch('');
  };

  // 1. Trades filtered ONLY by Date (Passed to Leaderboard and Map to show full context)
  const dateFilteredTrades = useMemo(() => {
    let trades = selectedDate ? allTrades.filter(t => t.lastDate === selectedDate) : [];
    
    // Apply Bitcoin Intelligence if enabled
    if (isBtcMode) {
       trades = applyBitcoinIntel(trades, selectedDate);
    }
    
    return trades;
  }, [allTrades, selectedDate, isBtcMode]);

  // 2. Trades filtered by Date AND Filters (Displayed in Feed)
  const processedTrades = useMemo(() => {
    let filtered = [...dateFilteredTrades];

    // Standard Filters
    if (filterOption === 'top5') {
      filtered = filtered.filter(t => t.rank && t.rank <= 5);
    } else if (filterOption === 'highConviction') {
      const threshold = 180; 
      filtered = filtered.filter(t => t.convictionScore > threshold);
    }

    if (tickerSearch) {
      filtered = filtered.filter(t => t.ticker.toUpperCase().includes(tickerSearch.toUpperCase()));
    }

    if (naturalFilter) {
      filtered = filtered.filter(t => {
        let match = true;
        
        if (naturalFilter.sector) {
          const filterSectors = Array.isArray(naturalFilter.sector) 
            ? naturalFilter.sector 
            : [naturalFilter.sector];
          match = match && filterSectors.some(s => 
            t.sector.toLowerCase().includes(s.toLowerCase())
          );
        }
        if (naturalFilter.industry) match = match && t.industry.toLowerCase().includes(naturalFilter.industry.toLowerCase());
        if (naturalFilter.min_value) match = match && t.value >= naturalFilter.min_value;
        if (naturalFilter.max_value) match = match && t.value <= naturalFilter.max_value;
        if (naturalFilter.min_rs) match = match && t.rs >= naturalFilter.min_rs;
        if (naturalFilter.max_rs) match = match && t.rs <= naturalFilter.max_rs;
        if (naturalFilter.max_rank) match = match && (t.rank !== null && t.rank <= naturalFilter.max_rank);
        if (naturalFilter.min_rank) match = match && (t.rank !== null && t.rank >= naturalFilter.min_rank);
        if (naturalFilter.ticker) match = match && t.ticker.toUpperCase() === naturalFilter.ticker.toUpperCase();
        return match;
      });
    }

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'value': return b.value - a.value;
        case 'rank':
          if (a.rank === null && b.rank === null) return 0;
          if (a.rank === null) return 1;
          if (b.rank === null) return -1;
          return a.rank - b.rank;
        case 'rs': return b.rs - a.rs;
        case 'force': return b.whaleForceScore - a.whaleForceScore;
        case 'gravity':
          const aAnchor = a.gravity?.isAnchor ? 1 : 0;
          const bAnchor = b.gravity?.isAnchor ? 1 : 0;
          if (aAnchor !== bAnchor) return bAnchor - aAnchor;
          const aVol = a.gravity?.totalVolumeAtLevel || 0;
          const bVol = b.gravity?.totalVolumeAtLevel || 0;
          return bVol - aVol;
        case 'defense': return b.defenseScore - a.defenseScore;
        case 'momentum':
          if (a.sentimentCategory === 'MOMENTUM' && b.sentimentCategory !== 'MOMENTUM') return -1;
          if (a.sentimentCategory !== 'MOMENTUM' && b.sentimentCategory === 'MOMENTUM') return 1;
          return b.whaleForceScore - a.whaleForceScore;
        case 'contrarian':
          if (a.sentimentCategory === 'CONTRARIAN' && b.sentimentCategory !== 'CONTRARIAN') return -1;
          if (a.sentimentCategory !== 'CONTRARIAN' && b.sentimentCategory === 'CONTRARIAN') return 1;
          return b.whaleForceScore - a.whaleForceScore;
        case 'stealth':
          if (a.sentimentCategory === 'STEALTH' && b.sentimentCategory !== 'STEALTH') return -1;
          if (a.sentimentCategory !== 'STEALTH' && b.sentimentCategory === 'STEALTH') return 1;
          return b.whaleForceScore - a.whaleForceScore;
        case 'time': default: return 0; 
      }
    });
  }, [dateFilteredTrades, sortOption, filterOption, naturalFilter, tickerSearch]);

  const totalValue = processedTrades.reduce((acc, t) => acc + t.value, 0);

  const getSortLabel = (opt: SortOption) => {
    switch (opt) {
      case 'force': return 'Power';
      case 'gravity': return 'Gravity';
      case 'rs': return 'Rel Str';
      case 'contrarian': return 'Contra';
      case 'stealth': return 'Stealth';
      case 'momentum': return 'Momentum';
      case 'defense': return 'Defense';
      default: return opt;
    }
  };

  return (
    <div className="min-h-screen bg-alpha-black bg-grid-subtle text-white font-sans selection:bg-alpha-money selection:text-black">
      
      {/* Intelligence Sidebar */}
      <IntelligenceSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeIntelTab}
        setActiveTab={setActiveIntelTab}
        dailyBrief={dailyBrief}
        briefLoading={isBriefLoading}
        onGenerateBrief={handleGenerateBrief}
        anomalyReport={anomalyReport}
        anomalyLoading={isAnomalyLoading}
        onGenerateAnomaly={handleGenerateAnomaly}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b-2 border-alpha-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-white uppercase hidden md:block">
              Trade<span className="text-alpha-dim">Terminal</span>
            </h1>
          </div>

          {/* Center: View Toggle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
             <DashboardToggle view={view} onChange={setView} />
          </div>
          
          <div className="flex items-center gap-6">
             {/* BTC Toggle */}
             {view === 'ledger' && (
                <button 
                  onClick={handleBtcToggle}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all ${
                     isBtcMode 
                       ? 'bg-alpha-bitcoin/20 border-alpha-bitcoin text-alpha-bitcoin shadow-[0_0_10px_rgba(247,147,26,0.2)]' 
                       : 'border-alpha-dim bg-alpha-surface hover:bg-alpha-border text-alpha-dim hover:text-white'
                  }`}
                  title="Toggle Block-Chain Context"
                >
                   {isProcessingBtc ? (
                      <div className="w-3 h-3 border-2 border-alpha-bitcoin border-t-transparent rounded-full animate-spin"></div>
                   ) : (
                      <span className="font-black text-xs">₿</span>
                   )}
                   <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">BTC Context</span>
                </button>
             )}

             {/* AI Toggle Buttons - Only show in Ledger View */}
             {view === 'ledger' && (
               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenSidebar('brief')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all group ${
                      isSidebarOpen && activeIntelTab === 'brief'
                        ? 'bg-alpha-money/20 border-alpha-money'
                        : 'border-alpha-money/30 bg-alpha-money/10 hover:bg-alpha-money/20'
                    }`}
                  >
                    <div className="w-2 h-2 bg-alpha-money rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-alpha-money group-hover:text-white hidden sm:inline">Daily Brief</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-alpha-money group-hover:text-white sm:hidden">AI</span>
                  </button>

                  <button 
                    onClick={() => handleOpenSidebar('anomaly')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all group ${
                      isSidebarOpen && activeIntelTab === 'anomaly'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                        : 'border-alpha-dim bg-alpha-surface hover:bg-alpha-border text-alpha-dim hover:text-white'
                    }`}
                  >
                    <span className="text-[10px]">📡</span>
                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white hidden sm:inline">Anomaly</span>
                  </button>
               </div>
             )}

             {view === 'ledger' && (
               <div className="hidden lg:block text-right border-l border-alpha-border pl-6">
                  <span className="block text-[10px] text-alpha-dim uppercase font-bold tracking-wider">Total Volume</span>
                  <span className="font-mono text-sm font-bold text-alpha-money">${(totalValue / 1000000000).toFixed(2)}B</span>
               </div>
             )}
          </div>
        </div>
      </header>
      
      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {view === 'ledger' ? (
          <>
            {/* Control Deck: Equal Width Split */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 max-w-6xl mx-auto w-full">
               <div className="relative z-50">
                  <DateSelector 
                      selectedDate={selectedDate}
                      availableDates={availableDates}
                      onDateSelect={setSelectedDate}
                   />
               </div>
               
               <div className="relative z-30">
                   <CommandBar 
                      onFilterChange={setNaturalFilter} 
                      activeFilter={naturalFilter}
                   />
               </div>
            </section>

            {/* Top Section: Sector Leaderboard */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-display font-bold text-alpha-dim uppercase tracking-widest">Sector Velocity // Inflow</h3>
              </div>
              <SectorLeaderboard 
                trades={dateFilteredTrades} // Use trades filtered ONLY by date, ignoring current sector filter
                onSectorClick={handleSectorClick}
                selectedSectors={selectedSectors}
              />
            </section>

            {/* Controls */}
            <section className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b-2 border-alpha-border pb-6">
               {/* Left: Sort Options */}
               <div className="flex flex-col gap-2 w-full md:w-auto flex-grow">
                  <span className="text-xs font-display font-bold text-alpha-dim uppercase">Sort Feed</span>
                  <div className="flex flex-wrap gap-2">
                    {(['force', 'gravity', 'defense', 'momentum', 'contrarian', 'stealth', 'rs', 'rank', 'value'] as SortOption[]).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSortOption(opt)}
                          className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase border-2 transition-all ${
                            sortOption === opt 
                              ? 'bg-white text-black border-white' 
                              : 'bg-black text-alpha-dim border-alpha-border hover:border-white hover:text-white'
                          }`}
                        >
                          {getSortLabel(opt)}
                        </button>
                      ))}
                  </div>
               </div>

               {/* Center: Manual Ticker Search */}
               <div className="flex flex-col gap-2 w-full md:w-auto">
                  <span className="text-xs font-display font-bold text-alpha-dim uppercase">Find Ticker</span>
                  <div className="relative group">
                     <input 
                       type="text" 
                       value={tickerSearch}
                       onChange={(e) => setTickerSearch(e.target.value.toUpperCase())}
                       placeholder="SYMBOL..."
                       className="w-full md:w-40 bg-black border-2 border-alpha-border text-white px-3 py-1.5 rounded-sm text-[10px] font-bold font-mono uppercase focus:border-white focus:outline-none transition-colors placeholder:text-alpha-dim/50"
                     />
                     {tickerSearch && (
                       <button 
                         onClick={() => setTickerSearch('')}
                         className="absolute right-2 top-1/2 -translate-y-1/2 text-alpha-dim hover:text-white"
                         title="Clear Ticker"
                       >
                         ×
                       </button>
                     )}
                  </div>
               </div>
               
               {/* Right: Quick Filters */}
               <div className="flex flex-col gap-2 w-full md:w-auto items-start md:items-end">
                  <span className="text-xs font-display font-bold text-alpha-dim uppercase">Quick Filter</span>
                  <div className="flex gap-2">
                    <button 
                        onClick={() => setFilterOption('all')}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border-2 transition-all ${
                          filterOption === 'all' 
                          ? 'border-white text-white' 
                          : 'border-transparent text-alpha-dim hover:text-white'
                        }`}
                      >
                        All
                      </button>
                      <button 
                        onClick={() => setFilterOption('top5')}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border-2 transition-all ${
                          filterOption === 'top5' 
                          ? 'border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                          : 'border-transparent text-alpha-dim hover:text-white'
                        }`}
                      >
                        Top 5 Rank
                      </button>
                   </div>
               </div>
            </section>

            {/* Main Grid */}
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {processedTrades.map((trade) => (
                <div key={trade.id} className="h-full">
                  <TradeCard trade={trade} />
                </div>
              ))}
              
              {processedTrades.length === 0 && (
                 <div className="col-span-full min-h-[50vh] flex flex-col items-center justify-center border border-dashed border-alpha-border rounded-lg bg-black p-12 text-center animate-fade-in-up">
                    <h2 className="text-xl font-mono font-bold text-alpha-dim mb-4 tracking-widest uppercase">
                       // NO_DATA_FOUND
                    </h2>
                    <p className="text-white font-sans text-lg max-w-md leading-relaxed">
                       No institutional records indexed for <span className="text-alpha-money font-mono">{selectedDate}</span>. 
                       Use the <span className="font-bold border-b border-white pb-0.5">VAULT</span> to upload the daily CSV or select a previous date.
                    </p>
                    
                    {(naturalFilter || tickerSearch || filterOption !== 'all') && (
                       <div className="mt-8">
                          <button 
                            onClick={() => {
                              setNaturalFilter(null);
                              setTickerSearch('');
                              setFilterOption('all');
                            }}
                            className="text-xs font-mono text-alpha-dim hover:text-white border border-alpha-border hover:border-white px-4 py-2 rounded-sm transition-all uppercase tracking-wider"
                          >
                             Clear Current Filters
                          </button>
                       </div>
                    )}
                 </div>
              )}
            </main>
          </>
        ) : view === 'map' ? (
           <div className="animate-fade-in-up space-y-8">
              <section className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto w-full">
                <div className="relative z-50 w-full md:w-1/2">
                   <DateSelector 
                       selectedDate={selectedDate}
                       availableDates={availableDates}
                       onDateSelect={setSelectedDate}
                    />
                </div>
                <div className="w-full md:w-1/2 text-right">
                   <p className="text-xs text-alpha-dim font-mono uppercase tracking-wider">
                      Visualize capital distribution across the market structure.
                   </p>
                </div>
              </section>
              <LiquidityMap trades={dateFilteredTrades} />
           </div>
        ) : (
          <VaultDashboard onDataUpdate={handleDataUpdate} />
        )}
      </div>

    </div>
  );
};

export default App;