import type { Block, Chapter, Entry, Part, QuizQuestion } from './types';
import { parseMarkdown, splitFrontMatter, parseQuiz, blocksToText, parseEntries, stripInline } from './markdown';
import { chapterSources, refSources } from '../generated/content';

export const PART_META: { num: number; title: string; blurb: string }[] = [
  { num: 1, title: 'Understanding Version Control', blurb: 'What Git is, why it exists, and the mental model everything else builds on.' },
  { num: 2, title: 'Installing and Configuring Git', blurb: 'Install Git, tell it who you are, and connect it to GitHub securely.' },
  { num: 3, title: 'Your First Repository', blurb: 'Create a repository and learn the add–commit loop you will use every day.' },
  { num: 4, title: 'Working with Existing Projects', blurb: 'Clone, fetch, pull and push: working with a copy that lives on a server.' },
  { num: 5, title: 'Branches', blurb: 'Parallel lines of work, and why a branch is just a movable label.' },
  { num: 6, title: 'Commits', blurb: 'What a commit really contains, and how to make commits worth reading.' },
  { num: 7, title: 'Merging', blurb: 'Combining lines of work, and resolving conflicts calmly.' },
  { num: 8, title: 'Rebase', blurb: 'Replaying commits to rewrite history, and when that is a bad idea.' },
  { num: 9, title: 'Undoing Changes', blurb: 'restore, reset, revert and reflog: the safety net under everything.' },
  { num: 10, title: 'Stash', blurb: 'Setting unfinished work aside without committing it.' },
  { num: 11, title: 'Cherry-pick', blurb: 'Copying a single commit from one branch to another.' },
  { num: 12, title: 'Tags and Releases', blurb: 'Naming important commits and shipping versions.' },
  { num: 13, title: 'GitHub', blurb: 'Pull requests, reviews, protection rules, issues and Actions.' },
  { num: 14, title: 'Professional Workflows', blurb: 'How teams actually organise branches, reviews and releases.' },
  { num: 15, title: 'Advanced Git', blurb: 'Detached HEAD, bisect, worktrees, hooks, and the object model underneath.' },
  { num: 16, title: 'Real-World Disaster Recovery', blurb: 'Fourteen things that go wrong on real teams, and how to recover safely.' },
  { num: 17, title: 'Professional Best Practices', blurb: 'The habits that make you easy to work with.' },
  { num: 18, title: 'Practical Labs', blurb: 'Hands-on exercises to run in a real terminal.' },
  { num: 19, title: 'Quizzes', blurb: 'Every quiz in the book, plus extra practice.' },
  { num: 20, title: 'Final Project', blurb: 'A full team workflow from clone to tagged release, then the final assessment.' },
];

function collectQuizzes(blocks: Block[], prefix: string, acc: QuizQuestion[]) {
  for (const b of blocks) {
    if (b.t === 'code' && b.lang === 'quiz') acc.push(...parseQuiz(b.code, prefix, acc.length));
    else if (b.t === 'callout') collectQuizzes(b.children, prefix, acc);
  }
}

const asList = (v: string | string[] | undefined): string[] =>
  Array.isArray(v) ? v : v ? v.split('|').map(s => s.trim()).filter(Boolean) : [];

export const chapters: Chapter[] = chapterSources.map((src, idx) => {
  const { meta, body } = splitFrontMatter(src);
  const blocks = parseMarkdown(body);
  const id = String(meta.id);
  const headings = blocks.filter(b => b.t === 'h' && b.level === 2).map(b => ({ id: (b as any).id, text: stripInline((b as any).text) }));
  if (blocks.some(b => b.t === 'callout' && b.kind === 'recap')) headings.push({ id: 'chapter-review', text: 'Chapter review' });
  const quizzes: QuizQuestion[] = [];
  collectQuizzes(blocks, id, quizzes);
  return {
    id,
    num: idx + 1,
    part: Number(meta.part),
    title: String(meta.title),
    minutes: Number(meta.minutes) || 15,
    level: String(meta.level || 'Beginner'),
    topics: asList(meta.topics),
    objectives: asList(meta.objectives),
    concepts: asList(meta.concepts),
    commands: asList(meta.commands),
    blocks,
    headings,
    quizzes,
    plain: blocksToText(blocks),
  };
});

export const chapterById = new Map(chapters.map(c => [c.id, c]));

export const parts: Part[] = PART_META.map(p => ({ ...p, chapters: chapters.filter(c => c.part === p.num) }));

function entries(name: string): Entry[] {
  const src = refSources[name] || '';
  return parseEntries(src).map(e => {
    const blocks = parseMarkdown(e.body);
    return { ...e, blocks, plain: blocksToText(blocks) };
  });
}

export const commandEntries = entries('commands');
export const glossaryEntries = entries('glossary').sort((a, b) =>
  a.title.replace(/^[^a-z0-9]+/i, '').localeCompare(b.title.replace(/^[^a-z0-9]+/i, ''), 'en', { sensitivity: 'base' }));
export const cheatsheetEntries = entries('cheatsheet');
export const labEntries = entries('labs');

function doc(name: string) {
  const { meta, body } = splitFrontMatter(refSources[name] || '');
  const blocks = parseMarkdown(body);
  const quizzes: QuizQuestion[] = [];
  collectQuizzes(blocks, name, quizzes);
  return { meta, blocks, quizzes, plain: blocksToText(blocks) };
}

export const projectDoc = doc('project');
export const assessmentDoc = doc('assessment');
export const extraQuizDoc = doc('quizbank');

export const totalMinutes = chapters.reduce((s, c) => s + c.minutes, 0);
export const allChapterQuizzes = chapters.flatMap(c => c.quizzes);

export function labId(e: Entry) { return e.meta.id || e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
export function cmdId(e: Entry) { return 'cmd-' + e.title.replace(/^git\s+/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
export function termId(e: Entry) {
  return 'term-' + e.title.toLowerCase().replace(/^\./, 'dot-').replace(/^@/, 'at-').replace(/\^/g, '-caret').replace(/~/g, '-tilde').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
