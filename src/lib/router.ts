import type { Route } from './types';

// Hash routes use only letters, digits, "." and "-" so they survive the artifact link.
export function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, '');
  if (!h || h === 'home') return { view: 'home' };
  if (h.startsWith('ch-')) return { view: 'chapter', id: h.slice(3) };
  const [base, sub] = h.split('.');
  switch (base) {
    case 'commands': return { view: 'commands', id: sub };
    case 'glossary': return { view: 'glossary', id: sub };
    case 'labs': return { view: 'labs', id: sub };
    case 'cheatsheet':
    case 'quizbank':
    case 'project':
    case 'assessment':
    case 'playground':
    case 'contents':
      return { view: base } as Route;
  }
  return { view: 'home' };
}

export function routeToHash(r: Route): string {
  switch (r.view) {
    case 'home': return '#home';
    case 'chapter': return '#ch-' + r.id;
    case 'commands': return '#commands' + (r.id ? '.' + r.id : '');
    case 'glossary': return '#glossary' + (r.id ? '.' + r.id : '');
    case 'labs': return '#labs' + (r.id ? '.' + r.id : '');
    default: return '#' + r.view;
  }
}

export function go(r: Route | string) {
  const hash = typeof r === 'string' ? r : routeToHash(r);
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = hash;
}

// An in-page anchor to scroll to after the next route renders (kept out of the URL).
let pendingAnchor: string | null = null;
export function goTo(hash: string, anchor?: string) {
  pendingAnchor = anchor || null;
  go(hash);
}
export function takeAnchor(): string | null {
  const a = pendingAnchor;
  pendingAnchor = null;
  return a;
}
