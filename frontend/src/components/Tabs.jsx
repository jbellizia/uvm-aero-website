import { useState } from 'react';

// By default the container shrinks to the active panel. Pass keepHeight to hold the tallest panel's height
// so surrounding layout doesn't shift when switching tabs.
// Pass active and onChange to control the selected tab from the parent.
// Pass wrap to lay many tabs out as a grid of rows instead of one sideways-scrolling row.
export default function Tabs({ tabs, panels, className = '', keepHeight = false, wrap = false, active: controlled, onChange }) {
  const [internal, setInternal] = useState(tabs[0].key);
  const active = controlled ?? internal;
  const setActive = onChange ?? setInternal;

  return (
    <>
      {/* Without wrap, scrolls sideways instead of squashing labels when there are more tabs than fit. */}
      <div
        className={`mb-8 border-border ${
          wrap ? 'grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] border-l border-t' : 'flex gap-0 border overflow-x-auto'
        } ${className}`}
        style={{ fontSize: '0.68rem', letterSpacing: '0.12em' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2.5 uppercase font-bold transition-colors ${
              wrap ? 'border-r border-b border-border' : 'flex-1 shrink-0 whitespace-nowrap'
            } ${
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
