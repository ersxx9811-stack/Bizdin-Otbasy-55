import { useState, useRef, useEffect, type CSSProperties } from 'react';
import type { Photo } from '../data/photos';

/** Блюр-плейсхолдері бар, сапалы lazy loading кескіні. Қатынасы алдын ала белгілі — орын секірмейді. */
export function Img({ photo, sizes, eager = false, fit = 'cover', pos, zoom, origin, className = '', style, alt }: {
  photo: Photo; sizes: string; eager?: boolean; fit?: 'cover' | 'contain'; pos?: string; zoom?: number; origin?: string; className?: string; style?: CSSProperties; alt?: string;
}) {
  const [ok, setOk] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => { if (ref.current?.complete && ref.current.naturalWidth) setOk(true); }, []);
  return (
    <span className={`img ${ok ? 'ok' : ''} ${zoom ? 'zoomed' : ''} ${className}`} style={{ backgroundColor: photo.color, backgroundImage: `url(${photo.blur})`, ...(zoom ? { ['--z' as any]: zoom, ['--o' as any]: origin ?? pos ?? 'center' } : {}), ...style }}>
      <img
        ref={ref}
        src={photo.large}
        srcSet={photo.srcSet}
        sizes={sizes}
        width={photo.w} height={photo.h}
        alt={alt ?? `${photo.title} — ${photo.note}`}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        {...(eager ? { fetchPriority: 'high' as const } : {})}
        onLoad={() => setOk(true)}
        style={{ objectFit: fit, objectPosition: pos }}
        draggable={false}
      />
    </span>
  );
}
