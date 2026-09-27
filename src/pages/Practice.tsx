import React from 'react';
import { labEntries, labId, parts, chapters, allChapterQuizzes, projectDoc, assessmentDoc, extraQuizDoc, chapterById, PART_META } from '../lib/content';
import { actions, useProgress } from '../lib/progress';
import { Markdown, QuizScope } from '../components/Markdown';
import { Question, KIND_LABEL } from '../components/Quiz';
import { GitVisualizer } from '../components/GitVisualizer';
import { PRESETS } from '../lib/vizPresets';
import { I } from '../components/Icons';
import type { QuizQuestion } from '../lib/types';

// ---------------- Labs ----------------
export function Labs({ focus }: { focus?: string }) {
  const p = useProgress();
  React.useEffect(() => { window.scrollTo(0, 0); }, [focus]);
  const lab = focus ? labEntries.find(e => labId(e) === focus) : null;

  if (lab) {
    const id = labId(lab);
    const idx = labEntries.indexOf(lab);
    const done = p.labs.includes(id);
    const prev = labEntries[idx - 1], next = labEntries[idx + 1];
    const ch = lab.meta.chapter ? chapterById.get(lab.meta.chapter) : null;
    return (
      <article className="page">
        <div className="eyebrow"><a href="#labs"><b>← All labs</b></a><span>Lab {idx + 1} of {labEntries.length}</span></div>
        <h1 className="title">{lab.title}</h1>
        <div className="chips">
          {lab.meta.minutes && <span className="chip"><I.clock />{lab.meta.minutes} min</span>}
          {lab.meta.level && <span className={'chip level-' + lab.meta.level}>{lab.meta.level}</span>}
          {ch && <a className="chip" href={'#ch-' + ch.id}><I.book />Chapter {ch.num}: {ch.title}</a>}
          {done && <span className="chip level-Beginner"><I.check />Completed</span>}
        </div>
        <div className="callout note" style={{ marginTop: 22 }}>
          <div className="callout-head"><I.terminal /><span>Real Git</span></div>
          <div className="callout-body"><p style={{ margin: '0 0 12px', fontFamily: 'var(--font-body)' }}>Labs run in a real terminal with real Git. Work inside a throwaway folder (the lab tells you which) so nothing can touch your actual projects.</p></div>
        </div>
        <div className="prose"><QuizScope prefix={id}><Markdown blocks={lab.blocks} /></QuizScope></div>
        <div className="ch-foot">
          <div className="complete-card">
            <p>{done ? 'Lab complete.' : 'Reached the expected result?'}</p>
            <button className={'btn ' + (done ? 'done' : 'primary')} onClick={() => actions.toggleLab(id)} aria-pressed={done}><I.check />{done ? 'Completed' : 'Mark lab complete'}</button>
          </div>
          <nav className="pager">
            {prev ? <a href={'#labs.' + labId(prev)}><small>← Previous lab</small><span>{prev.title}</span></a> : <a href="#labs"><small>←</small><span>All labs</span></a>}
            {next ? <a className="next" href={'#labs.' + labId(next)}><small>Next lab →</small><span>{next.title}</span></a> : <a className="next" href="#project"><small>Next →</small><span>Final project</span></a>}
          </nav>
        </div>
      </article>
    );
  }

  return (
    <div className="page">
      <div className="eyebrow"><b>Part 18</b><span>Practical labs</span></div>
      <h1 className="title">Practical labs</h1>
      <p className="lede">{labEntries.length} hands-on labs, each with an objective, a starting state, step-by-step instructions, the result you should see, common mistakes, a full solution and a stretch challenge. They build on each other, so going in order works best.</p>
      <div className="score-card">
        <div><div className="lbl">Completed</div><div className="big">{p.labs.length}<span style={{ fontSize: 18, color: 'var(--muted)' }}> / {labEntries.length}</span></div></div>
        <div style={{ flex: 1, minWidth: 180 }}><div className="bar"><span style={{ width: `${(p.labs.length / labEntries.length) * 100}%` }} /></div></div>
      </div>
      <div className="lab-list">
        {labEntries.map((e, i) => (
          <a key={labId(e)} className="lab-item" href={'#labs.' + labId(e)}>
            <span className="ln">LAB {String(i + 1).padStart(2, '0')}</span>
            <span><b>{e.title}</b><small>{e.meta.summary}{e.meta.minutes ? ` · ${e.meta.minutes} min` : ''}{e.meta.level ? ` · ${e.meta.level}` : ''}</small></span>
            <span className={'status-dot' + (p.labs.includes(labId(e)) ? ' on' : '')} aria-label={p.labs.includes(labId(e)) ? 'Completed' : 'Not completed'} />
          </a>
        ))}
      </div>
    </div>
  );
}

