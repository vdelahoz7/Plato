import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { publicUser } from "@/lib/user";
import { type Activity, type Sex, dailyCaloriesFor } from "@/lib/nutrition";
import type { Goal } from "@/lib/meals";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, password, name, goal, weight, height, age, sex, activity } = body;

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
    return Response.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });
  }

  const profile = {
    goal: (goal ?? "mantener") as Goal,
    weight: Number(weight) || 70,
    height: Number(height) || 170,
    age: Number(age) || 30,
    sex: (sex === "female" ? "female" : "male") as Sex,
    activity: (activity ?? "moderado") as Activity,
  };
  const dailyCalories = dailyCaloriesFor(profile);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: String(name).trim(),
      passwordHash: hashPassword(password),
      dailyCalories,
      ...profile,
    },
  });

  await createSession(user.id);
  return Response.json({ user: publicUser(user) }, { status: 201 });
}
