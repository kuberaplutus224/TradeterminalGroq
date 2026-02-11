import React from 'react';

interface IntelligenceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'brief' | 'anomaly';
  setActiveTab: (tab: 'brief' | 'anomaly') => void;
  
  // Daily Brief Data
  dailyBrief: string[] | null;
  briefLoading: boolean;
  onGenerateBrief: () => void;

  // Anomaly Data
  anomalyReport: string[] | null;
  anomalyLoading: boolean;
  onGenerateAnomaly: () => void;
}

const IntelligenceSidebar: React.FC<IntelligenceSidebarProps> = ({ 
  isOpen, 
  onClose,
  activeTab,
  setActiveTab,
  dailyBrief, 
  briefLoading,
  onGenerateBrief,
  anomalyReport,
  anomalyLoading,
  onGenerateAnomaly
}) => {
  
  const isLoading = activeTab === 'brief' ? briefLoading : anomalyLoading;
  const data = activeTab === 'brief' ? dailyBrief : anomalyReport;
  const onGenerate = activeTab === 'brief' ? onGenerateBrief : onGenerateAnomaly;
  const title = activeTab === 'brief' ? "Daily Brief" : "Anomaly Scan";
  const buttonText = activeTab === 'brief' ? "Initialize Intelligence" : "Run Correlation Matrix";

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-full sm:w-[450px] bg-black border-l-2 border-alpha-border z-50 transform transition-transform duration-300 ease-out shadow-2xl flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
          
          {/* Header */}
          <div className="p-6 border-b border-alpha-border flex items-center justify-between bg-black/50 backdrop-blur">
            <h2 className="text-xl font-display font-black uppercase tracking-tight text-white flex items-center gap-2">
              {title} <span className="text-alpha-money text-[9px] border border-alpha-money px-1 rounded-sm align-top">AI-QUANT</span>
            </h2>
            <button 
              onClick={onClose}
              className="text-alpha-dim hover:text-white font-mono text-xl"
            >
              ×
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="px-6 py-4 flex gap-2 border-b border-alpha-border bg-alpha-surface/30">
             <button 
               onClick={() => setActiveTab('brief')}
               className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                 activeTab === 'brief' 
                   ? 'bg-white text-black border-white' 
                   : 'bg-black text-alpha-dim border-alpha-border hover:border-white hover:text-white'
               }`}
             >
               Daily Brief
             </button>
             <button 
               onClick={() => setActiveTab('anomaly')}
               className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                 activeTab === 'anomaly' 
                   ? 'bg-white text-black border-white' 
                   : 'bg-black text-alpha-dim border-alpha-border hover:border-white hover:text-white'
               }`}
             >
               Anomaly Scan
             </button>
          </div>

          {/* Content Area */}
          <div className="flex-grow p-6 overflow-y-auto bg-grid-subtle">
            {!data && !isLoading && (
              <div className="text-center py-20 flex flex-col items-center">
                 <div className="w-16 h-16 border-2 border-dashed border-alpha-dim rounded-full flex items-center justify-center mb-4 opacity-50">
                    <span className="text-2xl">{activeTab === 'brief' ? '📝' : '📡'}</span>
                 </div>
                 <p className="text-alpha-dim text-sm mb-6 font-mono max-w-[200px]">
                   {activeTab === 'brief' 
                     ? "Generate AI analysis of current market structure." 
                     : "Detect statistical anomalies, cluster formations, and price floor deviations."}
                 </p>
                 <button 
                    onClick={onGenerate}
                    className="bg-alpha-money/10 text-alpha-money border border-alpha-money font-bold uppercase text-xs px-6 py-3 tracking-widest hover:bg-alpha-money hover:text-black transition-all shadow-[0_0_15px_rgba(0,255,65,0.1)]"
                 >
                    {buttonText}
                 </button>
              </div>
            )}

            {isLoading && (
              <div className="space-y-6 animate-pulse mt-10">
                <div className="h-4 bg-alpha-border/50 rounded w-3/4"></div>
                <div className="h-4 bg-alpha-border/50 rounded w-1/2"></div>
                <div className="h-4 bg-alpha-border/50 rounded w-5/6"></div>
                <div className="pt-4 flex flex-col items-center gap-2">
                   <div className="w-8 h-8 border-2 border-t-alpha-money border-r-transparent border-b-alpha-money border-l-transparent rounded-full animate-spin"></div>
                   <span className="text-[10px] font-mono text-alpha-money blink">
                     {activeTab === 'brief' ? "ANALYZING TAPE..." : "CALCULATING CORRELATIONS..."}
                   </span>
                </div>
              </div>
            )}

            {data && (
              <div className="space-y-6">
                {data.map((point, idx) => {
                  // Custom parsing for Anomaly Report Tags
                  const isAnomaly = activeTab === 'anomaly';
                  let content = point;
                  let tag = "";
                  
                  if (isAnomaly) {
                     const match = point.match(/^(\[.*?\]):\s*(.*)/);
                     if (match) {
                       tag = match[1];
                       content = match[2];
                     }
                  }

                  return (
                    <div key={idx} className="relative pl-6 border-l-2 border-alpha-dim hover:border-alpha-money transition-colors group">
                      <span className="absolute -left-[5px] top-0 w-2 h-2 bg-black border border-alpha-dim group-hover:border-alpha-money transform rotate-45 transition-colors"></span>
                      
                      {tag && (
                         <span className="block text-[10px] font-black text-alpha-money uppercase tracking-widest mb-1">
                           {tag}
                         </span>
                      )}
                      
                      <p className={`text-sm font-sans text-white leading-relaxed ${tag ? 'opacity-90' : ''}`}>
                        {content}
                      </p>
                    </div>
                  )
                })}
                
                <div className="pt-8 border-t border-alpha-border mt-8">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-mono text-alpha-dim uppercase">Status</span>
                       <span className="text-[10px] text-white font-bold tracking-wider">LIVE</span>
                    </div>
                    <div className="flex flex-col text-right">
                       <span className="text-[9px] font-mono text-alpha-dim uppercase">Confidence</span>
                       <span className="text-[10px] text-alpha-money font-bold tracking-wider">HIGH</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-alpha-border bg-black">
             <button 
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full text-center text-[10px] font-mono text-alpha-dim uppercase hover:text-white transition-colors"
             >
                {data ? (activeTab === 'brief' ? "Refresh Brief" : "Re-Scan Anomalies") : ""}
             </button>
          </div>
      </div>
    </>
  );
};

export default IntelligenceSidebar;