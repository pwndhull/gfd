import React from 'react';
import type { Block } from '../lib/types';
import { parseQuiz, parseExercise, parseCmd, parsePairs, parseMarkdown } from '../lib/markdown';
import { CodeBlock } from './CodeBlock';
import { Diagram } from './Diagrams';
import { GitVisualizer, Snapshot } from './GitVisualizer';
import { Quiz } from './Quiz';
import { I } from './Icons';

// ---------- Inline ----------
const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*?\*)|(\[[^\]]+\]\([^)\s]+\))/g;

export function Inline({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (m[1]) out.push(<code key={k++}>{t.slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={k++}><Inline text={t.slice(2, -2)} /></strong>);
    else if (m[3]) out.push(<em key={k++}>{t.slice(1, -1)}</em>);
    else if (m[4]) {
      const lm = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!;
      const href = lm[2];
      const ext = /^https?:/.test(href);
      out.push(
        <a key={k++} href={href} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          <Inline text={lm[1]} />
        </a>
      );
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

// ---------- ASCII graph (```graph Caption) ----------
function GraphAscii({ caption, code }: { caption: string; code: string }) {
  const lines = code.split('\n');
  const render = (l: string, i: number) => {
    const parts = l.split(/(\bHEAD\b|\borigin\/[\w./-]+|\b(?:main|master|develop|feature\/[\w-]+|fix\/[\w-]+|hotfix\/[\w.-]+|release\/[\w.-]+|experiment|topic)\b)/g);
    return (
      <React.Fragment key={i}>
        {parts.map((p, j) =>
          p === 'HEAD' ? <span key={j} className="g-head">{p}</span>
            : /^origin\//.test(p) ? <span key={j} className="g-remote">{p}</span>
              : j % 2 === 1 ? <span key={j} className="g-branch">{p}</span>
                : p)}
        {'\n'}
      </React.Fragment>
    );
  };
  return (
    <figure className="graph-fig">
      <figcaption>{caption || 'Diagram'}</figcaption>
      <pre>{lines.map(render)}</pre>
    </figure>
  );
}

// ---------- Command breakdown (```cmd) ----------
const TOK_COLORS = ['var(--lane-0)', 'var(--lane-1)', 'var(--lane-3)', 'var(--lane-2)', 'var(--lane-4)', 'var(--lane-5)'];

function CommandBreakdown({ code }: { code: string }) {
  const { command, parts } = parseCmd(code);
  const colorFor = (i: number) => TOK_COLORS[i % TOK_COLORS.length];
  return (
    <div className="cmdx">
      <div className="cmdx-line" aria-label={command}>
        <span className="prompt">$</span>
        {parts.length ? parts.map(([tok], i) => (
          <span key={i} className="cmdx-tok" style={{ borderColor: colorFor(i), color: '#eef6f3' }}>{tok}</span>
        )) : command}
      </div>
      <div className="cmdx-rows">
        {parts.map(([tok, meaning], i) => (
          <div key={i} className="cmdx-row">
            <code style={{ color: colorFor(i) }}>{tok}</code>
            <span><Inline text={meaning} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Exercise (```exercise Title) ----------
function Exercise({ code, title }: { code: string; title: string }) {
  const ex = parseExercise(code, title);
  const [open, setOpen] = React.useState(false);
  return (
    <div className="exercise">
      <div className="exercise-head"><I.wrench className="" />Exercise</div>
      <div className="exercise-title">{ex.title}</div>
      <div className="prose ex-body"><Markdown blocks={parseMarkdown(ex.task)} /></div>
      {ex.solution && (
        <>
          <button className="btn small sol-toggle" aria-expanded={open} onClick={() => setOpen(o => !o)}>
            <I.eye />{open ? 'Hide solution' : 'Show solution'}
          </button>
          {open && <div className="prose ex-body"><Markdown blocks={parseMarkdown(ex.solution)} /></div>}
        </>
      )}
    </div>
  );
}

// ---------- Definition lists (```terms / ```commands) ----------
function Defs({ code, mono }: { code: string; mono?: boolean }) {
  return (
    <dl className="defs">
      {parsePairs(code).map(([a, b], i) => (
        <div className="d" key={i}>
          <dt>{mono ? <code>{a}</code> : <Inline text={a} />}</dt>
          <dd><Inline text={b} /></dd>
        </div>
      ))}
    </dl>
  );
}

// ---------- Callouts ----------
const CALLOUT: Record<string, { label: string; icon: keyof typeof I }> = {
  tip: { label: 'Tip', icon: 'bulb' },
  note: { label: 'Note', icon: 'info' },
  warning: { label: 'Careful', icon: 'alert' },
  danger: { label: 'Danger', icon: 'alert' },
  analogy: { label: 'Analogy', icon: 'swap' },
  internals: { label: 'Under the hood', icon: 'cpu' },
  mistake: { label: 'Common mistake', icon: 'alert' },
  recover: { label: 'How to recover', icon: 'shield' },
  jargon: { label: 'Jargon', icon: 'book' },
  scenario: { label: 'Real-world scenario', icon: 'flag' },
};

function Callout({ kind, title, children }: { kind: string; title: string; children: Block[] }) {
  if (kind === 'recap') {
    return (
      <section className="recap">
        <h2 id="chapter-review">Chapter review</h2>
        <Markdown blocks={children} />
      </section>
    );
  }
  if (kind === 'solution') {
    return (
      <details className="callout solution">
        <summary><I.eye />{title || 'Show solution'}</summary>
        <div className="callout-body"><Markdown blocks={children} /></div>
      </details>
    );
  }
  const c = CALLOUT[kind] || CALLOUT.note;
  const Icon = I[c.icon];
  return (
    <aside className={`callout ${kind}`}>
      <div className="callout-head">
        <Icon />
        <span>{c.label}</span>
        {title && <span className={'callout-title' + (kind === 'jargon' ? ' jargon-term' : '')}>{kind === 'jargon' ? `“${title}”` : title}</span>}
      </div>
      <div className="callout-body"><Markdown blocks={children} /></div>
    </aside>
  );
}

// ---------- Blocks ----------
function renderCode(b: Extract<Block, { t: 'code' }>, key: number) {
  switch (b.lang) {
    case 'quiz': return <QuizBlock key={key} code={b.code} />;
    case 'exercise': return <Exercise key={key} code={b.code} title={b.meta} />;
    case 'cmd': return <CommandBreakdown key={key} code={b.code} />;
    case 'terms': return <Defs key={key} code={b.code} />;
    case 'commands': return <Defs key={key} code={b.code} mono />;
    case 'diagram': return <Diagram key={key} name={b.meta || b.code.trim()} caption={b.meta && b.code.trim() ? b.code.trim() : undefined} />;
    case 'viz': return <GitVisualizer key={key} preset={b.meta || b.code.trim()} />;
    default: return <CodeBlock key={key} lang={b.lang} meta={b.meta} code={b.code} />;
  }
}

const isFigure = (b: Block) => b.t === 'code' && (b.lang === 'graph' || b.lang === 'snap');

export function Markdown({ blocks }: { blocks: Block[] }) {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (isFigure(b)) {
      const group: Block[] = [];
      while (i < blocks.length && isFigure(blocks[i])) group.push(blocks[i++]);
      i--;
      out.push(
        <div className="graphs" key={'g' + i}>
          {group.map((g, j) => {
            const gb = g as Extract<Block, { t: 'code' }>;
            return gb.lang === 'snap'
              ? <Snapshot key={j} caption={gb.meta} script={gb.code} />
              : <GraphAscii key={j} caption={gb.meta} code={gb.code} />;
          })}
        </div>
      );
      continue;
    }
    switch (b.t) {
      case 'h': {
        const Tag = (`h${Math.min(4, Math.max(2, b.level))}`) as 'h2';
        out.push(<Tag key={i} id={b.id}><Inline text={b.text} /></Tag>);
        break;
      }
      case 'p': out.push(<p key={i}><Inline text={b.text} /></p>); break;
      case 'ul': {
        const isTask = b.items.every(it => /^\[[ xX]\] /.test(it));
        out.push(
          <ul key={i} className={isTask ? 'task-list' : undefined}>
            {b.items.map((it, j) => {
              const m = it.match(/^\[([ xX])\] (.*)$/);
              return m
                ? <li key={j}><span className={'task-box' + (m[1] !== ' ' ? ' on' : '')} aria-hidden="true" /><Inline text={m[2]} /></li>
                : <li key={j}><Inline text={it} /></li>;
            })}
          </ul>
        );
        break;
      }
      case 'ol': out.push(<ol key={i} start={b.start}>{b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ol>); break;
      case 'hr': out.push(<hr key={i} />); break;
      case 'table':
        out.push(
          <div className="table-wrap" key={i}>
            <table>
              <thead><tr>{b.head.map((h, j) => <th key={j}><Inline text={h} /></th>)}</tr></thead>
              <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}><Inline text={c} /></td>)}</tr>)}</tbody>
            </table>
          </div>
        );
        break;
      case 'callout': out.push(<Callout key={i} kind={b.kind} title={b.title} children={b.children} />); break;
      case 'code': out.push(renderCode(b, i)); break;
    }
  }
  return <>{out}</>;
}

/** Sets the quiz id prefix (the chapter or page id) used by quizzes inside it. */
const QuizPrefix = React.createContext('q');
export function QuizScope({ prefix, children }: { prefix: string; children: React.ReactNode }) {
  return <QuizPrefix.Provider value={prefix}>{children}</QuizPrefix.Provider>;
}
function QuizBlock({ code }: { code: string }) {
  const prefix = React.useContext(QuizPrefix);
  const qs = React.useMemo(() => parseQuiz(code, prefix), [code, prefix]);
  return <Quiz questions={qs} />;
}
