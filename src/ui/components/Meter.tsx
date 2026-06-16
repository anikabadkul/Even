interface MeterProps {
  pct: number; // 0-100
  color?: string;
  withGapStripe?: boolean;
  height?: number;
}

export function Meter({ pct, color = 'var(--color-accent)', withGapStripe, height = 14 }: MeterProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="relative rounded-full bg-paper overflow-hidden" style={{ height }}>
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out"
        style={{ width: `${clamped}%`, background: color }}
      />
      {withGapStripe && (
        <div
          className="absolute inset-y-0 right-0"
          style={{
            left: `${clamped}%`,
            background:
              'repeating-linear-gradient(45deg, var(--color-amber-soft) 0 6px, #fbf3e6 6px 12px)',
          }}
        />
      )}
    </div>
  );
}
