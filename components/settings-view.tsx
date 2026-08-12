import { Check, ChevronLeft, CirclePlus, Coins, PenLine, Plus, ShieldCheck, Trash2, TrendingUp, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CATEGORY_COLORS } from "@/lib/constants";
import { formatMoney, getMonthTotals, normalizeNumericInput } from "@/lib/format";
import type { Category, MonthData, MonthSettings } from "@/lib/types";

type SettingsViewProps = {
  month: MonthData;
  onSave: (settings: MonthSettings) => void;
};

export default function SettingsView({ month, onSave }: SettingsViewProps) {
  const [salary, setSalary] = useState(String(month.salary));
  const [deductions, setDeductions] = useState(String(month.deductions));
  const [totalSpent, setTotalSpent] = useState(String(month.totalSpent));
  const [savingsThisMonth, setSavingsThisMonth] = useState(String(month.savingsThisMonth));
  const [investment, setInvestment] = useState(String(month.investment));
  const [emergencyFund, setEmergencyFund] = useState(String(month.emergencyFund));
  const [outings, setOutings] = useState(String(month.outings));
  const [categories, setCategories] = useState<Category[]>(month.categories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryBudget, setNewCategoryBudget] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState<string>(CATEGORY_COLORS[0]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSalary(String(month.salary));
    setDeductions(String(month.deductions));
    setTotalSpent(String(month.totalSpent));
    setSavingsThisMonth(String(month.savingsThisMonth));
    setInvestment(String(month.investment));
    setEmergencyFund(String(month.emergencyFund));
    setOutings(String(month.outings));
    setCategories(month.categories.map((category) => ({ ...category })));
    setMessage("");
  }, [month]);

  const numeric = (value: string) => Math.max(0, Number.parseFloat(normalizeNumericInput(value)) || 0);
  const totals = useMemo(() => getMonthTotals({ salary: numeric(salary), deductions: numeric(deductions), categories, expenses: month.expenses, totalSpent: numeric(totalSpent), savingsThisMonth: numeric(savingsThisMonth), investment: numeric(investment), emergencyFund: numeric(emergencyFund), outings: numeric(outings) }), [categories, deductions, emergencyFund, investment, month.expenses, outings, salary, savingsThisMonth, totalSpent]);

  function updateCategory(id: string, value: string) {
    setCategories((items) => items.map((category) => category.id === id ? { ...category, budget: numeric(value) } : category));
  }

  function removeCategory(category: Category) {
    const hasExpenses = month.expenses.some((expense) => expense.categoryId === category.id);
    if (hasExpenses) {
      setMessage("لا يمكن حذف تصنيف لديه مصروفات مسجلة. احفظ بياناته أو عدّل المصروفات أولاً.");
      return;
    }
    if (!window.confirm(`حذف تصنيف «${category.name}»؟`)) return;
    setCategories((items) => items.filter((item) => item.id !== category.id));
  }

  function addCategory() {
    const name = newCategoryName.trim();
    const budget = numeric(newCategoryBudget);
    if (!name) {
      setMessage("اكتب اسم التصنيف الجديد.");
      return;
    }
    if (categories.some((category) => category.name === name)) {
      setMessage("هذا التصنيف موجود بالفعل.");
      return;
    }
    setCategories((items) => [...items, { id: `custom-${Date.now()}`, name, budget, spent: 0, color: newCategoryColor }]);
    setNewCategoryName("");
    setNewCategoryBudget("");
    setMessage("");
  }

  function handleSave() {
    onSave({
      salary: numeric(salary),
      deductions: numeric(deductions),
      totalSpent: numeric(totalSpent),
      savingsThisMonth: numeric(savingsThisMonth),
      investment: numeric(investment),
      emergencyFund: numeric(emergencyFund),
      outings: numeric(outings),
      categories: categories.map((category) => ({ ...category, budget: Math.round(category.budget * 1000) / 1000 })),
    });
    setMessage("تم حفظ إعدادات هذا الشهر.");
  }

  return (
    <div className="settings-view space-y-6 pb-2">
      <header>
        <p className="text-xs font-extrabold tracking-[0.18em] text-[#2d9b73]">تخصيص الميزانية</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[clamp(1.75rem,5vw,2.65rem)] font-black leading-[1.12] tracking-[-0.06em] text-[#19382c]">الإعدادات</h1>
            <p className="mt-2 text-sm leading-6 text-[#7d8982]">اضبط الأرقام مرة، وخلي ميزان يتابعها معك.</p>
          </div>
          <button type="button" onClick={handleSave} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#2d9b73] px-5 text-sm font-black text-white shadow-[0_10px_20px_rgba(45,155,115,0.2)] transition hover:bg-[#248662]"><Check className="size-4" /> حفظ التغييرات</button>
        </div>
      </header>

      <section className="settings-card surface-card rounded-[28px] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#e8f7ee] text-[#2d9b73]"><WalletCards className="size-[18px]" /></span>
          <div><h2 className="text-lg font-black text-[#19382c]">الراتب</h2><p className="mt-1 text-xs font-semibold text-[#8d9991]">الأرقام الأساسية لشهر {month.monthKey}</p></div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <MoneyInput label="الراتب الأصلي" value={salary} onChange={setSalary} icon={Coins} />
          <MoneyInput label="الاستقطاعات" value={deductions} onChange={setDeductions} icon={PenLine} />
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#f3f8f4] px-4 py-3">
          <span className="text-xs font-bold text-[#76877c]">صافي الراتب المحسوب</span>
          <span className="number-ltr text-base font-black text-[#23835e]">{formatMoney(totals.netSalary)}</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MoneyInput label="إجمالي المصروف" value={totalSpent} onChange={setTotalSpent} icon={WalletCards} />
          <MoneyInput label="مدخرات هذا الشهر" value={savingsThisMonth} onChange={setSavingsThisMonth} icon={ShieldCheck} />
        </div>
      </section>

      <section className="settings-card surface-card rounded-[28px] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#f1ebfb] text-[#9d6bc3]"><TrendingUp className="size-[18px]" /></span>
          <div><h2 className="text-lg font-black text-[#19382c]">تخصيصات إضافية</h2><p className="mt-1 text-xs font-semibold text-[#8d9991]">مبالغ تحجزها قبل الصرف اليومي.</p></div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <MoneyInput label="الاستثمار" value={investment} onChange={setInvestment} icon={TrendingUp} />
          <MoneyInput label="صندوق الطوارئ" value={emergencyFund} onChange={setEmergencyFund} icon={ShieldCheck} />
          <MoneyInput label="طلعات ومطاعم" value={outings} onChange={setOutings} icon={CirclePlus} />
        </div>
      </section>

      <section className="settings-card surface-card rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[#fff1e2] text-[#dd8a37]"><WalletCards className="size-[18px]" /></span>
            <div><h2 className="text-lg font-black text-[#19382c]">الميزانيات الشهرية</h2><p className="mt-1 text-xs font-semibold text-[#8d9991]">عدّل الحد المخصص لكل تصنيف.</p></div>
          </div>
          <span className={`number-ltr text-sm font-black ${totals.afterFixedAllocations < 0 ? "text-[#c75b55]" : "text-[#2d9b73]"}`}>{formatMoney(totals.fixedAllocations)} إجمالي</span>
        </div>
        <div className="mt-6 divide-y divide-[#edf1ed]">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${category.color}1A` }}><span className="size-2.5 rounded-full" style={{ backgroundColor: category.color }} /></span>
              <span className="min-w-0 flex-1 truncate text-sm font-black text-[#3a5143]">{category.name}</span>
              <div className="relative w-28 shrink-0 sm:w-36">
                <input aria-label={`ميزانية ${category.name}`} value={category.budget} onChange={(event) => updateCategory(category.id, normalizeNumericInput(event.target.value))} type="text" inputMode="decimal" className="number-ltr min-h-11 w-full rounded-xl border border-[#e5ece7] bg-[#fbfcfb] px-3 pl-10 text-left text-sm font-black text-[#334c3d] outline-none transition focus:border-[#96d3ab] focus:bg-white focus:ring-4 focus:ring-[#d8f2e0]" />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#9aa59e]">د.ك</span>
              </div>
              {!category.isDefault && <button type="button" onClick={() => removeCategory(category)} className="flex size-10 shrink-0 items-center justify-center rounded-xl text-[#c87972] transition hover:bg-[#fff0ee]" aria-label={`حذف ${category.name}`}><Trash2 className="size-4" /></button>}
              {category.isDefault && <span className="flex size-10 shrink-0 items-center justify-center text-[#c4cec7]"><PenLine className="size-3.5" /></span>}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[22px] border border-dashed border-[#c9dfcf] bg-[#f7fbf8] p-4">
          <div className="flex items-center gap-2 text-sm font-black text-[#37624c]"><CirclePlus className="size-4 text-[#2d9b73]" /> إضافة تصنيف جديد</div>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_150px_auto]">
            <input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} type="text" placeholder="اسم التصنيف" className="min-h-11 rounded-xl border border-[#deebe1] bg-white px-3 text-sm font-bold text-[#3e5548] outline-none placeholder:text-[#aebbb2] focus:border-[#96d3ab] focus:ring-4 focus:ring-[#d8f2e0]" />
            <div className="relative">
              <input value={newCategoryBudget} onChange={(event) => setNewCategoryBudget(normalizeNumericInput(event.target.value))} type="text" inputMode="decimal" placeholder="الميزانية" className="number-ltr min-h-11 w-full rounded-xl border border-[#deebe1] bg-white px-3 pl-10 text-left text-sm font-bold text-[#3e5548] outline-none placeholder:text-[#aebbb2] focus:border-[#96d3ab] focus:ring-4 focus:ring-[#d8f2e0]" />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#9aa59e]">د.ك</span>
            </div>
            <button type="button" onClick={addCategory} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#19382c] px-4 text-xs font-black text-white transition hover:bg-[#285542]"><Plus className="size-4" /> إضافة</button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8a9b90]">اللون</span>
            {CATEGORY_COLORS.map((color) => <button key={color} type="button" onClick={() => setNewCategoryColor(color)} className={`flex size-7 items-center justify-center rounded-full border-2 transition ${newCategoryColor === color ? "border-[#19382c]" : "border-transparent"}`} aria-label="اختيار لون"><span className="size-4 rounded-full" style={{ backgroundColor: color }} /></button>)}
          </div>
        </div>
      </section>

      {message && <div role="status" className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${message.startsWith("تم") ? "bg-[#eaf8ef] text-[#2d805b]" : "bg-[#fff3e5] text-[#b77830]"}`}><Check className="size-4" /> {message}</div>}

      <div className="surface-card flex flex-col gap-3 rounded-[24px] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-bold text-[#849189]">المتاح بعد كل التخصيصات</p><p className={`number-ltr mt-1 text-lg font-black ${totals.afterFixedAllocations >= 0 ? "text-[#23835e]" : "text-[#c75b55]"}`}>{formatMoney(totals.afterFixedAllocations)}</p></div>
        <button type="button" onClick={handleSave} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#2d9b73] px-5 text-sm font-black text-white transition hover:bg-[#248662]"><Check className="size-4" /> حفظ الإعدادات</button>
      </div>
    </div>
  );
}

function MoneyInput({ label, value, onChange, icon: Icon }: { label: string; value: string; onChange: (value: string) => void; icon: typeof Coins }) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-xs font-extrabold text-[#829087]"><Icon className="size-3.5 text-[#2d9b73]" /> {label}</span>
      <div className="relative mt-2">
        <input value={value} onChange={(event) => onChange(normalizeNumericInput(event.target.value))} type="text" inputMode="decimal" className="number-ltr min-h-13 w-full rounded-2xl border border-[#e3ebe5] bg-[#fbfcfb] px-4 pl-12 text-left text-lg font-black text-[#334c3d] outline-none transition focus:border-[#96d3ab] focus:bg-white focus:ring-4 focus:ring-[#d8f2e0]" />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#a0aba4]">د.ك</span>
      </div>
    </label>
  );
}
