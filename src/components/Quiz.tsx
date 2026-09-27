import React from 'react';
import type { QuizQuestion } from '../lib/types';
import { actions, useProgress } from '../lib/progress';
import { Inline } from './Markdown';

export const KIND_LABEL: Record<string, string> = {
  mc: 'Multiple choice',
  tf: 'True or false',
  predict: 'Predict the result',
  state: 'Predict the Git state',
  troubleshoot: 'Troubleshooting',
  scenario: 'Scenario',
};

export function Question({ q, index, record = true, locked, onAnswer, reveal }: {
  q: QuizQuestion; index: number; record?: boolean;
  locked?: boolean; onAnswer?: (choice: number) => void; reveal?: boolean;
}) {
  const progress = useProgress();
  const [choice, setChoice] = React.useState<number | null>(null);
  const [checked, setChecked] = React.useState(false);
  const shown = reveal ?? checked;
  const firstTry = q.id in progress.answers ? progress.answers[q.id] : undefined;

  const check = () => {
    if (choice === null) return;
    setChecked(true);
    if (record) actions.answer(q.id, choice === q.answer);
  };

  return (
    <div className="q" role="group" aria-labelledby={`${q.id}-p`}>
      <div className="q-kind">
        <span className="n">Q{index + 1}</span>
        <span>{KIND_LABEL[q.kind]}</span>
        {record && firstTry !== undefined && !checked && (
          <span style={{ marginLeft: 'auto', textTransform: 'none', letterSpacing: 0, fontWeight: 500, color: firstTry ? 'var(--ok)' : 'var(--danger)' }}>
            {firstTry ? 'Answered correctly before' : 'Missed before: try again'}
          </span>
        )}
      </div>
      <div className="q-prompt" id={`${q.id}-p`}><Inline text={q.prompt} /></div>
      {q.code && <pre className="q-code">{q.code}</pre>}
      <div className="q-opts" role="radiogroup">
        {q.options.map((o, i) => {
          let cls = 'q-opt';
          if (shown) {
            if (i === q.answer) cls += ' right';
            else if (i === choice) cls += ' wrong';
          } else if (i === choice) cls += ' sel';
          return (
            <button key={i} className={cls} role="radio" aria-checked={choice === i} disabled={shown || locked}
              onClick={() => { setChoice(i); onAnswer?.(i); }}>
              <span className="mark">{shown && i === q.answer ? '✓' : shown && i === choice ? '✕' : String.fromCharCode(65 + i)}</span>
              <span><Inline text={o} /></span>
            </button>
          );
        })}
      </div>
      {!onAnswer && (
        <div className="q-foot">
          {!checked ? (
            <button className="btn primary small" onClick={check} disabled={choice === null}>Check answer</button>
          ) : (
            <>
              <span className={'q-result ' + (choice === q.answer ? 'ok' : 'no')} aria-live="polite">
                {choice === q.answer ? 'Correct.' : `Not quite. The answer is ${String.fromCharCode(65 + q.answer)}.`}
              </span>
              <button className="btn small ghost" onClick={() => { setChecked(false); setChoice(null); }}>Try again</button>
            </>
          )}
        </div>
      )}
      {shown && q.explain && <div className="q-explain"><Inline text={q.explain} /></div>}
    </div>
  );
}

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  return (
    <div className="quiz">
      {questions.map((q, i) => <Question key={q.id} q={q} index={i} />)}
    </div>
  );
}
