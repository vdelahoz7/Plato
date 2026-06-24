export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <ellipse cx="60" cy="64" rx="44" ry="42" fill="#fff" />
      <circle cx="48" cy="59" r="6" fill="#2B2B29" />
      <circle cx="72" cy="59" r="6" fill="#2B2B29" />
      <circle cx="49.5" cy="57" r="2" fill="#fff" />
      <circle cx="73.5" cy="57" r="2" fill="#fff" />
      <circle cx="41" cy="71" r="5" fill="#F285A0" />
      <circle cx="79" cy="71" r="5" fill="#F285A0" />
      <path
        d="M50 71 Q60 81 70 71"
        fill="none"
        stroke="#2B2B29"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CalorieRing({ total, goal }: { total: number; goal: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(total / goal, 1);
  const offset = circ * (1 - progress);
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--track)" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--brand-bright)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums">
          {total.toLocaleString("es")}
        </span>
        <span className="text-xs text-muted">de {goal.toLocaleString("es")}</span>
      </div>
    </div>
  );
}

export function MacroBar({
  label,
  grams,
  target,
  color,
}: {
  label: string;
  grams: number;
  target: number;
  color: string;
}) {
  const pct = Math.min((grams / target) * 100, 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span style={{ color }}>{label}</span>
        <span className="font-medium tabular-nums">{Math.round(grams)} g</span>
      </div>
      <div className="h-1.5 rounded-full bg-track">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
