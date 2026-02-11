import React, { useState, useMemo } from 'react';
import { registerUpload, getUploadsForDate } from '../services/dataService';

interface VaultDashboardProps {
  onDataUpdate?: () => void;
}

const VaultDashboard: React.FC<VaultDashboardProps> = ({ onDataUpdate }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastUpload, setLastUpload] = useState<{name: string, date: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Minimum date: Jan 02 2000
  const MIN_DATE = new Date(2000, 0, 2);
  // Maximum date: Today (End of day)
  const MAX_DATE = new Date();
  MAX_DATE.setHours(23, 59, 59, 999);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (selectedDate) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!selectedDate) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && selectedDate) {
      handleFileUpload(e.target.files[0]);
      // Reset input value to ensure onChange fires if the same file is selected again
      e.target.value = '';
    }
  };

  const handleFileUpload = (file: File) => {
    if (!selectedDate) return;
    setIsProcessing(true);
    setUploadError(null);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result as string;
        if (text) {
           // Async call to register upload
           const result = await registerUpload(selectedDate, file.name, text);
           
           if (result.success) {
              setLastUpload({ name: file.name, date: selectedDate });
              if (onDataUpdate) onDataUpdate();
           } else {
              setUploadError(result.message || "Upload Failed");
           }
        }
        setIsProcessing(false);
    };
    reader.onerror = () => {
        console.error("Failed to read file");
        setUploadError("Failed to read file contents");
        setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };

  // Calendar Navigation Logic
  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    if (newDate.getFullYear() < 2000) return; 
    setViewDate(newDate);
  };

  const changeYear = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear() + offset, viewDate.getMonth(), 1);
    if (newDate.getFullYear() < 2000) return;
    setViewDate(newDate);
  };

  const calendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const firstDayObj = new Date(year, month, 1);
    const firstDayJS = firstDayObj.getDay(); 
    
    const startOffset = (firstDayJS + 6) % 7;

    const grid = [];
    
    for (let i = 0; i < startOffset; i++) {
        grid.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        const currentDateObj = new Date(year, month, i);
        
        const isDisabled = currentDateObj.getTime() < MIN_DATE.getTime() || currentDateObj.getTime() > MAX_DATE.getTime();

        grid.push({
            day: i,
            date: dateStr,
            isDisabled
        });
    }

    return grid;
  }, [viewDate]);

  const monthLabel = viewDate.toLocaleString('default', { month: 'long' });
  const yearLabel = viewDate.getFullYear();

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
      
      {/* 1. Calendar Grid */}
      <section>
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
             {/* Navigation Controls */}
             <div className="flex items-center bg-black border border-alpha-border rounded-sm">
                <button onClick={() => changeYear(-1)} className="px-2 py-1 text-alpha-dim hover:text-white border-r border-alpha-border text-[10px]" title="Prev Year">«</button>
                <button onClick={() => changeMonth(-1)} className="px-2 py-1 text-alpha-dim hover:text-white border-r border-alpha-border text-[10px]" title="Prev Month">‹</button>
                <button onClick={() => setViewDate(new Date())} className="px-3 py-1 text-alpha-dim hover:text-white border-r border-alpha-border text-[10px] font-mono uppercase">Today</button>
                <button onClick={() => changeMonth(1)} className="px-2 py-1 text-alpha-dim hover:text-white border-r border-alpha-border text-[10px]" title="Next Month">›</button>
                <button onClick={() => changeYear(1)} className="px-2 py-1 text-alpha-dim hover:text-white text-[10px]" title="Next Year">»</button>
             </div>
             
             <h2 className="text-xl font-display font-black text-white uppercase tracking-tighter">
               {monthLabel} <span className="text-alpha-dim">{yearLabel}</span>
             </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-alpha-money rounded-full animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold text-alpha-money uppercase tracking-widest">
              Sync Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
           {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
             <div key={day} className="text-center py-2 text-[10px] font-mono text-alpha-dim font-bold tracking-widest">
               {day}
             </div>
           ))}
           
           {calendarGrid.map((cell, idx) => {
             if (!cell) {
                return <div key={`empty-${idx}`} className="aspect-square bg-transparent"></div>;
             }
             
             const { day, date, isDisabled } = cell;
             const isSelected = selectedDate === date;
             const uploads = getUploadsForDate(date);
             const hasData = uploads.length > 0;
             
             return (
               <button
                 key={date}
                 onClick={() => !isDisabled && setSelectedDate(date)}
                 disabled={isDisabled}
                 className={`
                   aspect-square relative flex flex-col items-start justify-between p-2 transition-all duration-200 group rounded-none
                   ${isDisabled 
                     ? 'bg-alpha-surface/20 text-alpha-dim/20 border-2 border-transparent cursor-not-allowed' 
                     : isSelected 
                       ? 'bg-white text-black border-2 border-white transform scale-105 z-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                       : 'bg-black text-alpha-dim border-2 border-alpha-border hover:border-white hover:text-white'
                   }
                 `}
               >
                 <span className="text-sm font-display font-bold">{day}</span>
                 {hasData && !isDisabled && (
                   <div className={`w-full flex justify-end`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-alpha-money'}`}></span>
                   </div>
                 )}
               </button>
             );
           })}
        </div>
      </section>

      {/* 2. Upload Zone */}
      <section>
         <div className="border-t border-dashed border-alpha-border pt-8">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-widest mb-4">
               Data Stamping Protocol
            </h3>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative h-64 border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 rounded-none
                ${!selectedDate 
                  ? 'border-alpha-border bg-alpha-surface/30 cursor-not-allowed opacity-50' 
                  : isDragging 
                    ? 'border-white bg-white text-black scale-[1.01]' 
                    : uploadError
                      ? 'border-amber-500/50 bg-black'
                      : 'border-white/50 bg-black hover:bg-alpha-surface hover:border-white'
                }
              `}
            >
              {!selectedDate ? (
                <>
                  <div className="w-12 h-12 border-2 border-alpha-dim flex items-center justify-center rounded-none text-alpha-dim">
                     <span className="text-2xl font-bold">!</span>
                  </div>
                  <p className="text-xs font-mono text-alpha-dim uppercase tracking-widest">
                    Select a valid date on grid to initiate upload
                  </p>
                </>
              ) : isProcessing ? (
                 <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-mono uppercase text-white animate-pulse">Ingesting CSV Data...</span>
                 </div>
              ) : uploadError ? (
                <>
                   <div className="w-16 h-16 border-2 border-amber-500 text-amber-500 flex items-center justify-center rounded-full">
                     <span className="text-2xl font-bold">!</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-display font-bold text-amber-500 uppercase tracking-tight">
                      {uploadError}
                    </p>
                    <p className="text-xs font-mono text-alpha-dim mt-1 max-w-sm mx-auto">
                      Browser storage limits may have been reached. Data is available for this session but may not persist after reload.
                    </p>
                  </div>
                  <label className="mt-4 cursor-pointer text-[10px] font-bold uppercase text-white hover:text-amber-500 border-b border-white hover:border-amber-500 transition-colors">
                    Retry Upload
                    <input type="file" className="hidden" onChange={handleFileSelect} accept=".csv" />
                  </label>
                </>
              ) : lastUpload && lastUpload.date === selectedDate && !isDragging ? (
                <>
                  <div className="w-16 h-16 bg-alpha-money text-black flex items-center justify-center rounded-full animate-bounce-short shadow-[0_0_20px_rgba(0,255,65,0.4)]">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                     </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-display font-bold text-white uppercase tracking-tight">
                      Data Stamped Successfully
                    </p>
                    <p className="text-xs font-mono text-alpha-dim mt-1">
                      MAPPED TO: <span className="text-alpha-money">{selectedDate}</span>
                    </p>
                    <p className="text-[10px] font-mono text-alpha-dim mt-2 opacity-50">
                      FILE: {lastUpload.name}
                    </p>
                  </div>
                  <label className="mt-4 cursor-pointer text-[10px] font-bold uppercase text-white hover:text-alpha-money border-b border-white hover:border-alpha-money transition-colors">
                    Upload Another
                    <input type="file" className="hidden" onChange={handleFileSelect} accept=".csv" />
                  </label>
                </>
              ) : (
                <>
                  <div className={`w-16 h-16 border-2 flex items-center justify-center rounded-none transition-colors ${isDragging ? 'border-black text-black' : 'border-white text-white'}`}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                     </svg>
                  </div>
                  <div className="text-center">
                     <p className={`text-sm font-bold uppercase tracking-widest mb-1 ${isDragging ? 'text-black' : 'text-white'}`}>
                       {isDragging ? 'Drop File to Map' : 'Drop CSV or Click to Upload'}
                     </p>
                     <p className={`text-[10px] font-mono uppercase ${isDragging ? 'text-black/60' : 'text-alpha-dim'}`}>
                       Target Date: {selectedDate}
                     </p>
                  </div>
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleFileSelect}
                    accept=".csv"
                    disabled={!selectedDate}
                  />
                </>
              )}
            </div>
         </div>
      </section>

    </div>
  );
};

export default VaultDashboard;