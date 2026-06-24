"use client";

import { useState } from "react";
import { Logo } from "@/components/ui";
import { type Goal, caloriesForGoal } from "@/lib/meals";
import { type User, login, register } from "@/lib/api";

const GOALS: { id: Goal; label: string; icon: string }[] = [
  { id: "perder", label: "Bajar de peso", icon: "📉" },
  { id: "mantener", label: "Mantener", icon: "⚖️" },
  { id: "ganar", label: "Subir de peso", icon: "📈" },
];

type Mode = "welcome" | "login" | "register";

export default function Auth({ onAuthed }: { onAuthed: (u: User) => void }) {
  const [mode, setMode] = useState<Mode>("welcome");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [goal, setGoal] = useState<Goal>("mantener");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const user =
        mode === "register"
          ? await register({
              name: name.trim(),
              email: email.trim(),
              password,
              goal,
              dailyCalories: caloriesForGoal(goal),
            })
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
  const canSubmit =
    email.trim() && password && (!isRegister || name.trim());

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand">
            <Logo className="h-7 w-7" />
          </div>
          <h1 className="text-lg font-semibold">
            {isRegister ? "Crear cuenta" : "Iniciar sesión"}
          </h1>
        </div>

        <div className="space-y-3">
          {isRegister && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand-bright focus:outline-none"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand-bright focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
            placeholder="Contraseña"
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand-bright focus:outline-none"
          />

          {isRegister && (
            <div>
              <p className="mb-2 mt-1 text-xs text-neutral-500">¿Cuál es tu meta?</p>
              <div className="grid grid-cols-3 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`rounded-xl border px-2 py-2.5 text-center text-xs transition-colors ${
                      goal === g.id
                        ? "border-brand-bright bg-emerald-50 font-medium text-brand"
                        : "border-neutral-200"
                    }`}
                  >
                    <span className="block text-base">{g.icon}</span>
                    {g.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-neutral-500">
                Meta diaria: {caloriesForGoal(goal).toLocaleString("es")} kcal
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
          )}

          <button
            onClick={submit}
            disabled={!canSubmit || loading}
            className="w-full rounded-xl bg-brand py-3 text-sm font-medium text-white active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Un momento…" : isRegister ? "Crear cuenta" : "Entrar"}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-neutral-500">
          {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
          <button
            onClick={() => {
              setError(null);
              setMode(isRegister ? "login" : "register");
            }}
            className="font-medium text-brand hover:underline"
          >
            {isRegister ? "Inicia sesión" : "Créala aquí"}
          </button>
        </p>
      </div>
    </div>
  );
}
