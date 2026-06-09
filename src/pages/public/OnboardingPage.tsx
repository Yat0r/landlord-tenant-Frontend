import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardList,
  FileBarChart,
  KeyRound,
  LockKeyhole,
  Receipt,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

const registrationUrl = import.meta.env.VITE_KEYCLOAK_REGISTRATION_URL as string | undefined;

const audienceCards = [
  {
    title: 'For Landlords',
    description: 'Manage units, tenants, rent, maintenance, and arrears.',
    icon: Building2,
  },
  {
    title: 'For Tenants',
    description: 'View lease details, payments, receipts, and maintenance requests.',
    icon: Receipt,
  },
  {
    title: 'For Admins',
    description: 'Monitor platform activity, users, properties, leases, payments, and audit logs.',
    icon: Users,
  },
];

const benefits = [
  { label: 'Secure Keycloak authentication', icon: LockKeyhole },
  { label: 'Role-based access', icon: ShieldCheck },
  { label: 'Payment and rent tracking foundation', icon: Receipt },
  { label: 'Maintenance visibility', icon: Wrench },
  { label: 'KRA/eTIMS-ready reporting planned', icon: FileBarChart },
];

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <p className="text-lg font-bold text-slate-950 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export default function OnboardingPage() {
  const { isAuthenticated, isLoading, redirectPath, signIn } = useAuth();
  const [isRequestAccessOpen, setIsRequestAccessOpen] = useState(false);
  const canUseRegistration = Boolean(registrationUrl?.trim());

  const heroStats = useMemo(
    () => [
      { value: '4 roles', label: 'Admin, landlord, tenant, manager' },
      { value: 'Secure', label: 'OIDC identity foundation' },
      { value: 'Unified', label: 'Operations in one platform' },
    ],
    []
  );

  useEffect(() => {
    if (!isRequestAccessOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsRequestAccessOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isRequestAccessOpen]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  function handleSignUp() {
    if (canUseRegistration && registrationUrl) {
      window.location.assign(registrationUrl);
      return;
    }

    setIsRequestAccessOpen(true);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef7f4_45%,#f8fafc_100%)] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <section className="mx-auto flex min-h-[92vh] max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#006948_0%,#0f766e_48%,#2563eb_100%)] shadow-[0_14px_36px_rgba(15,118,110,0.24)]">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-base font-bold tracking-normal text-slate-950 dark:text-slate-100">LandlordTenant</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Property management platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => signIn()}>
              Sign in
            </Button>
            <Button variant="outline" onClick={handleSignUp}>
              Request access
            </Button>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:py-8">
          <div className="max-w-3xl">
            <Badge variant="info" className="mb-5">
              Secure role-based property operations
            </Badge>
            <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl lg:text-7xl dark:text-slate-100">
              Property management made simple
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Manage properties, units, tenants, leases, rent payments, maintenance, and reports from one secure platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => signIn()} className="sm:min-w-40">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={handleSignUp} className="sm:min-w-44">
                {canUseRegistration ? 'Sign up' : 'Request access'}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(0,105,72,0.18),rgba(37,99,235,0.16))] blur-2xl" />
            <div className="relative rounded-3xl border border-white/80 bg-white/90 p-5 shadow-2xl shadow-emerald-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Operations overview</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Live portal foundation</p>
                  </div>
                  <Badge variant="success">Protected</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {heroStats.map((stat) => (
                    <StatPill key={stat.label} value={stat.value} label={stat.label} />
                  ))}
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    { label: 'Rent and payment tracking', icon: Receipt, color: 'bg-emerald-100 text-emerald-700' },
                    { label: 'Lease visibility by role', icon: ClipboardList, color: 'bg-blue-100 text-blue-700' },
                    { label: 'Maintenance request queue', icon: Wrench, color: 'bg-cyan-100 text-cyan-700' },
                  ].map(({ label, icon: Icon, color }) => (
                    <div key={label} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {audienceCards.map(({ title, description, icon: Icon }) => (
              <Card key={title} className="h-full">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#006948] dark:bg-emerald-950 dark:text-emerald-300">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle>{title}</CardTitle>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#006948] dark:text-emerald-300">Trust foundation</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 dark:text-slate-100">Built for secure property workflows</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <KeyRound className="mx-auto h-10 w-10 text-[#006948] dark:text-emerald-300" />
          <h2 className="mt-4 text-3xl font-bold tracking-normal text-slate-950 dark:text-slate-100">Ready to continue?</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Sign in securely through Keycloak, or request access from an administrator if your account has not been activated yet.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => signIn()}>
              Sign in securely
            </Button>
            <Button size="lg" variant="outline" onClick={handleSignUp}>
              Request access
            </Button>
          </div>
        </div>
      </section>

      <Modal
        isOpen={isRequestAccessOpen}
        onClose={() => setIsRequestAccessOpen(false)}
        title="Request access"
      >
        <div className="space-y-4">
          <Alert variant="warning" title="Self-registration is not available yet">
            Please contact the administrator to activate your account.
          </Alert>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            LandlordTenant keeps account creation and role assignment managed through Keycloak and the platform administrator. No local signup or password storage is performed in the frontend.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsRequestAccessOpen(false)}>
              Close
            </Button>
            <Button onClick={() => signIn()}>
              Sign in instead
              <BadgeCheck className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
