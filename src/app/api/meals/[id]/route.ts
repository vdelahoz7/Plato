import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "No autenticado." }, { status: 401 });

  const { id } = await ctx.params;
  // deleteMany asegura que solo borre si la comida es del usuario.
  const result = await prisma.meal.deleteMany({ where: { id, userId: user.id } });
  if (result.count === 0) {
    return Response.json({ error: "Comida no encontrada." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
