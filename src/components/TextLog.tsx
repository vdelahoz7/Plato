"use client";

import { useRef, useState } from "react";
import type { Analysis } from "@/lib/meals";

interface SpeechResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: (e: SpeechResultEvent) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function TextLog({
  onResult,
  setBusy,
  setError,
}: {
  onResult: (a: Analysis) => void;
  setBusy: (b: boolean) => void;
  setError: (e: string | null) => void;
}) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const SpeechCtor = getSpeechRecognition();

  async function analyze() {
    const value = text.trim();
    if (!value) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo analizar el texto.");
        return;
      }
      onResult(data as Analysis);
      setText("");
    } catch {
      setError("Error de conexión.");
    } finally {
      setBusy(false);
    }
  }

  function toggleVoice() {
    if (!SpeechCtor) return;
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SpeechCtor();
    rec.lang = "es-ES";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  return (
    <section className="mt-6">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
        Agregar por texto
      </h2>
      <div className="flex items-center gap-2 rounded-2xl border border-neutral-200/80 bg-white p-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && analyze()}
          placeholder="Ej: dos tacos al pastor y un refresco"
          className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm focus:outline-none"
        />
        {SpeechCtor && (
          <button
            onClick={toggleVoice}
            aria-label="Dictar por voz"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${
              listening ? "bg-red-100 text-red-600" : "bg-neutral-100 text-neutral-600"
            }`}
          >
            🎤
          </button>
        )}
        <button
          onClick={analyze}
          disabled={!text.trim()}
          aria-label="Analizar texto"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white disabled:opacity-40"
        >
          →
        </button>
      </div>
      {listening && <p className="mt-1.5 px-1 text-xs text-red-600">🎙️ Escuchando… habla ahora</p>}
    </section>
  );
}
