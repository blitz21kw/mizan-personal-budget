import {
  ArrowLeft,
  ArrowUpLeft,
  Banknote,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Coins,
  CreditCard,
  Landmark,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import type { CSSProperties } from "react";
import { formatMoney, formatMonthLabel, getCategorySpent, getMonthTotals } from "@/lib/format";
import type { Category, MonthData } from "@/lib/types";

type DashboardViewProps = {
  month: MonthData;
  monthKeys: string[];
  onMonthChange: (monthKey: string) => void;
  onAddExpense: () => void;
  onOpenSettings: () => void;
  onOpenTransactions: () => void;
  onOpenHistory: () => void;
};

export default function DashboardView({
  month,
  monthKeys,
  onMonthChange,
  onAddExpense,
  onOpenSettings,
  onOpenTransactions,
  onOpenHistory,
}: DashboardViewProps) {
  const totals = getMonthTotals(month);
  const spentRatio = totals.netSalary > 0 ? totals.totalSpent / totals.netSalary : 0;
  const fixedRatio = totals.netSalary > 0 ? totals.fixedAllocations / totals.netSalary : 0;
  const monthLabel = formatMonthLabel(month.monthKey);

  return (
    <div className="space-y-6 pb-2">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold tracking-[0.18em] text-[#2d9b73]">لوحة التحكم</p>
          <h1 className="mt-2 text-[clamp(1.75rem,5vw,2.65rem)] font-black leading-[1.12] tracking-[-0.06em] text-[#19382c]">
            أموالك، بصورة أهدأ.
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#7d8982]">كل ما يهمك عن هذا الشهر في مكان واحد.</p>
        </div>
        <MonthSelect monthKey={month.monthKey} monthKeys={monthKeys} onChange={onMonthChange} />
      </header>

      <section className="relative isolate overflow-hidden rounded-[32px] bg-[#163329] p-5 text-white shadow-[0_24px_55px_rgba(24,67,48,0.2)] sm:p-7">
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
            className="group flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#c8f1d7] px-5 text-sm font-black text-[#16412e] shadow-[0_12px_22px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:bg-white active:translate-y-0 sm:min-w-44"
          >
            <span className="flex size-8 items-center justify-center rounded-xl bg-[#2d9b73] text-white transition group-hover:rotate-90">
              <Plus className="size-4" strokeWidth={2.6} />
            </span>
            صرف جديد
          </button>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:max-w-xl sm:grid-cols-3">
          <HeroMetric label="المصروف حتى الآن" value={formatMoney(totals.totalSpent)} icon={ArrowUpLeft} />
          <HeroMetric label="المحجوز" value={formatMoney(totals.reserves)} icon={ShieldCheck} />
          <div className="col-span-2 mt-2 hidden items-center gap-2 text-[11px] text-[#9ec4ad] sm:col-span-1 sm:mt-0 sm:flex sm:justify-end sm:text-left">
            <Sparkles className="size-3.5 text-[#bdebd0]" />
            {spentRatio > 0.8 ? "اقتربت من حد الصرف هذا الشهر" : "استمر، أنت مسيطر على ميزانيتك"}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="الراتب الأصلي" value={month.salary} icon={Banknote} tone="green" />
        <StatCard label="الاستقطاع" value={month.deductions} icon={CreditCard} tone="orange" prefix="−" />
        <StatCard label="صافي الراتب" value={totals.netSalary} icon={Coins} tone="blue" />
        <StatCard label="الميزانيات الثابتة" value={totals.fixedAllocations} icon={Landmark} tone="purple" />
      </section>

      <section className="surface-card rounded-[28px] p-5 sm:p-6">
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

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
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
            <CategoryCard key={category.id} category={category} spent={getCategorySpent(month.expenses, category.id)} />
          ))}
        </div>
        {!month.categories.length && (
          <button type="button" onClick={onOpenSettings} className="surface-card flex w-full items-center justify-center rounded-[24px] p-8 text-sm font-bold text-[#6c7b72]">
            أضف أول ميزانية من الإعدادات
          </button>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <ReserveCard label="استثمار" value={month.investment} helper="تخصيص شهري" icon={TrendingUp} tone="mint" />
        <ReserveCard label="صندوق الطوارئ" value={month.emergencyFund} helper="أمان أكثر" icon={ShieldCheck} tone="peach" />
        <ReserveCard label="طلعات ومطاعم" value={month.outings} helper="مساحة للمتعة" icon={CircleDollarSign} tone="lavender" />
      </section>

      <p className="text-center text-xs font-semibold text-[#a1aca5]">{monthLabel} · آخر تحديث محفوظ على جهازك</p>
      <button type="button" onClick={onOpenHistory} className="sr-only">فتح السجل الشهري</button>
    </div>
  );
}

function MonthSelect({ monthKey, monthKeys, onChange }: { monthKey: string; monthKeys: string[]; onChange: (key: string) => void }) {
  return (
    <label className="group relative flex min-h-12 items-center gap-2 rounded-2xl border border-[#e1e9e3] bg-white/80 px-3.5 shadow-sm transition focus-within:border-[#92d4ad] focus-within:ring-4 focus-within:ring-[#c9eed7]/60 sm:min-w-48">
      <CalendarDays className="size-4 text-[#2d9b73]" />
      <select value={monthKey} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none bg-transparent pl-5 text-sm font-extrabold text-[#385246] outline-none">
        {monthKeys.map((key) => <option key={key} value={key}>{formatMonthLabel(key)}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute left-3 size-4 text-[#91a099]" />
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

function CategoryCard({ category, spent }: { category: Category; spent: number }) {
  const ratio = category.budget > 0 ? spent / category.budget : spent > 0 ? 1 : 0;
  const remaining = category.budget - spent;
  const isOver = remaining < 0;
  const isApproaching = ratio >= 0.8 && !isOver;
  const statusLabel = isOver ? "تجاوزت الحد" : isApproaching ? "اقتربت من الحد" : "ضمن الخطة";
  const statusClass = isOver ? "bg-[#fff0ee] text-[#c65b57]" : isApproaching ? "bg-[#fff5e9] text-[#c17d2f]" : "bg-[#eef8f1] text-[#308361]";

  return (
    <article className={`surface-card rounded-[25px] p-4 transition hover:-translate-y-0.5 ${isOver ? "border-[#f1c1bc] bg-[#fffafa]" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[16px]" style={{ backgroundColor: `${category.color}1A`, color: category.color }}>
            <span className="size-3 rounded-full" style={{ backgroundColor: category.color }} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-[#253b30]">{category.name}</h3>
            <p className="number-ltr mt-1 text-[11px] font-semibold text-[#98a39c]">من {formatMoney(category.budget)}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold ${statusClass}`}>{statusLabel}</span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-2 text-xs">
        <span className="font-bold text-[#78857d]">المصروف <span className="number-ltr text-[#253b30]">{formatMoney(spent)}</span></span>
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

function ReserveCard({ label, value, helper, icon: Icon, tone }: { label: string; value: number; helper: string; icon: typeof TrendingUp; tone: "mint" | "peach" | "lavender" }) {
  const classes = {
    mint: "bg-[#e8f7ee] text-[#2d9b73]",
    peach: "bg-[#fff1e5] text-[#db8642]",
    lavender: "bg-[#f2ebfb] text-[#9d6bc3]",
  }[tone];
  return (
    <div className="surface-card flex items-center gap-3 rounded-[23px] p-4">
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-[16px] ${classes}`}><Icon className="size-[19px]" /></span>
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-[#8a978f]">{label}</p>
        <p className="number-ltr mt-1 truncate text-sm font-black text-[#253b30]">{formatMoney(value)}</p>
      </div>
      <span className="mr-auto whitespace-nowrap text-[10px] font-bold text-[#a3ada7]">{helper}</span>
    </div>
  );
}
