import { DEFAULT_RESERVE_ALLOCATION } from "@/lib/constants";

export function formatMoney(value: number, currency = "د.ك") {
  const safeValue = Math.abs(value) < 0.0005 ? 0 : value;
  const hasDecimals = Math.abs(safeValue % 1) > 0.0005;
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
    minimumFractionDigits: hasDecimals ? 3 : 0,
  }).format(safeValue);

  return `${formatted} ${currency}`;
}

export function normalizeNumericInput(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, ".")
    .replace(/٬/g, "")
    .replace(/,/g, "");
}

export function formatNumber(value: number) {
  const safeValue = Math.abs(value) < 0.0005 ? 0 : value;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
    minimumFractionDigits: Math.abs(safeValue % 1) > 0.0005 ? 3 : 0,
  }).format(safeValue);
}

export function getMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

export function getDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMonthLabel(monthKey: string, short = false) {
  const date = new Date(`${monthKey}-01T12:00:00`);
  return new Intl.DateTimeFormat("ar-KW", {
    month: short ? "short" : "long",
    year: "numeric",
  }).format(date);
}

export function formatDateLabel(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`);
  return new Intl.DateTimeFormat("ar-KW", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function getCategorySpent(expenses: { categoryId: string; amount: number }[], categoryId: string) {
  return expenses.reduce(
    (total, expense) => (expense.categoryId === categoryId ? total + expense.amount : total),
    0,
  );
}

export function getUnusedBudgetSurplus(month: {
  categories: { budget: number; spent: number }[];
  surplusTransferred?: number;
}) {
  const totalUnused = month.categories.reduce(
    (total, category) => total + Math.max(0, category.budget - category.spent),
    0,
  );
  const transferred = Math.max(0, month.surplusTransferred ?? 0);

  return {
    totalUnused,
    transferred,
    available: Math.max(0, totalUnused - transferred),
  };
}

function wholeDinars(value: number) {
  return Math.max(0, Math.floor(value));
}

export function getReserveAllocationForAmount(amount: number) {
  const available = wholeDinars(amount);
  if (available <= 0) {
    return { investment: 0, emergencyFund: 0, outings: 0 };
  }

  const fullPlanTotal = DEFAULT_RESERVE_ALLOCATION.emergencyFund
    + DEFAULT_RESERVE_ALLOCATION.investment
    + DEFAULT_RESERVE_ALLOCATION.outings;

  const raw = {
    investment: available * DEFAULT_RESERVE_ALLOCATION.investment / fullPlanTotal,
    emergencyFund: available * DEFAULT_RESERVE_ALLOCATION.emergencyFund / fullPlanTotal,
    outings: available * DEFAULT_RESERVE_ALLOCATION.outings / fullPlanTotal,
  };
  const allocation = {
    investment: Math.floor(raw.investment),
    emergencyFund: Math.floor(raw.emergencyFund),
    outings: Math.floor(raw.outings),
  };
  let remainingDinars = available - allocation.investment - allocation.emergencyFund - allocation.outings;

  const remainderOrder = (Object.keys(raw) as (keyof typeof raw)[]).sort((left, right) => {
    const difference = (raw[right] - Math.floor(raw[right])) - (raw[left] - Math.floor(raw[left]));
    return difference || (left === "investment" ? -1 : right === "investment" ? 1 : left === "emergencyFund" ? -1 : 1);
  });

  for (const field of remainderOrder) {
    if (remainingDinars <= 0) break;
    allocation[field] += 1;
    remainingDinars -= 1;
  }

  return allocation;
}

export function getAutomaticReserveAllocation(month: {
  salary: number;
  deductions: number;
  categories: { budget: number }[];
  savingsThisMonth?: number;
}) {
  const netSalary = month.salary - month.deductions;
  const fixedAllocations = month.categories.reduce((total, category) => total + Math.max(0, category.budget), 0);
  const savingsThisMonth = Math.max(0, month.savingsThisMonth ?? 0);
  const available = Math.max(0, netSalary - fixedAllocations - savingsThisMonth);

  return {
    ...getReserveAllocationForAmount(available),
    available: wholeDinars(available),
  };
}

export function getMonthTotals(month: {
  salary: number;
  deductions: number;
  categories: { budget: number }[];
  expenses: { amount: number }[];
  totalSpent?: number;
  savingsThisMonth?: number;
  investment: number;
  emergencyFund: number;
  outings: number;
}) {
  const netSalary = month.salary - month.deductions;
  const totalSpent = typeof month.totalSpent === "number"
    ? Math.max(0, month.totalSpent)
    : month.expenses.reduce((total, expense) => total + expense.amount, 0);
  const fixedAllocations = month.categories.reduce((total, category) => total + category.budget, 0);
  const savingsThisMonth = Math.max(0, month.savingsThisMonth ?? 0);
  const reserves = month.investment + month.emergencyFund + month.outings + savingsThisMonth;

  return {
    netSalary,
    totalSpent,
    fixedAllocations,
    savingsThisMonth,
    reserves,
    remaining: netSalary - totalSpent - reserves,
    afterFixedAllocations: netSalary - fixedAllocations - reserves,
  };
}
