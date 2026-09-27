// Core content types shared by the parser, the content loader and the UI.

export type Block =
  | { t: 'h'; level: number; text: string; id: string }
  | { t: 'p'; text: string }
  | { t: 'ul' | 'ol'; items: string[]; start?: number }
  | { t: 'code'; lang: string; meta: string; code: string }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'callout'; kind: string; title: string; children: Block[] }
  | { t: 'hr' };

export type QuizKind = 'mc' | 'tf' | 'predict' | 'state' | 'troubleshoot' | 'scenario';

export interface QuizQuestion {
  id: string;
  kind: QuizKind;
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface Chapter {
  id: string;
  num: number;          // 1-based chapter number across the whole book
  part: number;
  title: string;
  minutes: number;
  level: string;
  topics: string[];     // numbered syllabus topics this chapter covers
  objectives: string[];
  concepts: string[];
  commands: string[];
  blocks: Block[];
  headings: { id: string; text: string }[];
  quizzes: QuizQuestion[];
  plain: string;        // plain text for search
}

export interface Part {
  num: number;
  title: string;
  blurb: string;
  chapters: Chapter[];
}

export interface Entry {
  title: string;
  meta: Record<string, string>;
  body: string;
  blocks: Block[];
  plain: string;
}

export type Route =
  | { view: 'home' }
  | { view: 'chapter'; id: string }
  | { view: 'commands'; id?: string }
  | { view: 'cheatsheet' }
  | { view: 'glossary'; id?: string }
  | { view: 'labs'; id?: string }
  | { view: 'quizbank' }
  | { view: 'project' }
  | { view: 'assessment' }
  | { view: 'playground' }
  | { view: 'contents' };
