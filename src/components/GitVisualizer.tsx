import React from 'react';
import { SimState, run, runScript, reachable, headId, OutLine, emptyState } from '../lib/gitsim';
import { PRESETS } from '../lib/vizPresets';
import { I } from './Icons';

// ---------- Layout ----------
interface Node { id: string; label: string; msg: string; x: number; y: number; lane: number; ghost: boolean; merge: boolean }

const COL = 64, ROW = 72, PADX = 44, PADY = 46;

export function layout(s: SimState) {
  const visible = s.order.filter(id => !s.commits[id].hidden);
  const reach = reachable(s);
  const lane: Record<string, number> = {};
  let lanes = 0;
  const claim = (tip: string | undefined) => {
    if (!tip || lane[tip] !== undefined || s.commits[tip]?.hidden) return;
    const l = lanes++;
    let c: string | undefined = tip;
    while (c && lane[c] === undefined && s.commits[c]) { lane[c] = l; c = s.commits[c].parents[0]; }
  };
  const main = s.branchOrder.filter(b => s.branches[b]);
  main.forEach(b => claim(s.branches[b]));
  Object.keys(s.tracking).forEach(b => claim(s.tracking[b]));
  claim(headId(s));
  Object.values(s.tags).forEach(claim);
  [...visible].reverse().forEach(claim); // unreachable leftovers get their own lanes
  const col: Record<string, number> = {};
  visible.forEach((id, i) => (col[id] = i));
  const nodes: Node[] = visible.map(id => ({
    id, label: s.commits[id].label, msg: s.commits[id].msg,
    x: PADX + col[id] * COL, y: PADY + (lane[id] ?? 0) * ROW, lane: lane[id] ?? 0,
    ghost: !reach.has(id), merge: s.commits[id].parents.length > 1,
  }));
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const edges = nodes.flatMap(n => s.commits[n.id].parents.filter(p => byId[p]).map(p => ({ from: byId[p], to: n })));
  const width = PADX * 2 + Math.max(0, visible.length - 1) * COL + 120;
  const height = PADY + Math.max(1, lanes) * ROW + 10;
  return { nodes, edges, byId, width, height };
}

interface RefLabel { text: string; kind: 'branch' | 'head' | 'remote' | 'tag'; current?: boolean }

function refsFor(s: SimState, id: string): RefLabel[] {
  const out: RefLabel[] = [];
  const cur = 'branch' in s.head ? s.head.branch : null;
  if (!cur && headId(s) === id) out.push({ text: 'HEAD', kind: 'head' });
  for (const b of s.branchOrder) if (s.branches[b] === id) out.push({ text: b === cur ? `HEAD → ${b}` : b, kind: 'branch', current: b === cur });
  for (const b of Object.keys(s.tracking)) if (s.tracking[b] === id) out.push({ text: `origin/${b}`, kind: 'remote' });
  for (const t of Object.keys(s.tags)) if (s.tags[t] === id) out.push({ text: t, kind: 'tag' });
  return out;
}

