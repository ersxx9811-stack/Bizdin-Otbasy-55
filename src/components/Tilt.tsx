import { useRef, type ReactNode, type CSSProperties, type PointerEvent } from 'react';

/** 3D көлбеу (hover) + жылтыр */
export function Tilt({ children, className = '', max = 9, style }: { children: ReactNode; className?: string; max?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', ((0.5 - y) * max * 2).toFixed(2) + 'deg');
    el.style.setProperty('--ry', ((x - 0.5) * max * 2).toFixed(2) + 'deg');
    el.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
    el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
  };
  const leave = () => {
    const el = ref.current; if (!el) return;
    el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
  };
  return (
    <div className="tilt-wrap" style={style}>
      <div ref={ref} className={`tilt ${className}`} onPointerMove={move} onPointerLeave={leave}>
        {children}
        <span className="tilt-glare" aria-hidden />
      </div>
    </div>
  );
}
