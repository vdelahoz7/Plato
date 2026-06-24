import { GoogleGenAI, Type } from "@google/genai";
import { getCurrentUser } from "@/lib/auth";

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
    const ai = new GoogleGenAI({ apiKey });
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json", responseSchema },
        });
        break;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if ((!msg.includes("503") && !msg.includes("UNAVAILABLE")) || attempt === 2) throw e;
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    const text = response?.text;
    if (!text) return Response.json({ error: "El coach no respondió." }, { status: 502 });
    return Response.json(JSON.parse(text));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    if (message.includes("503") || message.includes("UNAVAILABLE")) {
      return Response.json({ error: "El coach está ocupado, intenta en unos segundos." }, { status: 503 });
    }
    return Response.json({ error: `Error del coach: ${message}` }, { status: 502 });
  }
}
