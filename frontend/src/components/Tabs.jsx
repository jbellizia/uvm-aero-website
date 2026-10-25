import { useState } from 'react';

// By default the container shrinks to the active panel. Pass keepHeight to hold the tallest panel's height
// so surrounding layout doesn't shift when switching tabs.
// Pass active and onChange to control the selected tab from the parent.
export default function Tabs({ tabs, panels, className = '', keepHeight = false, active: controlled, onChange }) {
  const [internal, setInternal] = useState(tabs[0].key);
  const active = controlled ?? internal;
  const setActive = onChange ?? setInternal;

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
              active === panel.key
                ? ''
                : `${keepHeight ? '' : 'h-0 overflow-hidden '}opacity-0 pointer-events-none`
            }`}
          >
            {panel.content}
          </div>
        ))}
      </div>
    </>
  );
}
