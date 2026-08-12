import {
  CalendarDays,
  LayoutDashboard,
  Plus,
  ReceiptText,
  Settings2,
  Sparkles,
} from "lucide-react";
import type { AppView } from "@/lib/types";

const navItems: { id: AppView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "transactions", label: "المصروفات", icon: ReceiptText },
  { id: "history", label: "السجل الشهري", icon: CalendarDays },
  { id: "settings", label: "الإعدادات", icon: Settings2 },
];

type NavigationProps = {
  activeView: AppView;
  onChange: (view: AppView) => void;
};

export function DesktopSidebar({ activeView, onChange }: NavigationProps) {
  return (
    <aside className="hidden w-[258px] shrink-0 border-l border-[#e1e9e3] bg-white/55 px-5 py-7 lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#19382c] text-[#c7efd8] shadow-[0_12px_22px_rgba(25,56,44,0.18)]">
          <Sparkles className="size-5" strokeWidth={2.2} />
        </div>
        <div>
          <p className="text-lg font-black tracking-[-0.04em] text-[#19382c]">ميزان</p>
          <p className="text-[11px] font-semibold text-[#8b9890]">مساحتك المالية</p>
        </div>
      </div>

      <div className="mt-12 px-3 text-[11px] font-bold tracking-[0.16em] text-[#a2aca6]">التنقل</div>
      <nav className="mt-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`group flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-right text-sm font-bold transition ${
                active
                  ? "bg-[#e6f4eb] text-[#217353]"
                  : "text-[#7e8a83] hover:bg-[#f2f6f3] hover:text-[#19382c]"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className={`flex size-9 items-center justify-center rounded-xl transition ${active ? "bg-white text-[#2d9b73] shadow-sm" : "bg-transparent text-[#97a29c] group-hover:text-[#19382c]"}`}>
                <Icon className="size-[18px]" strokeWidth={2.1} />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[26px] bg-[#19382c] p-5 text-white shadow-[0_16px_36px_rgba(25,56,44,0.16)]">
        <div className="flex size-9 items-center justify-center rounded-xl bg-[#bdebd0]/15 text-[#bdebd0]">
          <Sparkles className="size-4" />
        </div>
        <p className="mt-4 text-sm font-extrabold">خطوة صغيرة كل يوم</p>
        <p className="mt-1.5 text-xs leading-6 text-[#b7cfc2]">سجّل مصروفك أولاً بأول، وخلك قريب من هدفك.</p>
      </div>
    </aside>
  );
}

export function MobileBottomNav({ activeView, onChange }: NavigationProps) {
  return (
    <nav className="mobile-bottom-nav safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[#e2e9e4] bg-white/95 px-3 pt-2 shadow-[0_-12px_35px_rgba(28,60,44,0.08)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-5 items-end gap-1">
        <MobileNavButton item={navItems[0]} activeView={activeView} onChange={onChange} />
        <MobileNavButton item={navItems[1]} activeView={activeView} onChange={onChange} />
        <button
          type="button"
          onClick={() => onChange("add")}
          className="mobile-nav-cta -mt-7 flex flex-col items-center gap-1 text-[10px] font-extrabold text-[#2d9b73]"
          aria-label="صرف جديد"
        >
          <span className={`flex size-[54px] items-center justify-center rounded-[20px] border-[5px] border-[#f4f7f5] bg-[#2d9b73] text-white shadow-[0_10px_22px_rgba(45,155,115,0.32)] transition ${activeView === "add" ? "scale-105" : "hover:-translate-y-0.5"}`}>
            <Plus className="size-6" strokeWidth={2.6} />
          </span>
          صرف جديد
        </button>
        <MobileNavButton item={navItems[2]} activeView={activeView} onChange={onChange} />
        <MobileNavButton item={navItems[3]} activeView={activeView} onChange={onChange} />
      </div>
    </nav>
  );
}

function MobileNavButton({ item, activeView, onChange }: NavigationProps & { item: (typeof navItems)[number] }) {
  const Icon = item.icon;
  const active = activeView === item.id;
  return (
    <button
      type="button"
      onClick={() => onChange(item.id)}
      className={`mobile-nav-button flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold transition ${active ? "text-[#2d9b73]" : "text-[#98a29c]"}`}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="size-[19px]" strokeWidth={active ? 2.5 : 2} />
      {item.label}
    </button>
  );
}
