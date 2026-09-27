// Local progress tracking. Everything lives in this browser's localStorage;
// every access is guarded so the book still works when storage is blocked.
import React from 'react';

export interface Progress {
  completed: string[];                 // chapter ids
  labs: string[];                      // lab ids
  answers: Record<string, boolean>;    // quiz question id -> first-attempt correct?
  current: string | null;              // last opened chapter id
  assessmentBest: number | null;       // percent
  projectSteps: string[];              // final project step ids
  theme: 'light' | 'dark' | null;
}

const KEY = 'git-for-developers.progress.v1';
const empty: Progress = { completed: [], labs: [], answers: {}, current: null, assessmentBest: null, projectSteps: [], theme: null };

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return { ...empty };
  }
}

let state: Progress = load();
const listeners = new Set<() => void>();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  listeners.forEach(l => l());
}

export function update(fn: (p: Progress) => Progress) {
  state = fn(state);
  save();
}

export function getProgress() { return state; }

export function useProgress(): Progress {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    listeners.add(force);
    return () => { listeners.delete(force); };
  }, []);
  return state;
}

const toggleIn = (arr: string[], id: string, on?: boolean) => {
  const has = arr.includes(id);
  const want = on === undefined ? !has : on;
  if (want && !has) return [...arr, id];
  if (!want && has) return arr.filter(x => x !== id);
  return arr;
};

// --- Export / import -------------------------------------------------
// Lets a reader carry progress across browsers, devices, or a cleared
// localStorage by saving it to a JSON file and loading it back later.

export interface ProgressExport {
  app: 'git-for-developers';
  version: 1;
  exportedAt: string;
  progress: Progress;
}

export function exportProgress(): ProgressExport {
  return { app: 'git-for-developers', version: 1, exportedAt: new Date().toISOString(), progress: state };
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(x => typeof x === 'string');
}

// Accepts either a full export (`{ app, version, progress }`) or a bare
// progress object (e.g. a raw copy of the localStorage value), and keeps
// only fields of the expected shape — anything else in the file is ignored
// rather than trusted.
function sanitizeProgress(input: unknown): Progress {
  const src = (input && typeof input === 'object' && 'progress' in (input as any) && (input as any).progress
    ? (input as any).progress
    : input) as Partial<Progress> | null;
  const answers: Record<string, boolean> = {};
  if (src?.answers && typeof src.answers === 'object') {
    for (const [k, v] of Object.entries(src.answers as Record<string, unknown>)) {
      if (typeof v === 'boolean') answers[k] = v;
    }
  }
  return {
    completed: isStringArray(src?.completed) ? src!.completed : [],
    labs: isStringArray(src?.labs) ? src!.labs : [],
    answers,
    current: typeof src?.current === 'string' ? src!.current : null,
    assessmentBest: typeof src?.assessmentBest === 'number' ? src!.assessmentBest : null,
    projectSteps: isStringArray(src?.projectSteps) ? src!.projectSteps : [],
    theme: src?.theme === 'light' || src?.theme === 'dark' ? src.theme : null,
  };
}

/** Parses and applies a previously-exported progress file. Throws a
 *  message-carrying Error on invalid JSON or an unrecognizable shape;
 *  callers should show `err.message` to the reader. */
export function importProgress(raw: string): Progress {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error("That file doesn't look like a progress export.");
  }
  state = sanitizeProgress(parsed);
  save();
  return state;
}

export const actions = {
  toggleChapter: (id: string, on?: boolean) => update(p => ({ ...p, completed: toggleIn(p.completed, id, on) })),
  toggleLab: (id: string, on?: boolean) => update(p => ({ ...p, labs: toggleIn(p.labs, id, on) })),
  toggleStep: (id: string, on?: boolean) => update(p => ({ ...p, projectSteps: toggleIn(p.projectSteps, id, on) })),
  answer: (qid: string, correct: boolean) =>
    update(p => (qid in p.answers ? p : { ...p, answers: { ...p.answers, [qid]: correct } })),
  setCurrent: (id: string) => update(p => (p.current === id ? p : { ...p, current: id })),
  setAssessment: (pct: number) => update(p => ({ ...p, assessmentBest: Math.max(pct, p.assessmentBest ?? 0) })),
  setTheme: (t: 'light' | 'dark' | null) => update(p => ({ ...p, theme: t })),
  resetAll: () => { state = { ...empty, theme: state.theme }; save(); },
  resetQuiz: (ids: string[]) => update(p => {
    const answers = { ...p.answers };
    ids.forEach(id => delete answers[id]);
    return { ...p, answers };
  }),
};
