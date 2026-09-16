import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  PackageCheck,
  Truck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Header } from "@/components/Header";

const steps = [
  {
    number: "01",
    title: "Registra tu envío",
    description: "Guarda la información esencial de cada paquete en segundos.",
    icon: PackageCheck,
  },
  {
    number: "02",
    title: "Actualiza el estado",
    description: "Mantén una línea de tiempo clara desde la salida hasta la entrega.",
    icon: Truck,
  },
  {
    number: "03",
    title: "Consulta el progreso",
    description: "Comparte el avance y toma decisiones con información confiable.",
    icon: CheckCircle2,
  },
];

export const HomePage = () => {
  return (
    <main>
      <Header />
      <section id="como-funciona" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20 md:px-10 md:py-28" aria-labelledby="process-title">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Cómo funciona</p>
          <h2 id="process-title" className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 md:text-5xl">Del movimiento a la certeza.</h2>
          <p className="mt-5 text-lg leading-8 text-zinc-600">Una experiencia directa para que el seguimiento deje de ser una búsqueda entre mensajes y se convierta en una decisión informada.</p>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border bg-zinc-200 md:grid-cols-3">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <article key={number} className="bg-white p-7 md:p-9">
              <div className="flex items-center justify-between"><span className="font-mono text-sm text-zinc-400">{number}</span><Icon className="h-6 w-6 text-emerald-600" /></div>
              <h3 className="mt-16 text-xl font-semibold text-zinc-900">{title}</h3>
              <p className="mt-3 leading-7 text-zinc-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="para-quien" className="border-y bg-zinc-100 scroll-mt-24" aria-labelledby="audience-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:px-10 md:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Para quién es</p>
            <h2 id="audience-title" className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">Diseñado para coordinar, no para complicar.</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="border-l-2 border-emerald-400 pl-5"><Users className="h-6 w-6 text-zinc-700" /><h3 className="mt-5 font-semibold text-zinc-900">Personas y equipos</h3><p className="mt-2 leading-7 text-zinc-600">Para quienes necesitan consultar envíos sin depender de procesos dispersos.</p></div>
            <div className="border-l-2 border-emerald-400 pl-5"><MapPin className="h-6 w-6 text-zinc-700" /><h3 className="mt-5 font-semibold text-zinc-900">Operaciones logísticas</h3><p className="mt-2 leading-7 text-zinc-600">Para centralizar estados y ofrecer una comunicación más clara a cada cliente.</p></div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-7 px-6 py-20 md:flex-row md:items-center md:justify-between md:px-10 md:py-24">
        <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">El siguiente paso</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">Empieza a tener el control de tus envíos.</h2></div>
        <Link to="/registro" className={cn(buttonVariants({ size: "lg" }), "w-fit gap-2 bg-zinc-900 text-white hover:bg-zinc-700")}>Crear una cuenta <ArrowRight className="h-4 w-4" /></Link>
      </footer>
    </main>
  );
};
