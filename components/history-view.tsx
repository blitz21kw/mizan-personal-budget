import { ArrowLeft, CalendarPlus, CircleDollarSign, Clock3, Landmark, ShieldCheck, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { formatMoney, formatMonthLabel, getMonthTotals } from "@/lib/format";
import type { MonthData } from "@/lib/types";

type HistoryViewProps = {
  months: Record<string, MonthData>;
  activeMonthKey: string;
  monthKeys: string[];
  onMonthChange: (monthKey: string) => void;
  onCreateMonth: (monthKey: string) => void;
};

export default function HistoryView({ months, activeMonthKey, monthKeys, onMonthChange, onCreateMonth }: HistoryViewProps) {
  const month = months[activeMonthKey];
  const [newMonthKey, setNewMonthKey] = useState("");
  const totals = month ? getMonthTotals(month) : null;

  const categoryRows = useMemo(() => {
    if (!month) return [];
    return month.categories.map((category) => ({ category, spent: category.spent })).sort((a, b) => b.spent - a.spent);
  }, [month]);

  function handleCreateMonth() {
    if (!newMonthKey) return;
    onCreateMonth(newMonthKey);
    setNewMonthKey("");
  }

  if (!month || !totals) return null;

  return (
    <div className="history-view space-y-6 pb-2">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold tracking-[0.18em] text-[#2d9b73]">نظرة عبر الزمن</p>
          <h1 className="mt-2 text-[clamp(1.75rem,5vw,2.65rem)] font-black leading-[1.12] tracking-[-0.06em] text-[#19382c]">السجل الشهري</h1>
          <p className="mt-2 text-sm leading-6 text-[#7d8982]">كل شهر له قصته وأرقامه الخاصة.</p>
        </div>
        <div className="history-create-month flex items-center gap-2 rounded-2xl border border-dashed border-[#bfdcc8] bg-[#f7fbf8] p-2">
          <input type="month" value={newMonthKey} onChange={(event) => setNewMonthKey(event.target.value)} aria-label="اختيار شهر جديد" className="number-ltr min-h-10 rounded-xl border border-[#deebe1] bg-white px-3 text-xs font-bold text-[#557061] outline-none focus:border-[#96d3ab]" />
          <button type="button" disabled={!newMonthKey} onClick={handleCreateMonth} className="flex min-h-10 items-center gap-1.5 rounded-xl bg-[#19382c] px-3 text-xs font-black text-white transition hover:bg-[#285542]"><CalendarPlus className="size-3.5" /> تجهيز شهر</button>
        </div>
      </header>

      <div className="history-month-tabs flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {monthKeys.map((key) => (
          <button key={key} type="button" onClick={() => onMonthChange(key)} className={`shrink-0 rounded-2xl border px-4 py-3 text-xs font-black transition ${activeMonthKey === key ? "border-[#a2dbb5] bg-[#e9f7ee] text-[#247955]" : "border-[#e4ebe6] bg-white text-[#8a978f] hover:border-[#c6decd]"}`}>
            {formatMonthLabel(key, true)}
          </button>
        ))}
      </div>

      <section className="history-summary relative overflow-hidden rounded-[30px] bg-[#19382c] p-5 text-white shadow-[0_22px_50px_rgba(25,56,44,0.16)] sm:p-7">
        <div className="pointer-events-none absolute -left-16 -top-20 size-64 rounded-full bg-[#70d59c]/15 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold text-[#b7d8c4]">ملخص {formatMonthLabel(activeMonthKey)}</p><p className="number-ltr mt-3 text-4xl font-black tracking-[-0.06em] text-[#effff4]">{formatMoney(totals.remaining)}</p><p className="mt-2 text-xs font-semibold text-[#a8c7b5]">متبقٍ بعد المصروفات والتخصيصات</p></div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:min-w-64">
            <HistoryMetric label="صافي الراتب" value={formatMoney(totals.netSalary)} />
            <HistoryMetric label="المصروفات" value={formatMoney(totals.totalSpent)} />
            <HistoryMetric label="ادخار هذا الشهر" value={formatMoney(month.savingsThisMonth)} />
            <HistoryMetric label="الاستثمار" value={formatMoney(month.investment)} />
            <HistoryMetric label="الطوارئ" value={formatMoney(month.emergencyFund)} />
          </div>
        </div>
      </section>

      <section className="history-stat-grid grid grid-cols-2 gap-3 sm:grid-cols-4">
        <HistoryStat label="الراتب" value={month.salary} icon={WalletCards} />
        <HistoryStat label="الاستقطاعات" value={month.deductions} icon={Landmark} />
        <HistoryStat label="عدد المصروفات" value={month.expenses.length} icon={Clock3} suffix="مصروف" />
        <HistoryStat label="طلعات ومطاعم" value={month.outings} icon={CircleDollarSign} />
      </section>

      <section className="history-detail-card surface-card rounded-[28px] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-extrabold tracking-[0.12em] text-[#9aa59f]">تفصيل الإنفاق</p><h2 className="mt-1.5 text-xl font-black tracking-[-0.04em] text-[#19382c]">إجمالي التصنيفات</h2></div><ShieldCheck className="size-5 text-[#77b98e]" /></div>
        <div className="mt-5 divide-y divide-[#edf1ed]">
          {!categoryRows.length && <p className="py-8 text-center text-sm font-bold text-[#8b9890]">لا توجد ميزانيات في هذا الشهر.</p>}
          {categoryRows.map(({ category, spent }) => {
              const ratio = category.budget > 0 ? category.spent / category.budget : 0;
            return <div key={category.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2.5"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} /><span className="truncate text-sm font-black text-[#3b5143]">{category.name}</span></div><span className={`number-ltr text-xs font-black ${category.spent > category.budget ? "text-[#d15d58]" : "text-[#40594a]"}`}>{formatMoney(category.spent)} <span className="font-bold text-[#99a59d]">من {formatMoney(category.budget)}</span></span></div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#eff3ef]"><div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, ratio * 100))}%`, backgroundColor: category.spent > category.budget ? "#db645d" : category.color }} /></div>
            </div>;
          })}
        </div>
      </section>

      <button type="button" onClick={() => onMonthChange(activeMonthKey)} className="mx-auto flex items-center gap-1.5 text-xs font-extrabold text-[#2d9b73]">تحديث بيانات الشهر <ArrowLeft className="size-3.5" /></button>
    </div>
  );
}

function HistoryMetric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] font-semibold text-[#9fc2ae]">{label}</p><p className="number-ltr mt-1 text-xs font-black text-[#effff4]">{value}</p></div>;
}

function HistoryStat({ label, value, icon: Icon, suffix }: { label: string; value: number; icon: typeof WalletCards; suffix?: string }) {
  return <div className="surface-card rounded-[22px] p-4"><Icon className="size-[17px] text-[#5bab80]" /><p className="mt-4 text-xs font-bold text-[#8a978f]">{label}</p><p className="number-ltr mt-1 text-sm font-black text-[#2c4435]">{typeof value === "number" && suffix ? `${value} ${suffix}` : formatMoney(value)}</p></div>;
}
