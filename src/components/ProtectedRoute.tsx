import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import type { Role } from "@/types/api";

interface ProtectedRouteProps {
  roles?: Role[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const location = useLocation();
  const { accessToken, role, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
        Cargando sesión...
      </div>
    );
  }
  if (!accessToken)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && role && !roles.includes(role))
    return <Navigate to="/panel" replace />;
  return <Outlet />;
}
