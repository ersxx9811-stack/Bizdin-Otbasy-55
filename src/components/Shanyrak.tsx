/** Шаңырақ (киіз үйдің төбесі) — сызылып шығатын SVG */
export function Shanyrak({ className = '', draw = false, spin = false }: { className?: string; draw?: boolean; spin?: boolean }) {
  const spokes = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg className={`shanyrak ${draw ? 'draw' : ''} ${spin ? 'spin' : ''} ${className}`} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <circle cx="100" cy="100" r="92" pathLength={1} />
      <circle cx="100" cy="100" r="84" pathLength={1} strokeWidth="0.7" />
      <circle cx="100" cy="100" r="30" pathLength={1} />
      <circle cx="100" cy="100" r="10" pathLength={1} />
      {spokes.map((a) => (
        <g key={a} transform={`rotate(${a} 100 100)`}>
          <path d="M100 8 C 86 44, 86 70, 100 70 C 114 70, 114 44, 100 8" pathLength={1} strokeWidth="0.9" />
          <path d="M100 70 V 30" pathLength={1} strokeWidth="0.6" />
        </g>
      ))}
      <path d="M100 8v184M8 100h184" pathLength={1} strokeWidth="0.7" />
    </svg>
  );
}
