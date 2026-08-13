import type { Category } from "@/lib/types";

export const STORAGE_KEY = "mizan-personal-budget-v1";

export const DEFAULT_SALARY = 1565;
export const DEFAULT_DEDUCTIONS = 250;

export const DEFAULT_RESERVE_ALLOCATION = {
  emergencyFund: 150,
  investment: 100,
  outings: 65,
} as const;

export const MAX_OUTINGS_ALLOCATION = 100;

export const CATEGORY_COLORS = [
  "#6f7df5",
  "#ee9b4d",
  "#36ad7c",
  "#b36cdf",
  "#e5bd49",
  "#e56b68",
  "#49a9c4",
  "#93a747",
] as const;

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "wife", name: "مصروف الزوجة", budget: 500, spent: 0, color: "#6f7df5", isDefault: true },
  { id: "adnan", name: "عدنان", budget: 200, spent: 0, color: "#ee9b4d", isDefault: true },
  { id: "groceries", name: "مقاضي البيت", budget: 100, spent: 0, color: "#36ad7c", isDefault: true },
  { id: "fuel", name: "بنزين", budget: 70, spent: 0, color: "#b36cdf", isDefault: true },
  { id: "car-maintenance", name: "صيانة السيارة", budget: 35, spent: 0, color: "#e5bd49", isDefault: true },
  { id: "work-food", name: "أكل الدوام", budget: 25, spent: 0, color: "#e56b68", isDefault: true },
  { id: "gym", name: "النادي", budget: 25, spent: 0, color: "#49a9c4", isDefault: true },
  { id: "charity", name: "صدقة", budget: 25, spent: 0, color: "#93a747", isDefault: true },
  { id: "phone", name: "التلفون", budget: 20, spent: 0, color: "#2d9b73", isDefault: true },
];
