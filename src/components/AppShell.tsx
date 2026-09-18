import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Boxes,
  ClipboardList,
  LogOut,
  Map,
  Menu,
  PackageCheck,
  Settings,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import type { Role } from "@/types/api";
import { useState } from "react";

const navItems: Array<{
  label: string;
  to: string;
  icon: typeof Boxes;
  roles: Role[];
}> = [
  {
    label: "Resumen",
    to: "/panel",
    icon: Boxes,
    roles: ["CLIENTE", "OPERADOR", "CONDUCTOR"],
  },
  {
    label: "Pedidos",
    to: "/panel/pedidos",
    icon: ClipboardList,
    roles: ["OPERADOR"],
  },
  {
    label: "Envíos",
    to: "/panel/envios",
    icon: PackageCheck,
    roles: ["OPERADOR"],
  },
  {
    label: "Rutas",
    to: "/panel/rutas",
    icon: Map,
    roles: ["OPERADOR", "CONDUCTOR"],
  },
];

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const { role, signOut } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (mobileOpen)
      gsap.fromTo(
        sidebarRef.current,
        { x: -24, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.25 },
      );
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);
  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-950">
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-lg bg-slate-950 p-2 text-white shadow-lg md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Cerrar navegación" : "Abrir navegación"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/40 md:hidden"
          onClick={closeMenu}
          aria-label="Cerrar navegación"
        />
      )}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 px-5 py-6 text-white md:translate-x-0 md:opacity-100 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center gap-3 px-2">
          <span className="grid size-9 place-items-center rounded-lg bg-emerald-400 text-slate-950">
            <PackageCheck className="size-5" />
          </span>
          <div>
            <p className="font-semibold tracking-tight">LogisTrack</p>
            <p className="text-xs text-slate-400">Centro operativo</p>
          </div>
        </div>
        <div
          className="mt-10 flex-1 space-y-1"
          role="navigation"
          aria-label="Navegación del panel"
        >
          {navItems
            .filter((item) => role && item.roles.includes(role))
            .map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/panel"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? "bg-emerald-400 font-semibold text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"}`
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          <NavLink
            to="/panel/configuracion"
            onClick={closeMenu}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? "bg-emerald-400 font-semibold text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"}`
            }
          >
            <Settings className="size-4" />
            Configuración
          </NavLink>
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="px-3 text-xs uppercase tracking-[0.16em] text-slate-500">
            Sesión activa
          </p>
          <p className="mt-2 px-3 text-sm font-medium">
            {role === "CLIENTE"
              ? "Cliente"
              : role === "OPERADOR"
                ? "Operador"
                : "Conductor"}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-rose-500/15 hover:text-rose-200"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="min-h-screen md:pl-72">
        <Outlet />
      </main>
    </div>
  );
}
