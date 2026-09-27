import React from 'react';
import type { Route } from './lib/types';
import { parseHash } from './lib/router';
import { chapterById, chapters } from './lib/content';
import { actions, getProgress } from './lib/progress';
import { Sidebar } from './components/Sidebar';
import { SearchDialog } from './components/SearchDialog';
import { ChapterView, RightRail } from './components/ChapterView';
import { Home } from './pages/Home';
import { CommandReference, CheatSheet, Glossary } from './pages/Reference';
import { Labs, QuizBank, FinalProject, Assessment, Playground, Contents } from './pages/Practice';
import { I } from './components/Icons';

const hostTheme = document.documentElement.getAttribute('data-theme');

function effectiveTheme(): 'light' | 'dark' {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark' || attr === 'light') return attr;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(t: 'light' | 'dark' | null) {
  const el = document.documentElement;
  if (t) el.setAttribute('data-theme', t);
  else if (hostTheme) el.setAttribute('data-theme', hostTheme);
  else el.removeAttribute('data-theme');
}

function ThemeToggle() {
  const [theme, setTheme] = React.useState(effectiveTheme());
  const flip = () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    actions.setTheme(next);
    applyTheme(next);
    setTheme(next);
  };
  return (
    <button className="icon-btn" onClick={flip} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
      {theme === 'dark' ? <I.sun /> : <I.moon />}
    </button>
  );
}

function titleFor(r: Route): string {
  switch (r.view) {
    case 'chapter': { const c = chapterById.get(r.id); return c ? `${c.num}. ${c.title}` : 'Chapter'; }
    case 'commands': return 'Command reference';
    case 'cheatsheet': return 'Cheat sheet';
    case 'glossary': return 'Glossary';
    case 'labs': return 'Practical labs';
    case 'quizbank': return 'Quiz bank';
    case 'project': return 'Final project';
    case 'assessment': return 'Final assessment';
    case 'playground': return 'Git sandbox';
    case 'contents': return 'Contents';
    default: return 'Git for Developers';
  }
}

export function App() {
  const [route, setRoute] = React.useState<Route>(() => parseHash(location.hash));
  const [menu, setMenu] = React.useState(false);
  const [searching, setSearching] = React.useState(false);

  React.useEffect(() => { applyTheme(getProgress().theme); }, []);

  React.useEffect(() => {
    const onHash = () => { setRoute(parseHash(location.hash)); setMenu(false); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearching(true);
      } else if (!typing && route.view === 'chapter' && (e.key === '[' || e.key === ']')) {
        const i = chapters.findIndex(c => c.id === route.id);
        const target = chapters[i + (e.key === ']' ? 1 : -1)];
        if (target) location.hash = '#ch-' + target.id;
      } else if (e.key === 'Escape') {
        setMenu(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [route]);

  const chapter = route.view === 'chapter' ? chapterById.get(route.id) : undefined;

  let view: React.ReactNode;
  switch (route.view) {
    case 'chapter': view = chapter ? <ChapterView chapter={chapter} /> : <NotFound />; break;
    case 'commands': view = <CommandReference focus={route.id} />; break;
    case 'cheatsheet': view = <CheatSheet />; break;
    case 'glossary': view = <Glossary focus={route.id} />; break;
    case 'labs': view = <Labs focus={route.id} />; break;
    case 'quizbank': view = <QuizBank />; break;
    case 'project': view = <FinalProject />; break;
    case 'assessment': view = <Assessment />; break;
    case 'playground': view = <Playground />; break;
    case 'contents': view = <Contents />; break;
    default: view = <Home />;
  }

  return (
    <div className="app">
      <a href="#main" className="visually-hidden" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
      <Sidebar route={route} open={menu} onSearch={() => { setMenu(false); setSearching(true); }} onNavigate={() => setMenu(false)} />
      <div className={'scrim' + (menu ? ' open' : '')} onClick={() => setMenu(false)} aria-hidden="true" />
      <div>
        <header className="topbar">
          <button className="icon-btn" onClick={() => setMenu(true)} aria-label="Open table of contents" aria-expanded={menu}><I.menu /></button>
          <span className="tb-title">{titleFor(route)}</span>
          <button className="icon-btn" onClick={() => setSearching(true)} aria-label="Search"><I.search /></button>
          <ThemeToggle />
        </header>
        <div className={'main-wrap' + (chapter ? '' : ' no-rail')}>
          <main className="main" id="main" tabIndex={-1}>
            <DesktopThemeToggle />
            {view}
          </main>
          {chapter && <RightRail chapter={chapter} />}
        </div>
      </div>
      {searching && <SearchDialog onClose={() => setSearching(false)} />}
    </div>
  );
}

function DesktopThemeToggle() {
  return (
    <div className="desk-theme" style={{ position: 'absolute', top: 16, right: 16 }}>
      <ThemeToggle />
    </div>
  );
}

function NotFound() {
  return (
    <div className="page">
      <h1 className="title">That page is not in the book</h1>
      <p className="lede">The link may point to a chapter that was renamed. <a href="#contents">Open the table of contents</a> or press <span className="kbd">/</span> to search.</p>
    </div>
  );
}
