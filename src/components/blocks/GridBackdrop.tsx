import { cn } from '@/lib/cn';

type GridBackdropProps = {
  className?: string;
  size?: number;
  radius?: number;
  glowId?: string;
};

export function GridBackdrop({
  className,
  size = 26,
  radius = 1,
  glowId = 'grid-glow',
}: GridBackdropProps) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div
        data-backdrop-glow
        className="absolute top-1/2 left-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--signal-violet) 34%, transparent) 0%, color-mix(in oklab, var(--signal-cyan) 22%, transparent) 34%, transparent 66%)',
        }}
      />
      <svg className="absolute inset-0 h-full w-full" fill="none">
        <defs>
          <pattern id={glowId} width={size} height={size} patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r={radius} className="fill-[var(--ink-faint)]" />
          </pattern>
          <radialGradient id={`${glowId}-fade`} cx="50%" cy="34%" r="62%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="100%" stopColor="white" stopOpacity="0.08" />
          </radialGradient>
          <mask id={`${glowId}-mask`}>
            <rect width="100%" height="100%" fill={`url(#${glowId}-fade)`} />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${glowId})`} mask={`url(#${glowId}-mask)`} />
      </svg>
    </div>
  );
}
