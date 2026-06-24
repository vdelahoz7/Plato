import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "No autenticado." }, { status: 401 });

  const meals = await prisma.meal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ meals });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "No autenticado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string") {
    return Response.json({ error: "Datos de comida inválidos." }, { status: 400 });
  }

  const meal = await prisma.meal.create({
    data: {
      userId: user.id,
      name: body.name,
      calories: Math.round(Number(body.calories) || 0),
      protein: Math.round(Number(body.protein) || 0),
      carbs: Math.round(Number(body.carbs) || 0),
      fat: Math.round(Number(body.fat) || 0),
      items: Array.isArray(body.items) ? body.items : [],
    },
  });
  return Response.json({ meal }, { status: 201 });
}
