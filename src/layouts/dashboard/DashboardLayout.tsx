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
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <aside className="relative hidden w-[220px] flex-shrink-0 border-r border-slate-100 bg-white lg:flex lg:flex-col">
        <div className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,#6366f1_0%,#006948_60%,#0891b2_100%)]" />
        {sidebar}
      </aside>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/30"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[220px] flex-col border-r border-slate-100 bg-white shadow-xl">
            <div className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,#6366f1_0%,#006948_60%,#0891b2_100%)]" />
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-30 border-b border-slate-100 bg-white/85 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 text-slate-500 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0 flex-1">{topbar}</div>
          </div>
        </div>
        <div className="w-full px-4 py-5 lg:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
