import { Outlet } from 'react-router-dom';
import { type ReactNode, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  sidebar: ReactNode;
  topbar?: ReactNode;
}

export function DashboardLayout({ sidebar, topbar }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileSidebarOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-shrink-0 flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-emerald-500 via-cyan-500 to-indigo-500" />
        {sidebar}
      </aside>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[260px] flex-col overflow-y-auto border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-emerald-500 via-cyan-500 to-indigo-500" />
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden lg:pl-[260px]">
        <div className="sticky top-0 z-30 flex-shrink-0 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6 dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              aria-expanded={isMobileSidebarOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 lg:hidden dark:border-slate-700 dark:text-slate-400"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={20} />
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