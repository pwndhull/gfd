import React from 'react';
import { search, snippet, SearchItem } from '../lib/search';
import { goTo } from '../lib/router';
import { I } from './Icons';

function Highlight({ text, q }: { text: string; q: string }) {
  const terms = q.trim().split(/\s+/).filter(t => t.length > 1).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.join('|')})`, 'ig');
  return <>{text.split(re).map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p))}</>;
}

const SUGGESTIONS = ['staging area', 'undo last commit', 'reset --hard', 'detached HEAD', 'merge conflict', 'force-with-lease', 'reflog', 'rebase'];

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const [q, setQ] = React.useState('');
  const [sel, setSel] = React.useState(0);
  const results = React.useMemo(() => search(q), [q]);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { setSel(0); }, [q]);
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-i="${sel}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const open = (it: SearchItem) => { goTo(it.hash, it.anchor); onClose(); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(results.length - 1, s + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
    else if (e.key === 'Enter' && results[sel]) open(results[sel]);
  };

  return (
    <div className="search-scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="search-box" role="dialog" aria-modal="true" aria-label="Search the book" onKeyDown={onKey}>
        <div className="input">
          <I.search />
          <input id="global-search" autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search chapters, commands, glossary, recovery…" aria-label="Search" autoComplete="off" spellCheck={false} />
          <button className="icon-btn" onClick={onClose} aria-label="Close search"><I.x /></button>
        </div>
        <div className="results" ref={listRef} role="listbox">
          {!q && (
            <div style={{ padding: '14px 12px' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>Try</div>
              <div className="chips">
                {SUGGESTIONS.map(s => <button key={s} className="chip" onClick={() => setQ(s)}>{s}</button>)}
              </div>
            </div>
          )}
          {q && !results.length && <div className="search-empty">No results for “{q}”. Try a command name like <code className="inline-code">reset</code> or a word like <code className="inline-code">conflict</code>.</div>}
          {results.map((r, i) => (
            <div key={i} data-i={i} role="option" aria-selected={i === sel} className={'result' + (i === sel ? ' on' : '')}
              onMouseEnter={() => setSel(i)} onClick={() => open(r)}>
              <span className="type">{r.type}</span>
              <span className="rt"><Highlight text={r.title} q={q} /></span>
              <span className="rs"><Highlight text={snippet(r, q)} q={q} /></span>
            </div>
          ))}
        </div>
        <div className="search-hint">
          <span><span className="kbd">↑</span> <span className="kbd">↓</span> to move</span>
          <span><span className="kbd">Enter</span> to open</span>
          <span><span className="kbd">Esc</span> to close</span>
        </div>
      </div>
    </div>
  );
}
