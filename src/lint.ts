// Content checks, run with: node lint.mjs
// Bundles this file for Node and validates every chapter and reference file.
import { chapters, commandEntries, glossaryEntries, labEntries, cheatsheetEntries, assessmentDoc, projectDoc, extraQuizDoc } from './lib/content';
import type { Block } from './lib/types';
import { parseQuiz } from './lib/markdown';
import { PRESETS } from './lib/vizPresets';
import { chapterSources, refSources } from './generated/content';

const DIAGRAMS = ['vcs-models', 'snapshots', 'three-areas', 'architecture', 'local-remote', 'head', 'detached-head', 'fetch-pull', 'push', 'reset-modes', 'conflict', 'pr-workflow', 'objects', 'stash', 'gitflow', 'trunk', 'tracking'];
const KNOWN_LANGS = new Set(['bash', 'text', 'diff', 'quiz', 'exercise', 'cmd', 'terms', 'commands', 'diagram', 'viz', 'graph', 'snap', 'yaml', 'json', 'js', 'javascript', 'ts', 'python', 'ini', 'gitignore', 'powershell', 'markdown', 'toml', 'sh', 'properties', 'html', 'css', 'jsx']);
const problems: string[] = [];
const ids = new Set(chapters.map(c => c.id));
const glossTitles = new Set(glossaryEntries.flatMap(e => [e.title.toLowerCase(), ...(e.meta.aka || '').split(',').map(a => a.trim().toLowerCase()).filter(Boolean)]));

function walk(blocks: Block[], where: string, fn: (b: Block) => void) {
  for (const b of blocks) { fn(b); if (b.t === 'callout') walk(b.children, where, fn); }
}
function checkText(t: string, where: string) {
  for (const m of t.matchAll(/\]\(#ch-([\w-]+)\)/g)) if (!ids.has(m[1])) problems.push(`${where}: broken chapter link #ch-${m[1]}`);
  if (/```/.test(t)) problems.push(`${where}: stray backticks in text: ${t.slice(0, 80)}`);
}
function checkBlocks(blocks: Block[], where: string) {
  walk(blocks, where, b => {
    if (b.t === 'p' || b.t === 'h') checkText(b.text, where);
    if (b.t === 'ul' || b.t === 'ol') b.items.forEach(i => checkText(i, where));
    if (b.t === 'table') [b.head, ...b.rows].flat().forEach(c => checkText(c, where));
    if (b.t === 'code') {
      if (!KNOWN_LANGS.has(b.lang)) problems.push(`${where}: unknown fence language "${b.lang}"`);
      if (b.lang === 'diagram' && !DIAGRAMS.includes(b.meta || b.code.trim())) problems.push(`${where}: unknown diagram "${b.meta || b.code.trim()}"`);
      if (b.lang === 'viz' && !PRESETS[b.meta || b.code.trim()]) problems.push(`${where}: unknown viz preset "${b.meta || b.code.trim()}"`);
      if (b.lang === 'quiz') {
        const qs = parseQuiz(b.code, 'x');
        if (!qs.length) problems.push(`${where}: empty quiz`);
        qs.forEach(q => { if (q.answer < 0) problems.push(`${where}: quiz question without answer: ${q.prompt.slice(0, 60)}`); if (!q.explain) problems.push(`${where}: quiz question without explanation: ${q.prompt.slice(0, 60)}`); });
      }
      if (b.lang === 'exercise' && !/---\s*solution\s*---/.test(b.code)) problems.push(`${where}: exercise without solution`);
    }
  });
}

// Raw scan: a 3-backtick exercise/quiz fence must not contain an inner fence opener.
function rawFenceCheck(src: string, where: string) {
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^```(exercise|quiz)\b/);
    if (!m) continue;
    for (let j = i + 1; j < lines.length; j++) {
      if (/^```\s*$/.test(lines[j])) break;
      if (/^```\w/.test(lines[j])) { problems.push(`${where}: line ${j + 1}: inner fence inside 3-backtick ${m[1]} block (use 4 backticks outside)`); break; }
    }
  }
}
chapterSources.forEach((s, i) => rawFenceCheck(s, 'chapter file #' + (i + 1)));
Object.entries(refSources).forEach(([k, s]) => rawFenceCheck(s, k + '.md'));

let words = 0;
for (const c of chapters) {
  const w = `ch${c.num} ${c.id}`;
  if (!c.title || !c.part || !c.objectives.length) problems.push(`${w}: missing front matter`);
  const recap = c.blocks.find(b => b.t === 'callout' && b.kind === 'recap') as any;
  if (!recap) problems.push(`${w}: missing recap`);
  else {
    const hs = recap.children.filter((b: Block) => b.t === 'h').map((b: any) => b.text);
    for (const need of ['What you learned', 'Key terms', 'Key commands', 'Common mistakes', 'Quick quiz', 'Practical exercise', 'What to learn next']) if (!hs.includes(need)) problems.push(`${w}: recap missing "${need}"`);
  }
  if (c.quizzes.length < 3) problems.push(`${w}: only ${c.quizzes.length} quiz questions`);
  checkBlocks(c.blocks, w);
  words += c.plain.split(/\s+/).length;
  for (const k of c.concepts) if (!glossTitles.has(k.toLowerCase()) && glossaryEntries.length) problems.push(`${w}: concept not in glossary: ${k}`);
}
for (const e of [...commandEntries, ...glossaryEntries, ...labEntries, ...cheatsheetEntries]) checkBlocks(e.blocks, 'ref:' + e.title);
for (const e of glossaryEntries) if (e.meta.chapter && !ids.has(e.meta.chapter)) problems.push(`glossary ${e.title}: bad chapter ${e.meta.chapter}`);
for (const e of labEntries) if (e.meta.chapter && !ids.has(e.meta.chapter)) problems.push(`lab ${e.title}: bad chapter ${e.meta.chapter}`);
checkBlocks(assessmentDoc.blocks, 'assessment');
checkBlocks(projectDoc.blocks, 'project');
checkBlocks(extraQuizDoc.blocks, 'quizbank');

const qTotal = chapters.reduce((s, c) => s + c.quizzes.length, 0);
console.log(`${chapters.length} chapters, ~${words.toLocaleString()} chapter words, ${qTotal} chapter quiz questions, ${commandEntries.length} commands, ${glossaryEntries.length} glossary terms, ${labEntries.length} labs, ${assessmentDoc.quizzes.length} assessment questions`);
const dupIds = chapters.map(c => c.id).filter((x, i, a) => a.indexOf(x) !== i);
if (dupIds.length) problems.push('duplicate chapter ids: ' + dupIds.join(', '));
console.log(problems.length ? problems.join('\n') : 'No problems found.');
