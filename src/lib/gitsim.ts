// A safe, simplified Git simulator. It models commits, branches, tags, HEAD,
// the reflog and one remote ("origin"). It does NOT model files, so it never
// produces merge conflicts; the UI says so. Output wording follows real Git
// where that helps learners recognise messages later.

export interface SimCommit {
  id: string;
  label: string;
  msg: string;
  parents: string[];
  order: number;
  hidden?: boolean; // exists on the server but not fetched yet
}

export type Head = { branch: string } | { detached: string };

export interface SimState {
  commits: Record<string, SimCommit>;
  order: string[];
  branches: Record<string, string>;
  branchOrder: string[];
  tags: Record<string, string>;
  head: Head;
  server: Record<string, string>;     // branches on origin
  tracking: Record<string, string>;   // origin/<name> as last fetched
  upstream: Record<string, string>;   // local branch -> remote branch name
  reflog: { id: string; action: string }[];
  n: number;
  letters: number;
}

export interface OutLine { kind: 'cmd' | 'out' | 'err' | 'note' | 'ok'; text: string }

export function emptyState(): SimState {
  return {
    commits: {}, order: [], branches: {}, branchOrder: ['main'], tags: {}, head: { branch: 'main' },
    server: {}, tracking: {}, upstream: {}, reflog: [], n: 0, letters: 0,
  };
}

const clone = (s: SimState): SimState => JSON.parse(JSON.stringify(s));

