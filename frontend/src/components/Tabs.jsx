import { useState } from 'react';

export default function Tabs({ tabs, panels, className = '' }) {
  const [active, setActive] = useState(tabs[0].key);

  return (
    <>
      <div className={`flex gap-0 mb-8 border border-border ${className}`} style={{ fontSize: '0.68rem', letterSpacing: '0.12em' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`flex-1 py-2.5 uppercase font-bold transition-colors ${
              active === tab.key ? 'bg-accent text-black' : 'text-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={`grid ${className}`}>
        {panels.map((panel) => (
          <div
            key={panel.key}
            className={`[grid-area:1/1] transition-opacity duration-150 ${
              active === panel.key ? '' : 'opacity-0 pointer-events-none'
            }`}
          >
            {panel.content}
          </div>
        ))}
      </div>
    </>
  );
}
