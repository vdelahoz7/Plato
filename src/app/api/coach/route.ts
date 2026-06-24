import { Type } from "@google/genai";
import { getCurrentUser } from "@/lib/auth";
import { generateJSON } from "@/lib/gemini";

export const runtime = "nodejs";

const GOAL_TEXT: Record<string, string> = {
  perder: "bajar de peso (déficit calórico)",
  mantener: "mantener su peso",
  ganar: "subir de peso / ganar músculo (superávit)",
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      description: "Uno de: 'bien' (va por buen camino), 'atencion' (algo a mejorar), 'alerta' (lejos de la meta)",
    },
    headline: { type: Type.STRING, description: "Frase corta y motivadora (máx 8 palabras)" },
    analysis: { type: Type.STRING, description: "1-2 frases analizando el día respecto a la meta y los macros" },
    tips: {
      type: Type.ARRAY,
      description: "2-3 consejos accionables y concretos",
      items: { type: Type.STRING },
    },
  },
  required: ["status", "headline", "analysis", "tips"],
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Inicia sesión." }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "tu_key_aqui") {
    return Response.json({ error: "Falta la API key de Gemini." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const meals: { name: string; calories: number; protein: number; carbs: number; fat: number }[] =
    Array.isArray(body.meals) ? body.meals : [];

  if (meals.length === 0) {
    return Response.json(
      { error: "Registra al menos una comida para que el coach pueda ayudarte." },
      { status: 400 },
    );
  }

  const totals = meals.reduce(
    (a, m) => ({
      calories: a.calories + (m.calories || 0),
      protein: a.protein + (m.protein || 0),
      carbs: a.carbs + (m.carbs || 0),
      fat: a.fat + (m.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const prompt = `Eres un coach nutricional cercano, motivador y honesto. Responde SIEMPRE en español.

Datos del usuario:
- Objetivo: ${GOAL_TEXT[user.goal] ?? user.goal}
- Meta diaria: ${user.dailyCalories} kcal
- Hoy lleva: ${Math.round(totals.calories)} kcal (proteína ${Math.round(totals.protein)}g, carbos ${Math.round(totals.carbs)}g, grasa ${Math.round(totals.fat)}g)
- Comidas registradas hoy: ${meals.map((m) => `${m.name} (${Math.round(m.calories)} kcal)`).join(", ")}

Da feedback breve, personalizado y útil sobre cómo va su día respecto a su meta y objetivo.
Sé concreto y amable, nada genérico. Si va bien, motívalo; si se está pasando o le falta, dilo con tacto y di qué ajustar.`;

  try {
    const out = await generateJSON({ apiKey, contents: prompt, responseSchema });
    return Response.json(JSON.parse(out));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    if (/(503|unavailable|overloaded|429|resource_exhausted|quota)/i.test(message)) {
      return Response.json(
        { error: "El coach está muy ocupado. Intenta de nuevo en unos segundos." },
        { status: 503 },
      );
    }
    return Response.json({ error: `Error del coach: ${message}` }, { status: 502 });
  }
}
