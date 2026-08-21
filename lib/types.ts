export type AppView =
  | "dashboard"
  | "add"
  | "settings"
  | "history"
  | "transactions";

export type Category = {
  id: string;
  name: string;
  budget: number;
  spent: number;
  color: string;
  isDefault?: boolean;
};

export type Expense = {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  createdAt: string;
};

export type ReserveAllocationMode = "auto" | "manual";

export type MonthData = {
  monthKey: string;
  salary: number;
  deductions: number;
  categories: Category[];
  totalSpent: number;
  savingsThisMonth: number;
  expenses: Expense[];
  investment: number;
  emergencyFund: number;
  outings: number;
  outingsSpent: number;
  reserveAllocationMode: ReserveAllocationMode;
  surplusTransferred: number;
};

export type BudgetState = {
  version: 1;
  activeMonthKey: string;
  months: Record<string, MonthData>;
};

export type ExpenseDraft = {
  amount: number;
  categoryId: string;
  description: string;
  date: string;
};

export type MonthSettings = Pick<
  MonthData,
  | "salary"
  | "deductions"
  | "categories"
  | "totalSpent"
  | "savingsThisMonth"
  | "investment"
  | "emergencyFund"
  | "outings"
  | "reserveAllocationMode"
>;
