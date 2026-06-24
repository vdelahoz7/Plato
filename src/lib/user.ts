import type { User } from "@prisma/client";

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  goal: string;
  dailyCalories: number;
};

/** Versión segura del usuario para enviar al cliente (sin passwordHash). */
export function publicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    goal: user.goal,
    dailyCalories: user.dailyCalories,
  };
}
