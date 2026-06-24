"use client";

import { useState } from "react";
import { Cake, Dumbbell, Ruler, Scale, Target, User as UserIcon } from "lucide-react";
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
  "w-full rounded-xl border border-line px-3 py-2 text-sm focus:border-brand-bright focus:outline-none";

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
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-xl font-semibold text-brand">
          {initials(user.name)}
        </div>
        <p className="font-medium">{user.name}</p>
        <p className="text-xs text-muted">{user.email}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface p-4 text-center">
          <p className="mb-1 text-xs text-muted">Racha</p>
          <p className="text-lg font-semibold tabular-nums">
            {stats.streak} {stats.streak === 1 ? "día" : "días"}
          </p>
        </div>
        <div className="rounded-xl bg-surface p-4 text-center">
          <p className="mb-1 text-xs text-muted">Promedio</p>
          <p className="text-lg font-semibold tabular-nums">
            {stats.average.toLocaleString("es")}
          </p>
        </div>
      </div>

      {!editing ? (
        <div className="rounded-xl bg-surface">
          <Row Icon={Target} label="Meta diaria" value={`${user.dailyCalories.toLocaleString("es")} kcal`} />
          <Row Icon={Scale} label="Objetivo" value={GOAL_LABELS[user.goal]} />
          <Row Icon={UserIcon} label="Sexo" value={user.sex === "male" ? "Hombre" : "Mujer"} />
          <Row Icon={Cake} label="Edad" value={`${user.age} años`} />
          <Row Icon={Ruler} label="Altura" value={`${user.height} cm`} />
          <Row Icon={Dumbbell} label="Peso" value={`${user.weight} kg`} last />
          <button
            onClick={() => setEditing(true)}
            className="w-full rounded-b-xl border-t border-line py-3 text-sm font-medium text-brand"
          >
            Editar mis datos
          </button>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl bg-surface p-4">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setSex("male")} className={`rounded-xl border py-2 text-sm ${sex === "male" ? "border-brand-bright bg-emerald-50 dark:bg-emerald-500/15 font-medium text-brand" : "border-line"}`}>Hombre</button>
            <button onClick={() => setSex("female")} className={`rounded-xl border py-2 text-sm ${sex === "female" ? "border-brand-bright bg-emerald-50 dark:bg-emerald-500/15 font-medium text-brand" : "border-line"}`}>Mujer</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className="text-xs text-muted">Edad<input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={`${inputCls} mt-1`} /></label>
            <label className="text-xs text-muted">Altura<input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={`${inputCls} mt-1`} /></label>
            <label className="text-xs text-muted">Peso<input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={`${inputCls} mt-1`} /></label>
          </div>
          <label className="block text-xs text-muted">
            Actividad
            <select value={activity} onChange={(e) => setActivity(e.target.value as Activity)} className={`${inputCls} mt-1`}>
              {ACTIVITIES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </label>
          <div>
            <p className="mb-1 text-xs text-muted">Objetivo</p>
            <div className="grid grid-cols-3 gap-2">
              {GOALS.map((g) => (
                <button key={g} onClick={() => setGoal(g)} className={`rounded-xl border py-2 text-xs ${goal === g ? "border-brand-bright bg-emerald-50 dark:bg-emerald-500/15 font-medium text-brand" : "border-line"}`}>
                  {GOAL_LABELS[g].split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/15 p-3 text-center">
            <p className="text-xs text-emerald-700 dark:text-emerald-300">Nueva meta diaria</p>
            <p className="text-xl font-semibold text-brand tabular-nums">{previewCalories.toLocaleString("es")} kcal</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-muted">Cancelar</button>
            <button onClick={save} disabled={saving} className="flex-[2] rounded-xl bg-brand py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Guardando…" : "Guardar"}</button>
          </div>
        </div>
      )}

      <button
        onClick={onLogout}
        className="mt-6 w-full rounded-xl border border-line py-3 text-sm font-medium text-muted transition-colors hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-500/15 hover:text-red-600"
      >
        Cerrar sesión
      </button>
    </div>
  );
}

function Row({
  Icon,
  label,
  value,
  last,
}: {
  Icon: typeof Target;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${last ? "" : "border-b border-line"}`}>
      <span className="flex items-center gap-2 text-sm">
        <Icon size={16} className="text-faint" />
        {label}
      </span>
      <span className="text-sm text-muted">{value}</span>
    </div>
  );
}
