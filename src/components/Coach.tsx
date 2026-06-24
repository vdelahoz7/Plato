"use client";

import { useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, Lightbulb, RotateCw } from "lucide-react";
import type { Meal } from "@/lib/meals";

type Feedback = {
  status: "bien" | "atencion" | "alerta" | string;
  headline: string;
  analysis: string;
  tips: string[];
};

const STATUS_STYLE: Record<
  string,
  { bg: string; border: string; text: string; Icon: typeof Bot }
> = {
  bien: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", Icon: CheckCircle2 },
  atencion: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", Icon: Lightbulb },
  alerta: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", Icon: AlertTriangle },
};

export default function Coach({
  today,
  stats,
}: {
  today: Meal[];
  stats: { average: number; streak: number };
}) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meals: today.map((m) => ({
            name: m.name,
            calories: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fat: m.fat,
          })),
          context: { average: stats.average, streak: stats.streak },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo obtener el consejo.");
        return;
      }
      setFeedback(data as Feedback);
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  const style = feedback ? STATUS_STYLE[feedback.status] ?? STATUS_STYLE.atencion : null;
  const StatusIcon = style?.Icon ?? Lightbulb;

  return (
    <section className="mt-6">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
        Coach con IA
      </h2>

      {!feedback && (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 text-center">
          <Bot size={32} className="mx-auto mb-3 text-brand" />
          <p className="mb-4 text-sm text-neutral-600">
            {today.length === 0
              ? "Registra una comida y tu coach analizará cómo vas hoy."
              : "Tu coach puede analizar lo que llevas hoy y darte consejos."}
          </p>
          <button
            onClick={ask}
            disabled={loading || today.length === 0}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Pensando…" : "¿Cómo voy hoy?"}
          </button>
          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
        </div>
      )}

      {feedback && style && (
        <div className={`rounded-2xl border ${style.border} ${style.bg} p-5`}>
          <div className="mb-2 flex items-center gap-2">
            <StatusIcon size={20} className={style.text} />
            <p className={`font-semibold ${style.text}`}>{feedback.headline}</p>
          </div>
          <p className="mb-3 text-sm text-neutral-700">{feedback.analysis}</p>
          <ul className="space-y-1.5">
            {feedback.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-neutral-700">
                <span className={style.text}>•</span>
                {tip}
              </li>
            ))}
          </ul>
          <button
            onClick={ask}
            disabled={loading}
            className="mt-4 flex items-center gap-1 text-xs font-medium text-brand hover:underline disabled:opacity-50"
          >
            <RotateCw size={12} /> {loading ? "Pensando…" : "Volver a analizar"}
          </button>
        </div>
      )}
    </section>
  );
}
