"use client";

import { useState } from "react";
import { Logo } from "@/components/ui";
import { type Goal } from "@/lib/meals";
import { type Activity, type Sex, ACTIVITIES, dailyCaloriesFor } from "@/lib/nutrition";
import { type User, login, register } from "@/lib/api";

const GOALS: { id: Goal; label: string; icon: string }[] = [
  { id: "perder", label: "Bajar", icon: "📉" },
  { id: "mantener", label: "Mantener", icon: "⚖️" },
  { id: "ganar", label: "Subir", icon: "📈" },
];

type Mode = "welcome" | "login" | "register";

const inputCls =
  "w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand-bright focus:outline-none";

export default function Auth({ onAuthed }: { onAuthed: (u: User) => void }) {
  const [mode, setMode] = useState<Mode>("welcome");
  const [regStep, setRegStep] = useState<0 | 1>(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState<Activity>("moderado");
  const [goal, setGoal] = useState<Goal>("mantener");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profile = {
    weight: Number(weight) || 70,
    height: Number(height) || 170,
    age: Number(age) || 25,
    sex,
    activity,
    goal,
  };
  const previewCalories = dailyCaloriesFor(profile);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const user =
        mode === "register"
          ? await register({ name: name.trim(), email: email.trim(), password, ...profile })
          : await login(email.trim(), password);
      onAuthed(user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo salió mal.");
    } finally {
      setLoading(false);
    }
  }

  if (mode === "welcome") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-brand px-8 text-center text-white">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15">
          <Logo className="h-16 w-16" />
        </div>
        <h1 className="mb-2 text-3xl font-semibold">Plato</h1>
        <p className="mb-10 max-w-xs text-emerald-50">
          Cuenta tus calorías con solo una foto de tu comida.
        </p>
        <button
          onClick={() => setMode("register")}
          className="mb-3 w-full max-w-xs rounded-2xl bg-white py-3.5 font-medium text-brand active:scale-[0.99]"
        >
          Crear cuenta
        </button>
        <button
          onClick={() => setMode("login")}
          className="text-sm text-emerald-50 underline-offset-4 hover:underline"
        >
          Ya tengo cuenta
        </button>
      </div>
    );
  }

  const isRegister = mode === "register";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand">
            <Logo className="h-7 w-7" />
          </div>
          <h1 className="text-lg font-semibold">
            {isRegister ? (regStep === 0 ? "Crear cuenta" : "Tus datos") : "Iniciar sesión"}
          </h1>
        </div>

        {/* LOGIN */}
        {!isRegister && (
          <div className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" autoComplete="email" className={inputCls} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && email.trim() && password && submit()} placeholder="Contraseña" autoComplete="current-password" className={inputCls} />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
            <button onClick={submit} disabled={!email.trim() || !password || loading} className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-white active:scale-[0.99] disabled:opacity-50">
              {loading ? "Un momento…" : "Entrar"}
            </button>
          </div>
        )}

        {/* REGISTER — paso 0: cuenta */}
        {isRegister && regStep === 0 && (
          <div className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className={inputCls} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" autoComplete="email" className={inputCls} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña (mín. 6)" autoComplete="new-password" className={inputCls} />
            <button onClick={() => { setError(null); setRegStep(1); }} disabled={!name.trim() || !email.trim() || password.length < 6} className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-white active:scale-[0.99] disabled:opacity-50">
              Continuar
            </button>
          </div>
        )}

        {/* REGISTER — paso 1: perfil para TDEE */}
        {isRegister && regStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSex("male")} className={`rounded-xl border py-2.5 text-sm ${sex === "male" ? "border-brand-bright bg-emerald-50 font-medium text-brand" : "border-neutral-200"}`}>Hombre</button>
              <button onClick={() => setSex("female")} className={`rounded-xl border py-2.5 text-sm ${sex === "female" ? "border-brand-bright bg-emerald-50 font-medium text-brand" : "border-neutral-200"}`}>Mujer</button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-neutral-500">Edad<input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={`${inputCls} mt-1`} /></label>
              <label className="text-xs text-neutral-500">Altura cm<input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={`${inputCls} mt-1`} /></label>
              <label className="text-xs text-neutral-500">Peso kg<input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={`${inputCls} mt-1`} /></label>
            </div>

            <label className="block text-xs text-neutral-500">
              Actividad
              <select value={activity} onChange={(e) => setActivity(e.target.value as Activity)} className={`${inputCls} mt-1`}>
                {ACTIVITIES.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </label>

            <div>
              <p className="mb-1 text-xs text-neutral-500">Objetivo</p>
              <div className="grid grid-cols-3 gap-2">
                {GOALS.map((g) => (
                  <button key={g.id} onClick={() => setGoal(g.id)} className={`rounded-xl border px-2 py-2.5 text-center text-xs ${goal === g.id ? "border-brand-bright bg-emerald-50 font-medium text-brand" : "border-neutral-200"}`}>
                    <span className="block text-base">{g.icon}</span>{g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-xs text-emerald-700">Tu meta diaria calculada</p>
              <p className="text-2xl font-semibold text-brand tabular-nums">
                {previewCalories.toLocaleString("es")}{" "}
                <span className="text-sm font-normal">kcal</span>
              </p>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setRegStep(0)} className="flex-1 rounded-xl border border-neutral-300 py-3 text-sm font-medium text-neutral-600">Atrás</button>
              <button onClick={submit} disabled={loading} className="flex-[2] rounded-xl bg-brand py-3 text-sm font-medium text-white active:scale-[0.99] disabled:opacity-50">
                {loading ? "Creando…" : "Crear cuenta"}
              </button>
            </div>
          </div>
        )}

        {regStep === 0 && (
          <p className="mt-4 text-center text-xs text-neutral-500">
            {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
            <button onClick={() => { setError(null); setMode(isRegister ? "login" : "register"); }} className="font-medium text-brand hover:underline">
              {isRegister ? "Inicia sesión" : "Créala aquí"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
