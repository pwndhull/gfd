import { chapters, commandEntries, glossaryEntries, cheatsheetEntries, labEntries, cmdId, termId, labId, PART_META } from './content';
import { parsePairs, stripInline } from './markdown';

export interface SearchItem {
  type: 'Chapter' | 'Section' | 'Command' | 'Glossary' | 'Cheat sheet' | 'Lab' | 'Recovery' | 'Page';
  title: string;
  sub: string;
  text: string;
  hash: string;
  anchor?: string;
  weight: number;
}

let index: SearchItem[] | null = null;

export function getIndex(): SearchItem[] {
  if (index) return index;
  const items: SearchItem[] = [];
  const pages: [string, string, string][] = [
    ['Home', 'Dashboard and progress', '#home'],
    ['Table of contents', 'Every part, chapter and syllabus topic', '#contents'],
    ['Command reference', 'Every command with syntax, options and danger level', '#commands'],
    ['Cheat sheet', 'Quick lookup of common commands by category', '#cheatsheet'],
    ['Glossary', 'A to Z definitions of Git terms', '#glossary'],
    ['Practical labs', 'Hands-on exercises for a real terminal', '#labs'],
    ['Quiz bank', 'All quizzes in one place', '#quizbank'],
    ['Final project', 'Clone to release, end to end', '#project'],
    ['Final assessment', 'Scored exam covering the whole book', '#assessment'],
    ['Git sandbox', 'Simulated Git playground with a live commit graph', '#playground'],
    ['Troubleshooting guide', 'Error messages and symptoms with fixes', '#ch-troubleshooting-guide'],
    ['Disaster recovery', 'Fourteen real-world recovery scenarios', '#ch-recovery-wrong-place'],
  ];
  pages.forEach(([t, s, h]) => items.push({ type: 'Page', title: t, sub: s, text: s, hash: h, weight: 3 }));

  for (const c of chapters) {
    const part = PART_META.find(p => p.num === c.part)!;
    const recovery = c.part === 16;
    items.push({
      type: recovery ? 'Recovery' : 'Chapter',
      title: c.title,
      sub: `Part ${c.part} · ${part.title} · Chapter ${c.num}`,
      text: [c.topics.join(' '), c.objectives.join(' '), c.concepts.join(' '), c.commands.join(' '), c.plain].join(' '),
      hash: '#ch-' + c.id,
      weight: 5,
    });
    for (const b of c.blocks) {
      if (b.t === 'h' && (b.level === 2 || b.level === 3)) {
        items.push({ type: recovery ? 'Recovery' : 'Section', title: stripInline(b.text), sub: `in ${c.title}`, text: stripInline(b.text), hash: '#ch-' + c.id, anchor: b.id, weight: b.level === 2 ? 3 : 2 });
      }
    }
  }
  for (const e of commandEntries) items.push({ type: 'Command', title: e.title, sub: e.meta.purpose || '', text: (e.meta.purpose || '') + ' ' + e.plain, hash: '#commands.' + cmdId(e), weight: 5 });
  for (const e of glossaryEntries) items.push({ type: 'Glossary', title: e.title, sub: e.plain.slice(0, 140), text: e.plain, hash: '#glossary.' + termId(e), weight: 4 });
  for (const e of labEntries) items.push({ type: 'Lab', title: e.title, sub: e.meta.summary || '', text: e.plain, hash: '#labs.' + labId(e), weight: 3 });
  for (const cat of cheatsheetEntries) {
    for (const [cmd, desc] of parsePairs(cat.body)) items.push({ type: 'Cheat sheet', title: cmd, sub: `${cat.title} · ${stripInline(desc)}`, text: stripInline(desc), hash: '#cheatsheet', weight: 2 });
  }
  index = items;
  return items;
}

export function search(q: string, limit = 40): SearchItem[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const terms = query.split(/\s+/).filter(Boolean);
  const scored: [number, SearchItem][] = [];
  for (const it of getIndex()) {
    const title = it.title.toLowerCase();
    const text = it.text.toLowerCase();
    let score = 0;
    let ok = true;
    for (const t of terms) {
      const inTitle = title.includes(t);
      if (!inTitle && !text.includes(t)) { ok = false; break; }
      score += inTitle ? 12 : 1;
    }
    if (!ok) continue;
    if (title === query) score += 60;
    else if (title.startsWith(query)) score += 30;
    else if (title.includes(query)) score += 15;
    score += it.weight;
    scored.push([score, it]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  return scored.slice(0, limit).map(s => s[1]);
}

export function snippet(it: SearchItem, q: string): string {
  const t = q.trim().toLowerCase().split(/\s+/)[0];
  if (!t) return it.sub;
  if (it.title.toLowerCase().includes(t) || !it.text) return it.sub;
  const idx = it.text.toLowerCase().indexOf(t);
  if (idx < 0) return it.sub;
  const start = Math.max(0, idx - 60);
  return (start ? '…' : '') + it.text.slice(start, idx + 100).replace(/\s+/g, ' ') + '…';
}
