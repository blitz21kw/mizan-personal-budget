import {
  ArrowLeft,
  ArrowUpLeft,
  Banknote,
  CalendarDays,
  Check,
  CircleDollarSign,
  Coins,
  CreditCard,
  Landmark,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatMoney, formatMonthLabel, getMonthTotals, getUnusedBudgetSurplus, normalizeNumericInput } from "@/lib/format";
import type { Category, MonthData } from "@/lib/types";

type ReserveField = "investment" | "emergencyFund" | "outings";

type DashboardViewProps = {
  month: MonthData;
  onMonthChange: (monthKey: string) => void;
  onUpdateMonthValue: (field: "salary" | "deductions" | "totalSpent" | "savingsThisMonth", amount: number) => void;
  onUpdateCategoryBudget: (categoryId: string, budget: number) => void;
  onUpdateCategorySpent: (categoryId: string, spent: number) => void;
  onUpdateReserve: (field: ReserveField, amount: number) => void;
  onUpdateOutingsSpent: (amount: number) => void;
  onTransferSurplus: (investmentPercent: number, emergencyPercent: number) => void;
  onAddExpense: () => void;
  onOpenSettings: () => void;
  onOpenTransactions: () => void;
  onOpenHistory: () => void;
};

export default function DashboardView({
  month,
  onMonthChange,
  onUpdateMonthValue,
  onUpdateCategoryBudget,
  onUpdateCategorySpent,
  onUpdateReserve,
  onUpdateOutingsSpent,
  onTransferSurplus,
  onAddExpense,
  onOpenSettings,
  onOpenTransactions,
  onOpenHistory,
}: DashboardViewProps) {
  const totals = getMonthTotals(month);
  const spentRatio = totals.netSalary > 0 ? totals.totalSpent / totals.netSalary : 0;
  const fixedRatio = totals.netSalary > 0 ? totals.fixedAllocations / totals.netSalary : 0;
  const monthLabel = formatMonthLabel(month.monthKey);
  const surplus = getUnusedBudgetSurplus(month);
  const [isSurplusDialogOpen, setIsSurplusDialogOpen] = useState(false);
  const [investmentPercent, setInvestmentPercent] = useState("50");
  const [emergencyPercent, setEmergencyPercent] = useState("50");
  const [surplusError, setSurplusError] = useState("");
  const investmentPercentValue = percentageValue(investmentPercent);
  const emergencyPercentValue = percentageValue(emergencyPercent);
  const totalPercent = investmentPercentValue + emergencyPercentValue;
  const leftoverPercent = Math.max(0, 100 - totalPercent);
  const investmentAmount = Math.round(surplus.available * investmentPercentValue / 100 * 1000) / 1000;
  const emergencyAmount = Math.round(surplus.available * emergencyPercentValue / 100 * 1000) / 1000;
  const leftoverAmount = Math.max(0, Math.round((surplus.available - investmentAmount - emergencyAmount) * 1000) / 1000);

  function openSurplusDialog() {
    setSurplusError("");
    setIsSurplusDialogOpen(true);
  }

  function submitSurplusTransfer() {
    if (totalPercent > 100) {
      setSurplusError("مجموع النسب لا يمكن أن يتجاوز ١٠٠٪.");
      return;
    }
    if (totalPercent <= 0) {
      setSurplusError("حدد نسبة واحدة على الأقل للتحويل.");
      return;
    }
    onTransferSurplus(investmentPercentValue, emergencyPercentValue);
    setIsSurplusDialogOpen(false);
  }

  return (
    <div className="dashboard-view space-y-6 pb-2">
      <header className="dashboard-header flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="dashboard-heading-copy">
          <p className="text-xs font-extrabold tracking-[0.18em] text-[#2d9b73]">لوحة التحكم</p>
          <h1 className="mt-2 text-[clamp(1.75rem,5vw,2.65rem)] font-black leading-[1.12] tracking-[-0.06em] text-[#19382c]">
            أموالك، بصورة أهدأ.
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#7d8982]">كل ما يهمك عن هذا الشهر في مكان واحد.</p>
        </div>
        <MonthSelect monthKey={month.monthKey} onChange={onMonthChange} />
      </header>

      <section className="dashboard-hero relative isolate overflow-hidden rounded-[32px] bg-[#163329] p-5 text-white shadow-[0_24px_55px_rgba(24,67,48,0.2)] sm:p-7">
        <div className="pointer-events-none absolute -left-10 -top-24 -z-10 size-72 rounded-full bg-[#6ed39b]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-10 -z-10 size-64 rounded-full border-[24px] border-[#8de0ae]/[0.08]" />
        <div className="pointer-events-none absolute right-1/2 top-1/2 -z-10 size-56 -translate-y-1/2 rounded-full bg-[#d2f3dc]/[0.04] blur-2xl" />

        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#bdd9c8]">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/10">
                <WalletCards className="size-4" />
              </span>
              المتبقي النقدي
            </div>
            <p className="number-ltr mt-5 text-[clamp(2.5rem,9vw,4.55rem)] font-black leading-none tracking-[-0.075em] text-[#ecfff3]">
              {formatMoney(totals.remaining)}
            </p>
            <p className="mt-3 text-sm text-[#b9d2c2]">
              من صافي راتب <span className="number-ltr font-bold text-white">{formatMoney(totals.netSalary)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onAddExpense}
            className="hero-action group flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#c8f1d7] px-5 text-sm font-black text-[#16412e] shadow-[0_12px_22px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:bg-white active:translate-y-0 sm:min-w-44"
          >
            <span className="flex size-8 items-center justify-center rounded-xl bg-[#2d9b73] text-white transition group-hover:rotate-90">
              <Plus className="size-4" strokeWidth={2.6} />
            </span>
            صرف جديد
          </button>
        </div>

        <div className="hero-metrics relative mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:max-w-xl sm:grid-cols-3">
          <EditableHeroMetric label="المصروف حتى الآن" value={totals.totalSpent} icon={ArrowUpLeft} onChange={(value) => onUpdateMonthValue("totalSpent", value)} />
          <HeroMetric label="المحجوز" value={formatMoney(totals.reserves)} icon={ShieldCheck} />
          <div className="col-span-2 mt-2 hidden items-center gap-2 text-[11px] text-[#9ec4ad] sm:col-span-1 sm:mt-0 sm:flex sm:justify-end sm:text-left">
            <Sparkles className="size-3.5 text-[#bdebd0]" />
            {spentRatio > 0.8 ? "اقتربت من حد الصرف هذا الشهر" : "استمر، أنت مسيطر على ميزانيتك"}
          </div>
        </div>
      </section>

      <section className="dashboard-stat-grid grid grid-cols-2 gap-3 sm:grid-cols-4">
        <EditableStatCard label="الراتب الأصلي" value={month.salary} icon={Banknote} tone="green" onChange={(value) => onUpdateMonthValue("salary", value)} />
        <EditableStatCard label="الاستقطاع" value={month.deductions} icon={CreditCard} tone="orange" prefix="−" onChange={(value) => onUpdateMonthValue("deductions", value)} />
        <StatCard label="صافي الراتب" value={totals.netSalary} icon={Coins} tone="blue" />
        <StatCard label="الميزانيات الثابتة" value={totals.fixedAllocations} icon={Landmark} tone="purple" />
      </section>

      <section className="plan-card surface-card rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#9aa59f]">توزيع الراتب</p>
            <h2 className="mt-1.5 text-xl font-black tracking-[-0.04em] text-[#19382c]">الخطة الشهرية</h2>
          </div>
          <button type="button" onClick={onOpenSettings} className="flex items-center gap-1.5 text-xs font-extrabold text-[#2d9b73] transition hover:text-[#176a4b]">
            تعديل الخطة <ArrowLeft className="size-3.5" />
          </button>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="flex items-end justify-between gap-3 text-sm">
              <span className="font-bold text-[#596860]">المخصص للميزانيات الثابتة</span>
              <span className="number-ltr font-black text-[#19382c]">{formatMoney(totals.fixedAllocations)}</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#eef3ef]">
              <div className="h-full rounded-full bg-[#2d9b73] transition-all" style={{ width: `${Math.min(100, Math.max(0, fixedRatio * 100))}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#8a968f]">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#2d9b73]" /> {Math.round(fixedRatio * 100)}% من الصافي</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#e8eeea]" /> الباقي للتوزيع</span>
            </div>
          </div>
          <div className={`rounded-2xl px-4 py-3 md:min-w-48 ${totals.afterFixedAllocations >= 0 ? "bg-[#edf8f1]" : "bg-[#fff0ee]"}`}>
            <p className="text-xs font-bold text-[#829087]">بعد الميزانيات</p>
            <p className={`number-ltr mt-1 text-lg font-black ${totals.afterFixedAllocations >= 0 ? "text-[#23835e]" : "text-[#c25250]"}`}>{formatMoney(totals.afterFixedAllocations)}</p>
          </div>
        </div>
      </section>

      <section className="surplus-card surface-card overflow-hidden rounded-[28px] border-[#cfe5d6] bg-[linear-gradient(135deg,#f7fcf8,#eef8f1)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#dff3e7] text-[#2d9b73]"><Sparkles className="size-[19px]" /></span>
            <div>
              <p className="text-xs font-extrabold tracking-[0.12em] text-[#6f9880]">الفائض غير المستخدم</p>
              <h2 className="mt-1 text-lg font-black tracking-[-0.04em] text-[#19382c]">حوّل المتبقي إلى أمان أكثر</h2>
              <p className="mt-1.5 text-xs font-semibold leading-6 text-[#718c7b]">المبلغ الذي ظل داخل ميزانياتك ويمكن توزيعه بين الاستثمار والطوارئ.</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/75 px-4 py-3 sm:min-w-56 sm:flex-col sm:items-end sm:bg-transparent sm:p-0">
            <div className="text-right"><p className="text-[10px] font-bold text-[#87a192]">المتاح للتحويل</p><p className="number-ltr mt-1 text-xl font-black text-[#237951]">{formatMoney(surplus.available)}</p></div>
            <button type="button" onClick={openSurplusDialog} disabled={surplus.available <= 0} className="flex min-h-11 items-center gap-2 rounded-xl bg-[#247c58] px-4 text-xs font-black text-white shadow-[0_8px_18px_rgba(36,124,88,0.18)] transition hover:bg-[#1d684a] disabled:bg-[#b6c9bc] disabled:shadow-none"><Sparkles className="size-3.5" /> {surplus.available > 0 ? "تحويل الفائض" : "لا يوجد فائض"}</button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold text-[#88a092]">
          <span>إجمالي المتبقي من الميزانيات: <b className="number-ltr text-[#557665]">{formatMoney(surplus.totalUnused)}</b></span>
          {surplus.transferred > 0 && <span>تم تحويله سابقاً: <b className="number-ltr text-[#557665]">{formatMoney(surplus.transferred)}</b></span>}
        </div>
      </section>

      <section>
        <div className="budget-section-heading mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#9aa59f]">تفاصيل الشهر</p>
            <h2 className="mt-1.5 text-xl font-black tracking-[-0.04em] text-[#19382c]">ميزانياتك</h2>
          </div>
          <button type="button" onClick={onOpenTransactions} className="flex items-center gap-1.5 text-xs font-extrabold text-[#2d9b73] transition hover:text-[#176a4b]">
            كل المصروفات <ArrowLeft className="size-3.5" />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {month.categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              spent={category.spent}
              onBudgetChange={(budget) => onUpdateCategoryBudget(category.id, budget)}
              onSpentChange={(spent) => onUpdateCategorySpent(category.id, spent)}
            />
          ))}
        </div>
        {!month.categories.length && (
          <button type="button" onClick={onOpenSettings} className="surface-card flex w-full items-center justify-center rounded-[24px] p-8 text-sm font-bold text-[#6c7b72]">
            أضف أول ميزانية من الإعدادات
          </button>
        )}
      </section>

      <section className="reserve-grid grid gap-3 sm:grid-cols-3">
        <ReserveCard label="استثمار" value={month.investment} helper="تخصيص شهري" icon={TrendingUp} tone="mint" onChange={(amount) => onUpdateReserve("investment", amount)} />
        <ReserveCard label="صندوق الطوارئ" value={month.emergencyFund} helper="أمان أكثر" icon={ShieldCheck} tone="peach" onChange={(amount) => onUpdateReserve("emergencyFund", amount)} />
        <OutingsCard allocated={month.outings} spent={month.outingsSpent} onAllocatedChange={(amount) => onUpdateReserve("outings", amount)} onSpentChange={onUpdateOutingsSpent} />
      </section>

      <section className="savings-card surface-card rounded-[28px] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#9aa59f]">الادخار الفعلي</p>
            <h2 className="mt-1.5 text-xl font-black tracking-[-0.04em] text-[#19382c]">مدخرات هذا الشهر</h2>
          </div>
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#e8f7ee] text-[#2d9b73]"><ShieldCheck className="size-[18px]" /></span>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold leading-6 text-[#829087]">المبلغ الذي حفظته فعليًا هذا الشهر، منفصل عن صندوق الطوارئ والاستثمار.</p>
          <InlineMoneyInput value={month.savingsThisMonth} label="مدخرات هذا الشهر" onCommit={(value) => onUpdateMonthValue("savingsThisMonth", value)} />
        </div>
      </section>

      <p className="dashboard-footnote text-center text-xs font-semibold text-[#a1aca5]">{monthLabel} · آخر تحديث محفوظ على جهازك</p>
      <button type="button" onClick={onOpenHistory} className="sr-only">فتح السجل الشهري</button>

      {isSurplusDialogOpen && (
        <div className="mobile-sheet-backdrop fixed inset-0 z-[55] flex items-end justify-center bg-[#10251d]/50 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="تحويل فائض الميزانية">
          <div className="mobile-sheet w-full max-w-lg rounded-t-[30px] bg-[#f5f8f6] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[30px] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs font-extrabold tracking-[0.14em] text-[#2d9b73]">تحويل الفائض</p><h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-[#19382c]">وين تبي تحط المبلغ؟</h2><p className="mt-1.5 text-xs font-semibold leading-6 text-[#84948a]">اختر النسبة لكل جهة. أي نسبة متبقية تبقى خارج التحويل.</p></div>
              <button type="button" onClick={() => setIsSurplusDialogOpen(false)} className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#e1ebe3] bg-white text-[#83958a]" aria-label="إغلاق"><X className="size-4" /></button>
            </div>

            <div className="mt-5 rounded-[22px] bg-[#19382c] p-4 text-white">
              <p className="text-xs font-bold text-[#b9d7c4]">المبلغ المتاح حالياً</p>
              <p className="number-ltr mt-1 text-3xl font-black tracking-[-0.06em] text-[#effff5]">{formatMoney(surplus.available)}</p>
              <p className="mt-1 text-[11px] font-semibold text-[#a5c7b2]">سيتم احتساب المبلغ بدقة قبل التأكيد.</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button type="button" onClick={() => { setInvestmentPercent("100"); setEmergencyPercent("0"); setSurplusError(""); }} className="min-h-10 rounded-xl border border-[#dfeae2] bg-white px-2 text-[11px] font-black text-[#557665] transition hover:border-[#a9d5b8]">كله استثمار</button>
              <button type="button" onClick={() => { setInvestmentPercent("50"); setEmergencyPercent("50"); setSurplusError(""); }} className="min-h-10 rounded-xl border border-[#dfeae2] bg-white px-2 text-[11px] font-black text-[#557665] transition hover:border-[#a9d5b8]">نصف ونصف</button>
              <button type="button" onClick={() => { setInvestmentPercent("0"); setEmergencyPercent("100"); setSurplusError(""); }} className="min-h-10 rounded-xl border border-[#dfeae2] bg-white px-2 text-[11px] font-black text-[#557665] transition hover:border-[#a9d5b8]">كله طوارئ</button>
            </div>

            <div className="mt-4 space-y-3">
              <SurplusDestination label="استثمار" helper="نسبة التحويل للاستثمار" value={investmentPercent} onChange={(value) => { setInvestmentPercent(value); setSurplusError(""); }} amount={investmentAmount} tone="mint" icon={TrendingUp} />
              <SurplusDestination label="صندوق الطوارئ" helper="نسبة التحويل للطوارئ" value={emergencyPercent} onChange={(value) => { setEmergencyPercent(value); setSurplusError(""); }} amount={emergencyAmount} tone="peach" icon={ShieldCheck} />
            </div>

            <div className={`mt-4 flex items-center justify-between rounded-2xl px-4 py-3 ${totalPercent > 100 ? "bg-[#fff0ee] text-[#c35d57]" : "bg-[#eef7f0] text-[#527561]"}`}><span className="text-xs font-bold">سيبقى بعد التحويل</span><span className="number-ltr text-sm font-black">{formatMoney(leftoverAmount)} <span className="text-[10px] font-bold">({leftoverPercent}٪)</span></span></div>
            {surplusError && <p role="alert" className="mt-3 rounded-2xl bg-[#fff0ee] px-4 py-3 text-xs font-bold text-[#c35d57]">{surplusError}</p>}

            <button type="button" onClick={submitSurplusTransfer} disabled={totalPercent <= 0 || totalPercent > 100 || surplus.available <= 0} className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#2d9b73] text-sm font-black text-white shadow-[0_10px_22px_rgba(45,155,115,0.2)] transition hover:bg-[#247c58] disabled:bg-[#b6c9bc] disabled:shadow-none"><Check className="size-4" /> تأكيد التحويل</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MonthSelect({ monthKey, onChange }: { monthKey: string; onChange: (key: string) => void }) {
  return (
    <label className="month-control group relative flex min-h-12 items-center gap-2 rounded-2xl border border-[#e1e9e3] bg-white/80 px-3.5 shadow-sm transition focus-within:border-[#92d4ad] focus-within:ring-4 focus-within:ring-[#c9eed7]/60 sm:min-w-48">
      <CalendarDays className="size-4 text-[#2d9b73]" />
      <input aria-label="اختيار الشهر" type="month" value={monthKey} onChange={(event) => onChange(event.target.value)} className="number-ltr w-full bg-transparent text-left text-sm font-extrabold text-[#385246] outline-none" />
    </label>
  );
}

function HeroMetric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof ArrowUpLeft }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9fc2ae]"><Icon className="size-3.5" /> {label}</p>
      <p className="number-ltr mt-1.5 text-sm font-black text-[#effff5]">{value}</p>
    </div>
  );
}

function EditableHeroMetric({ label, value, icon: Icon, onChange }: { label: string; value: number; icon: typeof ArrowUpLeft; onChange: (value: number) => void }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9fc2ae]"><Icon className="size-3.5" /> {label}</p>
      <div className="mt-1.5 flex items-center gap-1">
        <InlineMoneyInput value={value} label={label} onCommit={onChange} compact />
        <span className="text-[10px] font-black text-[#b0d1bd]">د.ك</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone, prefix = "" }: { label: string; value: number; icon: typeof Banknote; tone: "green" | "orange" | "blue" | "purple"; prefix?: string }) {
  const toneClasses = {
    green: "bg-[#e8f7ee] text-[#2d9b73]",
    orange: "bg-[#fff1e2] text-[#dd8a37]",
    blue: "bg-[#e9f3fb] text-[#4a94ba]",
    purple: "bg-[#f3ebfb] text-[#a16ac8]",
  }[tone];
  return (
    <div className="surface-card min-w-0 rounded-[23px] p-4 sm:p-5">
      <div className={`flex size-9 items-center justify-center rounded-xl ${toneClasses}`}><Icon className="size-[17px]" strokeWidth={2.1} /></div>
      <p className="mt-4 truncate text-xs font-bold text-[#88948c]">{label}</p>
      <p className="number-ltr mt-1.5 truncate text-base font-black tracking-[-0.03em] text-[#19382c]">{prefix}{formatMoney(value)}</p>
    </div>
  );
}

function EditableStatCard({ label, value, icon: Icon, tone, prefix = "", onChange }: { label: string; value: number; icon: typeof Banknote; tone: "green" | "orange" | "purple"; prefix?: string; onChange: (value: number) => void }) {
  const toneClasses = {
    green: "bg-[#e8f7ee] text-[#2d9b73]",
    orange: "bg-[#fff1e2] text-[#dd8a37]",
    purple: "bg-[#f3ebfb] text-[#a16ac8]",
  }[tone];
  return (
    <div className="surface-card min-w-0 rounded-[23px] p-4 sm:p-5">
      <div className={`flex size-9 items-center justify-center rounded-xl ${toneClasses}`}><Icon className="size-[17px]" strokeWidth={2.1} /></div>
      <p className="mt-4 truncate text-xs font-bold text-[#88948c]">{label}</p>
      <div className="mt-1.5 flex items-center gap-1">
        {prefix && <span className="text-sm font-black text-[#c47b32]">{prefix}</span>}
        <InlineMoneyInput value={value} label={label} onCommit={onChange} />
        <span className="text-[10px] font-black text-[#9aa59e]">د.ك</span>
      </div>
    </div>
  );
}

function CategoryCard({ category, spent, onBudgetChange, onSpentChange }: { category: Category; spent: number; onBudgetChange: (budget: number) => void; onSpentChange: (spent: number) => void }) {
  const ratio = category.budget > 0 ? spent / category.budget : spent > 0 ? 1 : 0;
  const remaining = category.budget - spent;
  const isOver = remaining < 0;
  const isApproaching = ratio >= 0.8 && !isOver;
  const statusLabel = isOver ? "تجاوزت الحد" : isApproaching ? "اقتربت من الحد" : "ضمن الخطة";
  const statusClass = isOver ? "bg-[#fff0ee] text-[#c65b57]" : isApproaching ? "bg-[#fff5e9] text-[#c17d2f]" : "bg-[#eef8f1] text-[#308361]";

  return (
    <article className={`budget-category-card surface-card rounded-[25px] p-4 transition hover:-translate-y-0.5 ${isOver ? "border-[#f1c1bc] bg-[#fffafa]" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[16px]" style={{ backgroundColor: `${category.color}1A`, color: category.color }}>
            <span className="size-3 rounded-full" style={{ backgroundColor: category.color }} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-[#253b30]">{category.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#98a39c]">
              <span>المخصص</span>
              <BudgetAmountInput value={category.budget} label={`ميزانية ${category.name}`} onCommit={onBudgetChange} />
              <span>د.ك</span>
            </div>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold ${statusClass}`}>{statusLabel}</span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1 font-bold text-[#78857d]">المصروف <InlineMoneyInput value={spent} label={`المصروف في ${category.name}`} onCommit={onSpentChange} compact /> <span className="text-[10px] text-[#9aa59e]">د.ك</span></span>
        <span className={`number-ltr font-black ${isOver ? "text-[#d55d59]" : "text-[#2d9b73]"}`}>{isOver ? `−${formatMoney(Math.abs(remaining))}` : formatMoney(remaining)} <span className="font-bold text-[#8c9991]">متبقي</span></span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#edf2ee]">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, ratio * 100))}%`, backgroundColor: isOver ? "#db645d" : isApproaching ? "#ed9a4d" : category.color }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-[#a0aaa4]">
        <span>{Math.round(ratio * 100)}% مستخدم</span>
        {isOver && <span className="text-[#d55d59]">أوقف الصرف هنا</span>}
      </div>
    </article>
  );
}

function ReserveCard({ label, value, helper, icon: Icon, tone, onChange }: { label: string; value: number; helper: string; icon: typeof TrendingUp; tone: "mint" | "peach" | "lavender"; onChange: (amount: number) => void }) {
  const classes = {
    mint: "bg-[#e8f7ee] text-[#2d9b73]",
    peach: "bg-[#fff1e5] text-[#db8642]",
    lavender: "bg-[#f2ebfb] text-[#9d6bc3]",
  }[tone];
  return (
    <div className="reserve-card surface-card flex items-center gap-3 rounded-[23px] p-4">
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-[16px] ${classes}`}><Icon className="size-[19px]" /></span>
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-[#8a978f]">{label}</p>
        <div className="mt-1 flex items-center gap-1">
          <BudgetAmountInput value={value} label={label} onCommit={onChange} compact />
          <span className="text-[10px] font-black text-[#8e9a92]">د.ك</span>
        </div>
      </div>
      <span className="mr-auto whitespace-nowrap text-[10px] font-bold text-[#a3ada7]">{helper}</span>
    </div>
  );
}

function OutingsCard({ allocated, spent, onAllocatedChange, onSpentChange }: { allocated: number; spent: number; onAllocatedChange: (amount: number) => void; onSpentChange: (amount: number) => void }) {
  const remaining = allocated - spent;
  const ratio = allocated > 0 ? spent / allocated : spent > 0 ? 1 : 0;
  const isOver = remaining < 0;
  const isApproaching = ratio >= 0.8 && !isOver;
  const statusLabel = isOver ? "تجاوزت الحد" : isApproaching ? "اقتربت من الحد" : "ضمن الخطة";
  const statusClass = isOver ? "bg-[#fff0ee] text-[#c65b57]" : isApproaching ? "bg-[#fff5e9] text-[#c17d2f]" : "bg-[#f3edfb] text-[#8e62b3]";

  return (
    <article className={`reserve-card surface-card rounded-[23px] p-4 ${isOver ? "border-[#f1c1bc] bg-[#fffafa]" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[16px] bg-[#f2ebfb] text-[#9d6bc3]"><CircleDollarSign className="size-[19px]" /></span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[#8a978f]">طلعات ومطاعم</p>
            <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#98a39c]">
              <span>المخصص</span>
              <BudgetAmountInput value={allocated} label="مخصص طلعات ومطاعم" onCommit={onAllocatedChange} compact />
              <span>د.ك</span>
            </div>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold ${statusClass}`}>{statusLabel}</span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 text-[11px]">
        <span className="flex items-center gap-1 font-bold text-[#78857d]">المصروف <InlineMoneyInput value={spent} label="المصروف في طلعات ومطاعم" onCommit={onSpentChange} compact /> <span className="text-[9px] text-[#9aa59e]">د.ك</span></span>
        <span className={`number-ltr whitespace-nowrap font-black ${isOver ? "text-[#d55d59]" : "text-[#7e56a4]"}`}>{isOver ? `−${formatMoney(Math.abs(remaining))}` : formatMoney(remaining)} <span className="font-bold text-[#8c9991]">متبقي</span></span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f0edf3]">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, ratio * 100))}%`, backgroundColor: isOver ? "#db645d" : isApproaching ? "#ed9a4d" : "#9d6bc3" }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[9px] font-bold text-[#a0aaa4]">
        <span>{Math.round(ratio * 100)}% مستخدم</span>
        <span>{isOver ? "تجاوزت المخصص" : "من ميزانية الطلعات"}</span>
      </div>
    </article>
  );
}

function BudgetAmountInput({ value, label, onCommit, compact = false }: { value: number; label: string; onCommit: (value: number) => void; compact?: boolean }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit() {
    const normalized = normalizeNumericInput(draft);
    const parsed = Math.max(0, Number.parseFloat(normalized) || 0);
    setDraft(String(parsed));
    if (parsed !== value) onCommit(parsed);
  }

  return (
    <input
      aria-label={label}
      type="text"
      inputMode="decimal"
      value={draft}
      onChange={(event) => setDraft(normalizeNumericInput(event.target.value))}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
      className={`money-edit-input number-ltr rounded-lg border border-transparent bg-[#f5f8f5] px-1.5 text-left font-black text-[#2d6f50] outline-none transition focus:border-[#9bd9b1] focus:bg-white focus:ring-2 focus:ring-[#d8f2e0] ${compact ? "w-[4.5rem] text-sm" : "w-[4.75rem] text-[11px]"}`}
    />
  );
}

function InlineMoneyInput({ value, label, onCommit, compact = false }: { value: number; label: string; onCommit: (value: number) => void; compact?: boolean }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit() {
    const parsed = Math.max(0, Number.parseFloat(normalizeNumericInput(draft)) || 0);
    setDraft(String(parsed));
    if (parsed !== value) onCommit(parsed);
  }

  return (
    <input
      aria-label={label}
      type="text"
      inputMode="decimal"
      value={draft}
      onChange={(event) => setDraft(normalizeNumericInput(event.target.value))}
      onBlur={commit}
      onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
      className={`money-edit-input number-ltr rounded-lg border border-transparent bg-[#f5f8f5] px-1.5 text-left font-black text-[#2d6f50] outline-none transition focus:border-[#9bd9b1] focus:bg-white focus:ring-2 focus:ring-[#d8f2e0] ${compact ? "w-[3.8rem] text-[11px]" : "w-[4.75rem] text-sm"}`}
    />
  );
}

function percentageValue(value: string) {
  return Math.min(100, Math.max(0, Number.parseFloat(normalizeNumericInput(value)) || 0));
}

function SurplusDestination({ label, helper, value, onChange, amount, tone, icon: Icon }: { label: string; helper: string; value: string; onChange: (value: string) => void; amount: number; tone: "mint" | "peach"; icon: typeof TrendingUp }) {
  const toneClasses = tone === "mint" ? "bg-[#e8f7ee] text-[#2d9b73]" : "bg-[#fff1e5] text-[#db8642]";
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e3ece5] bg-white px-3 py-3">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneClasses}`}><Icon className="size-[18px]" /></span>
      <div className="min-w-0 flex-1"><p className="text-sm font-black text-[#314c3d]">{label}</p><p className="mt-0.5 truncate text-[10px] font-semibold text-[#93a198]">{helper}</p></div>
      <div className="relative w-20 shrink-0"><input aria-label={`${label} بالنسبة`} type="text" inputMode="decimal" value={value} onChange={(event) => onChange(normalizeNumericInput(event.target.value))} className="number-ltr min-h-11 w-full rounded-xl border border-[#e3ece5] bg-[#f8fbf8] px-2 pl-7 text-left text-sm font-black text-[#315c45] outline-none focus:border-[#96d3ab] focus:bg-white focus:ring-4 focus:ring-[#d8f2e0]" /><span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-[#8da196]">٪</span></div>
      <span className="number-ltr w-24 shrink-0 text-left text-xs font-black text-[#557665]">{formatMoney(amount)}</span>
    </div>
  );
}