// ---------------- Quiz bank ----------------
export function QuizBank() {
  const p = useProgress();
  const [part, setPart] = React.useState<number | 'extra' | 'all'>('all');
  const [kind, setKind] = React.useState<string>('all');
  const [onlyMissed, setOnlyMissed] = React.useState(false);
  const [nonce, setNonce] = React.useState(0);
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  const extra = extraQuizDoc.quizzes;
  const pool: { q: QuizQuestion; label: string; href: string }[] = [
    ...chapters.flatMap(c => c.quizzes.map(q => ({ q, label: `Ch ${c.num} · ${c.title}`, href: '#ch-' + c.id, part: c.part }))),
    ...extra.map(q => ({ q, label: 'Extra practice', href: '#quizbank', part: 'extra' as const })),
  ].filter(x => (part === 'all' || (x as any).part === part) && (kind === 'all' || x.q.kind === kind) && (!onlyMissed || p.answers[x.q.id] === false));

  const everything = [...allChapterQuizzes, ...extra];
  const answered = everything.filter(q => q.id in p.answers);
  const right = answered.filter(q => p.answers[q.id]).length;
  const kinds = Object.keys(KIND_LABEL);

  return (
    <div className="page">
      <div className="eyebrow"><b>Part 19</b><span>Quizzes</span></div>
      <h1 className="title">Quiz bank</h1>
      <p className="lede">Every quiz from every chapter, plus extra practice. Your first answer to each question counts toward your score; you can retry as often as you like.</p>
      <div className="score-card">
        <div><div className="lbl">Score (first attempts)</div><div className="big">{answered.length ? Math.round((right / answered.length) * 100) + '%' : '—'}</div></div>
        <div><div className="lbl">Answered</div><div className="big">{answered.length}<span style={{ fontSize: 18, color: 'var(--muted)' }}> / {everything.length}</span></div></div>
        <div><div className="lbl">Missed</div><div className="big">{answered.length - right}</div></div>
        <button className="btn small ghost" style={{ marginLeft: 'auto' }} onClick={() => { actions.resetQuiz(everything.map(q => q.id)); setNonce(n => n + 1); }}><I.reset />Reset quiz scores</button>
      </div>
      <div className="filter">
        <label htmlFor="qb-part" style={{ fontSize: 13, color: 'var(--muted)' }}>Part</label>
        <select id="qb-part" className="btn" value={String(part)} onChange={e => setPart(e.target.value === 'all' ? 'all' : e.target.value === 'extra' ? 'extra' : Number(e.target.value))}>
          <option value="all">All parts</option>
          {PART_META.filter(pt => chapters.some(c => c.part === pt.num && c.quizzes.length)).map(pt => <option key={pt.num} value={pt.num}>Part {pt.num}: {pt.title}</option>)}
          <option value="extra">Extra practice</option>
        </select>
        <label htmlFor="qb-kind" style={{ fontSize: 13, color: 'var(--muted)' }}>Type</label>
        <select id="qb-kind" className="btn" value={kind} onChange={e => setKind(e.target.value)}>
          <option value="all">All types</option>
          {kinds.map(k => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
        </select>
        <label className="step-check" style={{ padding: '6px 10px' }} htmlFor="qb-missed">
          <input id="qb-missed" type="checkbox" checked={onlyMissed} onChange={e => setOnlyMissed(e.target.checked)} />Only questions I missed
        </label>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>{pool.length} question{pool.length === 1 ? '' : 's'}</p>
      {!pool.length && <div className="empty">No questions match these filters.</div>}
      <div className="quiz" key={nonce}>
        {pool.map((x, i) => (
          <div key={x.q.id}>
            <a href={x.href} style={{ fontSize: 12.5, color: 'var(--muted)', display: 'block', margin: '0 0 6px 2px' }}>{x.label}</a>
            <Question q={x.q} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Final project ----------------
export function FinalProject() {
  const p = useProgress();
  React.useEffect(() => { window.scrollTo(0, 0); }, []);
  const steps = (Array.isArray(projectDoc.meta.steps) ? projectDoc.meta.steps : []) as string[];
  const done = steps.filter((_, i) => p.projectSteps.includes('step-' + (i + 1))).length;
  return (
    <article className="page">
      <div className="eyebrow"><b>Part 20</b><span>Final project</span></div>
      <h1 className="title">{String(projectDoc.meta.title || 'Final project')}</h1>
      <p className="lede">{String(projectDoc.meta.lede || '')}</p>
      <section className="objectives">
        <h2>Project checklist · {done}/{steps.length}</h2>
        <div className="bar" style={{ marginBottom: 12 }}><span style={{ width: `${(done / Math.max(1, steps.length)) * 100}%` }} /></div>
        <div className="steps">
          {steps.map((s, i) => {
            const id = 'step-' + (i + 1);
            const on = p.projectSteps.includes(id);
            return (
              <label key={id} className={'step-check' + (on ? ' on' : '')} htmlFor={'pj-' + id}>
                <input id={'pj-' + id} type="checkbox" checked={on} onChange={() => actions.toggleStep(id)} />
                <span><b style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', marginRight: 8 }}>{String(i + 1).padStart(2, '0')}</b>{s}</span>
              </label>
            );
          })}
        </div>
      </section>
      <div className="prose"><QuizScope prefix="project"><Markdown blocks={projectDoc.blocks} /></QuizScope></div>
      <div className="ch-foot">
        <nav className="pager">
          <a href="#labs"><small>← Back</small><span>Practical labs</span></a>
          <a className="next" href="#assessment"><small>Next →</small><span>Final assessment</span></a>
        </nav>
      </div>
    </article>
  );
}

// ---------------- Final assessment ----------------
export function Assessment() {
  const p = useProgress();
  const qs = assessmentDoc.quizzes;
  const [attempt, setAttempt] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [submitted, setSubmitted] = React.useState(false);
  React.useEffect(() => { window.scrollTo(0, 0); }, [attempt]);
  const count = Object.keys(answers).length;
  const score = qs.filter(q => answers[q.id] === q.answer).length;
  const pct = qs.length ? Math.round((score / qs.length) * 100) : 0;
  const pass = Number(assessmentDoc.meta.pass || 80);

  const submit = () => {
    setSubmitted(true);
    actions.setAssessment(pct);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <article className="page">
      <div className="eyebrow"><b>Part 20</b><span>Final assessment</span><span>{qs.length} questions</span></div>
      <h1 className="title">Final assessment</h1>
      <p className="lede">{String(assessmentDoc.meta.lede || '')} You need {pass}% to pass. Answers are revealed only after you submit.</p>
      {submitted ? (
        <div className="score-card">
          <div><div className="lbl">This attempt</div><div className={'big ' + (pct >= pass ? 'pass' : 'fail')}>{pct}%</div></div>
          <div><div className="lbl">Correct</div><div className="big">{score}/{qs.length}</div></div>
          <div><div className="lbl">Best</div><div className="big">{p.assessmentBest ?? pct}%</div></div>
          <div style={{ flex: 1, minWidth: 200, fontSize: 15, color: 'var(--ink-2)' }}>
            {pct >= pass ? 'Passed. You are ready to work on a professional Git team. Review any misses below.' : 'Not a pass yet. Each explanation below points you to what to review. Retake when ready.'}
          </div>
          <button className="btn primary" onClick={() => { setAnswers({}); setSubmitted(false); setAttempt(a => a + 1); }}><I.reset />Retake</button>
        </div>
      ) : (
        <div className="score-card">
          <div><div className="lbl">Answered</div><div className="big">{count}/{qs.length}</div></div>
          <div style={{ flex: 1, minWidth: 160 }}><div className="bar"><span style={{ width: `${(count / Math.max(1, qs.length)) * 100}%` }} /></div></div>
          {p.assessmentBest != null && <div><div className="lbl">Best so far</div><div className="big">{p.assessmentBest}%</div></div>}
        </div>
      )}
      <div className="quiz" key={attempt}>
        {qs.map((q, i) => (
          <Question key={q.id + attempt} q={q} index={i} record={false} locked={submitted}
            reveal={submitted} onAnswer={c => setAnswers(a => ({ ...a, [q.id]: c }))} />
        ))}
      </div>
      {!submitted && (
        <div className="complete-card" style={{ marginTop: 20 }}>
          <p>{count < qs.length ? `${qs.length - count} question${qs.length - count === 1 ? '' : 's'} left. Unanswered questions count as wrong.` : 'All questions answered.'}</p>
          <button className="btn primary" onClick={submit} disabled={count === 0}><I.check />Submit assessment</button>
        </div>
      )}
    </article>
  );
}

// ---------------- Playground ----------------
export function Playground() {
  const [preset, setPreset] = React.useState('playground');
  React.useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="page wide">
      <div className="eyebrow"><b>Sandbox</b><span>Simulated Git</span></div>
      <h1 className="title">Git sandbox</h1>
      <p className="lede">A safe place to try commands and watch the commit graph respond. It simulates commits, branches, HEAD, merges, rebases, resets, reverts, cherry-picks, tags and a remote. It does not run real Git and has no files.</p>
      <div className="seg" role="group" aria-label="Starting scenario" style={{ marginBottom: 6 }}>
        {Object.entries(PRESETS).map(([k, v]) => <button key={k} aria-pressed={preset === k} onClick={() => setPreset(k)}>{v.title}</button>)}
      </div>
      <GitVisualizer key={preset} preset={preset} big />
      <div className="prose" style={{ marginTop: 24 }}>
        <h2>Supported commands</h2>
        <div className="table-wrap"><table><thead><tr><th>Command</th><th>What the sandbox does</th></tr></thead><tbody>
          {[
            ['git commit -m "msg"', 'Adds a commit on top of HEAD. --amend replaces the last commit.'],
            ['git branch [name] / -d / -D / -m', 'Lists, creates, deletes or renames branches.'],
            ['git switch <b> / -c <b> / --detach', 'Moves HEAD to a branch; -c creates it first.'],
            ['git checkout <b | commit> / -b <b>', 'Like switch, and can detach HEAD at a commit.'],
            ['git merge <b> [--no-ff | --ff-only]', 'Fast-forwards when possible, otherwise creates a merge commit.'],
            ['git rebase <b>', 'Replays your commits as new copies on top of <b>.'],
            ['git reset [--soft | --mixed | --hard] <ref>', 'Moves the current branch and explains what real Git does to your files.'],
            ['git revert <ref>', 'Adds a commit that undoes <ref>.'],
            ['git cherry-pick <ref>', 'Copies one commit onto HEAD.'],
            ['git tag [-a] <name> [ref]', 'Creates or lists tags.'],
            ['git fetch / pull [--rebase] / push [-u] [--force-with-lease]', 'Talks to a simulated origin.'],
            ['git log --oneline [--all] / status / reflog', 'Shows history, state and HEAD\'s movements.'],
          ].map(([a, b]) => <tr key={a}><td><code>{a}</code></td><td>{b}</td></tr>)}
        </tbody></table></div>
        <p>References you can use: branch names, tags, <code>origin/main</code>, short hashes, <code>HEAD</code>, <code>HEAD~2</code>, <code>HEAD^2</code>, and the sandbox-only shortcut of commit letters such as <code>C</code> or <code>C′</code> (type <code>C'</code>).</p>
      </div>
    </div>
  );
}

// ---------------- Table of contents ----------------
export function Contents() {
  const p = useProgress();
  React.useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="page">
      <div className="eyebrow"><b>Contents</b><span>{chapters.length} chapters · {chapters.reduce((s, c) => s + c.topics.length, 0)} syllabus topics</span></div>
      <h1 className="title">Table of contents</h1>
      <p className="lede">Numbers in the grey list under each chapter are the syllabus topics it covers. Closely related topics share a chapter so each one is taught in context.</p>
      {parts.map(pt => (
        <section key={pt.num} className="contents-part">
          <h2><span className="mono" style={{ color: 'var(--muted)', fontSize: 14, marginRight: 10 }}>PART {pt.num}</span>{pt.title}</h2>
          <p>{pt.blurb}</p>
          {pt.chapters.map(c => (
            <div key={c.id} className="contents-ch">
              <span className="n">{String(c.num).padStart(2, '0')}{p.completed.includes(c.id) ? ' ✓' : ''}</span>
              <div>
                <a href={'#ch-' + c.id}>{c.title}</a>
                {c.topics.length > 0 && <ul>{c.topics.map(t => <li key={t}>{/^\d+$/.test(t.split(' ')[0]) ? <><span>{t.split(' ')[0]}</span>{t.split(' ').slice(1).join(' ')}</> : t}</li>)}</ul>}
              </div>
              <span className="m">{c.minutes} min</span>
            </div>
          ))}
          {pt.num === 18 && <div className="contents-ch"><span className="n">—</span><div><a href="#labs">Practical labs</a><ul><li>{labEntries.length} labs</li></ul></div><span className="m" /></div>}
          {pt.num === 19 && <div className="contents-ch"><span className="n">—</span><div><a href="#quizbank">Quiz bank</a><ul><li>{allChapterQuizzes.length + extraQuizDoc.quizzes.length} questions</li></ul></div><span className="m" /></div>}
          {pt.num === 20 && <>
            <div className="contents-ch"><span className="n">—</span><div><a href="#project">Final project</a></div><span className="m" /></div>
            <div className="contents-ch"><span className="n">—</span><div><a href="#assessment">Final assessment</a><ul><li>{assessmentDoc.quizzes.length} questions</li></ul></div><span className="m" /></div>
          </>}
        </section>
      ))}
      <section className="contents-part">
        <h2>Reference</h2>
        <div className="contents-ch"><span className="n">—</span><div><a href="#commands">Command reference</a></div><span className="m" /></div>
        <div className="contents-ch"><span className="n">—</span><div><a href="#cheatsheet">Cheat sheet</a></div><span className="m" /></div>
        <div className="contents-ch"><span className="n">—</span><div><a href="#glossary">Glossary</a></div><span className="m" /></div>
        <div className="contents-ch"><span className="n">—</span><div><a href="#playground">Git sandbox</a></div><span className="m" /></div>
      </section>
    </div>
  );
}
