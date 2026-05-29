import { type ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Shield,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import { useLandlords } from './hooks/useLandlords';

const PAGE_SIZE = 15;

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(iso)
  );

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'indigo';

const badgeClass: Record<BadgeVariant, string> = {
  success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-100 bg-amber-50 text-amber-700',
  danger: 'border-red-100 bg-red-50 text-red-700',
  info: 'border-blue-100 bg-blue-50 text-blue-700',
  neutral: 'border-slate-200 bg-slate-100 text-slate-600',
  purple: 'border-purple-100 bg-purple-50 text-purple-700',
  indigo: 'border-indigo-100 bg-indigo-50 text-indigo-700',
};

function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeClass[variant]}`}
    >
      {children}
    </span>
  );
}

function MiniStatCard({
  label,
  value,
  icon,
  bg,
  color,
  alert,
}: {
  label: string;
  value: number | undefined;
  icon: ReactNode;
  bg: string;
  color: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 px-4 py-4 shadow-sm ${
        alert ? 'ring-1 ring-amber-200' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {alert && <span className="w-2 h-2 rounded-full bg-amber-400" />}
      </div>
      <div className="text-[22px] font-bold text-slate-900 leading-none">
        {value !== undefined ? value : <span className="text-slate-300 animate-pulse">-</span>}
      </div>
      <div className="text-xs text-slate-400 mt-1.5 font-medium">{label}</div>
    </div>
  );
}

export default function LandlordsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [linkedFilter, setLinkedFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);

  const successMessage = (location.state as { successMessage?: string } | null)?.successMessage;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (successMessage) {
      window.history.replaceState({}, '', `${location.pathname}${location.search}`);
    }
  }, [location.pathname, location.search, successMessage]);

  const totalQuery = useLandlords({ pageSize: 1 });
  const linkedQuery = useLandlords({ pageSize: 1, keycloakLinked: true });
  const unlinkedQuery = useLandlords({ pageSize: 1, keycloakLinked: false });

  const landlords = useLandlords({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    keycloakLinked: linkedFilter,
  });

  const totalCount = landlords.data?.totalCount ?? 0;
  const pageCount = landlords.data ? Math.max(1, Math.ceil(totalCount / PAGE_SIZE)) : undefined;
  const showingStart = landlords.data && totalCount > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = landlords.data ? Math.min(page * PAGE_SIZE, totalCount) : 0;

  return (
    <div className="flex-1 overflow-y-auto py-5 px-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Landlords</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage landlord accounts and their Keycloak link status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/landlords/new')}
          className="inline-flex items-center gap-2 bg-[#006948] hover:bg-[#005238] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <UserPlus size={15} /> Add Landlord
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 text-[13px] text-emerald-700 font-medium">
          <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-500" />
          {successMessage}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full bg-white border border-slate-100 rounded-xl pl-9 pr-4 py-2 text-[13px] text-slate-600 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-[#006948]/20 shadow-sm"
          />
        </div>

        {[
          { label: 'All', value: undefined },
          { label: 'Linked', value: true },
          { label: 'Unlinked', value: false },
        ].map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => {
              setLinkedFilter(chip.value);
              setPage(1);
            }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              linkedFilter === chip.value
                ? 'bg-[#006948] text-white border-[#006948]'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <MiniStatCard
          label="Total Landlords"
          value={totalQuery.data?.totalCount}
          icon={<UserCheck size={16} />}
          bg="bg-violet-50"
          color="text-violet-600"
        />
        <MiniStatCard
          label="Linked to Keycloak"
          value={linkedQuery.data?.totalCount}
          icon={<Shield size={16} />}
          bg="bg-emerald-50"
          color="text-emerald-600"
        />
        <MiniStatCard
          label="Not Yet Linked"
          value={unlinkedQuery.data?.totalCount}
          icon={<UserX size={16} />}
          bg="bg-amber-50"
          color="text-amber-600"
          alert
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-slate-800">All Landlords</span>
          <button
            type="button"
            className="text-slate-300 hover:text-slate-500 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Download CSV"
          >
            <Download size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/60">
                {['Landlord', 'Contact', 'National ID', 'Properties', 'Tenants', 'Keycloak', 'Joined', ''].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="text-left py-2.5 px-5 text-[11px] text-slate-400 font-semibold uppercase tracking-wide whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {landlords.isPending &&
                Array.from({ length: 8 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-slate-50">
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="py-3 px-5">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}

              {landlords.isError && (
                <tr>
                  <td colSpan={8} className="py-10 px-5 text-center text-sm text-red-500">
                    Could not load landlords. Please try again.
                  </td>
                </tr>
              )}

              {!landlords.isPending && !landlords.isError && landlords.data.items.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 px-5 text-center text-sm text-slate-400">
                    {debouncedSearch || linkedFilter !== undefined
                      ? 'No landlords match your filters.'
                      : 'No landlords registered yet.'}
                  </td>
                </tr>
              )}

              {landlords.data?.items.map((landlord) => (
                <tr
                  key={landlord.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {landlord.name
                          .split(' ')
                          .map((namePart) => namePart[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{landlord.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{landlord.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-5 whitespace-nowrap">
                    <div className="text-slate-600">{landlord.email}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{landlord.phone ?? '-'}</div>
                  </td>

                  <td className="py-3 px-5 font-mono text-slate-500 whitespace-nowrap">
                    {landlord.nationalId ?? '-'}
                  </td>

                  <td className="py-3 px-5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                      <Building2 size={12} className="text-slate-300" />
                      {landlord.propertyCount}
                    </span>
                  </td>

                  <td className="py-3 px-5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                      <Users size={12} className="text-slate-300" />
                      {landlord.tenantCount}
                    </span>
                  </td>

                  <td className="py-3 px-5 whitespace-nowrap">
                    {landlord.keycloakLinked ? (
                      <Badge variant="success">
                        <CheckCircle2 size={10} /> Linked
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <AlertTriangle size={10} /> Unlinked
                      </Badge>
                    )}
                  </td>

                  <td className="py-3 px-5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {fmtDate(landlord.createdAt)}
                  </td>

                  <td className="py-3 px-5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/landlords/${landlord.id}`)}
                      className="text-[11px] text-[#006948] font-semibold hover:underline flex items-center gap-1"
                    >
                      View <ChevronRight size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-50 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] text-slate-400 font-mono">
            {landlords.data
              ? `Showing ${showingStart}-${showingEnd} of ${totalCount} landlords`
              : '-'}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[11px] text-slate-500 font-mono px-2">
              Page {page} of {pageCount ?? '-'}
            </span>
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={!pageCount || page >= pageCount}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
