"use client";

import { useState } from "react";
import { type Goal, type Meal, getStats, initials } from "@/lib/meals";
import { type Activity, type Sex, ACTIVITIES, dailyCaloriesFor } from "@/lib/nutrition";
import { type User, updateUser } from "@/lib/api";

const GOAL_LABELS: Record<Goal, string> = {
  perder: "Bajar de peso",
  mantener: "Mantener peso",
  ganar: "Subir de peso",
};

const GOALS: Goal[] = ["perder", "mantener", "ganar"];

const inputCls =
  "w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-brand-bright focus:outline-none";

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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form local
  const [sex, setSex] = useState<Sex>(user.sex);
  const [age, setAge] = useState(String(user.age));
  const [height, setHeight] = useState(String(user.height));
  const [weight, setWeight] = useState(String(user.weight));
  const [activity, setActivity] = useState<Activity>(user.activity);
  const [goal, setGoal] = useState<Goal>(user.goal);

  const draft = {
    weight: Number(weight) || user.weight,
    height: Number(height) || user.height,
    age: Number(age) || user.age,
    sex,
    activity,
    goal,
  };
  const previewCalories = dailyCaloriesFor(draft);

  async function save() {
    setSaving(true);
    try {
      const updated = await updateUser(draft);
      onUserChange(updated);
      setEditing(false);
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

      {!editing ? (
        <div className="rounded-xl bg-white">
          <Row label="🎯 Meta diaria" value={`${user.dailyCalories.toLocaleString("es")} kcal`} />
          <Row label="⚖️ Objetivo" value={GOAL_LABELS[user.goal]} />
          <Row label="🚻 Sexo" value={user.sex === "male" ? "Hombre" : "Mujer"} />
          <Row label="🎂 Edad" value={`${user.age} años`} />
          <Row label="📏 Altura" value={`${user.height} cm`} />
          <Row label="🏋️ Peso" value={`${user.weight} kg`} last />
          <button
            onClick={() => setEditing(true)}
            className="w-full rounded-b-xl border-t border-neutral-100 py-3 text-sm font-medium text-brand"
          >
            Editar mis datos
          </button>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl bg-white p-4">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setSex("male")} className={`rounded-xl border py-2 text-sm ${sex === "male" ? "border-brand-bright bg-emerald-50 font-medium text-brand" : "border-neutral-200"}`}>Hombre</button>
            <button onClick={() => setSex("female")} className={`rounded-xl border py-2 text-sm ${sex === "female" ? "border-brand-bright bg-emerald-50 font-medium text-brand" : "border-neutral-200"}`}>Mujer</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-xs text-neutral-500">Edad<input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={`${inputCls} mt-1`} /></label>
            <label className="text-xs text-neutral-500">Altura<input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={`${inputCls} mt-1`} /></label>
            <label className="text-xs text-neutral-500">Peso<input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={`${inputCls} mt-1`} /></label>
          </div>
          <label className="block text-xs text-neutral-500">
            Actividad
            <select value={activity} onChange={(e) => setActivity(e.target.value as Activity)} className={`${inputCls} mt-1`}>
              {ACTIVITIES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </label>
          <div>
            <p className="mb-1 text-xs text-neutral-500">Objetivo</p>
            <div className="grid grid-cols-3 gap-2">
              {GOALS.map((g) => (
                <button key={g} onClick={() => setGoal(g)} className={`rounded-xl border py-2 text-xs ${goal === g ? "border-brand-bright bg-emerald-50 font-medium text-brand" : "border-neutral-200"}`}>
                  {GOAL_LABELS[g].split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <p className="text-xs text-emerald-700">Nueva meta diaria</p>
            <p className="text-xl font-semibold text-brand tabular-nums">{previewCalories.toLocaleString("es")} kcal</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="flex-1 rounded-xl border border-neutral-300 py-2.5 text-sm font-medium text-neutral-600">Cancelar</button>
            <button onClick={save} disabled={saving} className="flex-[2] rounded-xl bg-brand py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Guardando…" : "Guardar"}</button>
          </div>
        </div>
      )}

      <button
        onClick={onLogout}
        className="mt-6 w-full rounded-xl border border-neutral-300 py-3 text-sm font-medium text-neutral-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      >
        Cerrar sesión
      </button>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${last ? "" : "border-b border-neutral-100"}`}>
      <span className="text-sm">{label}</span>
      <span className="text-sm text-neutral-500">{value}</span>
    </div>
  );
}
