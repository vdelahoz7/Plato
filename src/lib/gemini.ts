import { GoogleGenAI, type ContentListUnion, type Schema } from "@google/genai";

// Modelo principal: Flash-Lite da mucho margen en el plan gratuito (≈1500 req/día).
export const GEMINI_MODEL = "gemini-2.5-flash-lite";

// Modelos de respaldo: si el principal está saturado o sin cuota, se intenta con estos.
// La cuota es POR MODELO, así que un fallback suele estar disponible aunque el primero no.
// Los alias "-latest" apuntan al modelo vigente y suelen tener cuota libre.
const FALLBACK_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type ErrKind = "overload" | "quota" | "notfound" | "other";

function classify(err: unknown): ErrKind {
  const m = (err instanceof Error ? err.message : String(err)).toLowerCase();
  if (m.includes("503") || m.includes("unavailable") || m.includes("overloaded")) return "overload";
  if (m.includes("429") || m.includes("resource_exhausted") || m.includes("quota")) return "quota";
  if (m.includes("404") || m.includes("not_found") || m.includes("not found")) return "notfound";
  return "other";
}

/**
 * Genera contenido JSON con Gemini de forma resiliente:
 * recorre [modelo principal, ...respaldos] y, en cada uno, reintenta con backoff
 * exponencial ante saturación (503). Salta al siguiente modelo si hay falta de
 * cuota (429) o el modelo no existe. Solo lanza si TODOS fallan (o error real de entrada).
 */
export async function generateJSON(opts: {
  apiKey: string;
  contents: ContentListUnion;
  responseSchema: Schema;
}): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: opts.apiKey });
  const models = [GEMINI_MODEL, ...FALLBACK_MODELS];
  let lastErr: unknown = new Error("Sin respuesta del modelo.");

  for (const model of models) {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: opts.contents,
          config: { responseMimeType: "application/json", responseSchema: opts.responseSchema },
        });
        if (res.text) return res.text;
        throw new Error("Respuesta vacía del modelo.");
      } catch (err) {
        lastErr = err;
        const kind = classify(err);
        if (kind === "other") throw err; // error real (p.ej. imagen inválida): no insistir
        if (kind === "overload" && attempt < 3) {
          await sleep(400 * 2 ** attempt + Math.floor(Math.random() * 250));
          continue; // reintenta el mismo modelo
        }
        break; // cuota / no existe / se agotaron reintentos -> siguiente modelo
      }
    }
  }
  throw lastErr;
}
