import React from 'react';
import { chapters, parts, totalMinutes, labEntries, allChapterQuizzes, chapterById } from '../lib/content';
import { useProgress, actions, exportProgress, importProgress } from '../lib/progress';
import { I } from '../components/Icons';

function ProgressGraph() {
  const p = useProgress();
  const bookParts = parts.filter(pt => pt.chapters.length);
  const current = p.current ? chapterById.get(p.current)?.part : null;
  const W = 520, y = 92, x0 = 26, step = bookParts.length > 1 ? (W - 52) / (bookParts.length - 1) : 0;
  return (
    <div className="hero-graph">
      <div className="cap"><span>git log --graph your-progress</span><span>{bookParts.length} parts</span></div>
      <svg viewBox={`0 0 ${W} 150`} role="img" aria-label="Your progress through the book drawn as a commit history">
        <path d={`M${x0},${y} L${W - x0},${y}`} stroke="var(--line-strong)" strokeWidth={2.5} />
        {(() => {
          const lastDone = bookParts.reduce((acc, pt, i) => (pt.chapters.some(c => p.completed.includes(c.id)) ? i : acc), -1);
          return lastDone >= 0 ? <path d={`M${x0},${y} L${x0 + lastDone * step},${y}`} stroke="var(--accent)" strokeWidth={3} /> : null;
        })()}
        <path d={`M${x0 + 4 * step},${y} C${x0 + 5 * step},${y} ${x0 + 5 * step},${y + 40} ${x0 + 6 * step},${y + 40} L${x0 + 7 * step},${y + 40} C${x0 + 8 * step},${y + 40} ${x0 + 8 * step},${y} ${x0 + 9 * step},${y}`} stroke="var(--lane-1)" strokeWidth={2} fill="none" opacity={0.55} />
        {bookParts.map((pt, i) => {
          const d = pt.chapters.filter(c => p.completed.includes(c.id)).length;
          const full = d === pt.chapters.length;
          const x = x0 + i * step;
          return (
            <a key={pt.num} href={'#ch-' + pt.chapters[0].id} aria-label={`Part ${pt.num}: ${pt.title}, ${d} of ${pt.chapters.length} chapters done`}>
              <circle cx={x} cy={y} r={full ? 9 : 8} fill={full ? 'var(--accent)' : 'var(--surface)'} stroke={d ? 'var(--accent)' : 'var(--line-strong)'} strokeWidth={2.5} />
              {d > 0 && !full && <circle cx={x} cy={y} r={3.5} fill="var(--accent)" />}
              <text x={x} y={y + 28} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--muted)' }}>{pt.num}</text>
              <title>{`Part ${pt.num}: ${pt.title}`}</title>
            </a>
          );
        })}
        {(() => {
          const i = bookParts.findIndex(pt => pt.num === (current ?? 1));
          const x = x0 + Math.max(0, i) * step;
          return (
            <g>
              <rect x={x - 32} y={y - 50} width={64} height={22} rx={11} fill="var(--head-soft)" stroke="var(--head)" />
              <text x={x} y={y - 35} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, fill: 'var(--ink)' }}>HEAD</text>
              <path d={`M${x},${y - 28} L${x},${y - 12}`} stroke="var(--head)" strokeWidth={2} />
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

export function Home() {
  const p = useProgress();
  const done = p.completed.filter(id => chapterById.has(id)).length;
  const pct = Math.round((done / chapters.length) * 100);
  const answered = allChapterQuizzes.filter(q => q.id in p.answers);
  const correct = answered.filter(q => p.answers[q.id]).length;
  const quizPct = answered.length ? Math.round((correct / answered.length) * 100) : null;
  const current = (p.current && chapterById.get(p.current)) || null;
  const nextUp = chapters.find(c => !p.completed.includes(c.id)) || chapters[0];
  const resume = current && !p.completed.includes(current.id) ? current : nextUp;
  const minutesLeft = chapters.filter(c => !p.completed.includes(c.id)).reduce((s, c) => s + c.minutes, 0);
  const hours = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? (m % 60) + 'm' : ''}` : `${m}m`);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [importMsg, setImportMsg] = React.useState<{ ok: boolean; text: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handleExport() {
    const blob = new Blob([JSON.stringify(exportProgress(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `git-for-developers-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importProgress(String(reader.result));
        setImportMsg({ ok: true, text: 'Progress imported.' });
      } catch (err) {
        setImportMsg({ ok: false, text: err instanceof Error ? err.message : 'Import failed.' });
      }
    };
    reader.onerror = () => setImportMsg({ ok: false, text: "Couldn't read that file." });
    reader.readAsText(file);
  }

  return (
    <div className="page wide">
      <section className="hero">
        <div>
          <div className="eyebrow"><b>Git for Developers</b><span>{chapters.length} chapters · 20 parts · {labEntries.length} labs</span></div>
          <h1>From your first commit to <em>professional Git workflows.</em></h1>
          <p className="lede">A complete, hands-on book for developers joining a team. Every idea is explained in plain English first, then shown as a command, a diagram and a live simulation you can poke at.</p>
          <div className="hero-actions">
            <a className="btn primary lg" href={'#ch-' + resume.id}><I.play />{done || p.current ? 'Continue learning' : 'Start reading'}</a>
            <a className="btn lg" href="#ch-your-first-complete-workflow"><I.terminal />Quick start: first repo in 10 minutes</a>
          </div>
        </div>
        <ProgressGraph />
      </section>

      <div className="stats">
        <div className="stat">
          <span className="k">Overall progress</span>
          <span className="v">{pct}%</span>
          <div className="bar"><span style={{ width: pct + '%' }} /></div>
        </div>
        <div className="stat">
          <span className="k">Chapters completed</span>
          <span className="v">{done}<small> / {chapters.length}</small></span>
        </div>
        <div className="stat">
          <span className="k">Labs completed</span>
          <span className="v">{p.labs.length}<small> / {labEntries.length}</small></span>
        </div>
        <div className="stat">
          <span className="k">Quiz score</span>
          <span className="v">{quizPct === null ? '—' : quizPct + '%'}<small>{answered.length ? ` ${correct}/${answered.length}` : ' none yet'}</small></span>
        </div>
      </div>

      <a className="continue" href={'#ch-' + resume.id} style={{ color: 'var(--ink)', textDecoration: 'none' }}>
        <div>
          <div className="eyebrow"><b>{current && current.id === resume.id ? 'Current chapter' : 'Up next'}</b><span>Part {resume.part} · Chapter {resume.num}</span></div>
          <div className="t">{resume.title}</div>
          <div className="s">{resume.minutes} min · {resume.level} · About {hours(minutesLeft)} of reading left in the book (total {hours(totalMinutes)})</div>
        </div>
        <span className="btn primary"><I.right />Continue</span>
      </a>

      <h2 className="section-title">The book <small>Each dot is a chapter</small></h2>
      <div className="parts-grid">
        {parts.filter(pt => pt.chapters.length).map(pt => {
          const d = pt.chapters.filter(c => p.completed.includes(c.id)).length;
          return (
            <a key={pt.num} className="part-card" href={'#ch-' + pt.chapters[0].id}>
              <span className="pn"><span>PART {String(pt.num).padStart(2, '0')}</span><span>{pt.chapters.reduce((s, c) => s + c.minutes, 0)} min</span></span>
              <span className="pt">{pt.title}</span>
              <span className="pb">{pt.blurb}</span>
              <span className="dots">{pt.chapters.map(c => <i key={c.id} className={p.completed.includes(c.id) ? 'on' : ''} />)}</span>
            </a>
          );
        })}
      </div>

      <h2 className="section-title">Practice and reference</h2>
      <div className="tools-grid">
        <a className="tool" href="#playground"><I.graph /><span><b>Git sandbox</b><span>Type commands, watch the commit graph change. Simulated, safe.</span></span></a>
        <a className="tool" href="#labs"><I.flask /><span><b>Practical labs</b><span>{labEntries.length} guided exercises for a real terminal.</span></span></a>
        <a className="tool" href="#quizbank"><I.quiz /><span><b>Quiz bank</b><span>{allChapterQuizzes.length}+ questions with explanations.</span></span></a>
        <a className="tool" href="#project"><I.flag /><span><b>Final project</b><span>Clone, branch, PR, conflict, recovery, release.</span></span></a>
        <a className="tool" href="#assessment"><I.award /><span><b>Final assessment</b><span>{p.assessmentBest != null ? `Best score ${p.assessmentBest}%` : 'A scored exam. 80% to pass.'}</span></span></a>
        <a className="tool" href="#commands"><I.terminal /><span><b>Command reference</b><span>Syntax, options, mistakes and danger level.</span></span></a>
        <a className="tool" href="#cheatsheet"><I.list /><span><b>Cheat sheet</b><span>Searchable, copyable, by category.</span></span></a>
        <a className="tool" href="#glossary"><I.book /><span><b>Glossary</b><span>Every Git term, A to Z, in plain English.</span></span></a>
      </div>

      <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', color: 'var(--muted)', fontSize: 13 }}>
        <span>Progress is saved in this browser only.</span>
        <button className="btn small ghost" onClick={handleExport}><I.download />Export progress</button>
        <button className="btn small ghost" onClick={() => fileInputRef.current?.click()}><I.upload />Import progress</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />
        {!confirmReset ? (
          <button className="btn small ghost" onClick={() => setConfirmReset(true)}><I.reset />Reset progress</button>
        ) : (
          <>
            <span style={{ color: 'var(--danger)' }}>Clear all chapters, labs and quiz answers?</span>
            <button className="btn small" style={{ color: 'var(--danger)' }} onClick={() => { actions.resetAll(); setConfirmReset(false); }}>Yes, reset</button>
            <button className="btn small ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
          </>
        )}
      </div>
      {importMsg && (
        <div className="import-msg" style={{ color: importMsg.ok ? 'var(--accent)' : 'var(--danger)' }}>
          {importMsg.ok ? <I.check /> : <I.alert />} {importMsg.text}
        </div>
      )}
    </div>
  );
}
