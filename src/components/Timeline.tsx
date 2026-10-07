import { useEffect, useRef } from 'react';
import { TIMELINE } from '../data/content';
import { byId } from '../data/photos';
import { Img } from './Img';
import { Reveal } from './Reveal';
import { reduced } from '../hooks';

/** Анимациялы тік уақыт желісі: сызық скролл кезінде толады */
export function Timeline() {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.62 - r.top) / r.height));
      el.style.setProperty('--fill', reduced() ? '1' : p.toFixed(3));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <ol className="tl" ref={ref}>
      <span className="tl-line" aria-hidden><span /></span>
      {TIMELINE.map((m, i) => (
        <li key={m.title + m.date} className={`tl-item ${i % 2 ? 'r' : 'l'}`}>
          <span className="tl-dot" aria-hidden />
          <Reveal kind={i % 2 ? 'right' : 'left'} className="tl-card">
            <div className="tl-photos" data-n={m.photos.length}>
              {m.photos.map((id) => <Img key={id} photo={byId(id)} sizes="(min-width:900px) 360px, 90vw" className="tl-img" />)}
            </div>
            <div className="tl-body">
              <span className="tl-date"><b>{m.year}</b> · {m.date}</span>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