export function GraphSVG({ state, compact = false }: { state: SimState; compact?: boolean }) {
  const { nodes, edges, width, height } = layout(state);
  if (!nodes.length) {
    return <div style={{ padding: '18px 16px', color: 'var(--muted)', fontSize: 13.5 }}>No commits yet. Your first commit will appear here.</div>;
  }
  const laneColor = (l: number) => `var(--lane-${l % 6})`;
  const refH = 20;
  // Labels sit above nodes on the first lane and below nodes on other lanes.
  const below = (n: Node) => n.lane > 0;
  let shift = 0, extra = 0;
  for (const n of nodes) {
    const k = refsFor(state, n.id).length;
    if (!k) continue;
    if (below(n)) extra = Math.max(extra, n.y + (compact ? 20 : 36) + k * (refH + 3) + 4 - height);
    else shift = Math.max(shift, 20 + refH + (k - 1) * (refH + 3) + 4 - n.y);
  }
  const H = height + shift + extra + (compact ? 0 : 6);
  return (
    <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img"
      aria-label={`Commit graph with ${nodes.length} commits`}>
      <g transform={`translate(0,${shift})`}>
      {edges.map((e, i) => {
        const { from, to } = e;
        const c = laneColor(to.lane === from.lane ? to.lane : Math.max(to.lane, from.lane));
        const d = from.y === to.y
          ? `M${from.x},${from.y} L${to.x},${to.y}`
          : `M${from.x},${from.y} C${from.x + COL * 0.55},${from.y} ${to.x - COL * 0.55},${to.y} ${to.x},${to.y}`;
        return <path key={i} className="edge" d={d} stroke={c} opacity={to.ghost ? 0.35 : 1} strokeDasharray={to.ghost ? '4 4' : undefined} />;
      })}
      {nodes.map(n => {
        const refs = refsFor(state, n.id);
        const c = laneColor(n.lane);
        return (
          <g key={n.id} className={'node' + (n.ghost ? ' ghost' : '')}>
            <title>{`${n.id}  ${n.msg}${n.ghost ? '\n(not on any branch: reachable only through the reflog)' : ''}`}</title>
            {n.merge && <circle cx={n.x} cy={n.y} r={19} fill="none" stroke={c} strokeWidth={1.5} />}
            <circle cx={n.x} cy={n.y} r={15} fill="var(--surface)" stroke={c} />
            <text x={n.x} y={n.y + 0.5} fill="var(--ink)">{n.label}</text>
            {!compact && <text className="sha" x={n.x} y={n.y + 29}>{n.id}</text>}
            {refs.map((r, i) => {
              const w = r.text.length * 6.9 + 14;
              const top = below(n) ? n.y + (compact ? 20 : 36) + i * (refH + 3) : n.y - 20 - refH - i * (refH + 3);
              const fill = r.kind === 'head' || r.current ? 'var(--head-soft)' : r.kind === 'remote' ? 'var(--info-soft)' : r.kind === 'tag' ? 'var(--surface-2)' : 'var(--accent-soft)';
              const stroke = r.kind === 'head' || r.current ? 'var(--head)' : r.kind === 'remote' ? 'var(--info)' : r.kind === 'tag' ? 'var(--line-strong)' : 'var(--accent)';
              return (
                <g key={i} className="ref" transform={`translate(${Math.max(2, n.x - w / 2)},${top})`}>
                  <rect width={w} height={refH} rx={r.kind === 'tag' ? 3 : 10} fill={fill} stroke={stroke} />
                  <text x={7} y={refH / 2 + 0.5} fill="var(--ink)">{r.kind === 'tag' ? '⌂ ' : ''}{r.text}</text>
                </g>
              );
            })}
          </g>
        );
      })}
      </g>
    </svg>
  );
}

export function GraphFrame({ state, compact }: { state: SimState; compact?: boolean }) {
  return (
    <div className="viz-graph">
      <GraphSVG state={state} compact={compact} />
    </div>
  );
}

// ---------- Static snapshot (```snap Caption) ----------
export function Snapshot({ caption, script }: { caption: string; script: string }) {
  const state = React.useMemo(() => runScript(script.split('\n').map(l => l.trim()).filter(Boolean)), [script]);
  return (
    <figure className="graph-fig">
      <figcaption>{caption || 'Commit graph'}</figcaption>
      <GraphFrame state={state} compact />
    </figure>
  );
}

