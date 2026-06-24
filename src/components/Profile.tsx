"use client";

import { useState } from "react";
import { type Goal, type Meal, caloriesForGoal, getStats, initials } from "@/lib/meals";
import { type User, updateUser } from "@/lib/api";

const GOAL_LABELS: Record<Goal, string> = {
  perder: "Bajar de peso",
  mantener: "Mantener peso",
  ganar: "Subir de peso",
};

const GOAL_CYCLE: Goal[] = ["perder", "mantener", "ganar"];

export default function Profile({
  user,
  meals,
  onUserChange,
  onLogout,
}: {
  user: User;
  meals: Meal[];
  onUserChange: (u: User) => void;
  onLogout: () => void;
}) {
  const stats = getStats(meals);
  const [saving, setSaving] = useState(false);

  async function cycleGoal() {
    if (saving) return;
    const next = GOAL_CYCLE[(GOAL_CYCLE.indexOf(user.goal) + 1) % GOAL_CYCLE.length];
    setSaving(true);
    try {
      const updated = await updateUser({ goal: next, dailyCalories: caloriesForGoal(next) });
      onUserChange(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-5 pt-4 md:max-w-2xl md:px-0 md:pt-0">
      <h2 className="mb-5 text-sm font-medium">Perfil</h2>

      <div className="mb-5 flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-brand">
          {initials(user.name)}
        </div>
        <p className="font-medium">{user.name}</p>
        <p className="text-xs text-neutral-500">{user.email}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 text-center">
          <p className="mb-1 text-xs text-neutral-500">Racha</p>
          <p className="text-lg font-semibold tabular-nums">
            {stats.streak} {stats.streak === 1 ? "día" : "días"}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 text-center">
          <p className="mb-1 text-xs text-neutral-500">Promedio</p>
          <p className="text-lg font-semibold tabular-nums">
            {stats.average.toLocaleString("es")}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white">
        <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3.5">
          <span className="text-lg">🎯</span>
          <span className="flex-1 text-sm">Meta diaria</span>
          <span className="text-sm text-neutral-500 tabular-nums">
            {user.dailyCalories.toLocaleString("es")} kcal
          </span>
        </div>
        <button
          onClick={cycleGoal}
          disabled={saving}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left disabled:opacity-60"
        >
          <span className="text-lg">⚖️</span>
          <span className="flex-1 text-sm">Objetivo</span>
          <span className="text-sm text-neutral-500">{GOAL_LABELS[user.goal]}</span>
          <span className="text-neutral-300">›</span>
        </button>
      </div>

      <p className="mt-3 px-1 text-xs text-neutral-400">
        Toca “Objetivo” para cambiar tu meta. (Pronto: recordatorios.)
      </p>

      <button
        onClick={onLogout}
        className="mt-6 w-full rounded-xl border border-neutral-300 py-3 text-sm font-medium text-neutral-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
