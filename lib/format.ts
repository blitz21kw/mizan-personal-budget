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
