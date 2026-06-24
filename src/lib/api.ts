import type { Analysis, Goal, Meal } from "@/lib/meals";
import type { Activity, Sex } from "@/lib/nutrition";

export type User = {
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

export type Profile = {
  weight: number;
  height: number;
  age: number;
  sex: Sex;
  activity: Activity;
  goal: Goal;
};

async function jsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Algo salió mal.");
  return data;
}

export async function fetchMe(): Promise<User | null> {
  const res = await fetch("/api/auth/me");
  const data = await res.json().catch(() => ({ user: null }));
  return data.user ?? null;
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
} & Profile): Promise<User> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return (await jsonOrThrow(res)).user;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return (await jsonOrThrow(res)).user;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function fetchMeals(): Promise<Meal[]> {
  const res = await fetch("/api/meals");
  return (await jsonOrThrow(res)).meals;
}

export async function addMeal(analysis: Analysis): Promise<Meal> {
  const res = await fetch("/api/meals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(analysis),
  });
  return (await jsonOrThrow(res)).meal;
}

export async function deleteMeal(id: string): Promise<void> {
  const res = await fetch(`/api/meals/${id}`, { method: "DELETE" });
  await jsonOrThrow(res);
}

export async function updateUser(input: Partial<Profile> & { name?: string }): Promise<User> {
  const res = await fetch("/api/user", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return (await jsonOrThrow(res)).user;
}
