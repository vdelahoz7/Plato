import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { publicUser } from "@/lib/user";
import { type Activity, type Sex, dailyCaloriesFor } from "@/lib/nutrition";
import type { Goal } from "@/lib/meals";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "No autenticado." }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  // Mezclamos lo recibido sobre los valores actuales y recalculamos la meta.
  const merged = {
    goal: (typeof body.goal === "string" ? body.goal : user.goal) as Goal,
    weight: Number.isFinite(body.weight) ? Math.round(body.weight) : user.weight,
    height: Number.isFinite(body.height) ? Math.round(body.height) : user.height,
    age: Number.isFinite(body.age) ? Math.round(body.age) : user.age,
    sex: (body.sex === "male" || body.sex === "female" ? body.sex : user.sex) as Sex,
    activity: (typeof body.activity === "string" ? body.activity : user.activity) as Activity,
  };

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...merged,
      dailyCalories: dailyCaloriesFor(merged),
      ...(typeof body.name === "string" && body.name.trim()
        ? { name: body.name.trim() }
        : {}),
    },
  });

  return Response.json({ user: publicUser(updated) });
}
