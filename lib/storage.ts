import { DEFAULT_CATEGORIES, DEFAULT_DEDUCTIONS, DEFAULT_SALARY, STORAGE_KEY } from "@/lib/constants";
import { getCategorySpent, getMonthKey } from "@/lib/format";
import type { BudgetState, Category, MonthData } from "@/lib/types";

function numberOr(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function copyCategories(categories: Category[]) {
  return categories.map((category) => ({ ...category, spent: 0 }));
}

export function createMonth(monthKey = getMonthKey(new Date()), template?: MonthData): MonthData {
  const categories = template?.categories?.length ? copyCategories(template.categories) : copyCategories(DEFAULT_CATEGORIES);

  return {
    monthKey,
    salary: numberOr(template?.salary, DEFAULT_SALARY),
    deductions: numberOr(template?.deductions, DEFAULT_DEDUCTIONS),
    categories,
    totalSpent: 0,
    savingsThisMonth: 0,
    expenses: [],
    investment: numberOr(template?.investment, 0),
    emergencyFund: numberOr(template?.emergencyFund, 0),
    outings: numberOr(template?.outings, 0),
  };
}

export function createInitialState(): BudgetState {
  const monthKey = getMonthKey(new Date());
  return {
    version: 1,
    activeMonthKey: monthKey,
    months: { [monthKey]: createMonth(monthKey) },
  };
}

function normalizeCategory(category: unknown, index: number): Category | null {
  if (!category || typeof category !== "object") return null;
  const candidate = category as Partial<Category>;
  if (typeof candidate.id !== "string" || typeof candidate.name !== "string") return null;

  return {
    id: candidate.id,
    name: candidate.name,
    budget: Math.max(0, numberOr(candidate.budget, 0)),
    spent: Math.max(0, numberOr(candidate.spent, 0)),
    color: typeof candidate.color === "string" ? candidate.color : DEFAULT_CATEGORIES[index % DEFAULT_CATEGORIES.length].color,
    isDefault: candidate.isDefault === true || DEFAULT_CATEGORIES.some((item) => item.id === candidate.id),
  };
}

function normalizeMonth(monthKey: string, value: unknown, fallback?: MonthData): MonthData {
  if (!value || typeof value !== "object") return createMonth(monthKey, fallback);

  const candidate = value as Partial<MonthData>;
  const categories = Array.isArray(candidate.categories)
    ? candidate.categories.map(normalizeCategory).filter((category): category is Category => Boolean(category))
    : [];
  const expenses = Array.isArray(candidate.expenses)
    ? (candidate.expenses as unknown[])
        .filter((expense): expense is Record<string, unknown> => Boolean(expense) && typeof expense === "object")
        .map((expense) => ({
          id: typeof expense.id === "string" ? expense.id : `expense-${Date.now()}-${Math.random()}`,
          amount: Math.max(0, numberOr(expense.amount, 0)),
          categoryId: typeof expense.categoryId === "string" ? expense.categoryId : categories[0]?.id ?? DEFAULT_CATEGORIES[0].id,
          description: typeof expense.description === "string" ? expense.description : "",
          date: typeof expense.date === "string" ? expense.date : `${monthKey}-01`,
          createdAt: typeof expense.createdAt === "string" ? expense.createdAt : new Date().toISOString(),
        }))
    : [];

  const normalizedCategories = categories.length ? categories : copyCategories(fallback?.categories ?? DEFAULT_CATEGORIES);
  const totalSpent = Math.max(0, numberOr(candidate.totalSpent, expenses.reduce((total, expense) => total + expense.amount, 0)));
  const rawCategories = Array.isArray(candidate.categories) ? candidate.categories : [];

  return {
    monthKey,
    salary: numberOr(candidate.salary, fallback?.salary ?? DEFAULT_SALARY),
    deductions: numberOr(candidate.deductions, fallback?.deductions ?? DEFAULT_DEDUCTIONS),
    categories: normalizedCategories.map((category) => ({
      ...category,
      spent: numberOr(rawCategories.find((item) => item?.id === category.id)?.spent, getCategorySpent(expenses, category.id)),
    })),
    totalSpent,
    savingsThisMonth: Math.max(0, numberOr(candidate.savingsThisMonth, fallback?.savingsThisMonth ?? 0)),
    expenses,
    investment: numberOr(candidate.investment, fallback?.investment ?? 0),
    emergencyFund: numberOr(candidate.emergencyFund, fallback?.emergencyFund ?? 0),
    outings: numberOr(candidate.outings, fallback?.outings ?? 0),
  };
}

export function normalizeState(value: unknown): BudgetState {
  const initial = createInitialState();
  if (!value || typeof value !== "object") return initial;

  const candidate = value as Partial<BudgetState>;
  const rawMonths = candidate.months;
  if (!rawMonths || typeof rawMonths !== "object") return initial;

  const sourceMonths = rawMonths as Record<string, unknown>;
  const keys = Object.keys(sourceMonths);
  const months: Record<string, MonthData> = {};
  keys.forEach((key) => {
    months[key] = normalizeMonth(key, sourceMonths[key]);
  });

  if (!Object.keys(months).length) return initial;

  const activeMonthKey =
    typeof candidate.activeMonthKey === "string" && months[candidate.activeMonthKey]
      ? candidate.activeMonthKey
      : Object.keys(months).sort().at(-1) ?? initial.activeMonthKey;

  return { version: 1, activeMonthKey, months };
}

export function loadState() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveState(state: BudgetState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
