import { CalendarDays, Filter, Pencil, ReceiptText, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDateLabel, formatMoney } from "@/lib/format";
import type { Category, Expense } from "@/lib/types";

type TransactionsViewProps = {
  monthKey: string;
  categories: Category[];
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
};

export default function TransactionsView({ monthKey, categories, expenses, onEdit, onDelete }: TransactionsViewProps) {
  const [filter, setFilter] = useState("all");
  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const filteredExpenses = useMemo(() => expenses.filter((expense) => filter === "all" || expense.categoryId === filter).sort((a, b) => `${b.date}-${b.createdAt}`.localeCompare(`${a.date}-${a.createdAt}`)), [expenses, filter]);
  const totalFiltered = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);

  function handleDelete(expense: Expense) {
    if (window.confirm(`حذف مصروف ${formatMoney(expense.amount)}؟`)) onDelete(expense.id);
  }

  return (
    <div className="space-y-6 pb-2">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold tracking-[0.18em] text-[#2d9b73]">التفاصيل اليومية</p>
          <h1 className="mt-2 text-[clamp(1.75rem,5vw,2.65rem)] font-black leading-[1.12] tracking-[-0.06em] text-[#19382c]">المصروفات</h1>
          <p className="mt-2 text-sm leading-6 text-[#7d8982]">كل عملية صرف، مرتبة وواضحة.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-[#e9f7ee] px-4 py-3"><ReceiptText className="size-4 text-[#2d9b73]" /><span className="number-ltr text-sm font-black text-[#267c57]">{formatMoney(totalFiltered)}</span><span className="text-[11px] font-bold text-[#66927a]">المعروض</span></div>
      </header>

      <section className="surface-card rounded-[26px] p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-[#9aa59f]"><Filter className="size-3.5 text-[#2d9b73]" /> تصفية حسب التصنيف</div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button type="button" onClick={() => setFilter("all")} className={`shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-black transition ${filter === "all" ? "bg-[#19382c] text-white" : "bg-[#f2f6f3] text-[#809088] hover:bg-[#e8f2eb]"}`}>الكل <span className="mr-1 opacity-60">{expenses.length}</span></button>
          {categories.map((category) => <button key={category.id} type="button" onClick={() => setFilter(category.id)} className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-black transition ${filter === category.id ? "bg-[#e9f7ee] text-[#247955]" : "bg-[#f2f6f3] text-[#809088] hover:bg-[#e8f2eb]"}`}><span className="size-2 rounded-full" style={{ backgroundColor: category.color }} />{category.name}</button>)}
        </div>
      </section>

      <section className="surface-card overflow-hidden rounded-[28px]">
        <div className="border-b border-[#edf1ed] px-5 py-4 sm:px-6"><p className="text-sm font-black text-[#2f4839]">سجل {monthKey}</p><p className="mt-1 text-xs font-semibold text-[#a0aaa4]">الأحدث يظهر أولاً</p></div>
        {filteredExpenses.length ? <div className="divide-y divide-[#edf1ed]">{filteredExpenses.map((expense) => <ExpenseRow key={expense.id} expense={expense} category={categoryMap.get(expense.categoryId)} onEdit={() => onEdit(expense)} onDelete={() => handleDelete(expense)} />)}</div> : <EmptyTransactions hasAny={expenses.length > 0} />}
      </section>
    </div>
  );
}

function ExpenseRow({ expense, category, onEdit, onDelete }: { expense: Expense; category?: Category; onEdit: () => void; onDelete: () => void }) {
  return <article className="flex items-center gap-3 px-5 py-4 sm:px-6"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${category?.color ?? "#9aa59f"}1A` }}><span className="size-3 rounded-full" style={{ backgroundColor: category?.color ?? "#9aa59f" }} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-[#334b3d]">{expense.description || category?.name || "مصروف"}</p><p className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-[#9aa59f]"><CalendarDays className="size-3" /> {formatDateLabel(expense.date)} <span className="text-[#d3dcd5]">·</span> {category?.name}</p></div><div className="text-left"><p className="number-ltr text-sm font-black text-[#c75d58]">−{formatMoney(expense.amount)}</p><div className="mt-1 flex justify-end gap-1"><button type="button" onClick={onEdit} className="flex size-8 items-center justify-center rounded-lg text-[#93a39a] transition hover:bg-[#edf6ef] hover:text-[#2d9b73]" aria-label="تعديل المصروف"><Pencil className="size-3.5" /></button><button type="button" onClick={onDelete} className="flex size-8 items-center justify-center rounded-lg text-[#c78b85] transition hover:bg-[#fff0ee] hover:text-[#c75b55]" aria-label="حذف المصروف"><Trash2 className="size-3.5" /></button></div></div></article>;
}

function EmptyTransactions({ hasAny }: { hasAny: boolean }) {
  return <div className="flex flex-col items-center justify-center px-6 py-16 text-center"><span className="flex size-14 items-center justify-center rounded-[20px] bg-[#eef7f0] text-[#6db18b]"><ReceiptText className="size-6" /></span><h2 className="mt-4 text-base font-black text-[#3b5143]">{hasAny ? "لا توجد نتائج" : "لم تسجل مصروفات بعد"}</h2><p className="mt-2 max-w-xs text-xs font-semibold leading-6 text-[#98a39c]">{hasAny ? "جرّب تصنيفاً آخر لرؤية العمليات." : "عندما تسجل أول عملية صرف ستظهر هنا مرتبة حسب التاريخ."}</p></div>;
}
