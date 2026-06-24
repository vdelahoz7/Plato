import type { User } from "@prisma/client";
import type { Sex, Activity } from "@/lib/nutrition";
import type { Goal } from "@/lib/meals";

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  goal: Goal;
  dailyCalories: number;
  weight: number;
  height: number;
  age: number;
  sex: Sex;
  activity: Activity;
};

/** Versión segura del usuario para enviar al cliente (sin passwordHash). */
export function publicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    goal: user.goal as Goal,
    dailyCalories: user.dailyCalories,
    weight: user.weight,
    height: user.height,
    age: user.age,
    sex: user.sex as Sex,
    activity: user.activity as Activity,
  };
}
