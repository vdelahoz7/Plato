// Tipos y helpers puros (sin estado). Los datos vienen de la API / base de datos.

export type FoodItem = {
  name: string;
  calories: number;
};

export type Analysis = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: FoodItem[];
};

export type Meal = Analysis & {
  id: string;
  userId: string;
  createdAt: string; // ISO
};

export type Goal = "perder" | "mantener" | "ganar";

const GOAL_CALORIES: Record<Goal, number> = {
  perder: 1800,
  mantener: 2200,
  ganar: 2600,
};

export function caloriesForGoal(goal: Goal): number {
  return GOAL_CALORIES[goal];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "🙂";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Clave de día local 'YYYY-MM-DD' (no UTC, para agrupar por el día del usuario). */
export function keyFor(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayMeals(meals: Meal[]): Meal[] {
  const today = keyFor(new Date());
  return meals.filter((m) => keyFor(new Date(m.createdAt)) === today);
}

export function sumTotals(meals: Meal[]) {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export type DayTotal = { calories: number; count: number };

/** Mapa { 'YYYY-MM-DD': { calories, count } } a partir de las comidas del usuario. */
export function getDailyTotalsMap(meals: Meal[]): Record<string, DayTotal> {
  const out: Record<string, DayTotal> = {};
  for (const m of meals) {
    const key = keyFor(new Date(m.createdAt));
    if (!out[key]) out[key] = { calories: 0, count: 0 };
    out[key].calories += m.calories;
    out[key].count += 1;
  }
  for (const key of Object.keys(out)) out[key].calories = Math.round(out[key].calories);
  return out;
}

export function getStats(meals: Meal[]) {
  const map = getDailyTotalsMap(meals);
  const days = Object.keys(map).sort();

  let average = 0;
  if (days.length > 0) {
    const total = days.reduce((acc, d) => acc + map[d].calories, 0);
    average = Math.round(total / days.length);
  }

  const dayset = new Set(days);
  let streak = 0;
  const cursor = new Date();
  if (!dayset.has(keyFor(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dayset.has(keyFor(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { average, streak, daysLogged: days.length };
}