// ---------- Interactive sandbox (```viz preset) ----------
export function GitVisualizer({ preset = 'playground', big = false }: { preset?: string; big?: boolean }) {
  const p = PRESETS[preset] || PRESETS.playground;
  const initial = React.useMemo(() => runScript(p.setup), [preset]);
  const [state, setState] = React.useState<SimState>(initial);
  const [log, setLog] = React.useState<OutLine[]>([]);
  const [input, setInput] = React.useState('');
  const hist = React.useRef<string[]>([]);
  const hIdx = React.useRef(-1);
  const outRef = React.useRef<HTMLDivElement>(null);
  const inputId = React.useId();

  React.useEffect(() => { setState(initial); setLog([]); }, [initial]);
  React.useEffect(() => { outRef.current?.scrollTo({ top: outRef.current.scrollHeight }); }, [log]);

  const exec = (cmd: string) => {
    const c = cmd.trim();
    if (!c) return;
    if (c === 'clear') { setLog([]); return; }
    const r = run(state, c);
    setState(r.state);
    setLog(l => [...l, ...(c.startsWith('@') ? [] : [{ kind: 'cmd' as const, text: c }]), ...r.out].slice(-120));
    hist.current.push(c);
    hIdx.current = hist.current.length;
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { exec(input); setInput(''); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); hIdx.current = Math.max(0, hIdx.current - 1); setInput(hist.current[hIdx.current] || ''); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hIdx.current = Math.min(hist.current.length, hIdx.current + 1); setInput(hist.current[hIdx.current] || ''); }
  };

  const cur = 'branch' in state.head ? state.head.branch : null;
  const hid = headId(state);

  return (
    <section className="viz" aria-label={`Git sandbox: ${p.title}`}>
      <div className="viz-head">
        <span className="viz-title">{p.title}</span>
        <span className="sim-badge" title="Commands run in a simulator inside this page, not in real Git">Simulated Git</span>
        <div className="viz-actions">
          <button className="btn small" onClick={() => { setState(initial); setLog([]); }}><I.reset />Reset</button>
          {!big && <button className="btn small" onClick={() => { setState(emptyState()); setLog([{ kind: 'note', text: 'Empty repository on branch main. Start with: git commit -m "Initial commit"' }]); }}>Empty repo</button>}
        </div>
      </div>
      <p className="viz-intro">{p.intro}</p>
      <GraphFrame state={state} />
      <div className="viz-state">
        <span>HEAD: <b className="h">{cur ? `→ ${cur}` : `detached at ${hid}`}</b></span>
        <span>commit: <b>{hid ? `${state.commits[hid].label} ${hid}` : 'none yet'}</b></span>
        <span>branches: <b>{state.branchOrder.filter(b => state.branches[b]).length}</b></span>
        {Object.keys(state.tags).length > 0 && <span>tags: <b>{Object.keys(state.tags).join(', ')}</b></span>}
      </div>
      <div className="term">
        <div className="term-out" ref={outRef} aria-live="polite">
          {log.length === 0 && <div className="note">Type a git command below, or tap a suggestion. Commit letters (A, B, C′…) work as references here, as well as hashes, branch names and HEAD~1.</div>}
          {log.map((l, i) => <div key={i} className={l.kind}>{l.text}</div>)}
        </div>
        <div className="term-in">
          <label htmlFor={inputId}>$</label>
          <input id={inputId} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
            placeholder='git commit -m "message"' autoCapitalize="off" autoCorrect="off" spellCheck={false} autoComplete="off" />
          <button className="btn small" onClick={() => { exec(input); setInput(''); }} style={{ background: 'transparent', color: 'var(--code-ink)', borderColor: 'var(--code-line)' }}>Run</button>
        </div>
        <div className="suggest">
          {p.try.map(t => (
            <button key={t} className={t.startsWith('@') ? 'sim' : ''} onClick={() => exec(t)}
              title={t.startsWith('@') ? 'Simulator action, not a Git command' : 'Run this command'}>
              {t.startsWith('@teammate') ? `⚑ teammate pushes to ${t.split(' ')[1]}` : t}
            </button>
          ))}
        </div>
      </div>
      <p className="viz-foot">This sandbox simulates Git's commit graph in your browser. It has no files, so it never produces merge conflicts, and nothing you type touches a real repository. Dimmed commits are not on any branch; in real Git they stay recoverable through the reflog until garbage collection.</p>
    </section>
  );
}
