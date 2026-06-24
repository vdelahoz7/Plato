import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { publicUser } from "@/lib/user";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));

  if (!email || !password) {
    return Response.json(
      { error: "Ingresa tu correo y contraseña." },
      { status: 400 },
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || !verifyPassword(String(password), user.passwordHash)) {
    return Response.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 },
    );
  }

  await createSession(user.id);
  return Response.json({ user: publicUser(user) });
}
