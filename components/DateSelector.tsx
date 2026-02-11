import React, { useState, useMemo, useRef, useEffect } from 'react';

interface DateSelectorProps {
  selectedDate: string;
  availableDates: string[];
  onDateSelect: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, availableDates, onDateSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Parse selected date or default to today for the view
  const initialDate = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date();
  const [viewDate, setViewDate] = useState(initialDate);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync view date when selected date changes externally
  useEffect(() => {
      if(selectedDate) {
          setViewDate(new Date(selectedDate + 'T12:00:00'));
      }
  }, [selectedDate]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const calendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayObj = new Date(year, month, 1);
    const firstDayJS = firstDayObj.getDay(); 
    const startOffset = (firstDayJS + 6) % 7; // Mon start

    const grid = [];
    for (let i = 0; i < startOffset; i++) grid.push(null);
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        const hasData = availableDates.includes(dateStr);
        grid.push({ day: i, dateStr, hasData });
    }
    return grid;
  }, [viewDate, availableDates]);

  return (
      <div className="relative z-50 w-full" ref={containerRef}>
          {/* Trigger Block - Input Style Match */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`
                relative w-full group
                bg-black border rounded-sm
                py-4 px-4
                text-left flex items-center justify-between
                transition-all duration-200
                ${isOpen 
                    ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                    : 'border-alpha-border hover:border-alpha-dim'
                }
            `}
          >
              <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <div className={`
                    flex items-center justify-center w-5 h-5 
                    transition-colors duration-300
                    ${isOpen ? 'text-alpha-money' : 'text-alpha-dim group-hover:text-white'}
                  `}>
                     <span className="text-lg leading-none">{isOpen ? '●' : '○'}</span>
                  </div>

                  {/* Label & Value */}
                  <div className="flex items-baseline gap-3">
                      <span className="text-[10px] font-bold text-alpha-dim uppercase tracking-widest hidden sm:inline-block">
                        Target Date //
                      </span>
                      <span className={`text-sm font-mono font-bold tracking-tight transition-colors ${isOpen ? 'text-white' : 'text-white'}`}>
                        {selectedDate || "NO DATA INDEXED"}
                      </span>
                  </div>
              </div>
              
              {/* Chevron */}
              <div className={`
                text-alpha-dim transition-transform duration-300 
                ${isOpen ? 'rotate-180 text-white' : 'group-hover:text-white'}
              `}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
          </button>

          {/* Calendar Popover */}
          {isOpen && (
              <div className="absolute top-full left-0 mt-2 bg-black border border-alpha-border p-6 w-[340px] animate-fade-in-up shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-50 rounded-sm">
                  {/* Decorative Connector */}
                  <div className="absolute top-0 left-8 -mt-1.5 w-3 h-3 bg-black border-t border-l border-alpha-border transform rotate-45 z-10"></div>

                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-alpha-border/50">
                      <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-alpha-surface hover:text-white text-alpha-dim transition-colors rounded-sm">
                        <span className="font-mono text-xs">PREV</span>
                      </button>
                      <span className="text-sm font-display font-bold uppercase tracking-widest text-white">
                          {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={() => changeMonth(1)} className="p-2 hover:bg-alpha-surface hover:text-white text-alpha-dim transition-colors rounded-sm">
                        <span className="font-mono text-xs">NEXT</span>
                      </button>
                  </div>

                  {/* Grid Headers */}
                  <div className="grid grid-cols-7 mb-2">
                      {['M','T','W','T','F','S','S'].map(d => (
                          <div key={d} className="text-center text-[9px] font-mono text-alpha-dim font-bold">{d}</div>
                      ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-1">
                      {calendarGrid.map((cell, idx) => {
                          if (!cell) return <div key={idx} />;
                          const isSelected = cell.dateStr === selectedDate;
                          
                          return (
                              <button
                                  key={cell.dateStr}
                                  disabled={!cell.hasData}
                                  onClick={() => {
                                      onDateSelect(cell.dateStr);
                                      setIsOpen(false);
                                  }}
                                  className={`
                                      aspect-square flex items-center justify-center text-xs font-mono transition-all relative rounded-sm
                                      ${isSelected 
                                          ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10 transform scale-105' 
                                          : cell.hasData 
                                              ? 'text-white hover:bg-alpha-surface hover:border hover:border-white/30 cursor-pointer bg-alpha-surface/30' 
                                              : 'text-alpha-dim/20 cursor-not-allowed bg-transparent'
                                      }
                                  `}
                              >
                                  {cell.day}
                                  {/* Data Indicator Dot */}
                                  {cell.hasData && !isSelected && (
                                      <span className="absolute bottom-1 w-0.5 h-0.5 bg-alpha-money rounded-full shadow-[0_0_5px_rgba(0,255,65,0.5)]"></span>
                                  )}
                              </button>
                          )
                      })}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t border-alpha-border/50 flex items-center justify-center gap-6 text-[8px] font-mono text-alpha-dim uppercase tracking-widest">
                     <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-alpha-money rounded-full"></span>
                        <span>Active Data</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-alpha-surface border border-alpha-dim/20 rounded-full"></span>
                        <span>Empty</span>
                     </div>
                  </div>
              </div>
          )}
      </div>
  );
};

export default DateSelector;