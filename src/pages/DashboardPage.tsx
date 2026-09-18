import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowRight, ClipboardList, Map, PackageCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { Role } from "@/types/api";

const cards = [
  {
    key: "pedidos",
    title: "Pedidos",
    story: "HU-03A",
    description: "Validación y prioridad",
    icon: ClipboardList,
    roles: ["OPERADOR"],
  },
  {
    key: "envios",
    title: "Envíos",
    story: "HU-03B",
    description: "Etiquetas y seguimiento",
    icon: PackageCheck,
    roles: ["OPERADOR"],
  },
  {
    key: "rutas",
    title: "Rutas",
    story: "HU-09",
    description: "Asignación operativa",
    icon: Map,
    roles: ["OPERADOR", "CONDUCTOR"],
  },
] satisfies Array<{
  key: string;
  title: string;
  story: string;
  description: string;
  icon: typeof ClipboardList;
  roles: Role[];
}>;
export function DashboardPage() {
  usePageMeta("Panel", "Centro operativo de LogisTrack.");
  const role = useAuthStore((state) => state.role);
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.fromTo(
      gridRef.current?.children ?? [],
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.07, ease: "power2.out" },
    );
  }, []);
  const roleName =
    role === "CLIENTE"
      ? "cliente"
      : role === "OPERADOR"
        ? "operador"
        : "conductor";
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Centro operativo
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tu operación, en contexto.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Sesión activa como {roleName}. Accede a cada flujo desde un solo
            espacio.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Sistema conectado
          <br />
          <span className="text-xs text-emerald-700">
            Autenticación disponible
          </span>
        </div>
      </header>
      <section className="mt-8" aria-labelledby="modules-title">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Módulos
            </p>
            <h2 id="modules-title" className="mt-1 text-xl font-semibold">
              Flujos de LogisTrack
            </h2>
          </div>
        </div>
        <div
          ref={gridRef}
          className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {cards
            .filter((card) => role && (card.roles as Role[]).includes(role))
            .map(({ key, title, story, description, icon: Icon }) => (
              <Link
                key={key}
                to={`/panel/${key}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-10 place-items-center rounded-lg bg-slate-950 text-emerald-300">
                    <Icon className="size-5" />
                  </span>
                  <ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
                </div>
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  {story}
                </p>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </Link>
            ))}
        </div>
      </section>
      <section className="mt-10 rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
          Estado de integración
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <p className="font-medium">Autenticación</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Conectada a sesiones del backend.
            </p>
          </div>
          <div>
            <p className="font-medium">Registro de clientes</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Disponible con verificación por correo.
            </p>
          </div>
          <div>
            <p className="font-medium">Operación logística</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Requiere endpoints REST aún no publicados.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
