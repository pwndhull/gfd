import React from 'react';
import { I } from './Icons';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const mod = isMac ? '⌘' : 'Ctrl';

function Keys({ keys }: { keys: string[] }) {
  return (
    <span className="kbd-combo">
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="kbd-plus">+</span>}
          <span className="kbd">{k}</span>
        </React.Fragment>
      ))}
    </span>
  );
}

const GROUPS: { title: string; rows: { keys: string[]; label: string }[] }[] = [
  {
    title: 'Navigate',
    rows: [
      { keys: ['/'], label: 'Search the book' },
      { keys: [mod, 'K'], label: 'Search the book' },
      { keys: ['['], label: 'Previous chapter' },
      { keys: [']'], label: 'Next chapter' },
    ],
  },
  {
    title: 'Search dialog',
    rows: [
      { keys: ['↑'], label: 'Move up a result' },
      { keys: ['↓'], label: 'Move down a result' },
      { keys: ['Enter'], label: 'Open the selected result' },
    ],
  },
  {
    title: 'General',
    rows: [
      { keys: ['Esc'], label: 'Close a dialog or menu' },
      { keys: ['?'], label: 'Show this list' },
    ],
  },
];

export function KeyboardHelp({ onClose }: { onClose: () => void }) {
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  return (
    <div className="search-scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="kbd-card" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onKeyDown={onKey} tabIndex={-1} ref={el => el?.focus()}>
        <div className="kbd-card-head">
          <h2><I.keyboard />Keyboard shortcuts</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><I.x /></button>
        </div>
        <div className="kbd-card-body">
          {GROUPS.map(g => (
            <section key={g.title}>
              <h3>{g.title}</h3>
              <div className="kbd-rows">
                {g.rows.map((r, i) => (
                  <div className="kbd-row" key={i}>
                    <Keys keys={r.keys} />
                    <span>{r.label}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
