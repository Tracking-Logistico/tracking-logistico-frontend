import { ArrowRight, Clock3, PackageCheck, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/buttonVariants";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header
      className="overflow-hidden border-b bg-zinc-950 text-white"
      aria-labelledby="hero-title"
    >
      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 md:px-10 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
        <div className="max-w-2xl">
          <p className="mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
            <span className="h-px w-10 bg-emerald-300" />
            Visibilidad que avanza contigo
          </p>
          <h1
            id="hero-title"
            className="max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl"
          >
            Cada paquete tiene una historia.{" "}
            <span className="text-emerald-300">Síguela.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-300">
            LogisTrack reúne en un solo lugar el estado de tus envíos para que
            sepas qué está pasando, dónde está y cuál es el siguiente paso.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/registro"
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 bg-emerald-400 text-zinc-950 hover:bg-emerald-300",
              )}
            >
              Comenzar ahora <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#como-funciona"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white",
              )}
            >
              Conocer el proceso
            </a>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300" /> Información
              centralizada
            </span>
            <span className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-emerald-300" /> Seguimiento simple
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:justify-self-end">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-emerald-400/20" />
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <span className="text-sm font-medium text-zinc-300">
                Vista del envío
              </span>
              <span className="flex items-center gap-2 text-xs text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-300" /> En
                tránsito
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Código de seguimiento
                  </p>
                  <p className="mt-2 font-mono text-lg text-white">
                    LGT-4829-MX
                  </p>
                </div>
                <PackageCheck className="h-7 w-7 text-emerald-300" />
              </div>
              <div className="my-8 flex items-center gap-3 text-sm">
                <div className="h-3 w-3 rounded-full bg-emerald-300 ring-4 ring-emerald-300/15" />
                <div className="h-px flex-1 bg-gradient-to from-emerald-300 via-emerald-300/60 to-zinc-700" />
                <div className="h-3 w-3 rounded-full border border-zinc-600 bg-zinc-900" />
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-zinc-500">Origen</p>
                  <p className="mt-1 text-zinc-200">Bogotá</p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-500">Destino</p>
                  <p className="mt-1 text-zinc-200">Medellín</p>
                </div>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-zinc-800/70 p-3">
                  <p className="text-xs text-zinc-500">Última actualización</p>
                  <p className="mt-1 text-sm text-zinc-200">Hace 18 min</p>
                </div>
                <div className="rounded-lg bg-zinc-800/70 p-3">
                  <p className="text-xs text-zinc-500">Entrega estimada</p>
                  <p className="mt-1 text-sm text-zinc-200">24 Jun, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
