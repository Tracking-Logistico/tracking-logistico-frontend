/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Download,
  LoaderCircle,
  PackageCheck,
  Play,
  Search,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, getApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { LabelResponse, OrderResponse } from "@/types/api";

function downloadLabel(label: LabelResponse) {
  const blob = new Blob([label.contenido], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `etiqueta-${label.numeroTracking}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}
export function ShipmentsPage() {
  usePageMeta(
    "Envíos",
    "Activa envíos, genera etiquetas y consulta su tracking.",
  );
  const token = useAuthStore((state) => state.accessToken);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [tracking, setTracking] = useState("");
  const [result, setResult] = useState<OrderResponse | null>(null);
  const [label, setLabel] = useState<LabelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      setOrders(await api.listInTransitOrders(token));
    } catch (err) {
      setError(
        getApiError(err, "No se pudieron cargar los envíos en tránsito."),
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [token]);
  async function activate(id: number) {
    if (!token) return;
    setError("");
    try {
      const updated = await api.activateTracking(id, token);
      setSuccess(`Tracking activado: ${updated.numeroTracking ?? "generado"}.`);
      await load();
    } catch (err) {
      setError(
        getApiError(
          err,
          "El pedido debe estar validado antes de activar el tracking.",
        ),
      );
    }
  }
  async function createLabel(id: number) {
    if (!token) return;
    setError("");
    try {
      const generated = await api.generateLabel(id, token);
      setLabel(generated);
      setSuccess(`Etiqueta lista para ${generated.numeroTracking}.`);
    } catch (err) {
      setError(getApiError(err, "No se pudo generar la etiqueta."));
    }
  }
  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !tracking.trim()) return;
    setError("");
    setResult(null);
    try {
      setResult(await api.getOrderByTracking(tracking.trim(), token));
    } catch (err) {
      setError(getApiError(err, "No se encontró un envío con ese código."));
    }
  }
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
      <header className="border-b border-slate-200 pb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          HU-03B
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Activación, etiquetas y seguimiento
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Activa el tracking de pedidos validados, genera su etiqueta y consulta
          el estado mediante el código único.
        </p>
      </header>
      {(error || success) && (
        <p
          role={error ? "alert" : "status"}
          className={`mt-6 rounded-lg px-4 py-3 text-sm ${error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}
        >
          {error || success}
        </p>
      )}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
            <Search className="size-4" />
          </span>
          <div>
            <h2 className="font-semibold">Consultar tracking</h2>
            <p className="text-xs text-slate-500">
              Consulta el estado actual por número de guía.
            </p>
          </div>
        </div>
        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={search}
        >
          <input
            className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 font-mono text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            aria-label="Número de tracking"
            placeholder="TRK-89234710-CO"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
          <Button type="submit" disabled={!tracking.trim()}>
            Buscar envío
          </Button>
        </form>
        {result && (
          <div className="mt-5 rounded-xl bg-slate-50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono font-semibold">
                  {result.numeroTracking}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {result.direccionOrigen} → {result.direccionDestino}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                {result.estado}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Pedido {result.numeroPedido} · {result.tipoServicio} ·{" "}
              {result.pesoKg} kg
            </p>
          </div>
        )}
      </section>
      <section className="mt-8">
        <div className="flex items-center gap-3">
          <PackageCheck className="size-5 text-emerald-700" />
          <div>
            <h2 className="text-xl font-semibold">Envíos en tránsito</h2>
            <p className="text-sm text-slate-500">
              Activa tracking desde pedidos validados y genera la etiqueta.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <LoaderCircle className="size-4 animate-spin" />
              Cargando envíos...
            </div>
          )}
          {!loading && orders.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No hay envíos en tránsito todavía.
            </div>
          )}
          {orders.map((order) => (
            <article
              key={order.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-mono text-sm font-semibold">
                  {order.numeroPedido}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {order.direccionOrigen} → {order.direccionDestino}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {order.numeroTracking ?? "Sin tracking"} · {order.estado}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => void activate(order.id)}>
                  <Play className="size-4" />
                  Activar tracking
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!order.numeroTracking}
                  onClick={() => void createLabel(order.id)}
                >
                  <Tag className="size-4" />
                  Generar etiqueta
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
      {label && (
        <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Etiqueta generada
              </p>
              <h2 className="mt-1 font-mono font-semibold">
                {label.numeroTracking}
              </h2>
            </div>
            <Button onClick={() => downloadLabel(label)}>
              <Download className="size-4" />
              Descargar etiqueta
            </Button>
          </div>
          <div className="mt-5 grid gap-5 rounded-lg bg-white p-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex justify-center">
              <QRCodeSVG
                value={label.numeroTracking}
                size={148}
                includeMargin
              />
            </div>
            <pre className="max-h-64 overflow-auto text-xs text-slate-700">
              {label.contenido}
            </pre>
          </div>
        </section>
      )}
    </div>
  );
}
