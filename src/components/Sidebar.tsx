import React from 'react';
import type { Route } from '../lib/types';
import { parts, chapters, labEntries } from '../lib/content';
import { useProgress } from '../lib/progress';
import { I, BrandMark } from './Icons';

export function Sidebar({ route, open, onSearch, onNavigate }: { route: Route; open: boolean; onSearch: () => void; onNavigate: () => void }) {
  const p = useProgress();
  const activeId = route.view === 'chapter' ? route.id : null;
  const activePart = activeId ? chapters.find(c => c.id === activeId)?.part : null;
  const [expanded, setExpanded] = React.useState<Set<number>>(() => new Set(activePart ? [activePart] : [1]));
  const navRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (activePart) setExpanded(s => (s.has(activePart) ? s : new Set([...s, activePart])));
  }, [activePart]);

  React.useEffect(() => {
    if (!activeId) return;
    const el = navRef.current?.querySelector<HTMLElement>(`a[data-ch="${activeId}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeId, expanded]);

  const done = p.completed.filter(id => chapters.some(c => c.id === id)).length;
  const pct = Math.round((done / chapters.length) * 100);
  const toggle = (n: number) => setExpanded(s => { const x = new Set(s); x.has(n) ? x.delete(n) : x.add(n); return x; });

  const link = (hash: string, label: string, Icon: (p: { className?: string }) => JSX.Element, active: boolean, count?: string) => (
    <a className={'sb-link' + (active ? ' active' : '')} href={hash} onClick={onNavigate} aria-current={active ? 'page' : undefined}>
      <Icon />{label}{count && <span className="count">{count}</span>}
    </a>
  );

  return (
    <aside className={'sidebar' + (open ? ' open' : '')} aria-label="Book navigation">
      <div className="sb-head">
        <a className="brand" href="#home" onClick={onNavigate}>
          <BrandMark className="brand-mark" />
          <span>
            <span className="brand-name">Git for Developers</span><br />
            <span className="brand-sub">An interactive book</span>
          </span>
        </a>
        <div className="sb-row">
          <button className="search-btn" onClick={onSearch}><I.search />Search<span className="kbd">/</span></button>
        </div>
        <div className="sb-progress">
          <div className="row"><span>Book progress</span><span>{done}/{chapters.length} · {pct}%</span></div>
          <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Chapters completed"><span style={{ width: pct + '%' }} /></div>
        </div>
      </div>
      <nav className="sb-nav" ref={navRef}>
        {link('#home', 'Home', I.home, route.view === 'home')}
        {link('#contents', 'Table of contents', I.list, route.view === 'contents')}
        {link('#playground', 'Git sandbox', I.graph, route.view === 'playground')}

        <div className="sb-section-label">The book</div>
        {parts.filter(pt => pt.chapters.length).map(pt => {
          const isOpen = expanded.has(pt.num);
          const pd = pt.chapters.filter(c => p.completed.includes(c.id)).length;
          return (
            <div key={pt.num}>
              <button className="part-btn" aria-expanded={isOpen} onClick={() => toggle(pt.num)}>
                <span className="part-num">{String(pt.num).padStart(2, '0')}</span>
                <span className="part-title">{pt.title}</span>
                <span className="part-meta">{pd}/{pt.chapters.length}</span>
                <I.chev className="chev" />
              </button>
              {isOpen && (
                <ul className="lane">
                  {pt.chapters.map(c => {
                    const isDone = p.completed.includes(c.id);
                    const active = c.id === activeId;
                    return (
                      <li key={c.id}>
                        <a href={'#ch-' + c.id} data-ch={c.id} className={active ? 'active' : ''} onClick={onNavigate} aria-current={active ? 'page' : undefined}>
                          <span className={'dot' + (isDone ? ' done' : '')} aria-label={isDone ? 'Completed' : 'Not completed'} />
                          <span>{c.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        <div className="sb-section-label">Practice</div>
        {link('#labs', '18 · Practical labs', I.flask, route.view === 'labs', `${p.labs.length}/${labEntries.length}`)}
        {link('#quizbank', '19 · Quiz bank', I.quiz, route.view === 'quizbank')}
        {link('#project', '20 · Final project', I.flag, route.view === 'project')}
        {link('#assessment', 'Final assessment', I.award, route.view === 'assessment', p.assessmentBest != null ? p.assessmentBest + '%' : undefined)}

        <div className="sb-section-label">Reference</div>
        {link('#commands', 'Command reference', I.terminal, route.view === 'commands')}
        {link('#cheatsheet', 'Cheat sheet', I.list, route.view === 'cheatsheet')}
        {link('#glossary', 'Glossary', I.book, route.view === 'glossary')}
        {link('#ch-troubleshooting-guide', 'Troubleshooting guide', I.shield, activeId === 'troubleshooting-guide')}
      </nav>
    </aside>
  );
}
