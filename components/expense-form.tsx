import { Check, ChevronDown, FileText, Hash, Tag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatMoney, getDateInputValue, normalizeNumericInput } from "@/lib/format";
import type { Category, Expense, ExpenseDraft } from "@/lib/types";

type ExpenseFormProps = {
  categories: Category[];
  onSave: (draft: ExpenseDraft) => void;
  onCancel?: () => void;
  initialExpense?: Expense;
  isEditing?: boolean;
};

const quickAmounts = [5, 10, 20, 50];

export default function ExpenseForm({ categories, onSave, onCancel, initialExpense, isEditing = false }: ExpenseFormProps) {
  const [amount, setAmount] = useState(initialExpense ? String(initialExpense.amount) : "");
  const [categoryId, setCategoryId] = useState(initialExpense?.categoryId ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(initialExpense?.description ?? "");
  const [date, setDate] = useState(initialExpense?.date ?? getDateInputValue());
  const [error, setError] = useState("");

  useEffect(() => {
    setAmount(initialExpense ? String(initialExpense.amount) : "");
    setCategoryId(initialExpense?.categoryId ?? categories[0]?.id ?? "");
    setDescription(initialExpense?.description ?? "");
    setDate(initialExpense?.date ?? getDateInputValue());
    setError("");
  }, [initialExpense, categories]);

  const selectedCategory = useMemo(() => categories.find((category) => category.id === categoryId), [categories, categoryId]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number.parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("اكتب مبلغاً أكبر من صفر.");
      return;
    }
    if (!categoryId) {
      setError("اختر تصنيف المصروف.");
      return;
    }
    if (!date) {
      setError("اختر تاريخ المصروف.");
      return;
    }

    onSave({
      amount: Math.round(parsedAmount * 1000) / 1000,
      categoryId,
      description: description.trim(),
      date,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="expense-form space-y-5">
      <div className="expense-amount-card surface-card overflow-hidden rounded-[28px]">
        <div className="border-b border-[#edf1ed] px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-[#9ba69f]"><Hash className="size-3.5 text-[#2d9b73]" /> المبلغ</div>
          <div className="mt-3 flex items-baseline gap-2 border-b border-[#dfe8e1] pb-3 focus-within:border-[#2d9b73]">
            <input
              autoFocus={!isEditing}
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(event) => { setAmount(normalizeNumericInput(event.target.value)); setError(""); }}
              className="expense-amount-input number-ltr w-full min-w-0 bg-transparent text-5xl font-black tracking-[-0.07em] text-[#19382c] outline-none placeholder:text-[#d9e1dc] sm:text-6xl"
              aria-label="مبلغ المصروف"
            />
            <span className="shrink-0 text-sm font-black text-[#87958c]">د.ك</span>
          </div>
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {quickAmounts.map((quickAmount) => (
              <button key={quickAmount} type="button" onClick={() => { setAmount(String(quickAmount)); setError(""); }} className="number-ltr shrink-0 rounded-xl border border-[#e5ece7] bg-[#f8faf8] px-3.5 py-2 text-xs font-black text-[#638073] transition hover:border-[#a8dcbc] hover:bg-[#edf8f1] hover:text-[#227653]">
                +{formatMoney(quickAmount)}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-[#9ba69f]"><Tag className="size-3.5 text-[#2d9b73]" /> التصنيف</label>
            {selectedCategory && <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#63786c]"><span className="size-2 rounded-full" style={{ backgroundColor: selectedCategory.color }} /> {selectedCategory.name}</span>}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories.map((category) => {
              const selected = category.id === categoryId;
              return (
                <button key={category.id} type="button" onClick={() => { setCategoryId(category.id); setError(""); }} className={`expense-category-button flex min-h-12 items-center gap-2 rounded-2xl border px-3 text-right text-xs font-extrabold transition ${selected ? "border-[#9ad7b2] bg-[#eaf8ef] text-[#247955] shadow-[0_4px_12px_rgba(45,155,115,0.08)]" : "border-[#e6ece8] bg-white text-[#718078] hover:border-[#c9ded0] hover:bg-[#f7faf8]"}`}>
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="min-w-0 truncate">{category.name}</span>
                  {selected && <Check className="mr-auto size-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
          {!categories.length && <p className="mt-3 rounded-xl bg-[#fff4e6] p-3 text-xs font-bold text-[#b97732]">أضف تصنيفاً من الإعدادات قبل تسجيل المصروف.</p>}
        </div>
      </div>

      <div className="surface-card rounded-[28px] p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-[#9ba69f]"><FileText className="size-3.5 text-[#2d9b73]" /> وصف اختياري</span>
            <input value={description} onChange={(event) => setDescription(event.target.value)} type="text" placeholder="مثال: غداء سريع" className="mt-3 min-h-12 w-full rounded-2xl border border-[#e5ece7] bg-[#fbfcfb] px-4 text-sm font-bold text-[#3e5548] outline-none transition placeholder:text-[#b1bbb4] focus:border-[#96d3ab] focus:bg-white focus:ring-4 focus:ring-[#d8f2e0]" />
          </label>
          <label className="block">
            <span className="flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-[#9ba69f]"><ChevronDown className="size-3.5 rotate-[-45deg] text-[#2d9b73]" /> التاريخ</span>
            <input value={date} onChange={(event) => setDate(event.target.value)} type="date" className="number-ltr mt-3 min-h-12 w-full rounded-2xl border border-[#e5ece7] bg-[#fbfcfb] px-4 text-left text-sm font-bold text-[#3e5548] outline-none transition focus:border-[#96d3ab] focus:bg-white focus:ring-4 focus:ring-[#d8f2e0]" />
          </label>
        </div>
      </div>

      {error && <p role="alert" className="rounded-2xl bg-[#fff0ee] px-4 py-3 text-sm font-bold text-[#c45854]">{error}</p>}

      <div className="expense-actions flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && <button type="button" onClick={onCancel} className="min-h-13 rounded-2xl px-5 text-sm font-black text-[#7e8a83] transition hover:bg-[#edf2ee]">إلغاء</button>}
        <button type="submit" disabled={!categories.length} className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#2d9b73] px-5 text-sm font-black text-white shadow-[0_12px_22px_rgba(45,155,115,0.24)] transition hover:-translate-y-0.5 hover:bg-[#248662] active:translate-y-0 sm:max-w-xs">
          <Check className="size-4" strokeWidth={2.6} />
          {isEditing ? "حفظ التعديل" : "تسجيل المصروف"}
        </button>
      </div>
    </form>
  );
}
