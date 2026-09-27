import React from 'react';
import type { Chapter } from '../lib/types';
import { chapters, parts, commandEntries, glossaryEntries, cmdId, termId } from '../lib/content';
import { actions, useProgress } from '../lib/progress';
import { takeAnchor } from '../lib/router';
import { Markdown, QuizScope } from './Markdown';
import { I } from './Icons';

export function findTerm(name: string) {
  const n = name.toLowerCase();
  return glossaryEntries.find(e => e.title.toLowerCase() === n || (e.meta.aka || '').toLowerCase().split(',').map(s => s.trim()).includes(n));
}
export function findCommand(cmd: string) {
  const base = cmd.replace(/^\$\s*/, '').split(/\s+/).slice(0, 2).join(' ');
  return commandEntries.find(e => e.title === base);
}

function useScrollSpy(ids: string[]) {
  const [active, setActive] = React.useState<string | null>(null);
  React.useEffect(() => {
    const onScroll = () => {
      let cur: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) cur = id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ids.join('|')]);
  return active;
}

const scrollToId = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export function RightRail({ chapter }: { chapter: Chapter }) {
  const active = useScrollSpy(chapter.headings.map(h => h.id));
  const p = useProgress();
  const part = parts.find(pt => pt.num === chapter.part)!;
  const done = part.chapters.filter(c => p.completed.includes(c.id)).length;
  return (
    <aside className="rail" aria-label="On this page">
      <section>
        <h4>On this page</h4>
        <ol>
          {chapter.headings.map(h => (
            <li key={h.id}><a href={'#ch-' + chapter.id} onClick={scrollToId(h.id)} className={active === h.id ? 'on' : ''}>{h.text}</a></li>
          ))}
        </ol>
      </section>
      {chapter.concepts.length > 0 && (
        <section>
          <h4>Key concepts</h4>
          <div className="chips">
            {chapter.concepts.map(c => {
              const t = findTerm(c);
              return t ? <a key={c} className="chip" href={'#glossary.' + termId(t)}>{c}</a> : <span key={c} className="chip">{c}</span>;
            })}
          </div>
        </section>
      )}
      {chapter.commands.length > 0 && (
        <section>
          <h4>Commands</h4>
          <div className="cmd-list">
            {chapter.commands.map(c => {
              const e = findCommand(c);
              return e ? <a key={c} href={'#commands.' + cmdId(e)}>{c}</a> : <span key={c} className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{c}</span>;
            })}
          </div>
        </section>
      )}
      <section>
        <h4>Part {part.num} progress</h4>
        <div className="bar"><span style={{ width: `${(done / part.chapters.length) * 100}%` }} /></div>
        <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{done} of {part.chapters.length} chapters complete</p>
      </section>
    </aside>
  );
}

export function ChapterView({ chapter }: { chapter: Chapter }) {
  const p = useProgress();
  const idx = chapters.indexOf(chapter);
  const prev = chapters[idx - 1];
  const next = chapters[idx + 1];
  const part = parts.find(pt => pt.num === chapter.part)!;
  const done = p.completed.includes(chapter.id);

  React.useEffect(() => {
    actions.setCurrent(chapter.id);
    const anchor = takeAnchor();
    requestAnimationFrame(() => {
      if (anchor) document.getElementById(anchor)?.scrollIntoView({ block: 'start' });
      else window.scrollTo(0, 0);
    });
  }, [chapter.id]);

  const quizDone = chapter.quizzes.filter(q => q.id in p.answers).length;

  return (
    <article className="page">
      <div className="eyebrow">
        <b>Part {part.num}</b><span>{part.title}</span><span>Chapter {chapter.num} of {chapters.length}</span>
      </div>
      <h1 className="title">{chapter.title}</h1>
      <div className="chips">
        <span className="chip"><I.clock />{chapter.minutes} min</span>
        <span className={'chip level-' + chapter.level}>{chapter.level}</span>
        {chapter.quizzes.length > 0 && <span className="chip"><I.quiz />{quizDone}/{chapter.quizzes.length} quiz questions</span>}
        {done && <span className="chip level-Beginner"><I.check />Completed</span>}
      </div>

      {chapter.objectives.length > 0 && (
        <section className="objectives" aria-labelledby="objectives-h">
          <h2 id="objectives-h">Learning objectives</h2>
          <ul>{chapter.objectives.map((o, i) => <li key={i}><I.target />{o}</li>)}</ul>
          {chapter.topics.length > 0 && (
            <div className="topics-line">
              Covers: {chapter.topics.map((t, i) => <React.Fragment key={i}>{i > 0 && ' · '}{/^\d+$/.test(t.split(' ')[0]) ? <><span>{t.split(' ')[0]}</span> {t.split(' ').slice(1).join(' ')}</> : t}</React.Fragment>)}
            </div>
          )}
        </section>
      )}

      <details className="toc-mobile">
        <summary>On this page</summary>
        <ol>{chapter.headings.map(h => <li key={h.id}><a href={'#ch-' + chapter.id} onClick={scrollToId(h.id)}>{h.text}</a></li>)}</ol>
      </details>

      <div className="prose">
        <QuizScope prefix={chapter.id}>
          <Markdown blocks={chapter.blocks} />
        </QuizScope>
      </div>

      <div className="ch-foot">
        <div className="complete-card">
          <p>{done ? 'You marked this chapter complete.' : 'Finished reading and tried the quiz?'}</p>
          <button className={'btn ' + (done ? 'done' : 'primary')} onClick={() => actions.toggleChapter(chapter.id)} aria-pressed={done}>
            <I.check />{done ? 'Completed' : 'Mark as complete'}
          </button>
        </div>
        <nav className="pager" aria-label="Chapter navigation">
          {prev ? <a href={'#ch-' + prev.id}><small>← Previous · Chapter {prev.num}</small><span>{prev.title}</span></a> : <a href="#home"><small>← Back</small><span>Home</span></a>}
          {next ? <a className="next" href={'#ch-' + next.id}><small>Next · Chapter {next.num} →</small><span>{next.title}</span></a>
            : <a className="next" href="#labs"><small>Next →</small><span>Practical labs</span></a>}
        </nav>
      </div>
    </article>
  );
}
