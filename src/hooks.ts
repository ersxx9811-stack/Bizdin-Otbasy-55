import { useEffect, useRef, useState } from 'react';

export const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Элемент көрінген кезде bir рет true болады */
export function useInView<T extends Element>(opts: IntersectionObserverInit = { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); } }, opts);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, seen] as const;
}

/** [data-parallax="0.2"] элементтерін скролл кезінде жылжытады */
export function useParallax(dep: unknown) {
  useEffect(() => {
    if (reduced()) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = innerHeight;
      document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const s = parseFloat(el.dataset.parallax || '0.15');
        const d = (r.top + r.height / 2 - vh / 2) * s;
        el.style.setProperty('--py', d.toFixed(1) + 'px');
      });
      const root = document.documentElement;
      const max = root.scrollHeight - vh;
      root.style.setProperty('--progress', max > 0 ? (scrollY / max).toFixed(4) : '0');
      root.classList.toggle('scrolled', scrollY > 40);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
    const t = setTimeout(tick, 700);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); clearTimeout(t); };
  }, [dep]);
}

export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}
