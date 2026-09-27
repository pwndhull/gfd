// A small Markdown parser tailored to the book's content.
// Supports: headings, paragraphs, lists, fenced code (with custom fence types),
// pipe tables, horizontal rules, and ::: callout containers (nestable).

import type { Block, QuizQuestion, QuizKind } from './types';

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  const isBlockStart = (l: string) =>
    /^(#{1,4})\s/.test(l) || /^```/.test(l) || /^:::/.test(l) || /^\s*[-*]\s+/.test(l) ||
    /^\s*\d+\.\s+/.test(l) || /^\|/.test(l) || /^---\s*$/.test(l);

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // Fenced code
    const fence = line.match(/^(`{3,})\s*([\w-]*)\s*(.*)$/);
    if (fence) {
      const body: string[] = [];
      const close = new RegExp('^' + fence[1] + '\\s*$');
      i++;
      while (i < lines.length && !close.test(lines[i])) { body.push(lines[i]); i++; }
      i++; // closing fence
      blocks.push({ t: 'code', lang: fence[2] || 'text', meta: fence[3].trim(), code: body.join('\n') });
      continue;
    }

    // Callout container ::: kind Title ... :::
    const call = line.match(/^:::\s*(\w+)\s*(.*)$/);
    if (call) {
      const inner: string[] = [];
      let depth = 1;
      let fenceMark = '';
      i++;
      while (i < lines.length) {
        const l = lines[i];
        const fm = l.match(/^(`{3,})/);
        if (fm) {
          if (!fenceMark) fenceMark = fm[1];
          else if (fm[1] === fenceMark && /^`+\s*$/.test(l)) fenceMark = '';
        }
        if (!fenceMark) {
          if (/^:::\s*\w+/.test(l)) depth++;
          else if (/^:::\s*$/.test(l)) { depth--; if (depth === 0) break; }
        }
        inner.push(l);
        i++;
      }
      i++;
      blocks.push({ t: 'callout', kind: call[1], title: call[2].trim(), children: parseMarkdown(inner.join('\n')) });
      continue;
    }

    // Heading
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const text = h[2].trim();
      blocks.push({ t: 'h', level: h[1].length, text, id: slugify(text) });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---\s*$/.test(line)) { blocks.push({ t: 'hr' }); i++; continue; }

    // Table
    if (/^\|/.test(line)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        const cells = lines[i].trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, '|'));
        if (!cells.every(c => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      blocks.push({ t: 'table', head: rows[0] || [], rows: rows.slice(1) });
      continue;
    }

    // Lists
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (ul || ol) {
      const ordered = !!ol;
      const items: string[] = [];
      const start = ol ? parseInt(ol[1], 10) : 1;
      while (i < lines.length) {
        const l = lines[i];
        const m = ordered ? l.match(/^\s*\d+\.\s+(.*)$/) : l.match(/^\s*[-*]\s+(.*)$/);
        if (m) { items.push(m[1]); i++; continue; }
        // continuation line (indented, non-empty)
        if (/^\s{2,}\S/.test(l) && items.length) { items[items.length - 1] += ' ' + l.trim(); i++; continue; }
        break;
      }
      blocks.push(ordered ? { t: 'ol', items, start } : { t: 'ul', items });
      continue;
    }

    // Paragraph
    const para: string[] = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) { para.push(lines[i].trim()); i++; }
    blocks.push({ t: 'p', text: para.join(' ') });
  }
  return blocks;
}

// ---------- Custom fence parsers ----------

export function parsePairs(code: string): [string, string][] {
  return code
    .split('\n')
    .filter(l => l.includes('::'))
    .map(l => {
      const idx = l.indexOf('::');
      return [l.slice(0, idx).trim(), l.slice(idx + 2).trim()] as [string, string];
    });
}

export function shortHash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

const KINDS: QuizKind[] = ['mc', 'tf', 'predict', 'state', 'troubleshoot', 'scenario'];

export function parseQuiz(code: string, idPrefix: string, startIndex = 0): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  let cur: QuizQuestion | null = null;
  const push = () => { if (cur && cur.options.length) out.push(cur); cur = null; };
  for (const raw of code.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (line.startsWith('? ')) {
      push();
      let prompt = line.slice(2).trim();
      let kind: QuizKind = 'mc';
      const k = prompt.match(/^\[(\w+)\]\s*/);
      if (k && (KINDS as string[]).includes(k[1])) { kind = k[1] as QuizKind; prompt = prompt.slice(k[0].length); }
      cur = { id: '', kind, prompt, options: [], answer: -1, explain: '' };
    } else if (!cur) {
      continue;
    } else if (line.startsWith('| ')) {
      cur.code = (cur.code ? cur.code + '\n' : '') + line.slice(2);
    } else if (line === '|') {
      cur.code = (cur.code ? cur.code + '\n' : '');
    } else if (line.startsWith('+ ') || line.startsWith('- ')) {
      if (line.startsWith('+ ')) cur.answer = cur.options.length;
      cur.options.push(line.slice(2).trim());
    } else if (line.startsWith('> ')) {
      cur.explain = (cur.explain ? cur.explain + ' ' : '') + line.slice(2).trim();
    } else if (line.trim() && !cur.options.length) {
      cur.prompt += ' ' + line.trim();
    }
  }
  push();
  for (const q of out) {
    q.id = `${idPrefix}-${shortHash(q.prompt + (q.code || ''))}`;
    if (q.kind === 'mc' && q.options.length === 2 && /^true$/i.test(q.options[0]) && /^false$/i.test(q.options[1])) q.kind = 'tf';
  }
  return out;
}

export interface Exercise { title: string; task: string; solution: string }

export function parseExercise(code: string, title: string): Exercise {
  const parts = code.split(/\n---\s*solution\s*---\n|\n---\n/);
  return { title: title || 'Practical exercise', task: parts[0] || '', solution: parts[1] || '' };
}

export function parseCmd(code: string): { command: string; parts: [string, string][] } {
  const [first, ...rest] = code.split('\n');
  return { command: first.replace(/^\$\s*/, ''), parts: parsePairs(rest.join('\n')) };
}

// ---------- Front matter & entry files ----------

export function splitFrontMatter(src: string): { meta: Record<string, string | string[]>; body: string } {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: src };
  const meta: Record<string, string | string[]> = {};
  let key = '';
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      const v = kv[2].trim().replace(/^"(.*)"$/, '$1');
      meta[key] = v ? v : [];
    } else if (/^\s*-\s+/.test(line) && key) {
      const arr = Array.isArray(meta[key]) ? (meta[key] as string[]) : [];
      arr.push(line.replace(/^\s*-\s+/, '').trim());
      meta[key] = arr;
    }
  }
  return { meta, body: src.slice(m[0].length) };
}

/** Splits a file into entries at "## " headings. Leading "key: value" lines become meta. */
export function parseEntries(src: string): { title: string; meta: Record<string, string>; body: string }[] {
  const chunks = ('\n' + src).split(/\n## /).slice(1);
  return chunks.map(chunk => {
    const lines = chunk.split('\n');
    const title = lines[0].trim();
    const meta: Record<string, string> = {};
    let i = 1;
    while (i < lines.length && !lines[i].trim()) i++;
    while (i < lines.length) {
      const kv = lines[i].match(/^([a-z_]+):\s+(.*)$/);
      if (!kv) break;
      meta[kv[1]] = kv[2].trim();
      i++;
    }
    return { title, meta, body: lines.slice(i).join('\n').trim() };
  });
}

// ---------- Plain text extraction (for search) ----------

export function stripInline(s: string): string {
  return s.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

export function blocksToText(blocks: Block[]): string {
  const out: string[] = [];
  for (const b of blocks) {
    if (b.t === 'h' || b.t === 'p') out.push(stripInline(b.text));
    else if (b.t === 'ul' || b.t === 'ol') out.push(b.items.map(stripInline).join(' '));
    else if (b.t === 'table') out.push([b.head, ...b.rows].flat().map(stripInline).join(' '));
    else if (b.t === 'callout') out.push(b.title, blocksToText(b.children));
    else if (b.t === 'code' && !['quiz', 'viz', 'diagram'].includes(b.lang)) out.push(b.code);
  }
  return out.join(' ');
}
