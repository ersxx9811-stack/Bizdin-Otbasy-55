import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { useWidth } from '../hooks';
import type { Photo } from '../data/photos';
import { Img } from './Img';
import { Reveal } from './Reveal';

const CAPTION_H = 108; // карточка астындағы мәтін биіктігі (шамамен)

function colsFor(w: number) { return w >= 1180 ? 3 : w >= 640 ? 2 : 1; }

/** Masonry: әр карточка ең қысқа бағанға түседі, реті сақталады */
export function Gallery({ photos, onOpen, flatIndexOf, actions }: { photos: Photo[]; onOpen: (p: Photo) => void; flatIndexOf?: (p: Photo) => number; actions?: (p: Photo) => ReactNode }) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const cols = colsFor(w || 1200);
  const gap = cols === 1 ? 20 : 28;
  const columns = useMemo(() => {
    const colW = ((w || 1200) - gap * (cols - 1)) / cols;
    const heights = Array(cols).fill(0);
    const out: { p: Photo; i: number }[][] = Array.from({ length: cols }, () => []);
    photos.forEach((p, i) => {
      const h = Math.min(colW * 1.45, colW / p.ratio) + CAPTION_H + 22;
      const k = heights.indexOf(Math.min(...heights));
      out[k].push({ p, i }); heights[k] += h + gap;
    });
    return out;
  }, [photos, cols, w, gap]);
  const sizes = cols === 3 ? '(min-width:1280px) 410px, 33vw' : cols === 2 ? '50vw' : '100vw';

  return (
    <div ref={ref} className="masonry" style={{ ['--gap' as any]: gap + 'px' } as CSSProperties}>
      {columns.map((col, ci) => (
        <div className="m-col" key={ci}>
          {col.map(({ p, i }) => (
            <Reveal key={p.id} kind="up" delay={Math.min(0.5, (i % 6) * 0.06)}>
              <article className="pcard">
                <button className="pcard-btn" onClick={() => onOpen(p)} aria-label={`Үлкейтіп көру: ${p.title}`}>
                  <span className="pcard-frame" style={{ aspectRatio: String(Math.max(p.ratio, 0.68)) }}>
                    <Img photo={p} sizes={sizes} className="pcard-img" />
                    <span className="pcard-shade" />
                    <span className="pcard-open" aria-hidden>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
                    </span>
                    <span className="pcard-no">№ {String(flatIndexOf ? flatIndexOf(p) : p.index).padStart(2, '0')}</span>
                  </span>
                  <span className="pcard-cap">
                    <span className="pcard-meta"><i>{p.date}</i><b>{p.cat}</b></span>
                    <span className="pcard-title">{p.title}</span>
                    <span className="pcard-note">{p.note}</span>
                  </span>
                </button>
                {actions?.(p)}
              </article>
            </Reveal>
          ))}
        </div>
      ))}
    </div>
  );
}
