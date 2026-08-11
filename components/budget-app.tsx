"use client";

import { ArrowRight, Bell, Check, Menu, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardView from "@/components/dashboard-view";
import ExpenseForm from "@/components/expense-form";
import HistoryView from "@/components/history-view";
import { DesktopSidebar, MobileBottomNav } from "@/components/navigation";
import SettingsView from "@/components/settings-view";
import TransactionsView from "@/components/transactions-view";
import { createInitialState, createMonth, loadState, saveState } from "@/lib/storage";
import { getMonthKey } from "@/lib/format";
import type { AppView, BudgetState, Expense, ExpenseDraft, MonthData, MonthSettings } from "@/lib/types";

export default function BudgetApp() {
  const [state, setState] = useState<BudgetState>(() => createInitialState());
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [editingExpense, setEditingExpense] = useState<{ monthKey: string; expense: Expense } | null>(null);

  useEffect(() => {
    const savedState = loadState();
    if (savedState) setState(savedState);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [hydrated, state]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const activeMonth = state.months[state.activeMonthKey] ?? Object.values(state.months)[0];
  const monthKeys = useMemo(() => Object.keys(state.months).sort().reverse(), [state.months]);

  const notify = useCallback((message: string) => setToast(message), []);

  const changeView = useCallback((view: AppView) => {
    setEditingExpense(null);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const selectMonth = useCallback((monthKey: string) => {
    setState((previous) => {
      if (previous.months[monthKey]) return { ...previous, activeMonthKey: monthKey };
      const template = previous.months[previous.activeMonthKey] ?? createMonth(monthKey);
      return { ...previous, activeMonthKey: monthKey, months: { ...previous.months, [monthKey]: createMonth(monthKey, template) } };
    });
  }, []);

  const createNewMonth = useCallback((monthKey: string) => {
    setState((previous) => {
      if (previous.months[monthKey]) return { ...previous, activeMonthKey: monthKey };
      const template = previous.months[previous.activeMonthKey] ?? createMonth(monthKey);
      return { ...previous, activeMonthKey: monthKey, months: { ...previous.months, [monthKey]: createMonth(monthKey, template) } };
    });
    notify("تم تجهيز شهر جديد بنفس إعداداتك الحالية.");
  }, [notify]);

  const addExpense = useCallback((draft: ExpenseDraft) => {
    const targetMonthKey = getMonthKey(new Date(`${draft.date}T12:00:00`));
    setState((previous) => {
      const sourceMonth = previous.months[previous.activeMonthKey] ?? createMonth(previous.activeMonthKey);
      const targetMonth = previous.months[targetMonthKey] ?? createMonth(targetMonthKey, sourceMonth);
      const expense: Expense = {
        ...draft,
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `expense-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      return {
        ...previous,
        activeMonthKey: targetMonthKey,
        months: { ...previous.months, [targetMonthKey]: { ...targetMonth, expenses: [...targetMonth.expenses, expense] } },
      };
    });
    changeView("dashboard");
    notify("تم تسجيل المصروف بنجاح.");
  }, [changeView, notify]);

  const editExpense = useCallback((sourceMonthKey: string, expenseId: string, draft: ExpenseDraft) => {
    const targetMonthKey = getMonthKey(new Date(`${draft.date}T12:00:00`));
    setState((previous) => {
      const sourceMonth = previous.months[sourceMonthKey];
      if (!sourceMonth) return previous;
      const existingExpense = sourceMonth.expenses.find((expense) => expense.id === expenseId);
      if (!existingExpense) return previous;
      const updatedExpense = { ...existingExpense, ...draft };
      const nextMonths = { ...previous.months };

      if (sourceMonthKey === targetMonthKey) {
        nextMonths[sourceMonthKey] = { ...sourceMonth, expenses: sourceMonth.expenses.map((expense) => expense.id === expenseId ? updatedExpense : expense) };
      } else {
        const targetMonth = previous.months[targetMonthKey] ?? createMonth(targetMonthKey, sourceMonth);
        nextMonths[sourceMonthKey] = { ...sourceMonth, expenses: sourceMonth.expenses.filter((expense) => expense.id !== expenseId) };
        nextMonths[targetMonthKey] = { ...targetMonth, expenses: [...targetMonth.expenses, updatedExpense] };
      }
      return { ...previous, activeMonthKey: targetMonthKey, months: nextMonths };
    });
    setEditingExpense(null);
    notify("تم تحديث المصروف.");
  }, [notify]);

  const deleteExpense = useCallback((expenseId: string) => {
    setState((previous) => {
      const month = previous.months[previous.activeMonthKey];
      if (!month) return previous;
      return { ...previous, months: { ...previous.months, [previous.activeMonthKey]: { ...month, expenses: month.expenses.filter((expense) => expense.id !== expenseId) } } };
    });
    notify("تم حذف المصروف.");
  }, [notify]);

  const saveSettings = useCallback((settings: MonthSettings) => {
    setState((previous) => {
      const month = previous.months[previous.activeMonthKey];
      if (!month) return previous;
      return { ...previous, months: { ...previous.months, [previous.activeMonthKey]: { ...month, ...settings } } };
    });
    notify("تم حفظ إعدادات هذا الشهر.");
  }, [notify]);

  const startEditing = useCallback((expense: Expense) => setEditingExpense({ monthKey: state.activeMonthKey, expense }), [state.activeMonthKey]);

  if (!hydrated || !activeMonth) return <LoadingShell />;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1500px] lg:flex-row">
        <DesktopSidebar activeView={activeView} onChange={changeView} />
        <main className="min-w-0 flex-1 px-4 pb-4 pt-5 sm:px-7 sm:pt-7 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-[1180px]">
            <TopBar activeView={activeView} onChange={changeView} />
            {activeView === "dashboard" && <DashboardView month={activeMonth} monthKeys={monthKeys} onMonthChange={selectMonth} onAddExpense={() => changeView("add")} onOpenSettings={() => changeView("settings")} onOpenTransactions={() => changeView("transactions")} onOpenHistory={() => changeView("history")} />}
            {activeView === "add" && <AddExpenseView month={activeMonth} onSave={addExpense} onCancel={() => changeView("dashboard")} />}
            {activeView === "settings" && <SettingsView month={activeMonth} onSave={saveSettings} />}
            {activeView === "history" && <HistoryView months={state.months} activeMonthKey={state.activeMonthKey} monthKeys={monthKeys} onMonthChange={selectMonth} onCreateMonth={createNewMonth} />}
            {activeView === "transactions" && <TransactionsView monthKey={activeMonth.monthKey} categories={activeMonth.categories} expenses={activeMonth.expenses} onEdit={startEditing} onDelete={deleteExpense} />}
          </div>
        </main>
      </div>
      <MobileBottomNav activeView={activeView} onChange={changeView} />
      <div className="safe-bottom-space" />

      {editingExpense && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#10251d]/40 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="تعديل المصروف"><div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[30px] bg-[#f4f7f5] p-4 shadow-2xl sm:max-w-2xl sm:rounded-[30px] sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-extrabold tracking-[0.14em] text-[#2d9b73]">تحديث العملية</p><h2 className="mt-1 text-xl font-black text-[#19382c]">تعديل المصروف</h2></div><button type="button" onClick={() => setEditingExpense(null)} className="flex size-10 items-center justify-center rounded-xl bg-white text-[#829087] shadow-sm" aria-label="إغلاق"><X className="size-5" /></button></div><ExpenseForm key={editingExpense.expense.id} categories={state.months[editingExpense.monthKey]?.categories ?? activeMonth.categories} initialExpense={editingExpense.expense} isEditing onSave={(draft) => editExpense(editingExpense.monthKey, editingExpense.expense.id, draft)} onCancel={() => setEditingExpense(null)} /></div></div>}
      {toast && <div role="status" className="fixed bottom-[calc(5.8rem+env(safe-area-inset-bottom))] left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-2 rounded-2xl bg-[#19382c] px-4 py-3 text-sm font-bold text-white shadow-[0_16px_35px_rgba(25,56,44,0.25)] lg:bottom-6"><span className="flex size-6 items-center justify-center rounded-lg bg-[#bfead0]/15 text-[#bfead0]"><Check className="size-3.5" /></span>{toast}</div>}
    </div>
  );
}

function TopBar({ activeView, onChange }: { activeView: AppView; onChange: (view: AppView) => void }) {
  const titles: Record<AppView, string> = { dashboard: "نظرة عامة", add: "صرف جديد", settings: "الإعدادات", history: "السجل الشهري", transactions: "المصروفات" };
  return <div className="mb-6 flex items-center justify-between gap-3 lg:mb-8"><div className="flex items-center gap-2 lg:hidden">{activeView !== "dashboard" && <button type="button" onClick={() => onChange("dashboard")} className="flex size-10 items-center justify-center rounded-xl bg-white text-[#789086] shadow-sm" aria-label="العودة للرئيسية"><ArrowRight className="size-4" /></button>}<span className="text-sm font-black text-[#436052]">{titles[activeView]}</span></div><div className="hidden items-center gap-2 text-xs font-bold text-[#91a099] lg:flex"><span>ميزانيتك الشخصية</span><span className="text-[#cbd6cf]">/</span><span className="text-[#3d5949]">{titles[activeView]}</span></div><div className="mr-auto flex items-center gap-2"><button type="button" onClick={() => onChange("add")} className="hidden min-h-10 items-center gap-2 rounded-xl bg-[#e6f4eb] px-3.5 text-xs font-black text-[#247955] transition hover:bg-[#d7efdf] sm:flex"><span className="text-base leading-none">+</span> صرف جديد</button><button type="button" className="flex size-10 items-center justify-center rounded-xl bg-white text-[#8a9890] shadow-sm" aria-label="الإشعارات"><Bell className="size-[17px]" /></button><button type="button" className="flex size-10 items-center justify-center rounded-xl bg-white text-[#8a9890] shadow-sm lg:hidden" aria-label="القائمة"><Menu className="size-[17px]" /></button></div></div>;
}

function AddExpenseView({ month, onSave, onCancel }: { month: MonthData; onSave: (draft: ExpenseDraft) => void; onCancel: () => void }) {
  return <div className="mx-auto max-w-2xl space-y-6 pb-2"><header className="flex items-start gap-3"><button type="button" onClick={onCancel} className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#789086] shadow-sm" aria-label="إلغاء"><ArrowRight className="size-4" /></button><div><p className="text-xs font-extrabold tracking-[0.18em] text-[#2d9b73]">إضافة سريعة</p><h1 className="mt-2 text-[clamp(1.75rem,5vw,2.65rem)] font-black leading-[1.12] tracking-[-0.06em] text-[#19382c]">صرف جديد</h1><p className="mt-2 text-sm leading-6 text-[#7d8982]">سجّلها الآن، وخلّ الباقي على ميزان.</p></div></header><ExpenseForm categories={month.categories} onSave={onSave} onCancel={onCancel} /></div>;
}

function LoadingShell() {
  return <main className="min-h-screen p-4 sm:p-8"><div className="mx-auto max-w-[1180px] animate-pulse space-y-5"><div className="h-7 w-36 rounded-xl bg-[#e2ebe4]" /><div className="h-16 w-72 rounded-2xl bg-[#e2ebe4]" /><div className="h-56 rounded-[32px] bg-[#dbe9df]" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="h-28 rounded-[23px] bg-[#e2ebe4]" /><div className="h-28 rounded-[23px] bg-[#e2ebe4]" /><div className="h-28 rounded-[23px] bg-[#e2ebe4]" /><div className="h-28 rounded-[23px] bg-[#e2ebe4]" /></div></div></main>;
}
