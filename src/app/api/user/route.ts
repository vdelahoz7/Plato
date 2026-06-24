import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { publicUser } from "@/lib/user";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "No autenticado." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const data: { goal?: string; dailyCalories?: number; name?: string } = {};
  if (typeof body.goal === "string") data.goal = body.goal;
  if (Number.isFinite(body.dailyCalories)) data.dailyCalories = Math.round(body.dailyCalories);
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return Response.json({ user: publicUser(updated) });
}
