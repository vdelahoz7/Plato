import { getCurrentUser } from "@/lib/auth";
import { publicUser } from "@/lib/user";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  return Response.json({ user: user ? publicUser(user) : null });
}
