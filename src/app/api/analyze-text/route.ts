import { Type } from "@google/genai";
import { getCurrentUser } from "@/lib/auth";
import { generateJSON } from "@/lib/gemini";

export const runtime = "nodejs";

const PROMPT = `Eres un nutricionista experto. El usuario describe en español lo que comió.
Estima el contenido nutricional de esa descripción: identifica el platillo y desglosa cada
alimento con sus calorías. Responde SIEMPRE en español. Sé realista con las porciones típicas.
Si el texto no describe comida, devuelve name "No se detectó comida" y todos los valores en 0.`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    calories: { type: Type.NUMBER },
    protein: { type: Type.NUMBER },
    carbs: { type: Type.NUMBER },
    fat: { type: Type.NUMBER },
    items: {
      type: Type.ARRAY,
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
  if (!user) return Response.json({ error: "Inicia sesión." }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "tu_key_aqui") {
    return Response.json({ error: "Falta la API key de Gemini." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return Response.json({ error: "Describe lo que comiste." }, { status: 400 });
  }

  try {
    const out = await generateJSON({
      apiKey,
      contents: `${PROMPT}\n\nDescripción del usuario: "${text}"`,
      responseSchema,
    });
    return Response.json(JSON.parse(out));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    if (/(503|unavailable|overloaded|429|resource_exhausted|quota)/i.test(message)) {
      return Response.json(
        { error: "El servicio de IA está muy ocupado. Intenta de nuevo en unos segundos." },
        { status: 503 },
      );
    }
    return Response.json({ error: `Error al analizar: ${message}` }, { status: 502 });
  }
}
