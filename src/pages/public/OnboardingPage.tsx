import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Banknote,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileBarChart,
  Home,
  KeyRound,
  Layers3,
  LockKeyhole,
  Receipt,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

const registrationUrl = import.meta.env.VITE_KEYCLOAK_REGISTRATION_URL as string | undefined;

const proofCards = [
  {
    title: 'Rent visibility',
    description: 'Track rent charges, payments, arrears, receipts, and reminders.',
    icon: Banknote,
  },
  {
    title: 'Maintenance control',
    description: 'See tenant issues, status updates, and manager activity in one place.',
    icon: Wrench,
  },
  {
    title: 'Role-based portals',
    description: 'Give Admins, Landlords, Tenants, and Property Managers the right view.',
    icon: ShieldCheck,
  },
];

const problemSolutions = [
  {
    before: 'Late rent surprises',
    after: 'Automated reminders and arrears visibility',
  },
  {
    before: 'Unclear tenant records',
    after: 'Linked tenant profiles, leases, payments, and receipts',
  },
  {
    before: 'Maintenance confusion',
    after: 'Clear maintenance timelines and accountability',
  },
  {
    before: 'Vacant units stay hidden',
    after: 'Vacancy and application pipeline foundation',
  },
];

const audiences = [
  {
    title: 'Landlords',
    description: 'Manage properties, units, tenants, rent, maintenance, and arrears.',
    icon: Building2,
  },
  {
    title: 'Tenants',
    description: 'View lease details, payment history, receipts, and maintenance updates.',
    icon: Receipt,
  },
  {
    title: 'Admins',
    description: 'Monitor users, properties, leases, payments, audit logs, and reports.',
    icon: UserCog,
  },
  {
    title: 'Property Managers',
    description: 'Track assigned properties, maintenance tasks, tenant issues, and activity logs.',
    icon: Users,
  },
];

const capabilities = [
  { title: 'Property and unit management', icon: Home },
  { title: 'Tenant and lease management', icon: ClipboardList },
  { title: 'Rent charges and payment tracking', icon: Banknote },
  { title: 'Utility billing items', icon: Layers3 },
  { title: 'Receipts and allocations', icon: Receipt },
  { title: 'Maintenance request timelines', icon: Wrench },
  { title: 'Audit logs and reports', icon: FileBarChart },
  { title: 'Reminder and notification foundation', icon: Bell },
];

const trustBadges = [
  { label: 'Secure Keycloak authentication', icon: LockKeyhole },
  { label: 'Role-based access control', icon: ShieldCheck },
  { label: 'Protected API access', icon: KeyRound },
  { label: 'Audit logging', icon: Activity },
  { label: 'KRA/eTIMS-ready reporting planned', icon: BarChart3 },
];

const previewStats = [
  '24 properties tracked',
  '148 tenants',
  '18 occupied units',
  '6 vacant units',
  'KES 4.82M rent tracked',
  '7 open maintenance requests',
];

const previewPanels = [
  { title: 'Portfolio overview', value: '94%', label: 'portfolio visibility' },
  { title: 'Rent collection', value: 'KES 4.82M', label: 'tracked this cycle' },
  { title: 'Maintenance queue', value: '7 open', label: 'requests in progress' },
  { title: 'Lease alerts', value: '12', label: 'upcoming renewals' },
];

