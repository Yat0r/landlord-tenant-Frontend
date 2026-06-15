import { CheckCircle2, ChevronLeft, HousePlus, Info, Link2, ShieldAlert, UserPlus } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ROUTES } from '@/constants/routes/routes';
import type { ReactNode } from 'react';

const linkedOptions = [
  { value: 'yes', label: 'Yes, link to Keycloak' },
  { value: 'no', label: 'No, leave unlinked' },
];

const roleOptions = [
  { value: 'landlord', label: 'Landlord' },
  { value: 'property-manager', label: 'Property Manager' },
];

const managementOptions = [
  { value: 'nairobi', label: 'Nairobi region' },
  { value: 'mombasa', label: 'Mombasa region' },
  { value: 'kisumu', label: 'Kisumu region' },
];

function FieldGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {children}
    </Card>
  );
}

export default function AdminAddLandlordPage() {
  return (
    <div className="min-h-full bg-[#f4f6fb] font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <PageHeader
        title="Add Landlord"
        description="Static creation screen for the admin workflow. Backend submission is not wired yet."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="neutral" className="dark:bg-slate-800 dark:text-slate-200">
              Static form
            </Badge>
            <NavLink
              to={ROUTES.ADMIN_LANDLORDS}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={16} />
              Back to landlords
            </NavLink>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <FieldGroup
            title="Landlord details"
            description="Capture the core identity and account fields first."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Full name" placeholder="Amina Hassan" />
              <Input label="Email address" type="email" placeholder="amina@example.com" />
              <Input label="Phone number" placeholder="+254 700 123 456" />
              <Input label="National ID / Passport" placeholder="12345678" />
            </div>
          </FieldGroup>

          <FieldGroup
            title="Access and linking"
            description="Decide how this landlord will be provisioned in the system."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Account link"
                placeholder="Choose an option"
                options={linkedOptions}
              />
              <Select
                label="Role"
                placeholder="Choose a role"
                options={roleOptions}
              />
              <Select
                label="Management region"
                placeholder="Choose a region"
                options={managementOptions}
              />
              <Input label="Default rent reminder day" type="number" placeholder="5" />
            </div>
          </FieldGroup>

          <FieldGroup
            title="Property assignment"
            description="Static placeholders for the first properties and account notes."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Primary property group" placeholder="Westlands blocks" />
              <Input label="Initial property count" type="number" placeholder="3" />
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-200">
                Internal notes
              </label>
              <textarea
                rows={5}
                placeholder="Add admin notes, verification requirements, or onboarding context."
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
          </FieldGroup>
        </div>

        <aside className="space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                <HousePlus size={18} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">Review</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  This screen is ready for backend wiring.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-slate-100">
                  <UserPlus size={14} className="text-slate-400" />
                  Pending action
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Save and account provisioning are disabled until the backend landlord creation flow exists.
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-amber-800 dark:border-amber-950 dark:bg-amber-950/30 dark:text-amber-200">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldAlert size={14} />
                  Required checks
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    Verify landlord identity
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    Confirm account linking choice
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    Assign properties after creation
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-slate-100">
                  <Link2 size={14} className="text-slate-400" />
                  Workflow status
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Coming soon. The form is designed for the future landlord provisioning API.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="primary" className="flex-1" disabled>
                Save landlord
              </Button>
              <Button variant="secondary" className="flex-1 dark:bg-slate-900 dark:text-slate-100" disabled>
                Save draft
              </Button>
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                <Info size={16} />
              </span>
              <div>
                <h3 className="font-semibold text-slate-950 dark:text-slate-100">What happens next</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Static preview for the future flow.</p>
              </div>
            </div>
            <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">1. Admin fills landlord details.</li>
              <li className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">2. Account linking choice is applied.</li>
              <li className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">3. Properties are assigned later from the roster.</li>
            </ol>
          </Card>
        </aside>
      </div>
    </div>
  );
}
