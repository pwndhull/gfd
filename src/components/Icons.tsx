import React from 'react';

type P = { className?: string };
const S = (d: React.ReactNode) => ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

export const I = {
  search: S(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  menu: S(<><path d="M4 6h16M4 12h16M4 18h16" /></>),
  x: S(<><path d="M6 6l12 12M18 6 6 18" /></>),
  sun: S(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>),
  moon: S(<><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></>),
  check: S(<><path d="m5 12.5 4.5 4.5L19 7.5" /></>),
  chev: S(<><path d="m9 6 6 6-6 6" /></>),
  copy: S(<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></>),
  home: S(<><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1Z" /></>),
  book: S(<><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z" /><path d="M4 19V5M8 7h7" /></>),
  terminal: S(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3M13 15h4" /></>),
  list: S(<><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></>),
  flask: S(<><path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3" /><path d="M7 15h10" /></>),
  quiz: S(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.6-.8 1.1V14" /><circle cx="12" cy="17" r=".6" fill="currentColor" /></>),
  flag: S(<><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></>),
  award: S(<><circle cx="12" cy="9" r="6" /><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7" /></>),
  play: S(<><path d="M7 5v14l11-7Z" /></>),
  reset: S(<><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5" /><path d="M4 4v4.5h4.5" /></>),
  left: S(<><path d="M19 12H5M11 6l-6 6 6 6" /></>),
  right: S(<><path d="M5 12h14M13 6l6 6-6 6" /></>),
  info: S(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>),
  alert: S(<><path d="M12 3 2.5 20h19Z" /><path d="M12 10v4M12 17h.01" /></>),
  bulb: S(<><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z" /></>),
  cpu: S(<><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>),
  graph: S(<><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="9" r="2.5" /><path d="M6 8.5v7M8.3 7l7.4 1.3M17 11.3c-1 4-4 5.7-8.6 6.4" /></>),
  clock: S(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  target: S(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>),
  shield: S(<><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6Z" /><path d="m9 12 2 2 4-4" /></>),
  wrench: S(<><path d="M14.7 6.3a4 4 0 0 0 5 5L22 14l-8 8-2.3-2.3a4 4 0 0 0-5-5L4 12l8-8Z" /></>),
  eye: S(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>),
  swap: S(<><path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" /></>),
  download: S(<><path d="M12 3v12M7 11l5 5 5-5" /><path d="M4 19h16" /></>),
  upload: S(<><path d="M12 21V9M7 13l5-5 5 5" /><path d="M4 19h16" /></>),
};

export function BrandMark({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--ink)" />
      <path d="M10 7v18M10 13c0 4 12 2 12 8" stroke="var(--bg)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="10" cy="9" r="2.6" fill="var(--bg)" />
      <circle cx="10" cy="23" r="2.6" fill="var(--accent)" />
      <circle cx="22" cy="21" r="2.6" fill="var(--head)" />
    </svg>
  );
}
