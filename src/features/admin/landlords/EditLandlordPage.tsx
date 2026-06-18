import { type ReactNode, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ChevronLeft, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { handleApiError } from '@/api/helpers/apiHelpers';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useUpdateLandlord, fetchLandlordById } from './hooks/useLandlords';

const schema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(150, 'Full name is too long'),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Enter a valid phone number')
    .min(7, 'Enter a valid phone number'),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .trim()
    .max(300, 'Address is too long')
    .optional()
    .or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

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

export default function EditLandlordPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const landlordId = params.id;
  const updateLandlordMutation = useUpdateLandlord();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadErrorStatus, setLoadErrorStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedLandlord, setLoadedLandlord] = useState<{
    keycloakUserId?: string | null;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  useEffect(() => {
    let cancelled = false;

    async function loadLandlord() {
      if (!landlordId) {
        setLoadError('Missing landlord identifier.');
        setLoadErrorStatus(400);
        return;
      }

      setLoadError(null);
      setLoadErrorStatus(null);

      try {
        setIsLoading(true);
        const landlord = await fetchLandlordById(landlordId);
        if (cancelled) return;

        setLoadedLandlord({
          keycloakUserId: landlord.keycloakUserId ?? null,
        });

        reset({
          fullName: landlord.fullName ?? '',
          phoneNumber: landlord.phoneNumber ?? '',
          email: landlord.email ?? '',
          address: landlord.address ?? '',
        });
      } catch (error) {
        if (cancelled) return;
        const apiError = handleApiError(error);
        setLoadError(apiError.message || 'Failed to load landlord.');
        setLoadErrorStatus(apiError.status || null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadLandlord();

    return () => {
      cancelled = true;
    };
  }, [landlordId, reset]);

  async function onSubmit(values: FormValues) {
    if (!landlordId) {
      setError('root', { message: 'Missing landlord identifier.' });
      return;
    }

    try {
      const updated = await updateLandlordMutation.mutateAsync({
        id: landlordId,
        fullName: values.fullName.trim(),
        phoneNumber: values.phoneNumber.trim(),
        email: values.email?.trim() || undefined,
        address: values.address?.trim() || undefined,
        keycloakUserId: loadedLandlord?.keycloakUserId ?? undefined,
      });

      navigate('/admin/landlords', {
        state: { successMessage: `Landlord ${updated.fullName} updated successfully.` },
      });
    } catch (error) {
      const apiError = handleApiError(error);
      const backendErrors = apiError.errors?.filter(Boolean) ?? [];
      const combinedMessage =
        backendErrors.length > 0 ? `${apiError.message}: ${backendErrors.join(' ')}` : apiError.message;

      setError('root', {
        message: combinedMessage || 'Failed to update landlord. Please try again.',
      });
    }
  }

  if (!landlordId) {
    return (
      <div className="flex-1 overflow-y-auto py-5 px-5">
        <button
          type="button"
          onClick={() => navigate('/admin/landlords')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors"
        >
          <ChevronLeft size={15} /> Back to Landlords
        </button>
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Missing landlord identifier.
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 overflow-y-auto py-5 px-5">
        <button
          type="button"
          onClick={() => navigate('/admin/landlords')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors"
        >
          <ChevronLeft size={15} /> Back to Landlords
        </button>
        <div className="max-w-lg rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadErrorStatus === 404 ? 'Landlord not found.' : loadError}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState message="Loading landlord..." />;
  }

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
          <h1 className="text-xl font-bold text-slate-900">Edit Landlord</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Update the landlord identity fields supported by the backend.
          </p>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(onSubmit)(event)}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5"
        >
          <FormField label="Full Name" error={errors.fullName?.message} required>
            <input
              type="text"
              placeholder="John Kamau"
              aria-invalid={Boolean(errors.fullName)}
              className={inputClass(errors.fullName?.message)}
              {...register('fullName')}
            />
          </FormField>

          <FormField label="Email Address" error={errors.email?.message}>
            <input
              type="email"
              placeholder="john@example.com"
              aria-invalid={Boolean(errors.email)}
              className={inputClass(errors.email?.message)}
              {...register('email')}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">Optional.</p>
          </FormField>

          <FormField label="Address" error={errors.address?.message}>
            <textarea
              rows={3}
              placeholder="Apartment 2B, Riverside Drive"
              aria-invalid={Boolean(errors.address)}
              className={`${inputClass(errors.address?.message)} resize-none`}
              {...register('address')}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">Optional. Keep this aligned with the backend record.</p>
          </FormField>

          <FormField label="Phone Number" error={errors.phoneNumber?.message} required>
            <input
              type="tel"
              placeholder="+254 700 000 000"
              aria-invalid={Boolean(errors.phoneNumber)}
              className={inputClass(errors.phoneNumber?.message)}
              {...register('phoneNumber')}
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
              disabled={isSubmitting || updateLandlordMutation.isPending}
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              {(isSubmitting || updateLandlordMutation.isPending) && <RefreshCw size={14} className="animate-spin" />}
              Update Landlord
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
