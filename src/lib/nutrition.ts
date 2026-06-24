import type { Goal } from "@/lib/meals";

export type Sex = "male" | "female";
export type Activity = "sedentario" | "ligero" | "moderado" | "activo" | "muy_activo";

export const ACTIVITIES: { id: Activity; label: string; factor: number }[] = [
  { id: "sedentario", label: "Sedentario", factor: 1.2 },
  { id: "ligero", label: "Ligero (1-3 días/sem)", factor: 1.375 },
  { id: "moderado", label: "Moderado (3-5 días/sem)", factor: 1.55 },
  { id: "activo", label: "Activo (6-7 días/sem)", factor: 1.725 },
  { id: "muy_activo", label: "Muy activo", factor: 1.9 },
];

export type Profile = {
  weight: number; // kg
  height: number; // cm
  age: number;
  sex: Sex;
  activity: Activity;
  goal: Goal;
};

/** Metabolismo basal — fórmula Mifflin-St Jeor. */
export function bmr(p: Pick<Profile, "weight" | "height" | "age" | "sex">): number {
  return 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === "male" ? 5 : -161);
}

/** Gasto energético total diario (TDEE) = BMR × factor de actividad. */
export function tdee(p: Profile): number {
  const factor = ACTIVITIES.find((a) => a.id === p.activity)?.factor ?? 1.55;
  return bmr(p) * factor;
}

/** Meta diaria de calorías según el objetivo (déficit / mantenimiento / superávit). */
export function dailyCaloriesFor(p: Profile): number {
  const adjust = p.goal === "perder" ? -500 : p.goal === "ganar" ? 400 : 0;
  return Math.max(1200, Math.round((tdee(p) + adjust) / 10) * 10);
}

/** Objetivos de macros derivados de las calorías (30% proteína / 40% carbos / 30% grasa). */
export function macroTargets(calories: number) {
  return {
    protein: Math.round((calories * 0.3) / 4),
    carbs: Math.round((calories * 0.4) / 4),
    fat: Math.round((calories * 0.3) / 9),
  };
}
