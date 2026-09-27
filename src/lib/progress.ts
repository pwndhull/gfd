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
