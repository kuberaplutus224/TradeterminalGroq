import React from 'react';

interface DashboardToggleProps {
  view: 'ledger' | 'vault' | 'map';
  onChange: (view: 'ledger' | 'vault' | 'map') => void;
}

const DashboardToggle: React.FC<DashboardToggleProps> = ({ view, onChange }) => {
  return (
    <div className="flex items-center bg-black border border-white/20 p-1 rounded-sm">
      <button
        onClick={() => onChange('ledger')}
        className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm ${
          view === 'ledger'
            ? 'bg-white text-black'
            : 'bg-transparent text-alpha-dim hover:text-white'
        }`}
      >
        Ledger
      </button>
      <button
        onClick={() => onChange('map')}
        className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm ${
          view === 'map'
            ? 'bg-white text-black'
            : 'bg-transparent text-alpha-dim hover:text-white'
        }`}
      >
        Map
      </button>
      <button
        onClick={() => onChange('vault')}
        className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm ${
          view === 'vault'
            ? 'bg-white text-black'
            : 'bg-transparent text-alpha-dim hover:text-white'
        }`}
      >
        Vault
      </button>
    </div>
  );
};

export default DashboardToggle;