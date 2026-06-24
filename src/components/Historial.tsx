"use client";

import { useState } from "react";
import { type Meal, getDailyTotalsMap, keyFor } from "@/lib/meals";

const WEEK = ["L", "M", "M", "J", "V", "S", "D"];

export default function Historial({ meals, goal }: { meals: Meal[]; goal: number }) {
  const map = getDailyTotalsMap(meals);
  const today = new Date();
  const todayKey = keyFor(today);
  const [selected, setSelected] = useState<string>(todayKey);

  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleDateString("es", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // lunes = 0

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const sel = map[selected];
  const selDate = new Date(`${selected}T00:00:00`);
  const selLabel = selDate.toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-5 pt-4 md:max-w-2xl md:px-0 md:pt-0">
      <h2 className="text-sm font-medium">Historial</h2>
      <p className="mb-4 text-xs text-muted first-letter:uppercase">{monthName}</p>

      <div className="rounded-2xl bg-surface p-4">
        <div className="mb-1 grid grid-cols-7 text-center text-[11px] text-faint">
          {WEEK.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {cells.map((day, i) => {
            if (day === null) return <span key={i} />;
            const key = keyFor(new Date(year, month, day));
            const data = map[key];
            const isToday = key === todayKey;
            const isSelected = key === selected;
            const dotColor = data
              ? data.calories > goal
                ? "#d85a30"
                : "#1d9e75"
              : null;
            return (
              <button
                key={i}
                onClick={() => setSelected(key)}
                className="relative flex flex-col items-center py-1.5 text-sm"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    isSelected
                      ? "bg-brand text-white"
                      : isToday
                        ? "font-semibold text-brand"
                        : ""
                  }`}
                >
                  {day}
                </span>
                {dotColor && !isSelected && (
                  <span
                    className="absolute bottom-0.5 h-1 w-1 rounded-full"
                    style={{ background: dotColor }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-surface p-4">
        <p className="mb-1 text-xs text-muted first-letter:uppercase">{selLabel}</p>
        {sel ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-semibold tabular-nums">
                {sel.calories.toLocaleString("es")} kcal
              </span>
              <span
                className="text-xs"
                style={{ color: sel.calories > goal ? "#d85a30" : "#0f6e56" }}
              >
                {sel.calories > goal ? "sobre meta" : "en meta"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {sel.count} {sel.count === 1 ? "comida registrada" : "comidas registradas"}
            </p>
          </>
        ) : (
          <p className="text-sm text-faint">Sin registro este día.</p>
        )}
      </div>
    </div>
  );
}
