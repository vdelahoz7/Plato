import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { publicUser } from "@/lib/user";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { email, password, name, goal, dailyCalories } = await request
    .json()
    .catch(() => ({}));

  if (!email || !password || !name) {
    return Response.json(
      { error: "Faltan datos: nombre, email y contraseña son obligatorios." },
      { status: 400 },
    );
  }
  if (typeof password !== "string" || password.length < 6) {
    return Response.json(
      { error: "La contraseña debe tener al menos 6 caracteres." },
      { status: 400 },
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return Response.json(
      { error: "Ya existe una cuenta con ese correo." },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: String(name).trim(),
      passwordHash: hashPassword(password),
      goal: goal ?? "mantener",
      dailyCalories: Number(dailyCalories) || 2200,
    },
  });

  await createSession(user.id);
  return Response.json({ user: publicUser(user) }, { status: 201 });
}
