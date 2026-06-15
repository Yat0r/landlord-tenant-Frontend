import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-page px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-text">LandlordTenant</h1>
          <p className="mt-1 text-sm text-brand-muted">Property Management Platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
