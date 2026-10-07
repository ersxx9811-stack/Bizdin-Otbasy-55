import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { A, type Photo } from '../data/photos';

const fine = () => matchMedia('(hover:hover) and (pointer:fine)').matches;

export function Lightbox({ photos, index, onClose, onIndex }: { photos: Photo[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const p = photos[index];
  const [dir, setDir] = useState<'next' | 'prev' | ''>('');
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [dx, setDx] = useState(0);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const n = photos.length;

  const step = useCallback((d: 1 | -1) => {
    setDir(d === 1 ? 'next' : 'prev'); setZoom(false); setLoaded(false);
    onIndex((index + d + n) % n);
  }, [index, n, onIndex]);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add('lb-open');
    closeBtn.current?.focus();
    return () => { document.documentElement.classList.remove('lb-open'); prevFocus?.focus?.(); };
  }, []);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab') { // фокусты диалог ішінде ұстау
        const f = Array.from(document.querySelectorAll<HTMLElement>('.lb button, .lb a'));
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [onClose, step]);

  // көрші фотоларды алдын ала жүктеу
  useEffect(() => {
    [1, -1, 2].forEach((d) => { const q = photos[(index + d + n) % n]; if (q) { const im = new Image(); im.srcset = q.srcSet; im.sizes = '100vw'; im.src = q.large; } });
    strip.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [index, photos, n]);

  const down = (e: PointerEvent) => { drag.current = { x: e.clientX, y: e.clientY, moved: false }; (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); };
  const move = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) { if (zoom && stage.current && fine()) { const r = stage.current.getBoundingClientRect(); stage.current.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); stage.current.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); } return; }
    const ddx = e.clientX - d.x;
    if (Math.abs(ddx) > 6) d.moved = true;
    if (!zoom && d.moved) setDx(ddx);
    if (zoom && fine() && stage.current) { const r = stage.current.getBoundingClientRect(); stage.current.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); stage.current.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); }
  };
  const up = (e: PointerEvent) => {
    const d = drag.current; drag.current = null; if (!d) return;
    const ddx = e.clientX - d.x, ddy = e.clientY - d.y;
    setDx(0);
    if (!zoom && Math.abs(ddx) > 70 && Math.abs(ddx) > Math.abs(ddy)) { step(ddx < 0 ? 1 : -1); return; }
    if (!d.moved && fine()) { // басу — үлкейту/кішірейту (тек тінтуір)
      if (stage.current) { const r = stage.current.getBoundingClientRect(); stage.current.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); stage.current.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); }
      setZoom((z) => !z);
    }
  };

  return createPortal(
    <div className="lb" role="dialog" aria-modal="true" aria-label={`Фото көрсету: ${p.title}`}>
      <div className="lb-bg" style={{ backgroundImage: `url(${p.blur})` }} onClick={onClose} />
      <header className="lb-top">
        <div className="lb-count"><b>{String(index + 1).padStart(2, '0')}</b><span> / {String(n).padStart(2, '0')}</span></div>
        <div className="lb-actions">
          <a className="lb-btn lb-orig" href={p.src} target="_blank" rel="noopener" title="Түпнұсқа сапада ашу">Түпнұсқа</a>
          <button ref={closeBtn} className="lb-btn lb-x" onClick={onClose} aria-label="Жабу">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </div>
      </header>

      <div className="lb-main">
        <button className="lb-nav prev" onClick={() => step(-1)} aria-label="Алдыңғы фото"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M15 5l-7 7 7 7" /></svg></button>
        <div
          ref={stage}
          className={`lb-stage ${zoom ? 'zoom' : ''}`}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { drag.current = null; setDx(0); }}
        >
          <figure key={p.id} className={`lb-fig ${dir ? 'go-' + dir : ''} ${loaded ? 'ok' : ''}`} style={{ transform: dx ? `translateX(${dx}px)` : undefined, transition: dx ? 'none' : undefined }}>
            <span className="lb-ph">
              <img
                src={p.large} srcSet={p.srcSet} sizes="100vw" alt={`${p.title} — ${p.note}`} draggable={false}
                onLoad={() => setLoaded(true)}
                ref={(el) => { if (el?.complete && el.naturalWidth) setLoaded(true); }}
              />
            </span>
          </figure>
        </div>
        <button className="lb-nav next" onClick={() => step(1)} aria-label="Келесі фото"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 5l7 7-7 7" /></svg></button>
      </div>

      <footer className="lb-bottom">
        <div className="lb-cap" key={p.id}>
          <span className="lb-meta">{p.date} · {p.cat}</span>
          <h3>{p.title}</h3>
          <p>{p.note}</p>
        </div>
        <div className="lb-strip" ref={strip}>
          {photos.map((q, i) => (
            <button key={q.id} aria-current={i === index} aria-label={`${i + 1}-фото: ${q.title}`} className={i === index ? 'on' : ''} onClick={() => { setDir(i > index ? 'next' : 'prev'); setZoom(false); setLoaded(false); onIndex(i); }}>
              <img src={A(`images/optimized/${q.section}/${q.id}-640.webp`)} alt="" loading="lazy" draggable={false} />
            </button>
          ))}
        </div>
      </footer>
    </div>,
    document.body
  );
}
