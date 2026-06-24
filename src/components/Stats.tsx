"use client";

import { type Meal, getDailyTotalsMap, keyFor } from "@/lib/meals";

const DAY_LABELS = ["D", "L", "M", "M", "J", "V", "S"];

export default function Stats({ meals, goal }: { meals: Meal[]; goal: number }) {
  const map = getDailyTotalsMap(meals);

  // Últimos 7 días terminando hoy.
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const cals = map[keyFor(d)]?.calories ?? 0;
    return { label: DAY_LABELS[d.getDay()], cals, over: cals > goal };
  });

  const withData = days.filter((d) => d.cals > 0);
  const average =
    withData.length > 0
      ? Math.round(withData.reduce((a, d) => a + d.cals, 0) / withData.length)
      : 0;
  const inGoal = withData.filter((d) => !d.over).length;

  const max = Math.max(goal, ...days.map((d) => d.cals)) * 1.15;
  const goalPct = (goal / max) * 100;

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-5 pt-4 md:max-w-2xl md:px-0 md:pt-0">
      <h2 className="text-sm font-medium">Estadísticas</h2>
      <p className="mb-4 text-xs text-neutral-500">Esta semana</p>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4">
          <p className="mb-1 text-xs text-neutral-500">Promedio</p>
          <p className="text-lg font-semibold tabular-nums">
            {average.toLocaleString("es")}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4">
          <p className="mb-1 text-xs text-neutral-500">En meta</p>
          <p className="text-lg font-semibold tabular-nums">
            {inGoal}/{withData.length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4">
        <div className="relative flex h-44 items-stretch justify-between gap-2">
          <div
            className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-amber-500"
            style={{ bottom: `${goalPct}%` }}
          >
            <span className="absolute -top-4 right-0 bg-white pl-1 text-[11px] text-amber-700">
              meta
            </span>
          </div>
          {days.map((d, i) => (
            <div
              key={i}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <div
                className="w-full rounded-t transition-[height] duration-500"
                style={{
                  height: `${Math.max((d.cals / max) * 100, d.cals > 0 ? 4 : 1)}%`,
                  background: d.cals === 0 ? "#e2e5e0" : d.over ? "#d85a30" : "#1d9e75",
                }}
              />
              <span className="text-[11px] text-neutral-500">{d.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: "#1d9e75" }} /> en meta
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: "#d85a30" }} /> sobre meta
          </span>
        </div>
      </div>

      {withData.length === 0 && (
        <p className="mt-4 text-center text-xs text-neutral-400">
          Registra comidas para ver tu progreso de la semana.
        </p>
      )}
    </div>
  );
}
