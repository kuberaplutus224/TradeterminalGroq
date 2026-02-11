import React, { useState, useMemo } from 'react';
import { registerUpload, getUploadsForDate } from '../services/dataService';

interface VaultDashboardProps {
  onDataUpdate?: () => void;
}

const VaultDashboard: React.FC<VaultDashboardProps> = ({ onDataUpdate }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastUpload, setLastUpload] = useState<{ name: string, date: string } | null>(null);
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

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = e.target?.result;
      if (data) {
        // Pass either string (CSV) or ArrayBuffer (Excel)
        const result = await registerUpload(selectedDate, file.name, data as string | ArrayBuffer);

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

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
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
              <div className="flex flex-col items-center gap-6 p-8">
                <div className="w-16 h-16 border-2 border-alpha-border flex items-center justify-center text-alpha-dim">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-white uppercase tracking-widest">
                    Awaiting Target Date Selection
                  </p>
                  <p className="text-[10px] font-mono text-alpha-dim uppercase max-w-[240px]">
                    Pick a date on the calendar grid above to unlock the Data Stamping Protocol.
                  </p>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-t-alpha-money border-r-transparent border-b-alpha-money border-l-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-mono uppercase text-alpha-money animate-pulse">Analyzing Ingested Packets...</span>
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
                  <p className="text-[10px] font-mono text-alpha-dim mt-2 max-w-sm mx-auto">
                    Ensure the file has valid headers and your database is online.
                  </p>
                </div>
                <div className="flex gap-4 mt-6">
                  <label className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-alpha-dim transition-colors">
                    RETRY UPLOAD
                    <input type="file" className="hidden" onChange={handleFileSelect} accept=".csv,.xlsx,.xls" />
                  </label>
                </div>
              </>
            ) : lastUpload && lastUpload.date === selectedDate && !isDragging ? (
              <>
                <div className="w-16 h-16 bg-alpha-money text-black flex items-center justify-center rounded-sm animate-bounce-short shadow-[0_0_20px_rgba(0,255,65,0.4)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-lg font-display font-bold text-white uppercase tracking-tight">
                    Flow Recorded
                  </p>
                  <p className="text-xs font-mono text-alpha-dim mt-1">
                    STAMPED: <span className="text-alpha-money font-black">{selectedDate}</span>
                  </p>
                  <p className="text-[10px] font-mono text-alpha-dim mt-2 opacity-50">
                    SOURCE: {lastUpload.name}
                  </p>
                </div>
                <label className="mt-8 px-8 py-3 bg-transparent border border-white text-white text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white hover:text-black transition-all">
                  STAMP NEW SHEET
                  <input type="file" className="hidden" onChange={handleFileSelect} accept=".csv,.xlsx,.xls" />
                </label>
              </>
            ) : (
              <div className="flex flex-col items-center gap-8 p-12 w-full h-full relative">
                <div className={`w-20 h-20 border-2 flex items-center justify-center transition-all ${isDragging ? 'border-alpha-money bg-alpha-money text-black animate-pulse' : 'border-dashed border-white/20 text-white/20'}`}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>

                <div className="text-center space-y-4">
                  <div className="space-y-1">
                    <p className={`text-base font-black uppercase tracking-tighter ${isDragging ? 'text-alpha-money' : 'text-white'}`}>
                      {isDragging ? 'Release to Ingest' : 'Ingestion Engine Ready'}
                    </p>
                    <p className="text-[10px] font-mono text-alpha-dim uppercase">
                      Target: <span className="text-white">{selectedDate}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <label className="px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-alpha-money transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)] active:scale-95">
                      Open Document
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".csv,.xlsx,.xls"
                      />
                    </label>
                    <p className="text-[9px] font-mono text-alpha-dim/40 uppercase">
                      Supports .CSV / .XLSX / .XLS | Auto-Cleaning Active
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileSelect}
                  accept=".csv,.xlsx,.xls"
                  disabled={!selectedDate || isProcessing}
                  title=""
                />
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default VaultDashboard;