"use client";

import { useEffect, useRef, useState } from "react";
import { CalorieRing, Logo, MacroBar } from "@/components/ui";
import Auth from "@/components/Auth";
import Profile from "@/components/Profile";
import Stats from "@/components/Stats";
import Historial from "@/components/Historial";
import {
  type Analysis,
  type Meal,
  sumTotals,
  todayMeals,
} from "@/lib/meals";
import {
  type User,
  addMeal,
  deleteMeal,
  fetchMe,
  fetchMeals,
  logout as logoutApi,
} from "@/lib/api";

const MACRO_TARGETS = { protein: 120, carbs: 250, fat: 70 };

type Screen = "diario" | "stats" | "historial" | "perfil";

const NAV: { id: Screen; label: string; icon: string }[] = [
  { id: "diario", label: "Inicio", icon: "🏠" },
  { id: "stats", label: "Estadísticas", icon: "📊" },
  { id: "historial", label: "Historial", icon: "📅" },
  { id: "perfil", label: "Perfil", icon: "👤" },
];

export default function Home() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [screen, setScreen] = useState<Screen>("diario");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const me = await fetchMe();
      setUser(me);
      if (me) setMeals(await fetchMeals().catch(() => []));
      setReady(true);
    })();
  }, []);

  async function onAuthed(u: User) {
    setUser(u);
    setMeals(await fetchMeals().catch(() => []));
    setScreen("diario");
  }

  if (!ready) return null;
  if (!user) return <Auth onAuthed={onAuthed} />;

  const today = todayMeals(meals);
  const totals = sumTotals(today);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setAnalyzing(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch("/api/analyze", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo analizar la imagen.");
        return;
      }
      setResult(data as Analysis);
    } catch {
      setError("Error de conexión. Revisa que el servidor esté corriendo.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function confirmAdd() {
    if (!result) return;
    try {
      const meal = await addMeal(result);
      setMeals((prev) => [meal, ...prev]);
      setResult(null);
    } catch {
      setError("No se pudo guardar la comida.");
    }
  }

  async function handleDelete(id: string) {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    await deleteMeal(id).catch(() => {});
  }

  async function logout() {
    await logoutApi();
    setUser(null);
    setMeals([]);
    setScreen("diario");
  }

  const diary = (
    <div className="mx-auto w-full max-w-md px-4 md:max-w-4xl md:px-0">
      <div className="md:grid md:grid-cols-5 md:gap-5">
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 md:col-span-2 md:self-start">
          <div className="flex items-center gap-5 md:flex-col md:gap-6">
            <CalorieRing total={Math.round(totals.calories)} goal={user.dailyCalories} />
            <div className="flex-1 space-y-3 md:w-full">
              <MacroBar label="Proteína" grams={totals.protein} target={MACRO_TARGETS.protein} color="#1d9e75" />
              <MacroBar label="Carbos" grams={totals.carbs} target={MACRO_TARGETS.carbs} color="#ba7517" />
              <MacroBar label="Grasa" grams={totals.fat} target={MACRO_TARGETS.fat} color="#d85a30" />
            </div>
          </div>
        </section>

        <section className="mt-6 md:col-span-3 md:mt-0">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Comidas de hoy
          </h2>
          {today.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/50 px-5 py-10 text-center md:py-16">
              <p className="text-sm text-neutral-500">
                Aún no registras comidas hoy.
                <br />
                Toma una foto para empezar.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {today.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white px-4 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-lg">
                    🍽️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(m.createdAt).toLocaleTimeString("es", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {Math.round(m.calories)}
                  </span>
                  <button
                    onClick={() => handleDelete(m.id)}
                    aria-label="Eliminar comida"
                    className="ml-1 text-neutral-300 transition-colors hover:text-red-500"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar (escritorio) */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-neutral-200 bg-white p-4 md:flex">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">
            <Logo />
          </div>
          <div className="leading-tight">
            <p className="font-semibold">Plato</p>
            <p className="text-[11px] text-neutral-500">tu día, en una foto</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                screen === item.id
                  ? "bg-emerald-50 font-medium text-brand"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => fileInput.current?.click()}
          disabled={analyzing}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-medium text-white active:scale-[0.99] disabled:opacity-70"
        >
          {analyzing ? "Analizando…" : "📷 Analizar comida"}
        </button>
      </aside>

      {/* Contenido principal */}
      <div className="flex w-full flex-1 flex-col pb-24 md:ml-60 md:pb-10">
        <header className="flex items-center gap-2.5 px-5 py-4 md:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">
            <Logo />
          </div>
          <div className="leading-tight">
            <p className="font-semibold">Plato</p>
            <p className="text-[11px] text-neutral-500">tu día, en una foto</p>
          </div>
        </header>

        <div className="w-full md:px-10 md:pt-10">
          {screen === "diario" ? (
            diary
          ) : screen === "stats" ? (
            <Stats meals={meals} goal={user.dailyCalories} />
          ) : screen === "historial" ? (
            <Historial meals={meals} goal={user.dailyCalories} />
          ) : (
            <Profile user={user} meals={meals} onUserChange={setUser} onLogout={logout} />
          )}
        </div>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      {/* Barra inferior (móvil) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-neutral-200 bg-white/95 py-2.5 backdrop-blur md:hidden">
        <button
          onClick={() => setScreen("diario")}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${screen === "diario" ? "text-brand" : "text-neutral-400"}`}
        >
          <span className="text-lg">🏠</span>
          Inicio
        </button>
        <button
          onClick={() => setScreen("stats")}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${screen === "stats" ? "text-brand" : "text-neutral-400"}`}
        >
          <span className="text-lg">📊</span>
          Stats
        </button>
        <button
          onClick={() => fileInput.current?.click()}
          disabled={analyzing}
          aria-label="Analizar comida"
          className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-brand text-2xl text-white shadow-lg active:scale-95 disabled:opacity-70"
        >
          {analyzing ? "…" : "📷"}
        </button>
        <button
          onClick={() => setScreen("historial")}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${screen === "historial" ? "text-brand" : "text-neutral-400"}`}
        >
          <span className="text-lg">📅</span>
          Historial
        </button>
        <button
          onClick={() => setScreen("perfil")}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${screen === "perfil" ? "text-brand" : "text-neutral-400"}`}
        >
          <span className="text-lg">👤</span>
          Perfil
        </button>
      </nav>

      {analyzing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-6">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-7 text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-neutral-200 border-t-brand" />
            <p className="text-sm font-medium">Identificando alimentos…</p>
            <p className="text-xs text-neutral-500">La IA está analizando tu foto</p>
          </div>
        </div>
      )}

      {result && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 sm:rounded-3xl">
            <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <span>✨</span> Analizado con IA
            </div>
            <div className="mb-4 flex items-start justify-between gap-3">
              <p className="text-base font-semibold">{result.name}</p>
              <p className="shrink-0 text-xl font-semibold tabular-nums">
                {Math.round(result.calories)}
                <span className="text-xs font-normal text-neutral-500"> kcal</span>
              </p>
            </div>

            <ul className="mb-4">
              {result.items.map((it, i) => (
                <li
                  key={i}
                  className="flex justify-between border-t border-neutral-100 py-2 text-sm"
                >
                  <span className="text-neutral-600">{it.name}</span>
                  <span className="font-medium tabular-nums">{Math.round(it.calories)} kcal</span>
                </li>
              ))}
            </ul>

            <div className="mb-5 flex gap-2 text-xs">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
                P {Math.round(result.protein)}g
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">
                C {Math.round(result.carbs)}g
              </span>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-800">
                G {Math.round(result.fat)}g
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setResult(null)}
                className="flex-1 rounded-xl border border-neutral-300 py-3 text-sm font-medium text-neutral-600"
              >
                Descartar
              </button>
              <button
                onClick={confirmAdd}
                className="flex-[2] rounded-xl bg-brand py-3 text-sm font-medium text-white"
              >
                + Agregar al diario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
