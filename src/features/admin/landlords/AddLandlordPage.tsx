import { type ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ChevronLeft, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useCreateLandlord } from './hooks/useLandlords';

const schema = z.object({
  name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  nationalId: z
    .string()
    .min(5, 'National ID must be at least 5 characters')
    .max(20, 'National ID is too long')
    .optional()
    .or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

type ApiError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

const baseInputClass =
  'w-full bg-[#f4f6fb] border rounded-xl px-3.5 py-2.5 text-[13px] text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 transition-all';

function inputClass(error?: string): string {
  return error
    ? `${baseInputClass} border-red-300 focus:ring-red-200 focus:border-red-300`
    : `${baseInputClass} border-slate-200 focus:ring-brand-primary/20 focus:border-brand-primary/40`;
}

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

export default function AddLandlordPage() {
  const navigate = useNavigate();
  const createLandlord = useCreateLandlord();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const isSaving = isSubmitting || createLandlord.isPending;

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await createLandlord.mutateAsync({
        name: values.name,
        email: values.email,
        phone: values.phone ?? '',
        nationalId: values.nationalId ?? '',
      });

      navigate('/admin/landlords', {
        state: { successMessage: `Landlord ${result.name} added successfully.` },
      });
    } catch (err: unknown) {
      const axiosErr = err as ApiError;

      if (axiosErr.response?.status === 409) {
        setError('email', { message: 'A landlord with this email already exists.' });
        return;
      }

      setError('root', {
        message: axiosErr.response?.data?.message ?? 'Failed to add landlord. Please try again.',
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto py-5 px-5">
      <button
        type="button"
        onClick={() => navigate('/admin/landlords')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors"
      >
        <ChevronLeft size={15} /> Back to Landlords
      </button>

      <div className="max-w-lg">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900">Add Landlord</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Register a new landlord. They will receive an invitation to link their Keycloak account.
          </p>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(onSubmit)(event)}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5"
        >
          <FormField label="Full Name" error={errors.name?.message} required>
            <input
              type="text"
              placeholder="John Kamau"
              aria-invalid={Boolean(errors.name)}
              className={inputClass(errors.name?.message)}
              {...register('name')}
            />
          </FormField>

          <FormField label="Email Address" error={errors.email?.message} required>
            <input
              type="email"
              placeholder="john@example.com"
              aria-invalid={Boolean(errors.email)}
              className={inputClass(errors.email?.message)}
              {...register('email')}
            />
          </FormField>

          <FormField label="Phone Number" error={errors.phone?.message}>
            <input
              type="tel"
              placeholder="+254 700 000 000"
              aria-invalid={Boolean(errors.phone)}
              className={inputClass(errors.phone?.message)}
              {...register('phone')}
            />
          </FormField>

          <FormField label="National ID" error={errors.nationalId?.message}>
            <input
              type="text"
              placeholder="12345678"
              aria-invalid={Boolean(errors.nationalId)}
              className={inputClass(errors.nationalId?.message)}
              {...register('nationalId')}
            />
          </FormField>

          {errors.root && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-[13px] text-red-600">
              <AlertTriangle size={14} className="flex-shrink-0" />
              {errors.root.message}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              {isSaving && <RefreshCw size={14} className="animate-spin" />}
              {createLandlord.isPending ? 'Adding...' : 'Add Landlord'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/landlords')}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
