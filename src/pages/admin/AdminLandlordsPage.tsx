import { useMemo, useState } from 'react';
import {
  Building2,
  ChevronRight,
  HousePlus,
  Link2,
  Mail,
  Search,
  ShieldAlert,
  Users,
  WalletCards,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { ROUTES } from '@/constants/routes/routes';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatCurrency } from '@/utils/formatting/formatters';
import type { ReactNode } from 'react';

type ViewFilter = 'all' | 'linked' | 'unlinked';

type LandlordRow = {
  id: string;
  name: string;
  email: string;
  keycloakLinked: boolean;
  properties: number;
  activeLeases: number;
  monthlyRent: number;
  coverage: number;
};

const viewFilters: Array<{ value: ViewFilter; label: string }> = [
  { value: 'all', label: 'All landlords' },
  { value: 'linked', label: 'Linked only' },
  { value: 'unlinked', label: 'Unlinked only' },
];

const landlords: LandlordRow[] = [
  {
    id: 'LAN-001',
    name: 'Amina Hassan',
    email: 'amina.hassan@landlordtenant.co.ke',
    keycloakLinked: true,
    properties: 4,
    activeLeases: 3,
    monthlyRent: 185000,
    coverage: 92,
  },
  {
    id: 'LAN-002',
    name: 'David Otieno',
    email: 'david.otieno@landlordtenant.co.ke',
    keycloakLinked: true,
    properties: 3,
    activeLeases: 3,
    monthlyRent: 156000,
    coverage: 100,
  },
  {
    id: 'LAN-003',
    name: 'Faith Njeri',
    email: 'faith.njeri@landlordtenant.co.ke',
    keycloakLinked: false,
    properties: 2,
    activeLeases: 1,
    monthlyRent: 86000,
    coverage: 67,
  },
  {
    id: 'LAN-004',
    name: 'Joseph Mwangi',
    email: 'joseph.mwangi@landlordtenant.co.ke',
    keycloakLinked: false,
    properties: 1,
    activeLeases: 0,
    monthlyRent: 42000,
    coverage: 0,
  },
  {
    id: 'LAN-005',
    name: 'Grace Wanjiku',
    email: 'grace.wanjiku@landlordtenant.co.ke',
    keycloakLinked: true,
    properties: 5,
    activeLeases: 5,
    monthlyRent: 248000,
    coverage: 95,
  },
];

const portfolioCards = [
  {
    title: 'Total Landlords',
    value: '5',
    note: 'Static snapshot',
    icon: Users,
  },
  {
    title: 'Linked Accounts',
    value: '3',
    note: 'Connected to Keycloak',
    icon: Link2,
  },
  {
    title: 'Unlinked Accounts',
    value: '2',
    note: 'Require admin follow-up',
    icon: XCircle,
  },
  {
    title: 'Monthly Rent',
    value: formatCurrency(717000),
    note: 'Monthly rent across the roster',
    icon: WalletCards,
  },
];

const attentionItems = [
  {
    title: 'Unlinked landlords',
    description: '2 landlords still need Keycloak account linking.',
    tone: 'warning' as const,
    icon: ShieldAlert,
  },
  {
    title: 'Landlords without properties',
    description: '0 landlords currently have no assigned properties.',
    tone: 'success' as const,
    icon: CheckCircle2,
  },
  {
    title: 'Property coverage',
    description: '15 properties and 12 active leases across the landlord base.',
    tone: 'neutral' as const,
    icon: Building2,
  },
];

function StatTile({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string;
  value: string;
  note: string;
  icon: typeof Users;
}) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{title}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{value}</p>
      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{note}</p>
    </article>
  );
}

function SectionShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-100 sm:text-base">{title}</h2>
          {description && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function AccountStatePill({ linked }: { linked: boolean }) {
  return (
    <Badge
      variant={linked ? 'success' : 'warning'}
      className={clsx(
        linked
          ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-200'
          : 'border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-950 dark:bg-amber-950/50 dark:text-amber-200'
      )}
    >
      {linked ? 'Linked' : 'Unlinked'}
    </Badge>
  );
}

export default function AdminLandlordsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ViewFilter>('all');

  const landlordRows = useMemo(() => {
    return landlords.filter((landlord) => {
      const matchesSearch =
        landlord.name.toLowerCase().includes(search.toLowerCase()) ||
        landlord.email.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (filter === 'linked') return landlord.keycloakLinked;
      if (filter === 'unlinked') return !landlord.keycloakLinked;
      return true;
    });
  }, [filter, search]);

  const totalLandlords = landlords.length;
  const linkedLandlords = landlords.filter((landlord) => landlord.keycloakLinked).length;
  const unlinkedLandlords = totalLandlords - linkedLandlords;
  const totalProperties = landlords.reduce((sum, landlord) => sum + landlord.properties, 0);
  const activeLeases = landlords.reduce((sum, landlord) => sum + landlord.activeLeases, 0);
  const portfolioValue = landlords.reduce((sum, landlord) => sum + landlord.monthlyRent, 0);

  const topLandlords = [...landlords].sort((a, b) => b.monthlyRent - a.monthlyRent).slice(0, 4);

  return (
    <div className="min-h-full bg-[#f4f6fb] font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex flex-col gap-4 xl:flex-row">
        <main className="min-w-0 flex-1 space-y-5">
          <section className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                <Building2 size={14} />
                Landlords
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                Landlords
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Static admin snapshot for landlord roster, coverage, and account linking.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <NavLink
                to={ROUTES.ADMIN_LANDLORDS_NEW}
                className="inline-flex items-center gap-2 rounded-md bg-[#006948] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00573d]"
              >
                <HousePlus size={14} />
                Add landlord
              </NavLink>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {portfolioCards.map((card) => (
              <StatTile key={card.title} {...card} />
            ))}
          </section>

          <SectionShell
            title="Landlord roster"
            description="Search and review the current landlord list."
            action={<Badge variant="neutral">{landlordRows.length} shown</Badge>}
          >
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative w-full lg:max-w-md">
                <span className="sr-only">Search landlords</span>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 dark:text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or email"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#006948] focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {viewFilters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={clsx(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                      filter === item.value
                        ? 'bg-[#006948] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {landlordRows.length === 0 ? (
              <EmptyState
                title="No landlords match this view"
                description="Try changing the filter or search term."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Landlord</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Properties</th>
                      <th className="px-4 py-3">Rent</th>
                      <th className="px-4 py-3">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {landlordRows.map((landlord) => (
                      <tr key={landlord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <td className="px-4 py-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-950 dark:text-slate-100">{landlord.name}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                              <ChevronRight size={10} />
                              <span>{landlord.id}</span>
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                            <p className="flex items-center gap-2">
                              <Mail size={14} className="text-slate-400" />
                              <span className="truncate">{landlord.email}</span>
                            </p>
                            <p className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                              <Link2 size={14} />
                              {landlord.keycloakLinked ? 'Linked to Keycloak' : 'Requires account linking'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                              {landlord.properties} properties
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {landlord.activeLeases} active leases
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                              {formatCurrency(landlord.monthlyRent)}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {landlord.coverage}% occupancy coverage
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <AccountStatePill linked={landlord.keycloakLinked} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionShell>

          <SectionShell
            title="Landlord summary"
            description="Landlords ranked by monthly rent contribution."
            action={<Badge variant="neutral">Static snapshot</Badge>}
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {topLandlords.map((landlord) => (
                <article
                  key={landlord.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{landlord.name}</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{landlord.email}</p>
                    </div>
                    <Badge variant={landlord.keycloakLinked ? 'success' : 'warning'}>
                      {landlord.keycloakLinked ? 'Linked' : 'Unlinked'}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-500">
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Properties</p>
                      <p className="mt-1 font-semibold text-slate-950 dark:text-slate-100">{landlord.properties}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Active leases</p>
                      <p className="mt-1 font-semibold text-slate-950 dark:text-slate-100">{landlord.activeLeases}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 dark:text-slate-500">Monthly rent</p>
                      <p className="mt-1 font-semibold text-slate-950 dark:text-slate-100">
                        {formatCurrency(landlord.monthlyRent)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </SectionShell>
        </main>

        <aside className="flex w-full flex-col gap-4 xl:w-[360px]">
          <SectionShell title="Needs Attention" description="Static account states that require follow-up.">
            <div className="space-y-3">
              {attentionItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          'flex h-8 w-8 items-center justify-center rounded-lg',
                          item.tone === 'warning'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
                            : item.tone === 'success'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        )}
                      >
                        <item.icon size={16} />
                      </span>
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{item.title}</p>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionShell>

          <SectionShell title="Quick actions" description="Static navigation and planned roster workflows.">
            <div className="space-y-3">
              <NavLink
                to={ROUTES.ADMIN_LANDLORDS}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <span>Open landlords route</span>
                <ChevronRight size={14} />
              </NavLink>
              <NavLink
                to={ROUTES.ADMIN_LANDLORDS_NEW}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <span>Add landlord</span>
                <ChevronRight size={14} />
              </NavLink>
              <Button variant="secondary" className="w-full justify-between dark:bg-slate-900 dark:text-slate-100" disabled>
                <span>Import roster</span>
                <span className="text-xs uppercase tracking-wider">Coming soon</span>
              </Button>
            </div>
          </SectionShell>

          <SectionShell title="Coverage snapshot" description="Landlord coverage breakdown.">
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Linked accounts</span>
                  <span className="font-semibold text-slate-950 dark:text-slate-100">{linkedLandlords}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-[#006948]"
                    style={{ width: `${Math.round((linkedLandlords / totalLandlords) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Unlinked accounts</span>
                  <span className="font-semibold text-slate-950 dark:text-slate-100">{unlinkedLandlords}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${Math.round((unlinkedLandlords / totalLandlords) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Properties managed</span>
                  <span className="font-semibold text-slate-950 dark:text-slate-100">{totalProperties}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Active leases</span>
                  <span className="font-semibold text-slate-950 dark:text-slate-100">{activeLeases}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{ width: `${Math.round((activeLeases / totalProperties) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Monthly rent total</span>
                  <span className="font-semibold text-slate-950 dark:text-slate-100">{formatCurrency(portfolioValue)}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </SectionShell>
        </aside>
      </div>
    </div>
  );
}