function hash7(input: string): string {
  let h1 = 0x811c9dc5, h2 = 0x1234567;
  for (let i = 0; i < input.length; i++) {
    h1 = Math.imul(h1 ^ input.charCodeAt(i), 16777619);
    h2 = Math.imul(h2 + input.charCodeAt(i), 2246822519) ^ (h2 >>> 13);
  }
  return ((h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0')).slice(0, 7);
}

function nextLabel(s: SimState): string {
  const i = s.letters++;
  const L = String.fromCharCode(65 + (i % 26));
  return i < 26 ? L : L + Math.floor(i / 26);
}

export function headId(s: SimState): string | undefined {
  return 'branch' in s.head ? s.branches[s.head.branch] : s.head.detached;
}

function addCommit(s: SimState, msg: string, parents: string[], label?: string, hidden = false): SimCommit {
  s.n++;
  const id = hash7(`${s.n}:${msg}:${parents.join(',')}`);
  const c: SimCommit = { id, label: label || nextLabel(s), msg, parents, order: s.n, hidden };
  s.commits[id] = c;
  s.order.push(id);
  return c;
}

function moveHead(s: SimState, id: string, action: string) {
  if ('branch' in s.head) {
    if (!s.branches[s.head.branch]) s.branchOrder = s.branchOrder.includes(s.head.branch) ? s.branchOrder : [...s.branchOrder, s.head.branch];
    s.branches[s.head.branch] = id;
  } else s.head = { detached: id };
  s.reflog.unshift({ id, action });
}

export function ancestors(s: SimState, id: string | undefined): Set<string> {
  const seen = new Set<string>();
  const stack = id ? [id] : [];
  while (stack.length) {
    const c = stack.pop()!;
    if (seen.has(c) || !s.commits[c]) continue;
    seen.add(c);
    stack.push(...s.commits[c].parents);
  }
  return seen;
}

export function reachable(s: SimState): Set<string> {
  const tips = [...Object.values(s.branches), ...Object.values(s.tags), ...Object.values(s.tracking)];
  const h = headId(s);
  if (h) tips.push(h);
  const all = new Set<string>();
  tips.forEach(t => ancestors(s, t).forEach(x => all.add(x)));
  return all;
}

export function resolve(s: SimState, ref: string): string | null {
  const m = ref.match(/^(.*?)((?:[~^]\d*)*)$/);
  if (!m) return null;
  let base = m[1];
  const suffix = m[2];
  let id: string | undefined;
  if (base === 'HEAD' || base === '@') id = headId(s);
  else if (s.branches[base]) id = s.branches[base];
  else if (base.startsWith('origin/') && s.tracking[base.slice(7)]) id = s.tracking[base.slice(7)];
  else if (s.tags[base]) id = s.tags[base];
  else if (base.length >= 4 && /^[0-9a-f]+$/.test(base)) {
    const hits = Object.keys(s.commits).filter(k => k.startsWith(base) && !s.commits[k].hidden);
    if (hits.length === 1) id = hits[0];
  } else {
    // Simulator convenience: commits can be referred to by their diagram letter (A, B, C′...)
    const want = base.replace(/'/g, '′');
    const hits = s.order.filter(k => s.commits[k].label === want && !s.commits[k].hidden);
    if (hits.length) id = hits[hits.length - 1];
  }
  if (!id) return null;
  const re = /([~^])(\d*)/g;
  let t: RegExpExecArray | null;
  while ((t = re.exec(suffix))) {
    const n = t[2] === '' ? 1 : parseInt(t[2], 10);
    if (t[1] === '~') {
      for (let i = 0; i < n; i++) { id = s.commits[id!]?.parents[0]; if (!id) return null; }
    } else {
      if (n === 0) continue;
      id = s.commits[id!]?.parents[n - 1];
      if (!id) return null;
    }
  }
  return id || null;
}

function tokenize(line: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

function decorate(s: SimState, id: string): string {
  const refs: string[] = [];
  const hb = 'branch' in s.head ? s.head.branch : null;
  if (!hb && headId(s) === id) refs.push('HEAD');
  for (const b of s.branchOrder) if (s.branches[b] === id) refs.push(b === hb ? `HEAD -> ${b}` : b);
  for (const b of Object.keys(s.tracking)) if (s.tracking[b] === id) refs.push(`origin/${b}`);
  for (const t of Object.keys(s.tags)) if (s.tags[t] === id) refs.push(`tag: ${t}`);
  return refs.length ? ` (${refs.join(', ')})` : '';
}

function commitsToReplay(s: SimState, from: string, onto: string): string[] {
  const base = ancestors(s, onto);
  const list: string[] = [];
  let cur: string | undefined = from;
  while (cur && !base.has(cur)) {
    const c: SimCommit = s.commits[cur];
    if (c.parents.length < 2) list.push(cur); // rebase drops merge commits by default
    cur = c.parents[0];
  }
  return list.reverse();
}

export interface RunResult { state: SimState; out: OutLine[] }

export function run(prev: SimState, input: string): RunResult {
  const s = clone(prev);
  const out: OutLine[] = [];
  const say = (text: string, kind: OutLine['kind'] = 'out') => out.push({ kind, text });
  const tokens = tokenize(input.trim());
  if (!tokens.length) return { state: prev, out };

  // Simulator-only helpers (not Git commands)
  if (tokens[0] === '@teammate') {
    const b = tokens[1] || 'main';
    const msg = tokens.slice(2).join(' ') || 'Teammate change';
    const parent = s.server[b];
    const c = addCommit(s, msg, parent ? [parent] : [], undefined, true);
    s.server[b] = c.id;
    say(`A teammate pushed "${msg}" to origin/${b}. Your repository does not know yet: run git fetch or git pull.`, 'note');
    return { state: s, out };
  }
  if (tokens[0] === '@publish') {
    for (const b of Object.keys(s.branches)) { s.server[b] = s.branches[b]; s.tracking[b] = s.branches[b]; s.upstream[b] = b; }
    return { state: s, out };
  }

  if (tokens[0] !== 'git') {
    say(`This sandbox only understands git commands. Try: git log --oneline`, 'err');
    return { state: prev, out };
  }
  const [, cmd, ...args] = tokens;
  const flags = new Set(args.filter(a => a.startsWith('-')));
  const takesValue = ['commit', 'tag', 'revert', 'merge', 'cherry-pick'].includes(cmd);
  const pos = args.filter((a, i) => !a.startsWith('-') && !(takesValue && i > 0 && args[i - 1] === '-m'));
  const hid = headId(s);
  const curBranch = 'branch' in s.head ? s.head.branch : null;

  const needCommit = () => {
    if (!hid) { say(`fatal: your current branch '${curBranch}' does not have any commits yet`, 'err'); return false; }
    return true;
  };

  switch (cmd) {
    case 'commit': {
      const mi = args.indexOf('-m');
      const msg = mi >= 0 ? args[mi + 1] : undefined;
      if (flags.has('--amend')) {
        if (!needCommit()) break;
        const old = s.commits[hid!];
        const c = addCommit(s, msg || old.msg, old.parents, old.label + '′');
        moveHead(s, c.id, `commit (amend): ${c.msg}`);
        say(`[${curBranch || 'detached HEAD'} ${c.id}] ${c.msg}`);
        say(`Amend made a NEW commit ${c.label} (${c.id}). The old commit ${old.label} still exists but nothing points to it now.`, 'note');
        break;
      }
      if (!msg) { say('In real Git, "git commit" without -m opens your text editor for the message. Here, add -m "your message".', 'note'); break; }
      const c = addCommit(s, msg, hid ? [hid] : []);
      moveHead(s, c.id, `commit${hid ? '' : ' (initial)'}: ${msg}`);
      say(`[${curBranch || 'detached HEAD'}${hid ? '' : ' (root-commit)'} ${c.id}] ${msg}`);
      break;
    }
    case 'branch': {
      if (!args.length || flags.has('-a') || flags.has('-v') || flags.has('-vv')) {
        for (const b of s.branchOrder) if (s.branches[b]) say(`${b === curBranch ? '* ' : '  '}${b}${flags.has('-v') || flags.has('-vv') ? '  ' + s.branches[b] + ' ' + s.commits[s.branches[b]].msg : ''}`);
        if (!curBranch) say(`* (HEAD detached at ${hid})`);
        if (flags.has('-a')) for (const b of Object.keys(s.tracking)) say(`  remotes/origin/${b}`);
        break;
      }
      if (flags.has('-d') || flags.has('-D')) {
        const name = pos[0];
        if (!s.branches[name]) { say(`error: branch '${name}' not found`, 'err'); break; }
        if (name === curBranch) { say(`error: cannot delete branch '${name}' used by worktree (it is checked out). Switch to another branch first.`, 'err'); break; }
        if (flags.has('-d') && hid && !ancestors(s, hid).has(s.branches[name])) {
          say(`error: the branch '${name}' is not fully merged.`, 'err');
          say(`If you are sure you want to delete it, run 'git branch -D ${name}'.`, 'err');
          break;
        }
        const id = s.branches[name];
        delete s.branches[name];
        s.branchOrder = s.branchOrder.filter(b => b !== name);
        say(`Deleted branch ${name} (was ${id}).`);
        break;
      }
      if (flags.has('-m') || flags.has('-M')) {
        const [a, b] = pos.length === 2 ? pos : [curBranch!, pos[0]];
        if (!a || !s.branches[a]) { say(`error: refname '${a}' not found`, 'err'); break; }
        if (s.branches[b] && !flags.has('-M')) { say(`fatal: a branch named '${b}' already exists`, 'err'); break; }
        s.branches[b] = s.branches[a];
        delete s.branches[a];
        s.branchOrder = s.branchOrder.map(x => (x === a ? b : x));
        if (curBranch === a) s.head = { branch: b };
        say(`Renamed '${a}' to '${b}'.`, 'ok');
        break;
      }
      const name = pos[0];
      if (!needCommit()) break;
      if (s.branches[name]) { say(`fatal: a branch named '${name}' already exists`, 'err'); break; }
      const start = pos[1] ? resolve(s, pos[1]) : hid!;
      if (!start) { say(`fatal: not a valid object name: '${pos[1]}'`, 'err'); break; }
      s.branches[name] = start;
      s.branchOrder.push(name);
      say(`Created branch ${name} at ${start}. HEAD did not move: you are still on ${curBranch || 'a detached HEAD'}.`, 'note');
      break;
    }
    case 'switch':
    case 'checkout': {
      const create = flags.has('-c') || flags.has('-b') || flags.has('-C') || flags.has('-B');
      if (cmd === 'switch' && (flags.has('-b'))) { say(`error: unknown switch 'b'. Use git switch -c <name>, or git checkout -b <name>.`, 'err'); break; }
      if (cmd === 'checkout' && flags.has('-c')) { say(`error: unknown switch 'c'. Use git checkout -b <name>, or git switch -c <name>.`, 'err'); break; }
      if (create) {
        const name = pos[0];
        if (!name) { say('fatal: missing branch name', 'err'); break; }
        if (!needCommit()) break;
        if (s.branches[name]) { say(`fatal: a branch named '${name}' already exists`, 'err'); break; }
        const start = pos[1] ? resolve(s, pos[1]) : hid!;
        if (!start) { say(`fatal: invalid reference: ${pos[1]}`, 'err'); break; }
        s.branches[name] = start;
        s.branchOrder.push(name);
        s.head = { branch: name };
        s.reflog.unshift({ id: start, action: `checkout: moving from ${curBranch || hid} to ${name}` });
        say(`Switched to a new branch '${name}'`);
        break;
      }
      const target = pos[0];
      if (!target) { say('fatal: you must specify a branch', 'err'); break; }
      if (target === '-') { say('The sandbox does not track the previous branch. Name the branch instead.', 'note'); break; }
      if (s.branches[target] && !flags.has('--detach')) {
        if (curBranch === target) { say(`Already on '${target}'`); break; }
        s.head = { branch: target };
        s.reflog.unshift({ id: s.branches[target], action: `checkout: moving from ${curBranch || hid} to ${target}` });
        say(`Switched to branch '${target}'`);
        break;
      }
      // remote branch with the same name: create a local tracking branch (DWIM)
      if (!s.branches[target] && s.tracking[target] && !flags.has('--detach')) {
        s.branches[target] = s.tracking[target];
        s.branchOrder.push(target);
        s.upstream[target] = target;
        s.head = { branch: target };
        say(`branch '${target}' set up to track 'origin/${target}'.`);
        say(`Switched to a new branch '${target}'`);
        break;
      }
      const id = resolve(s, target);
      if (!id) { say(`error: pathspec '${target}' did not match any file(s) known to git`, 'err'); break; }
      if (cmd === 'switch' && !flags.has('--detach')) {
        say(`fatal: a branch is expected, got commit '${target}'`, 'err');
        say(`hint: If you want to detach HEAD at the commit, try again with the --detach option.`, 'err');
        break;
      }
      s.head = { detached: id };
      s.reflog.unshift({ id, action: `checkout: moving from ${curBranch || hid} to ${target}` });
      say(`Note: switching to '${target}'.`);
      say(`You are in 'detached HEAD' state. You can look around and make experimental commits. If you want to keep them, create a branch before switching away: git switch -c <new-branch-name>`);
      say(`HEAD is now at ${id} ${s.commits[id].msg}`);
      break;
    }
    case 'merge': {
      if (!needCommit()) break;
      if (flags.has('--abort')) { say('The sandbox has no file contents, so merges never stop on a conflict here. In real Git, git merge --abort restores the state from before the merge.', 'note'); break; }
      const target = pos[0];
      const tid = target ? resolve(s, target) : null;
      if (!tid) { say(`merge: ${target} - not something we can merge`, 'err'); break; }
      const mine = ancestors(s, hid);
      if (mine.has(tid)) { say('Already up to date.'); break; }
      const theirs = ancestors(s, tid);
      if (theirs.has(hid!) && !flags.has('--no-ff')) {
        moveHead(s, tid, `merge ${target}: Fast-forward`);
        say(`Updating ${hid}..${tid}`);
        say('Fast-forward');
        say(`No new commit was created. ${curBranch || 'HEAD'} simply moved forward to ${s.commits[tid].label}.`, 'note');
        break;
      }
      if (flags.has('--ff-only')) { say('fatal: Not possible to fast-forward, aborting.', 'err'); break; }
      const msg = `Merge ${target.startsWith('origin/') ? 'remote-tracking ' : ''}branch '${target}'${curBranch && curBranch !== 'main' ? ` into ${curBranch}` : ''}`;
      const c = addCommit(s, msg, [hid!, tid]);
      moveHead(s, c.id, `merge ${target}: Merge made by the 'ort' strategy.`);
      say(`Merge made by the 'ort' strategy.`);
      say(`Created merge commit ${c.label} (${c.id}) with two parents: ${s.commits[hid!].label} and ${s.commits[tid].label}.`, 'note');
      break;
    }
    case 'rebase': {
      if (!needCommit()) break;
      if (flags.has('-i') || flags.has('--interactive')) { say('Interactive rebase opens an editor with a todo list. The sandbox cannot show that; see the Interactive rebase chapter. Plain git rebase <branch> works here.', 'note'); break; }
      if (flags.has('--abort') || flags.has('--continue')) { say('No rebase in progress (the sandbox never stops for conflicts).', 'note'); break; }
      const upstreamRef = pos[0] || (curBranch && s.upstream[curBranch] ? 'origin/' + s.upstream[curBranch] : '');
      const up = upstreamRef ? resolve(s, upstreamRef) : null;
      if (!up) { say(`fatal: invalid upstream '${upstreamRef}'`, 'err'); break; }
      if (ancestors(s, hid).has(up)) { say(`Current branch ${curBranch || 'HEAD'} is up to date.`); break; }
      if (ancestors(s, up).has(hid!)) {
        moveHead(s, up, `rebase: fast-forward to ${upstreamRef}`);
        say(`Successfully rebased and updated ${curBranch ? 'refs/heads/' + curBranch : 'HEAD'}.`);
        say('Your branch had no commits of its own, so it just moved forward.', 'note');
        break;
      }
      const list = commitsToReplay(s, hid!, up);
      let tip = up;
      const made: string[] = [];
      for (const id of list) {
        const old = s.commits[id];
        const c = addCommit(s, old.msg, [tip], old.label.replace(/′*$/, '') + '′'.repeat((old.label.match(/′/g) || []).length + 1));
        tip = c.id;
        made.push(`${old.label} → ${c.label}`);
      }
      moveHead(s, tip, `rebase (finish): returning to ${curBranch ? 'refs/heads/' + curBranch : 'HEAD'}`);
      say(`Successfully rebased and updated ${curBranch ? 'refs/heads/' + curBranch : 'HEAD'}.`);
      say(`Replayed ${list.length} commit(s) as NEW commits: ${made.join(', ')}. The originals still exist (dimmed) and are reachable through the reflog.`, 'note');
      break;
    }
    case 'reset': {
      if (!needCommit()) break;
      const mode = flags.has('--hard') ? 'hard' : flags.has('--soft') ? 'soft' : 'mixed';
      const target = pos[0] || 'HEAD';
      const id = resolve(s, target);
      if (!id) { say(`fatal: ambiguous argument '${target}': unknown revision`, 'err'); break; }
      moveHead(s, id, `reset: moving to ${target}`);
      if (mode === 'hard') say(`HEAD is now at ${id} ${s.commits[id].msg}`);
      const effects = {
        soft: 'Only the branch pointer moved. In real Git, the changes from the commits you stepped back over are now staged, ready to commit again.',
        mixed: 'The branch pointer moved and the staging area was reset. In real Git, the changes from those commits are now unstaged edits in your working directory.',
        hard: 'The branch pointer, staging area AND working directory were reset. In real Git, uncommitted changes are gone for good. Committed work can still be found with git reflog.',
      };
      say(`--${mode}: ${effects[mode]}`, 'note');
      break;
    }
    case 'revert': {
      if (!needCommit()) break;
      const target = pos.find(p => p !== '1' && p !== '2') || '';
      const id = resolve(s, target);
      if (!id) { say(`fatal: bad revision '${target}'`, 'err'); break; }
      const t = s.commits[id];
      if (t.parents.length > 1 && !flags.has('-m')) { say(`error: commit ${id} is a merge but no -m option was given.`, 'err'); say('fatal: revert failed', 'err'); break; }
      const c = addCommit(s, `Revert "${t.msg}"`, [hid!]);
      moveHead(s, c.id, `revert: Revert "${t.msg}"`);
      say(`[${curBranch || 'detached HEAD'} ${c.id}] Revert "${t.msg}"`);
      say(`History was not rewritten. ${c.label} is a new commit that undoes the changes ${t.label} introduced.`, 'note');
      break;
    }
    case 'cherry-pick': {
      if (!needCommit()) break;
      if (flags.has('--abort') || flags.has('--continue')) { say('No cherry-pick in progress.', 'note'); break; }
      const target = pos[0];
      const id = target ? resolve(s, target) : null;
      if (!id) { say(`fatal: bad revision '${target}'`, 'err'); break; }
      const t = s.commits[id];
      if (t.parents.length > 1) { say(`error: commit ${id} is a merge but no -m option was given.`, 'err'); break; }
      if (ancestors(s, hid).has(id)) { say(`The commit ${t.label} is already part of this branch. Real Git would report the cherry-pick as empty.`, 'note'); break; }
      const c = addCommit(s, t.msg, [hid!], t.label.replace(/′*$/, '') + '′');
      moveHead(s, c.id, `cherry-pick: ${t.msg}`);
      say(`[${curBranch || 'detached HEAD'} ${c.id}] ${t.msg}`);
      say(`${c.label} is a copy of ${t.label} with a different parent, so it has a different hash (${c.id} vs ${t.id}).`, 'note');
      break;
    }
    case 'tag': {
      if (!pos.length && !flags.size) { Object.keys(s.tags).sort().forEach(t => say(t)); if (!Object.keys(s.tags).length) say('(no tags yet)', 'note'); break; }
      if (flags.has('-d')) { const t = pos[0]; if (!s.tags[t]) { say(`error: tag '${t}' not found.`, 'err'); break; } say(`Deleted tag '${t}' (was ${s.tags[t]})`); delete s.tags[t]; break; }
      if (!needCommit()) break;
      const mi = args.indexOf('-m');
      const rest = pos.filter(p => mi < 0 || p !== args[mi + 1]);
      const name = rest[0];
      if (s.tags[name]) { say(`fatal: tag '${name}' already exists`, 'err'); break; }
      const id = rest[1] ? resolve(s, rest[1]) : hid!;
      if (!id) { say(`fatal: Failed to resolve '${rest[1]}' as a valid ref.`, 'err'); break; }
      s.tags[name] = id;
      say(`Tagged ${s.commits[id].label} (${id}) as ${name}${flags.has('-a') ? ' (annotated)' : ''}.`, 'ok');
      break;
    }
    case 'log': {
      const start = pos[0] ? resolve(s, pos[0]) : hid;
      if (!start) { say(`fatal: your current branch '${curBranch}' does not have any commits yet`, 'err'); break; }
      const set = flags.has('--all') ? reachable(s) : ancestors(s, start);
      const ids = s.order.filter(id => set.has(id) && !s.commits[id].hidden).reverse();
      for (const id of ids) say(`${id}${decorate(s, id)} ${s.commits[id].msg}`);
      break;
    }
    case 'status': {
      if (curBranch) say(`On branch ${curBranch}`); else say(`HEAD detached at ${hid}`);
      if (curBranch && s.upstream[curBranch] && s.tracking[s.upstream[curBranch]] && hid) {
        const up = s.tracking[s.upstream[curBranch]];
        const a = ancestors(s, hid), b = ancestors(s, up);
        const ahead = [...a].filter(x => !b.has(x)).length, behind = [...b].filter(x => !a.has(x)).length;
        if (!ahead && !behind) say(`Your branch is up to date with 'origin/${s.upstream[curBranch]}'.`);
        else if (ahead && !behind) say(`Your branch is ahead of 'origin/${s.upstream[curBranch]}' by ${ahead} commit${ahead > 1 ? 's' : ''}.`);
        else if (!ahead && behind) say(`Your branch is behind 'origin/${s.upstream[curBranch]}' by ${behind} commit${behind > 1 ? 's' : ''}, and can be fast-forwarded.`);
        else say(`Your branch and 'origin/${s.upstream[curBranch]}' have diverged, and have ${ahead} and ${behind} different commits each, respectively.`);
      }
      if (!hid) say('No commits yet');
      say('nothing to commit, working tree clean');
      say('(The sandbox has no files, so the working tree is always clean.)', 'note');
      break;
    }
    case 'reflog': {
      s.reflog.slice(0, 30).forEach((r, i) => say(`${r.id} HEAD@{${i}}: ${r.action}`));
      if (!s.reflog.length) say('(empty)', 'note');
      break;
    }
    case 'fetch': {
      let changed = 0;
      for (const [b, id] of Object.entries(s.server)) {
        if (s.tracking[b] !== id) { say(`   ${s.tracking[b] ? s.tracking[b] + '..' + id : '* [new branch]'}  ${b} -> origin/${b}`); changed++; }
        ancestors(s, id).forEach(x => { if (s.commits[x]) s.commits[x].hidden = false; });
        s.tracking[b] = id;
      }
      if (!changed) say('(nothing new on origin)', 'note');
      else say('fetch only updated origin/* (your remote-tracking branches). Your own branches did not move.', 'note');
      break;
    }
    case 'pull': {
      if (!curBranch) { say('You are not currently on a branch.', 'err'); break; }
      const ub = s.upstream[curBranch];
      if (!ub) { say(`There is no tracking information for the current branch. Use: git push -u origin ${curBranch}`, 'err'); break; }
      const r1 = run(s, 'git fetch');
      const r2 = run(r1.state, flags.has('--rebase') ? `git rebase origin/${ub}` : `git merge origin/${ub}`);
      return { state: r2.state, out: [...r1.out, ...r2.out, { kind: 'note', text: `pull = fetch + ${flags.has('--rebase') ? 'rebase' : 'merge'}.` }] };
    }
    case 'push': {
      const b = pos[0] === 'origin' ? (pos[1] || curBranch) : curBranch;
      if (!b || !s.branches[b]) { say(`error: src refspec ${b} does not match any`, 'err'); break; }
      if (pos[0] !== 'origin' && !s.upstream[b]) {
        say(`fatal: The current branch ${b} has no upstream branch.`, 'err');
        say(`To push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin ${b}`, 'err');
        break;
      }
      const local = s.branches[b];
      const remote = s.server[b];
      const force = flags.has('--force') || flags.has('-f');
      const lease = flags.has('--force-with-lease');
      if (remote && remote !== local && !ancestors(s, local).has(remote)) {
        if (lease && s.tracking[b] !== remote) {
          say(` ! [rejected]        ${b} -> ${b} (stale info)`, 'err');
          say(`--force-with-lease refused: origin/${b} has commits you have not fetched. Nobody's work was overwritten.`, 'note');
          break;
        }
        if (!force && !lease) {
          say(` ! [rejected]        ${b} -> ${b} (non-fast-forward)`, 'err');
          say(`error: failed to push some refs. Updates were rejected because the tip of your current branch is behind its remote counterpart. Integrate the remote changes (e.g. git pull) before pushing again.`, 'err');
          break;
        }
        say(` + ${remote}...${local} ${b} -> ${b} (forced update)`);
        say(`The server's ${b} now points to ${s.commits[local].label}. Commits only the server had are no longer on any branch there.`, 'note');
      } else if (remote === local) {
        say('Everything up-to-date');
        break;
      } else {
        say(`   ${remote ? remote + '..' + local : '* [new branch]'}      ${b} -> ${b}`);
      }
      s.server[b] = local;
      s.tracking[b] = local;
      if (flags.has('-u') || flags.has('--set-upstream')) { s.upstream[b] = b; say(`branch '${b}' set up to track 'origin/${b}'.`); }
      break;
    }
    case 'init': say('This sandbox already has a repository. Use the Reset button to start over.', 'note'); break;
    case 'add': case 'restore': case 'diff': case 'stash': case 'rm': case 'mv':
      say(`git ${cmd} works with file contents, which this sandbox does not model. It focuses on the commit graph. Try it in the labs with real Git.`, 'note');
      break;
    default:
      say(`git: '${cmd}' is not supported in this sandbox. Supported: commit, branch, switch, checkout, merge, rebase, reset, revert, cherry-pick, tag, log, status, reflog, fetch, pull, push.`, 'err');
  }
  return { state: out.some(o => o.kind === 'err') ? prev : s, out };
}

export function runScript(lines: string[]): SimState {
  let s = emptyState();
  for (const l of lines) s = run(s, l).state;
  s.reflog = s.reflog.slice(0, 12);
  return s;
}
