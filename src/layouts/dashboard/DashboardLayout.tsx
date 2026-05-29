import { Outlet } from 'react-router-dom';
import { type ReactNode, useState } from 'react';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  sidebar: ReactNode;
  topbar?: ReactNode;
}

export function DashboardLayout({ sidebar, topbar }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#f4f6fb] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-[220px] flex-shrink-0 border-r border-slate-100 bg-white lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,#6366f1_0%,#006948_60%,#0891b2_100%)]" />
        {sidebar}
      </aside>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/30 dark:bg-slate-950/60"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[220px] flex-col border-r border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,#6366f1_0%,#006948_60%,#0891b2_100%)]" />
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden lg:pl-[220px]">
        <div className="z-30 shrink-0 border-b border-slate-100 bg-white/85 px-4 py-3 backdrop-blur lg:px-6 dark:border-slate-800 dark:bg-slate-900/85">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 text-slate-500 lg:hidden dark:border-slate-800 dark:text-slate-200"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0 flex-1">{topbar}</div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 lg:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