const tenantPortalItems = [
  'Lease active',
  'Rent due soon',
  'Receipt available',
  'Maintenance updated',
];

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function LandingNavbar({
  isAuthenticated,
  onDashboard,
  onSignIn,
}: {
  isAuthenticated: boolean;
  onDashboard: () => void;
  onSignIn: () => void;
}) {
  const links = [
    { label: 'Solutions', sectionId: 'solutions' },
    { label: 'Pricing', sectionId: 'pricing' },
    { label: 'Features', sectionId: 'features' },
    { label: 'About', sectionId: 'about' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071426]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => scrollToSection('hero')}
          className="flex min-w-0 items-center gap-3 rounded-full text-left focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0bbf7d_0%,#246bfe_100%)] shadow-[0_12px_34px_rgba(16,185,129,0.28)]">
            <Building2 className="h-5 w-5 text-white" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-white">LandlordTenant</span>
            <span className="hidden text-xs text-slate-400 sm:block">Property operations platform</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm font-medium text-slate-300 lg:flex" aria-label="Landing sections">
          {links.map((link) => (
            <button
              key={link.sectionId}
              type="button"
              onClick={() => scrollToSection(link.sectionId)}
              className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <Button
          onClick={isAuthenticated ? onDashboard : onSignIn}
          className="rounded-full bg-white text-[#071426] hover:bg-emerald-50 focus-visible:ring-emerald-300"
        >
          {isAuthenticated ? 'Dashboard' : 'Sign in'}
        </Button>
      </div>
    </header>
  );
}

function HeroSection({
  isAuthenticated,
  onPrimaryCta,
  onRequestAccess,
}: {
  isAuthenticated: boolean;
  onPrimaryCta: () => void;
  onRequestAccess: () => void;
}) {
  return (
    <section id="hero" className="relative overflow-hidden bg-[#071426] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(16,185,129,0.25),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(37,99,235,0.26),transparent_34%),linear-gradient(180deg,#071426_0%,#0a1930_58%,#f8fafc_58%,#f8fafc_100%)]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:px-8 lg:pb-24 lg:pt-20">
        <div className="flex flex-col justify-center">
          <Badge variant="info" className="mb-5 w-fit border border-emerald-300/20 bg-emerald-400/10 text-emerald-200">
            PROPERTY OPERATIONS PLATFORM
          </Badge>
          <h1 className="max-w-4xl text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
            The command center for{' '}
            <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#38f2a6_0%,#8bd7ff_100%)]">
              every property, tenant, and payment.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            LandlordTenant brings properties, units, tenants, leases, rent collection, maintenance, reminders, and reports into one secure operating system.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={onPrimaryCta} className="rounded-full bg-emerald-400 text-[#071426] hover:bg-emerald-300 focus-visible:ring-emerald-200 sm:min-w-52">
              {isAuthenticated ? 'Go to Dashboard' : 'Sign in securely'}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={onRequestAccess} className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 sm:min-w-44">
              Request access
            </Button>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative min-w-0">
      <div className="absolute -left-8 top-8 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute -right-8 bottom-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl">
        <div className="rounded-[1.5rem] border border-white/10 bg-[#0b172a]/92 p-5">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Property operations command center</p>
              <p className="mt-1 text-xs text-slate-400">Static UI illustration, not live data.</p>
            </div>
            <span className="w-fit rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              Portfolio view
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {previewStats.map((stat) => (
              <div key={stat} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                <p className="text-sm font-semibold text-white">{stat}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {previewPanels.map((panel) => (
              <div key={panel.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{panel.title}</p>
                <p className="mt-3 text-2xl font-bold text-white">{panel.value}</p>
                <p className="mt-1 text-xs text-slate-400">{panel.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Rent collection</p>
              <BarChart3 className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="flex h-28 items-end gap-2">
              {[48, 70, 58, 86, 78, 96, 90].map((height, index) => (
                <div key={height + index} className="flex flex-1 items-end rounded-full bg-white/10">
                  <div className="w-full rounded-full bg-[linear-gradient(180deg,#38f2a6_0%,#246bfe_100%)]" style={{ height: `${height}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-7 left-4 right-4 rounded-3xl border border-white/20 bg-white/90 p-4 text-[#071426] shadow-2xl shadow-black/20 backdrop-blur-xl sm:left-auto sm:right-8 sm:w-72">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Tenant portal</p>
            <p className="mt-1 text-xs text-slate-500">Static UI illustration, not live data.</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-[#006948]">
            <Users className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-4 grid gap-2">
          {tenantPortalItems.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-[#006948]" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProofCard({ title, description, icon: Icon }: (typeof proofCards)[number]) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#006948]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function ProblemSolutionCard({ before, after }: (typeof problemSolutions)[number]) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-500">Before</p>
        <p className="mt-2 text-sm font-semibold text-slate-800">{before}</p>
      </div>
      <div className="mt-3 rounded-2xl bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#006948]">After</p>
        <p className="mt-2 text-sm font-semibold text-slate-900">{after}</p>
      </div>
    </div>
  );
}

function AudienceCard({ title, description, icon: Icon }: (typeof audiences)[number]) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition hover:bg-white/[0.1]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

function CapabilityCard({ title, icon: Icon }: (typeof capabilities)[number]) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
    </div>
  );
}

function TrustBadge({ label, icon: Icon }: (typeof trustBadges)[number]) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-300/10 text-emerald-200">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm font-semibold text-slate-100">{label}</p>
    </div>
  );
}

function RequestAccessModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [showContactNote, setShowContactNote] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request access">
      <div className="space-y-4">
        <Alert variant="warning" title="Self-registration is not available yet">
          Please contact the administrator to activate your account.
        </Alert>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Account creation is controlled by the administrator to protect landlord and tenant records.
        </p>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          LandlordTenant does not create local users, store passwords, or bypass Keycloak from this page.
        </p>
        {showContactNote && (
          <Alert variant="info">
            Administrator contact details are not configured in this frontend yet. Use your organization&apos;s normal access request channel.
          </Alert>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Back
          </Button>
          <Button onClick={() => setShowContactNote(true)}>
            Contact administrator
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function OnboardingPage() {
  const { isAuthenticated, isLoading, redirectPath, signIn } = useAuth();
  const navigate = useNavigate();
  const [isRequestAccessOpen, setIsRequestAccessOpen] = useState(false);
  const canUseRegistration = Boolean(registrationUrl?.trim());

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071426]">
        <Spinner size="lg" />
      </div>
    );
  }

  function goToDashboard() {
    navigate(redirectPath);
  }

  function handlePrimaryCta() {
    if (isAuthenticated) {
      goToDashboard();
      return;
    }

    void signIn();
  }

  function handleRequestAccess() {
    if (canUseRegistration && registrationUrl) {
      window.location.assign(registrationUrl);
      return;
    }

    setIsRequestAccessOpen(true);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <LandingNavbar
        isAuthenticated={isAuthenticated}
        onDashboard={goToDashboard}
        onSignIn={() => {
          void signIn();
        }}
      />

      <HeroSection
        isAuthenticated={isAuthenticated}
        onPrimaryCta={handlePrimaryCta}
        onRequestAccess={handleRequestAccess}
      />

      <section className="relative -mt-8 pb-16">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {proofCards.map((card) => (
            <ProofCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section id="solutions" className="scroll-mt-24 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <Badge variant="neutral" className="mb-4">
              Problem to solution
            </Badge>
            <h2 className="text-4xl font-bold text-slate-950">Property management should not feel chaotic.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {problemSolutions.map((item) => (
              <ProblemSolutionCard key={item.before} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-24 bg-[#071426] py-20 text-white">
        <div className="absolute left-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">One platform</p>
            <h2 className="mt-3 text-4xl font-bold">One platform, different portals for each user.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {audiences.map((audience) => (
              <AudienceCard key={audience.title} {...audience} />
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-24 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#006948]">Core capabilities</p>
              <h2 className="mt-3 text-4xl font-bold text-slate-950">Built around the work property teams repeat every day.</h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-slate-600">
              The onboarding preview uses static UI-only examples. It does not call backend APIs or claim live operational totals.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((capability) => (
              <CapabilityCard key={capability.title} {...capability} />
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#eefaf5_52%,#eef5ff_100%)] p-8 shadow-xl shadow-slate-200/70 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#006948]">Access model</p>
                <h2 className="mt-3 text-4xl font-bold text-slate-950">Pricing and onboarding are administrator-led.</h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Account activation is controlled to protect property, tenant, lease, and payment records.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {['No self-service password signup', 'Role assignment through Keycloak', 'Administrator-controlled account activation', 'Request access before onboarding'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#006948]" />
                    <p className="text-sm font-semibold text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#071426] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-emerald-300" />
            <h2 className="text-3xl font-bold">Trust and security foundation</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {trustBadges.map((badge) => (
              <TrustBadge key={badge.label} {...badge} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <KeyRound className="mx-auto h-10 w-10 text-[#006948]" />
          <h2 className="mt-4 text-4xl font-bold text-slate-950">Ready to run property operations with clearer control?</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Sign in through Keycloak, or request access if your administrator has not activated your account yet.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={handlePrimaryCta}>
              {isAuthenticated ? 'Go to Dashboard' : 'Sign in securely'}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleRequestAccess}>
              Request access
            </Button>
          </div>
        </div>
      </section>

      <RequestAccessModal
        isOpen={isRequestAccessOpen}
        onClose={() => setIsRequestAccessOpen(false)}
      />
    </main>
  );
}
