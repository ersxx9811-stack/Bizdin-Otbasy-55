import { useEffect, useState, type ReactNode, type MouseEvent } from 'react';

export type Path = '/' | '/otbasy' | '/estelikter' | '/albomdar';
export const PATHS: Path[] = ['/', '/otbasy', '/estelikter', '/albomdar'];

const parse = (): Path => {
  const h = (location.hash.replace(/^#/, '').split('?')[0] || '/') as Path;
  return PATHS.includes(h) ? h : '/';
};

let pendingAnchor: string | null = null;

export function useRoute(): Path {
  const [p, setP] = useState<Path>(parse());
  useEffect(() => {
    const on = () => setP(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return p;
}

/** Бет ауысқан соң: якорьға немесе жоғарыға айналдыру */
export function useScrollAfterRoute(path: Path) {
  useEffect(() => {
    const a = pendingAnchor; pendingAnchor = null;
    const run = () => {
      if (a) document.getElementById(a)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    if (a) setTimeout(run, 650); else run();
  }, [path]);
}

export function go(to: Path, anchor?: string) {
  if (parse() === to) {
    if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  pendingAnchor = anchor ?? null;
  document.documentElement.classList.add('leaving');
  window.setTimeout(() => {
    location.hash = to;
    window.setTimeout(() => document.documentElement.classList.remove('leaving'), 60);
  }, 480);
}

export function Link({ to, anchor, className, children, onClick }: { to: Path; anchor?: string; className?: string; children: ReactNode; onClick?: () => void }) {
  const h = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault(); onClick?.(); go(to, anchor);
  };
  return <a href={'#' + to} className={className} onClick={h}>{children}</a>;
}

/** #/albomdar?t=<тақырып id> — ашық тақырып */
export const topicFromHash = (): string | null => new URLSearchParams(location.hash.split('?')[1] || '').get('t');
export function useTopicId(): string | null {
  const [t, setT] = useState(topicFromHash());
  useEffect(() => { const on = () => setT(topicFromHash()); window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on); }, []);
  return t;
}
export const openTopic = (id: string | null) => { location.hash = id ? `#/albomdar?t=${id}` : '#/albomdar'; };
