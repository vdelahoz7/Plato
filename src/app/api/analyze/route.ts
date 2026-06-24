import {
  GoogleGenAI,
  Type,
  createUserContent,
  createPartFromBase64,
} from "@google/genai";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const PROMPT = `Eres un nutricionista experto. Analiza la foto de comida y estima su contenido nutricional.
Responde SIEMPRE en español. Identifica el platillo y desglosa cada alimento visible con sus calorías.
Si la imagen no contiene comida, devuelve name "No se detectó comida" y todos los valores en 0.
Sé realista con las porciones que ves en la foto.`;

// Estructura que forzamos en la respuesta del modelo (structured output).
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "Nombre corto del platillo, ej. 'Pollo a la plancha, arroz y ensalada'",
    },
    calories: { type: Type.NUMBER, description: "Calorías totales (kcal)" },
    protein: { type: Type.NUMBER, description: "Proteína total en gramos" },
    carbs: { type: Type.NUMBER, description: "Carbohidratos totales en gramos" },
    fat: { type: Type.NUMBER, description: "Grasa total en gramos" },
    items: {
      type: Type.ARRAY,
      description: "Desglose por alimento detectado",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
        },
        required: ["name", "calories"],
      },
    },
  },
  required: ["name", "calories", "protein", "carbs", "fat", "items"],
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Inicia sesión para analizar comida." }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "tu_key_aqui") {
    return Response.json(
      {
        error:
          "Falta la API key de Gemini. Pega tu clave en el archivo .env.local (GEMINI_API_KEY) y reinicia el servidor.",
      },
      { status: 500 },
    );
  }

  let base64: string;
  let mimeType: string;
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) {
      return Response.json({ error: "No se recibió ninguna imagen." }, { status: 400 });
    }
    mimeType = file.type || "image/jpeg";
    const bytes = Buffer.from(await file.arrayBuffer());
    base64 = bytes.toString("base64");
  } catch {
    return Response.json({ error: "No se pudo leer la imagen enviada." }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Gemini (plan gratuito) a veces devuelve 503 por saturación temporal.
    // Reintentamos con un pequeño backoff antes de rendirnos.
    let response;
    let lastErr: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: createUserContent([
            PROMPT,
            createPartFromBase64(base64, mimeType),
          ]),
          config: {
            responseMimeType: "application/json",
            responseSchema,
          },
        });
        break;
      } catch (e) {
        lastErr = e;
        const msg = e instanceof Error ? e.message : String(e);
        const overloaded = msg.includes("503") || msg.includes("UNAVAILABLE");
        if (!overloaded || attempt === 2) throw e;
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    if (!response) throw lastErr ?? new Error("Sin respuesta del modelo");

    const text = response.text;
    if (!text) {
      return Response.json({ error: "Gemini no devolvió una respuesta." }, { status: 502 });
    }

    const data = JSON.parse(text);
    return Response.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    if (message.includes("503") || message.includes("UNAVAILABLE")) {
      return Response.json(
        { error: "Gemini está saturado ahora mismo. Intenta de nuevo en unos segundos." },
        { status: 503 },
      );
    }
    return Response.json(
      { error: `Error al analizar con Gemini: ${message}` },
      { status: 502 },
    );
  }
}
