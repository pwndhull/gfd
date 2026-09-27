import React from 'react';
import { commandEntries, cmdId, cheatsheetEntries, glossaryEntries, termId } from '../lib/content';
import { parsePairs, stripInline } from '../lib/markdown';
import { Markdown, Inline, QuizScope } from '../components/Markdown';
import { CopyButton } from '../components/CodeBlock';
import { I } from '../components/Icons';

function SearchInput({ id, value, onChange, placeholder }: { id: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="input" htmlFor={id}>
      <I.search />
      <input id={id} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" spellCheck={false} />
      {value && <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => onChange('')} aria-label="Clear"><I.x /></button>}
    </label>
  );
}

function useScrollToId(id: string | undefined, deps: unknown[] = []) {
  React.useEffect(() => {
    if (!id) { window.scrollTo(0, 0); return; }
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ block: 'start' });
        el.classList.remove('flash');
        void el.offsetWidth;
        el.classList.add('flash');
      }
    });
  }, [id, ...deps]);
}

const DANGER_LABEL: Record<string, string> = { safe: 'Safe', low: 'Low risk', medium: 'Rewrites or discards', high: 'Can lose work' };

export function CommandReference({ focus }: { focus?: string }) {
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('All');
  const cats = ['All', ...Array.from(new Set(commandEntries.map(e => e.meta.category || 'Other')))];
  const list = commandEntries.filter(e =>
    (cat === 'All' || e.meta.category === cat) &&
    (!q || (e.title + ' ' + (e.meta.purpose || '') + ' ' + e.plain).toLowerCase().includes(q.toLowerCase())));
  useScrollToId(focus);

  return (
    <div className="page">
      <div className="eyebrow"><b>Reference</b><span>{commandEntries.length} commands</span></div>
      <h1 className="title">Command reference</h1>
      <p className="lede">Every command in the book with its purpose, syntax, options, common mistakes and related commands. The badge shows how much damage a careless use can do.</p>
      <div className="filter">
        <SearchInput id="cmd-filter" value={q} onChange={setQ} placeholder="Filter commands, e.g. undo, branch, --hard" />
      </div>
      <div className="seg" role="group" aria-label="Category" style={{ marginBottom: 18 }}>
        {cats.map(c => <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      {!list.length && <div className="empty">No commands match “{q}”.</div>}
      {list.map(e => {
        const id = cmdId(e);
        const danger = e.meta.danger || 'safe';
        return (
          <details key={id} id={id} className="cmd-card" open={focus === id || undefined}>
            <summary>
              <span className="cn">{e.title}</span>
              <span className={'danger-pill ' + danger}>{DANGER_LABEL[danger] || danger}</span>
              <span className="cp"><Inline text={e.meta.purpose || ''} /></span>
            </summary>
            <div className="cb">
              {e.meta.related && (
                <div className="related" style={{ marginTop: 12 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--muted)', alignSelf: 'center' }}>Related:</span>
                  {e.meta.related.split(',').map(r => r.trim()).map(r => {
                    const t = commandEntries.find(x => x.title === r);
                    return t ? <a key={r} href={'#commands.' + cmdId(t)}>{r}</a> : <span key={r} className="chip">{r}</span>;
                  })}
                </div>
              )}
              <div className="prose"><QuizScope prefix={id}><Markdown blocks={e.blocks} /></QuizScope></div>
            </div>
          </details>
        );
      })}
    </div>
  );
}

export function CheatSheet() {
  const [q, setQ] = React.useState('');
  const ql = q.toLowerCase();
  React.useEffect(() => { window.scrollTo(0, 0); }, []);
  const cats = cheatsheetEntries.map(c => ({
    title: c.title,
    rows: parsePairs(c.body).filter(([a, b]) => !q || (a + ' ' + b).toLowerCase().includes(ql)),
  })).filter(c => c.rows.length);
  return (
    <div className="page wide">
      <div className="eyebrow"><b>Reference</b><span>{cheatsheetEntries.reduce((s, c) => s + parsePairs(c.body).length, 0)} commands in {cheatsheetEntries.length} categories</span></div>
      <h1 className="title">Git cheat sheet</h1>
      <p className="lede">The commands you will reach for most, grouped by job. Commands marked <span className="warnflag" style={{ color: 'var(--danger)', fontWeight: 700 }}>!</span> discard or rewrite work: read their chapter first.</p>
      <div className="filter"><SearchInput id="cheat-filter" value={q} onChange={setQ} placeholder="Filter, e.g. stash, remote, undo" /></div>
      <div className="seg" style={{ marginBottom: 20 }}>
        {cheatsheetEntries.map(c => <button key={c.title} aria-pressed={false} onClick={() => document.getElementById('cs-' + c.title.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}>{c.title}</button>)}
      </div>
      {!cats.length && <div className="empty">Nothing matches “{q}”.</div>}
      {cats.map(c => (
        <section key={c.title} className="cheat-cat" id={'cs-' + c.title.toLowerCase()} style={{ scrollMarginTop: 80 }}>
          <h2>{c.title}</h2>
          <div className="cheat-grid">
            {c.rows.map(([cmd, desc], i) => {
              const danger = desc.startsWith('!');
              return (
                <div key={i} className="cheat-row">
                  <code>{cmd}</code>
                  <span>{danger && <span className="warnflag">! </span>}<Inline text={danger ? desc.slice(1).trim() : desc} /></span>
                  <CopyButton text={cmd.replace(/\s+#.*$/, '')} mini />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function Glossary({ focus }: { focus?: string }) {
  const [q, setQ] = React.useState('');
  useScrollToId(focus);
  const list = glossaryEntries.filter(e => !q || (e.title + ' ' + e.plain).toLowerCase().includes(q.toLowerCase()));
  const letterOf = (t: string) => {
    const c = t.replace(/^[^a-z0-9]+/i, '')[0]?.toUpperCase() || '#';
    return /[A-Z]/.test(c) ? c : '#';
  };
  const groups = new Map<string, typeof list>();
  list.forEach(e => { const L = letterOf(e.title); groups.set(L, [...(groups.get(L) || []), e]); });
  const letters = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  return (
    <div className="page">
      <div className="eyebrow"><b>Reference</b><span>{glossaryEntries.length} terms</span></div>
      <h1 className="title">Glossary</h1>
      <p className="lede">Every Git term used in this book, in plain English. When a term has a chapter, the entry links to it.</p>
      <div className="filter"><SearchInput id="gl-filter" value={q} onChange={setQ} placeholder="Find a term, e.g. HEAD~1, upstream, index" /></div>
      <nav className="az" aria-label="Jump to letter">
        {letters.map(L => groups.has(L)
          ? <a key={L} href={'#glossary'} onClick={e => { e.preventDefault(); document.getElementById('gl-' + L)?.scrollIntoView({ behavior: 'smooth' }); }}>{L}</a>
          : <span key={L} aria-hidden="true">{L}</span>)}
      </nav>
      {!list.length && <div className="empty">No terms match “{q}”.</div>}
      {[...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([L, es]) => (
        <section key={L}>
          <div className="gl-letter" id={'gl-' + L}>{L}</div>
          {es.map(e => (
            <div key={e.title} id={termId(e)} className="gl-entry">
              <h3>{e.title}</h3>
              <div className="prose"><Markdown blocks={e.blocks} /></div>
              {(e.meta.see || e.meta.chapter) && (
                <div className="gl-see">
                  {e.meta.chapter && <>Learn more: <a href={'#ch-' + e.meta.chapter}>{e.meta.chapter_title || 'Read the chapter'}</a></>}
                  {e.meta.see && <>{e.meta.chapter ? ' · ' : ''}See also: {e.meta.see.split(',').map((s, i) => {
                    const t = glossaryEntries.find(x => x.title.toLowerCase() === s.trim().toLowerCase());
                    return <React.Fragment key={i}>{i > 0 && ', '}{t ? <a href={'#glossary.' + termId(t)}>{s.trim()}</a> : s.trim()}</React.Fragment>;
                  })}</>}
                </div>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

export { SearchInput, useScrollToId, stripInline };
