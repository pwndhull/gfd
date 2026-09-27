import React from 'react';

// Hand-drawn explanatory diagrams. All colors come from theme tokens (see .dg-* in styles.css).

type Tone = '' | 'accent' | 'info' | 'head' | 'danger' | 'muted';

function Markers({ id }: { id: string }) {
  const tones: Tone[] = ['', 'accent', 'info', 'head', 'danger'];
  return (
    <defs>
      {tones.map(t => (
        <marker key={t || 'ink'} id={`${id}-${t || 'ink'}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className={`dg-fill-${t || 'ink'}`} />
        </marker>
      ))}
    </defs>
  );
}

const Ctx = React.createContext('dg');

function Box({ x, y, w, h, title, sub, tone = '', dashed, mono, align = 'middle' }: {
  x: number; y: number; w: number; h: number; title?: string; sub?: string | string[]; tone?: Tone; dashed?: boolean; mono?: boolean; align?: 'middle' | 'start';
}) {
  const subs = Array.isArray(sub) ? sub : sub ? [sub] : [];
  const tx = align === 'middle' ? x + w / 2 : x + 14;
  const total = (title ? 18 : 0) + subs.length * 16;
  let ty = y + h / 2 - total / 2 + 13;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={9} className={`dg-box ${tone} ${dashed ? 'dashed' : ''}`} />
      {title && <text x={tx} y={ty} textAnchor={align} className={mono ? 'dg-label' : 'dg-title'}>{title}</text>}
      {subs.map((s, i) => (
        <text key={i} x={tx} y={ty + (title ? 18 : 0) + i * 16} textAnchor={align} className="dg-sub">{s}</text>
      ))}
    </g>
  );
}

function Arrow({ d, x1, y1, x2, y2, label, lx, ly, tone = '', dashed, both, anchor = 'middle' }: {
  d?: string; x1?: number; y1?: number; x2?: number; y2?: number; label?: string; lx?: number; ly?: number; tone?: Tone; dashed?: boolean; both?: boolean; anchor?: 'start' | 'middle' | 'end';
}) {
  const id = React.useContext(Ctx);
  const path = d || `M${x1},${y1} L${x2},${y2}`;
  const m = `url(#${id}-${tone || 'ink'})`;
  return (
    <g>
      <path d={path} className={`dg-arrow ${tone} ${dashed ? 'dashed' : ''}`} markerEnd={m} markerStart={both ? m : undefined} />
      {label && (
        <text x={lx ?? ((x1! + x2!) / 2)} y={ly ?? ((y1! + y2!) / 2 - 8)} textAnchor={anchor} className={`dg-label ${tone ? 'dg-text-' + tone : ''}`}>{label}</text>
      )}
    </g>
  );
}

function Dot({ x, y, label, tone = 'accent', r = 13, ghost }: { x: number; y: number; label?: string; tone?: string; r?: number; ghost?: boolean }) {
  const stroke = tone === 'accent' ? 'var(--lane-0)' : tone === 'info' ? 'var(--lane-1)' : tone === 'pink' ? 'var(--lane-2)' : tone === 'head' ? 'var(--lane-3)' : tone === 'violet' ? 'var(--lane-4)' : 'var(--line-strong)';
  return (
    <g opacity={ghost ? 0.4 : 1}>
      <circle cx={x} cy={y} r={r} fill="var(--surface)" stroke={stroke} strokeWidth={2.5} strokeDasharray={ghost ? '3 3' : undefined} />
      {label && <text x={x} y={y + 4} textAnchor="middle" className="dg-label" style={{ fontWeight: 600 }}>{label}</text>}
    </g>
  );
}

function Pill({ x, y, text, tone = 'accent' }: { x: number; y: number; text: string; tone?: 'accent' | 'head' | 'info' | 'muted' }) {
  const w = text.length * 7.4 + 16;
  return (
    <g>
      <rect x={x - w / 2} y={y - 11} width={w} height={22} rx={11} className={`dg-box ${tone}`} />
      <text x={x} y={y + 4} textAnchor="middle" className="dg-label" style={{ fontWeight: 600 }}>{text}</text>
    </g>
  );
}

function Line({ x1, y1, x2, y2, color = 'var(--lane-0)', dashed }: { x1: number; y1: number; x2: number; y2: number; color?: string; dashed?: boolean }) {
  return <path d={`M${x1},${y1} L${x2},${y2}`} stroke={color} strokeWidth={2.5} fill="none" strokeDasharray={dashed ? '4 4' : undefined} />;
}

function Curve({ x1, y1, x2, y2, color = 'var(--lane-1)' }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const mx = (x1 + x2) / 2;
  return <path d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} stroke={color} strokeWidth={2.5} fill="none" />;
}

// ---------------- Diagrams ----------------

const D: Record<string, { h: number; caption: string; draw: () => React.ReactNode }> = {
  'vcs-models': {
    h: 300,
    caption: 'Centralized systems keep history only on the server. Git is distributed: every clone carries the full history, and a hosting service like GitHub is simply the copy the team agrees to share.',
    draw: () => (
      <>
        <text x={170} y={24} textAnchor="middle" className="dg-title">Centralized (older tools)</text>
        <Box x={95} y={44} w={150} h={62} title="Server" sub="the only full history" tone="danger" />
        {[40, 170, 300].map((x, i) => <Box key={i} x={x - 55} y={196} w={110} h={56} title={`Dev ${i + 1}`} sub="latest files only" tone="muted" />)}
        {[40, 170, 300].map((x, i) => <Arrow key={i} x1={x} y1={194} x2={170 + (x - 170) * 0.35} y2={110} tone="" both />)}
        <text x={170} y={282} textAnchor="middle" className="dg-sub">Server down = nobody can commit or see history</text>

        <path d="M360,20 L360,280" className="dg-line" />

        <text x={545} y={24} textAnchor="middle" className="dg-title">Distributed (Git)</text>
        <Box x={470} y={44} w={150} h={62} title="GitHub" sub="shared copy (origin)" tone="info" />
        {[415, 545, 675].map((x, i) => <Box key={i} x={x - 58} y={196} w={116} h={56} title={`Dev ${i + 1}`} sub="full history" tone="accent" />)}
        {[415, 545, 675].map((x, i) => <Arrow key={i} x1={x} y1={194} x2={545 + (x - 545) * 0.35} y2={110} tone="accent" both />)}
        <text x={545} y={282} textAnchor="middle" className="dg-sub">Commit, branch and view history offline</text>
      </>
    ),
  },

  snapshots: {
    h: 250,
    caption: 'Each commit is a snapshot of the whole project. Files that did not change are not copied again: the new snapshot simply points at the same stored content (dashed).',
    draw: () => (
      <>
        {['Commit A', 'Commit B', 'Commit C'].map((c, i) => {
          const x = 30 + i * 230;
          const files = i === 0 ? [['index.html', 'v1', false], ['style.css', 'v1', false], ['app.js', 'v1', false]]
            : i === 1 ? [['index.html', 'v2', false], ['style.css', 'v1', true], ['app.js', 'v1', true]]
              : [['index.html', 'v2', true], ['style.css', 'v2', false], ['app.js', 'v1', true]];
          return (
            <g key={c}>
              <Box x={x} y={20} w={200} h={200} tone="muted" />
              <text x={x + 16} y={48} className="dg-title">{c}</text>
              <text x={x + 184} y={48} textAnchor="end" className="dg-mono">{['a1f3c09', '7be20d4', 'e4c9b18'][i]}</text>
              {files.map(([f, v, same], j) => (
                <Box key={j} x={x + 14} y={66 + j * 48} w={172} h={38} title={`${f}`} sub={undefined} tone={same ? 'muted' : 'accent'} dashed={!!same} align="start" mono />
              ))}
              {files.map(([, v, same], j) => (
                <text key={'v' + j} x={x + 176} y={90 + j * 48} textAnchor="end" className={same ? 'dg-sub' : 'dg-label dg-text-accent'}>{same ? `same ${v}` : v}</text>
              ))}
              {i < 2 && <Arrow x1={x + 226} y1={120} x2={x + 204} y2={120} tone="" />}
            </g>
          );
        })}
        <text x={360} y={242} textAnchor="middle" className="dg-sub">Arrows point from each commit back to its parent</text>
      </>
    ),
  },

  'three-areas': {
    h: 270,
    caption: 'Changes move left to right: edit files, choose what goes into the next commit with git add, then record it with git commit. The lower arrows move content back the other way.',
    draw: () => (
      <>
        <Box x={20} y={40} w={200} h={120} title="Working directory" sub={['the files you see and edit', 'in your editor']} tone="head" />
        <Box x={260} y={40} w={200} h={120} title="Staging area" sub={['also called the index:', 'the draft of your next commit']} tone="info" />
        <Box x={500} y={40} w={200} h={120} title="Repository" sub={['the .git folder:', 'every commit ever made']} tone="accent" />
        <Arrow x1={222} y1={80} x2={258} y2={80} tone="info" />
        <text x={240} y={30} textAnchor="middle" className="dg-label dg-text-info">git add</text>
        <Arrow x1={462} y1={80} x2={498} y2={80} tone="accent" />
        <text x={480} y={30} textAnchor="middle" className="dg-label dg-text-accent">git commit</text>
        <Arrow d="M600,164 C600,215 360,215 360,166" tone="" dashed />
        <text x={480} y={228} textAnchor="middle" className="dg-label">git restore --staged &lt;file&gt;</text>
        <text x={480} y={244} textAnchor="middle" className="dg-sub">unstage: copy HEAD's version into the index</text>
        <Arrow d="M360,164 C360,215 120,215 120,166" tone="" dashed />
        <text x={240} y={228} textAnchor="middle" className="dg-label">git restore &lt;file&gt;</text>
        <text x={240} y={244} textAnchor="middle" className="dg-sub">discard edits: copy the index version back</text>
      </>
    ),
  },

  architecture: {
    h: 330,
    caption: 'The four places your work can live. Everything except push, fetch, pull and clone happens on your own computer, with no network.',
    draw: () => (
      <>
        <rect x={10} y={10} width={500} height={250} rx={12} className="dg-box muted dashed" />
        <text x={24} y={34} className="dg-sub">YOUR COMPUTER</text>
        <Box x={24} y={80} w={140} h={90} title="Working tree" sub="files on disk" tone="head" />
        <Box x={192} y={80} w={140} h={90} title="Index" sub="staging area" tone="info" />
        <Box x={360} y={80} w={136} h={90} title="Local repo" sub={['commits, branches,', 'origin/* refs']} tone="accent" />
        <Box x={560} y={80} w={150} h={90} title="Remote repo" sub={['e.g. GitHub', 'named "origin"']} tone="info" />
        <Arrow x1={166} y1={110} x2={190} y2={110} tone="info" />
        <text x={178} y={72} textAnchor="middle" className="dg-label">add</text>
        <Arrow x1={334} y1={110} x2={358} y2={110} tone="accent" />
        <text x={346} y={72} textAnchor="middle" className="dg-label">commit</text>
        <Arrow x1={498} y1={105} x2={558} y2={105} tone="accent" />
        <text x={528} y={97} textAnchor="middle" className="dg-label">push</text>
        <Arrow x1={558} y1={140} x2={498} y2={140} tone="info" />
        <text x={528} y={158} textAnchor="middle" className="dg-label">fetch</text>
        <Arrow d="M430,172 C430,220 94,220 94,172" tone="" />
        <text x={262} y={236} textAnchor="middle" className="dg-label">switch / restore / merge update your files</text>
        <Arrow d="M635,172 C635,300 94,300 94,262" tone="head" dashed />
        <text x={400} y={296} textAnchor="middle" className="dg-label dg-text-head">pull = fetch + merge (or rebase) into your branch and files</text>
        <text x={635} y={200} textAnchor="middle" className="dg-sub">clone = copy all of it</text>
        <text x={635} y={216} textAnchor="middle" className="dg-sub">once, to start</text>
      </>
    ),
  },

  'local-remote': {
    h: 300,
    caption: 'origin/main is your repository\'s memory of where main was on the server the last time you talked to it. It only changes when you fetch, pull or push.',
    draw: () => (
      <>
        <Box x={250} y={14} w={220} h={70} title="GitHub (origin)" sub="main → C" tone="info" />
        <rect x={20} y={130} width={320} height={150} rx={12} className="dg-box muted" />
        <text x={36} y={156} className="dg-title">Your laptop</text>
        <Pill x={100} y={196} text="main → D" tone="accent" />
        <Pill x={100} y={240} text="origin/main → C" tone="info" />
        <text x={200} y={200} className="dg-sub">your branch (1 commit ahead)</text>
        <text x={200} y={244} className="dg-sub">last known server state</text>
        <rect x={380} y={130} width={320} height={150} rx={12} className="dg-box muted" />
        <text x={396} y={156} className="dg-title">Teammate's laptop</text>
        <Pill x={460} y={196} text="main → C" tone="accent" />
        <Pill x={470} y={240} text="origin/main → B" tone="info" />
        <text x={540} y={200} className="dg-sub">not pulled yet</text>
        <text x={560} y={244} className="dg-sub">stale: fetch updates it</text>
        <Arrow x1={180} y1={128} x2={280} y2={88} tone="accent" label="push" lx={206} ly={100} />
        <Arrow x1={440} y1={88} x2={530} y2={128} tone="info" label="fetch / pull" lx={516} ly={100} />
      </>
    ),
  },

  head: {
    h: 220,
    caption: 'HEAD answers "where am I?". Normally it points to a branch, and the branch points to a commit. When you commit, the branch HEAD points to moves forward.',
    draw: () => (
      <>
        <Line x1={80} y1={150} x2={400} y2={150} />
        {['A', 'B', 'C'].map((l, i) => <Dot key={l} x={80 + i * 160} y={150} label={l} />)}
        <Curve x1={400} y1={150} x2={560} y2={90} />
        <Dot x={560} y={90} label="D" tone="info" />
        <Pill x={400} y={196} text="main" tone="accent" />
        <Arrow x1={400} y1={184} x2={400} y2={166} tone="accent" />
        <Pill x={400} y={40} text="HEAD" tone="head" />
        <Arrow d="M400,52 L400,72 C400,88 400,110 400,134" tone="head" />
        <text x={416} y={100} className="dg-label dg-text-head">HEAD → main</text>
        <Pill x={640} y={90} text="feature" tone="info" />
        <Arrow x1={606} y1={90} x2={576} y2={90} tone="info" />
        <text x={80} y={200} textAnchor="middle" className="dg-sub">oldest</text>
      </>
    ),
  },

  'detached-head': {
    h: 200,
    caption: 'Detached HEAD: HEAD points straight at a commit instead of a branch. Safe for looking around. New commits made here belong to no branch until you create one.',
    draw: () => (
      <>
        <Line x1={80} y1={130} x2={480} y2={130} />
        {['A', 'B', 'C', 'D'].map((l, i) => <Dot key={l} x={80 + i * 133} y={130} label={l} />)}
        <Pill x={480} y={176} text="main" tone="accent" />
        <Arrow x1={480} y1={164} x2={480} y2={146} tone="accent" />
        <Pill x={213} y={40} text="HEAD" tone="head" />
        <Arrow x1={213} y1={52} x2={213} y2={114} tone="head" />
        <text x={230} y={86} className="dg-label dg-text-head">git checkout B (or git switch --detach B)</text>
        <Line x1={213} y1={130} x2={340} y2={70} color="var(--lane-3)" dashed />
        <Dot x={340} y={70} label="E" tone="head" ghost />
        <text x={360} y={62} className="dg-sub">a commit made here has no branch label</text>
      </>
    ),
  },

  'fetch-pull': {
    h: 330,
    caption: 'fetch downloads new commits and moves origin/main, but never touches your branch or files. pull does a fetch and then integrates origin/main into your current branch.',
    draw: () => (
      <>
        <text x={20} y={26} className="dg-title">git fetch</text>
        <Line x1={60} y1={80} x2={300} y2={80} />
        {['A', 'B', 'C'].map((l, i) => <Dot key={l} x={60 + i * 120} y={80} label={l} />)}
        <Line x1={300} y1={80} x2={420} y2={80} color="var(--lane-1)" />
        <Dot x={420} y={80} label="D" tone="info" />
        <Pill x={300} y={122} text="main" tone="accent" />
        <Pill x={420} y={40} text="origin/main" tone="info" />
        <Arrow x1={420} y1={52} x2={420} y2={64} tone="info" />
        <text x={470} y={84} className="dg-sub">origin/main moved to D</text>
        <text x={470} y={102} className="dg-sub">main and your files did not change</text>

        <path d="M20,160 L700,160" className="dg-line" />

        <text x={20} y={190} className="dg-title">git pull</text>
        <Line x1={60} y1={250} x2={420} y2={250} />
        {['A', 'B', 'C', 'D'].map((l, i) => <Dot key={l} x={60 + i * 120} y={250} label={l} />)}
        <Pill x={420} y={292} text="main" tone="accent" />
        <Pill x={420} y={210} text="origin/main" tone="info" />
        <Arrow x1={420} y1={222} x2={420} y2={234} tone="info" />
        <Arrow x1={420} y1={280} x2={420} y2={266} tone="accent" />
        <text x={470} y={246} className="dg-sub">fetch, then merge origin/main into main</text>
        <text x={470} y={264} className="dg-sub">(here a fast-forward: main slides to D)</text>
      </>
    ),
  },

  push: {
    h: 260,
    caption: 'push uploads commits the server does not have and moves the server\'s branch. If the server has commits you do not have, the push is rejected rather than losing them.',
    draw: () => (
      <>
        <text x={20} y={30} className="dg-title">Your repository</text>
        <Line x1={60} y1={80} x2={420} y2={80} />
        {['A', 'B', 'C', 'D'].map((l, i) => <Dot key={l} x={60 + i * 120} y={80} label={l} />)}
        <Pill x={420} y={40} text="main" tone="accent" />
        <text x={20} y={150} className="dg-title">GitHub before push</text>
        <Line x1={60} y1={196} x2={300} y2={196} />
        {['A', 'B', 'C'].map((l, i) => <Dot key={l} x={60 + i * 120} y={196} label={l} />)}
        <Line x1={300} y1={196} x2={420} y2={196} color="var(--lane-0)" dashed />
        <Dot x={420} y={196} label="D" ghost />
        <Pill x={300} y={236} text="main" tone="info" />
        <Arrow d="M460,86 C560,110 560,170 440,192" tone="accent" />
        <text x={560} y={142} className="dg-label dg-text-accent">git push</text>
        <text x={560} y={160} className="dg-sub">sends D, moves</text>
        <text x={560} y={176} className="dg-sub">GitHub's main to D</text>
      </>
    ),
  },

  'reset-modes': {
    h: 250,
    caption: 'All three modes move the current branch to the target commit. They differ in whether they also overwrite the staging area and your working files.',
    draw: () => {
      const cols = ['Branch + HEAD', 'Staging area', 'Working directory'];
      const rows: [string, boolean[], string][] = [
        ['--soft', [true, false, false], 'changes stay staged'],
        ['--mixed (default)', [true, true, false], 'changes kept, unstaged'],
        ['--hard', [true, true, true], 'uncommitted changes destroyed'],
      ];
      return (
        <>
          {cols.map((c, i) => <text key={c} x={300 + i * 140} y={30} textAnchor="middle" className="dg-title" style={{ fontSize: 13.5 }}>{c}</text>)}
          {rows.map(([name, cells, note], r) => (
            <g key={name}>
              <text x={20} y={86 + r * 64} className="dg-label" style={{ fontSize: 14 }}>git reset {name}</text>
              <text x={20} y={104 + r * 64} className={r === 2 ? 'dg-sub dg-text-danger' : 'dg-sub'}>{note}</text>
              {cells.map((on, i) => (
                <g key={i}>
                  <rect x={240 + i * 140} y={62 + r * 64} width={120} height={46} rx={8} className={`dg-box ${on ? (r === 2 && i === 2 ? 'danger' : 'accent') : 'muted'}`} />
                  <text x={300 + i * 140} y={90 + r * 64} textAnchor="middle" className={on ? 'dg-label' : 'dg-sub'} style={{ fontWeight: on ? 600 : 400 }}>{on ? (i === 0 ? 'moved' : 'reset to target') : 'untouched'}</text>
                </g>
              ))}
            </g>
          ))}
        </>
      );
    },
  },

  conflict: {
    h: 300,
    caption: 'Anatomy of a conflict. Git writes both versions into the file between markers. You edit the file into the version you want, delete all three marker lines, then git add it.',
    draw: () => {
      const lines = [
        ['function greet(user) {', ''],
        ['<<<<<<< HEAD', 'm'],
        ['  return "Hello, " + user.name;', 'a'],
        ['=======', 'm'],
        ['  return `Hi ${user.firstName}!`;', 'b'],
        ['>>>>>>> feature/greeting', 'm'],
        ['}', ''],
      ];
      return (
        <>
          <rect x={20} y={20} width={420} height={260} rx={10} fill="var(--code-bg)" />
          {lines.map(([t, k], i) => (
            <g key={i}>
              {k === 'a' && <rect x={20} y={62 + i * 30} width={420} height={28} fill="var(--head)" opacity={0.18} />}
              {k === 'b' && <rect x={20} y={62 + i * 30} width={420} height={28} fill="var(--info)" opacity={0.2} />}
              <text x={38} y={82 + i * 30} style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, fill: k === 'm' ? '#f3b560' : '#dbe7e3', fontWeight: k === 'm' ? 600 : 400 }}>{t}</text>
            </g>
          ))}
          <Arrow x1={560} y1={110} x2={446} y2={107} tone="head" />
          <text x={570} y={106} className="dg-label dg-text-head">start of YOUR side</text>
          <text x={570} y={122} className="dg-sub">(HEAD = branch you are on)</text>
          <Arrow x1={560} y1={168} x2={446} y2={167} tone="" />
          <text x={570} y={172} className="dg-label">divider</text>
          <Arrow x1={560} y1={228} x2={446} y2={227} tone="info" />
          <text x={570} y={224} className="dg-label dg-text-info">end of THEIR side</text>
          <text x={570} y={240} className="dg-sub">(the branch being merged in)</text>
        </>
      );
    },
  },

  'pr-workflow': {
    h: 250,
    caption: 'A typical pull request loop. Review and CI can send you back to commit more changes as many times as needed before the merge.',
    draw: () => {
      const steps = [['Branch', 'switch -c'], ['Commit', 'small steps'], ['Push', 'push -u'], ['Open PR', 'describe why'], ['Review + CI', 'checks run'], ['Merge', 'into main'], ['Clean up', 'delete branch']];
      return (
        <>
          {steps.map(([t, s], i) => {
            const x = 12 + i * 101;
            const tone: Tone = i === 4 ? 'info' : i === 5 ? 'accent' : 'muted';
            return (
              <g key={t}>
                <Box x={x} y={60} w={88} h={70} title={t} sub={s} tone={tone} />
                {i < steps.length - 1 && <Arrow x1={x + 89} y1={95} x2={x + 100} y2={95} />}
              </g>
            );
          })}
          <Arrow d="M460,132 C460,200 158,200 158,132" tone="head" dashed />
          <text x={309} y={206} textAnchor="middle" className="dg-label dg-text-head">changes requested → commit fixes → push again (PR updates itself)</text>
          <text x={360} y={36} textAnchor="middle" className="dg-sub">Your laptop: steps 1–3 · GitHub: steps 4–7</text>
        </>
      );
    },
  },

  objects: {
    h: 300,
    caption: 'Git\'s object model. A commit points to one tree (the project root) and to its parent commits. Trees list names and point to blobs (file contents) or other trees (folders).',
    draw: () => (
      <>
        <Box x={20} y={110} w={160} h={90} title="commit" sub={['e4c9b18', 'tree, parent, author,', 'message']} tone="head" />
        <Box x={20} y={10} w={160} h={60} title="parent commit" sub="7be20d4" tone="muted" dashed />
        <Arrow x1={100} y1={108} x2={100} y2={72} tone="" />
        <Box x={250} y={115} w={150} h={80} title="tree" sub={['9f1a3c2', 'project root']} tone="info" />
        <Arrow x1={182} y1={155} x2={248} y2={155} tone="" />
        <Box x={480} y={20} w={220} h={52} title="blob  README.md" sub="3b18e51 · file bytes" tone="accent" align="start" />
        <Box x={480} y={90} w={220} h={52} title="blob  package.json" sub="c07a1e4 · file bytes" tone="accent" align="start" />
        <Box x={480} y={160} w={220} h={52} title="tree  src/" sub="5d2f90b · a folder" tone="info" align="start" />
        <Box x={480} y={232} w={220} h={52} title="blob  src/app.js" sub="a91be03 · file bytes" tone="accent" align="start" />
        <Arrow x1={402} y1={140} x2={478} y2={48} />
        <Arrow x1={402} y1={150} x2={478} y2={116} />
        <Arrow x1={402} y1={165} x2={478} y2={186} />
        <Arrow d="M700,212 C730,230 730,250 702,258" />
      </>
    ),
  },

  stash: {
    h: 240,
    caption: 'git stash saves your uncommitted changes onto a stack and cleans your working directory. apply copies them back; pop copies them back and removes the entry.',
    draw: () => (
      <>
        <Box x={20} y={70} w={200} h={100} title="Working directory" sub={['half-finished edits', 'to login.js, api.js']} tone="head" />
        <rect x={420} y={30} width={280} height={180} rx={12} className="dg-box muted" />
        <text x={436} y={54} className="dg-title">Stash stack</text>
        <Box x={436} y={70} w={248} h={40} title="stash@{0}  WIP on feature/login" tone="accent" align="start" mono />
        <Box x={436} y={116} w={248} h={40} title="stash@{1}  WIP on main" tone="muted" align="start" mono />
        <Box x={436} y={162} w={248} h={40} title="stash@{2}  older…" tone="muted" align="start" mono />
        <Arrow x1={222} y1={100} x2={432} y2={90} tone="accent" label="git stash" lx={320} ly={84} />
        <Arrow x1={432} y1={130} x2={222} y2={140} tone="info" label="git stash pop / apply" lx={320} ly={160} />
      </>
    ),
  },

  gitflow: {
    h: 300,
    caption: 'GitFlow uses long-lived main and develop branches, plus short-lived feature, release and hotfix branches. Powerful for scheduled releases, heavy for teams that deploy continuously.',
    draw: () => {
      const L = { main: 50, hotfix: 100, release: 150, develop: 200, feature: 260 };
      const col = (n: number) => 110 + n * 56;
      return (
        <>
          {Object.entries(L).map(([k, y]) => <text key={k} x={12} y={y + 4} className="dg-label">{k}</text>)}
          <Line x1={col(0)} y1={L.main} x2={col(10)} y2={L.main} color="var(--lane-0)" />
          <Line x1={col(0)} y1={L.develop} x2={col(10)} y2={L.develop} color="var(--lane-1)" />
          <Curve x1={col(0)} y1={L.main} x2={col(1)} y2={L.develop} color="var(--lane-1)" />
          <Curve x1={col(1)} y1={L.develop} x2={col(2)} y2={L.feature} color="var(--lane-2)" />
          <Line x1={col(2)} y1={L.feature} x2={col(3)} y2={L.feature} color="var(--lane-2)" />
          <Curve x1={col(3)} y1={L.feature} x2={col(4)} y2={L.develop} color="var(--lane-2)" />
          <Curve x1={col(4)} y1={L.develop} x2={col(5)} y2={L.release} color="var(--lane-3)" />
          <Line x1={col(5)} y1={L.release} x2={col(6)} y2={L.release} color="var(--lane-3)" />
          <Curve x1={col(6)} y1={L.release} x2={col(7)} y2={L.main} color="var(--lane-3)" />
          <Curve x1={col(6)} y1={L.release} x2={col(7)} y2={L.develop} color="var(--lane-3)" />
          <Curve x1={col(7)} y1={L.main} x2={col(8)} y2={L.hotfix} color="var(--lane-4)" />
          <Curve x1={col(8)} y1={L.hotfix} x2={col(9)} y2={L.main} color="var(--lane-4)" />
          <Curve x1={col(8)} y1={L.hotfix} x2={col(9)} y2={L.develop} color="var(--lane-4)" />
          <Dot x={col(0)} y={L.main} tone="accent" r={9} />
          <Dot x={col(7)} y={L.main} tone="accent" r={9} />
          <Dot x={col(9)} y={L.main} tone="accent" r={9} />
          <Dot x={col(1)} y={L.develop} tone="info" r={9} />
          <Dot x={col(4)} y={L.develop} tone="info" r={9} />
          <Dot x={col(7)} y={L.develop} tone="info" r={9} />
          <Dot x={col(9)} y={L.develop} tone="info" r={9} />
          <Dot x={col(2)} y={L.feature} tone="pink" r={9} />
          <Dot x={col(3)} y={L.feature} tone="pink" r={9} />
          <Dot x={col(5)} y={L.release} tone="head" r={9} />
          <Dot x={col(6)} y={L.release} tone="head" r={9} />
          <Dot x={col(8)} y={L.hotfix} tone="violet" r={9} />
          <Pill x={col(7)} y={22} text="v1.0" tone="muted" />
          <Pill x={col(9)} y={22} text="v1.0.1" tone="muted" />
        </>
      );
    },
  },

  trunk: {
    h: 200,
    caption: 'Trunk-based development: everyone integrates into main at least daily through small, short-lived branches. Unfinished features hide behind feature flags instead of long branches.',
    draw: () => {
      const y = 110;
      const xs = [60, 140, 220, 300, 380, 460, 540, 620];
      return (
        <>
          <text x={12} y={y + 4} className="dg-label">main</text>
          <Line x1={60} y1={y} x2={660} y2={y} />
          {xs.map(x => <Dot key={x} x={x} y={y} tone="accent" r={9} />)}
          {[[60, 140, 'fix/typo', 50], [220, 300, 'feat/search-ui', 170], [300, 380, 'feat/api-v2', 50], [460, 540, 'fix/cache', 170]].map(([a, b, n, yy]) => (
            <g key={String(n)}>
              <Curve x1={a as number} y1={y} x2={(a as number) + 40} y2={yy as number} color="var(--lane-1)" />
              <Curve x1={(a as number) + 40} y1={yy as number} x2={b as number} y2={y} color="var(--lane-1)" />
              <Dot x={(a as number) + 40} y={yy as number} tone="info" r={8} />
              <text x={(a as number) + 40} y={(yy as number) < y ? (yy as number) - 16 : (yy as number) + 26} textAnchor="middle" className="dg-sub">{n as string}</text>
            </g>
          ))}
          <Pill x={620} y={60} text="deploy" tone="head" />
          <Arrow x1={620} y1={72} x2={620} y2={98} tone="head" />
        </>
      );
    },
  },

  'tracking': {
    h: 190,
    caption: 'Three different things that are easy to confuse: your local branch, your remote-tracking branch, and the branch on the server. Upstream tracking links the first to the second.',
    draw: () => (
      <>
        <Box x={20} y={60} w={200} h={80} title="main" sub={['local branch', 'you commit here']} tone="accent" />
        <Box x={260} y={60} w={200} h={80} title="origin/main" sub={['remote-tracking branch', 'read-only snapshot']} tone="info" />
        <Box x={500} y={60} w={200} h={80} title="main on GitHub" sub={['the real remote branch', 'on the server']} tone="info" dashed />
        <Arrow x1={222} y1={100} x2={258} y2={100} tone="" both />
        <text x={240} y={44} textAnchor="middle" className="dg-label">upstream</text>
        <Arrow x1={462} y1={100} x2={498} y2={100} tone="info" both />
        <text x={480} y={44} textAnchor="middle" className="dg-label">fetch / push</text>
        <text x={360} y={172} textAnchor="middle" className="dg-sub">git status compares main with origin/main — so "up to date" only means "up to date with the last fetch"</text>
      </>
    ),
  },
};

export const DIAGRAM_NAMES = Object.keys(D);

export function Diagram({ name, caption }: { name: string; caption?: string }) {
  const id = React.useId().replace(/:/g, '');
  const d = D[name];
  if (!d) return <p style={{ color: 'var(--danger)' }}>Unknown diagram: {name}</p>;
  return (
    <figure className="diagram">
      <div className="diagram-scroll">
        <svg viewBox={`0 0 720 ${d.h}`} role="img" aria-label={caption || d.caption}>
          <Ctx.Provider value={id}>
            <Markers id={id} />
            {d.draw()}
          </Ctx.Provider>
        </svg>
      </div>
      <figcaption>{caption || d.caption}</figcaption>
    </figure>
  );
}
