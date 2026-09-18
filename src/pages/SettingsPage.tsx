import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { usePageMeta } from "@/hooks/usePageMeta";

export function SettingsPage() {
  usePageMeta("Configuración", "Configuración de tu sesión en LogisTrack.");
  const role = useAuthStore((state) => state.role);
  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:px-10">
      <Link
        to="/panel"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950"
      >
        <ArrowLeft className="size-4" />
        Volver al resumen
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight">
        Configuración
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        Preferencias y seguridad de tu sesión actual.
      </p>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
            <KeyRound className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Seguridad de la cuenta</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Rol actual: {role}. El cambio de contraseña requiere el
              identificador de usuario, que el backend todavía no devuelve en el
              login.
            </p>
            <p className="mt-4 text-sm text-amber-700">
              La pantalla queda preparada, pero la operación no se habilita para
              evitar enviar un ID inventado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
