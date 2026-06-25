# Bocado 🍽️

Cuenta tus calorías con solo una foto. Tomas una foto de tu comida y la IA
(Gemini Vision) estima el platillo, sus calorías y sus macros, y lo registra en
tu diario del día.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Gemini 2.5 Flash** (`@google/genai`) para el análisis de imágenes
- Almacenamiento en `localStorage` (sin base de datos en el MVP)

## Cómo correrlo

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Consigue una **API key gratis** de Gemini en
   [Google AI Studio](https://aistudio.google.com/) → *Get API key*.
   (No actives facturación para mantenerla en el plan gratuito.)
3. Pega tu clave en `.env.local`:
   ```
   GEMINI_API_KEY=tu_key_real
   ```
4. Arranca el servidor:
   ```bash
   npm run dev
   ```
   Abre http://localhost:3000

## Cómo funciona

```
Navegador (cámara / subir foto)
   → POST /api/analyze   (la API key vive solo en el servidor)
        → Gemini 2.5 Flash Vision  (responde JSON estructurado)
        ← { name, calories, protein, carbs, fat, items[] }
   → se agrega al diario del día (localStorage)
```

La clave **nunca** se expone en el cliente: el frontend habla con `/api/analyze`,
y solo el servidor llama a Gemini. El `.env.local` está en `.gitignore`.

## Estructura

- `src/app/page.tsx` — la app (inicio, captura, resultado)
- `src/app/api/analyze/route.ts` — backend que llama a Gemini Vision
- `src/lib/meals.ts` — tipos y persistencia del diario

## Pendiente (v2)

- Estadísticas semanales e historial por día
- Cuenta en la nube + base de datos
- Ajuste de porciones antes de guardar
- Meta de calorías personalizable
