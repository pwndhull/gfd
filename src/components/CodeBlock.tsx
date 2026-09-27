import React from 'react';
import { I } from './Icons';

const SHELL = new Set(['bash', 'sh', 'shell', 'console', 'terminal', 'zsh', 'powershell', 'ps']);

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback: select a hidden textarea so the reader can press Ctrl/Cmd+C
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyButton({ text, label = 'Copy', mini = false }: { text: string; label?: string; mini?: boolean }) {
  const [state, setState] = React.useState<'idle' | 'ok' | 'fail'>('idle');
  const onClick = () => {
    copyText(text).then(ok => {
      setState(ok ? 'ok' : 'fail');
      setTimeout(() => setState('idle'), 1600);
    });
  };
  if (mini) {
    return (
      <button className="copy-mini" onClick={onClick} aria-label={state === 'ok' ? 'Copied' : 'Copy command'} title="Copy">
        {state === 'ok' ? <I.check /> : <I.copy />}
      </button>
    );
  }
  return (
    <button className="copy-btn" onClick={onClick} aria-live="polite">
      {state === 'ok' ? <I.check /> : <I.copy />}
      {state === 'ok' ? 'Copied' : state === 'fail' ? 'Select and copy' : label}
    </button>
  );
}

function parseMeta(meta: string) {
  const title = meta.match(/title="([^"]*)"/)?.[1] || '';
  const hl = new Set<number>();
  const range = meta.match(/\{([\d,\s-]+)\}/)?.[1];
  if (range) {
    for (const part of range.split(',')) {
      const [a, b] = part.split('-').map(n => parseInt(n, 10));
      for (let i = a; i <= (b || a); i++) hl.add(i);
    }
  }
  return { title, hl, numbers: /\blines\b/.test(meta), note: meta.match(/note="([^"]*)"/)?.[1] };
}

function highlightCommand(cmd: string, key: number): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /("[^"]*"|'[^']*'|#.*$|\s+|[^\s]+)/g;
  let m: RegExpExecArray | null;
  let wordIdx = 0;
  let prev = '';
  let i = 0;
  while ((m = re.exec(cmd))) {
    const t = m[0];
    const k = `${key}-${i++}`;
    if (/^\s+$/.test(t)) { out.push(t); continue; }
    if (t.startsWith('#')) out.push(<span key={k} className="tk-com">{t}</span>);
    else if (/^["']/.test(t)) out.push(<span key={k} className="tk-str">{t}</span>);
    else if (/^-/.test(t)) out.push(<span key={k} className="tk-flag">{t}</span>);
    else if (wordIdx === 0 || /^(\||&&|;)$/.test(prev)) out.push(<span key={k} className="tk-cmd">{t}</span>);
    else if (wordIdx === 1 && prev === 'git') out.push(<span key={k} className="tk-sub">{t}</span>);
    else out.push(t);
    if (!t.startsWith('#')) { prev = t; wordIdx = /^(\||&&|;)$/.test(t) ? 0 : wordIdx + 1; if (/^(\||&&|;)$/.test(t)) wordIdx = 0; }
  }
  return out;
}

function outputClass(line: string, lang: string): string {
  if (/^(<<<<<<<|=======$|>>>>>>>|\|\|\|\|\|\|\|)/.test(line)) return 'out out-mark';
  if (lang === 'diff' || lang === 'output-diff') {
    if (/^(\+\+\+|---|diff --git|index |@@)/.test(line)) return 'out out-meta';
    if (line.startsWith('+')) return 'out out-add';
    if (line.startsWith('-')) return 'out out-del';
  }
  return 'out';
}

export function CodeBlock({ lang, meta, code }: { lang: string; meta: string; code: string }) {
  const { title, hl, numbers, note } = parseMeta(meta);
  const shell = SHELL.has(lang);
  const lines = code.replace(/\n+$/, '').split('\n');
  const hasPrompt = shell && lines.some(l => l.startsWith('$ '));
  const copyValue = hasPrompt ? lines.filter(l => l.startsWith('$ ')).map(l => l.slice(2)).join('\n') : code;
  const label = shell ? 'Terminal' : lang === 'text' ? 'Text' : lang === 'diff' ? 'Diff' : lang;

  return (
    <>
      <div className="code">
        <div className="code-head">
          <span className="lang">{label}</span>
          {title && <span className="ttl">{title}</span>}
          <CopyButton text={copyValue} label={hasPrompt && lines.filter(l => l.startsWith('$ ')).length > 1 ? 'Copy commands' : 'Copy'} />
        </div>
        <pre tabIndex={0}>
          {lines.map((line, i) => {
            const n = i + 1;
            let content: React.ReactNode;
            if (shell && line.startsWith('$ ')) {
              content = <><span className="prompt">$ </span>{highlightCommand(line.slice(2), i)}</>;
            } else if (shell && !hasPrompt && line.trim() && !line.trim().startsWith('#')) {
              content = highlightCommand(line, i);
            } else if (shell && line.trim().startsWith('#') && !hasPrompt) {
              content = <span className="tk-com">{line}</span>;
            } else if (shell && hasPrompt) {
              content = <span className={outputClass(line, 'diff')}>{line}</span>;
            } else {
              content = <span className={outputClass(line, lang)}>{line}</span>;
            }
            return (
              <span key={i} className={'ln' + (hl.has(n) ? ' hl' : '')}>
                {numbers && <span className="num">{n}</span>}
                {content}
                {'\n'}
              </span>
            );
          })}
        </pre>
      </div>
      {note && <p className="code-note">{note}</p>}
    </>
  );
}
