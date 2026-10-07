import { type ReactNode, type CSSProperties } from 'react';
import { useInView } from '../hooks';

type Kind = 'up' | 'left' | 'right' | 'zoom' | 'fade' | 'clip';
export function Reveal({ children, kind = 'up', delay = 0, className = '', as: Tag = 'div', style }: { children: ReactNode; kind?: Kind; delay?: number; className?: string; as?: any; style?: CSSProperties }) {
  const [ref, seen] = useInView<HTMLElement>();
  return (
    <Tag ref={ref} className={`rv rv-${kind} ${seen ? 'in' : ''} ${className}`} style={{ ['--d' as any]: `${delay}s`, ...style }}>
      {children}
    </Tag>
  );
}
