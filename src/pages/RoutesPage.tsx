/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  LoaderCircle,
  Map,
  RefreshCw,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { api, getApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { OrderResponse, RouteResponse } from "@/types/api";

export function RoutesPage() {
  usePageMeta("Rutas", "Asigna y organiza las rutas de entrega.");
  const token = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role);
  const [pending, setPending] = useState<OrderResponse[]>([]);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [conductorId, setConductorId] = useState("");
  const [newConductorId, setNewConductorId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [loading, setLoading] = useState(role === "OPERADOR");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const loadPending = async () => {
    if (!token) return;
    if (role !== "OPERADOR") return;
    setLoading(true);
    try {
      setPending(await api.listPendingRouteOrders(token));
    } catch (err) {
      setError(
        getApiError(
          err,
          "No se pudieron cargar los envíos pendientes de ruta.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadPending();
  }, [token]);
  async function loadRoute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !conductorId) return;
    setError("");
    try {
      setRoute(await api.getDriverRoute(Number(conductorId), token));
    } catch (err) {
      setError(
        getApiError(err, "No existe una ruta activa para ese conductor."),
      );
      setRoute(null);
    }
  }
  async function assign() {
    if (!token || !selectedOrder || !conductorId) {
      setError("Selecciona un envío e indica el conductor.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await api.assignRouteOrder(
        selectedOrder,
        Number(conductorId),
        token,
      );
      setRoute(updated);
      setPending((current) =>
        current.filter((order) => order.id !== selectedOrder),
      );
      setSelectedOrder(null);
      setSuccess(
        `Envío asignado a la ruta del conductor ${updated.conductorId}.`,
      );
    } catch (err) {
      setError(getApiError(err, "No se pudo asignar el envío."));
    } finally {
      setSaving(false);
    }
  }
  async function reorder(stopId: number, direction: "up" | "down") {
    if (!token || !route) return;
    const index = route.paradas.findIndex((stop) => stop.id === stopId);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= route.paradas.length) return;
    const ids = route.paradas.map((stop) => stop.pedidoId);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      setRoute(await api.reorderRoute(route.id, ids, token));
    } catch (err) {
      setError(getApiError(err, "No se pudo reordenar la ruta."));
    }
  }

  async function reassign(pedidoId: number) {
    if (!token || !newConductorId) {
      setError("Indica el nuevo conductor para reasignar la parada.");
      return;
    }
    try {
      setRoute(
        await api.reassignRouteOrder(pedidoId, Number(newConductorId), token),
      );
      setSuccess(
        `Pedido ${pedidoId} reasignado al conductor ${newConductorId}.`,
      );
    } catch (err) {
      setError(getApiError(err, "No se pudo reasignar el envío."));
    }
  }
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            HU-09
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Gestión y asignación de rutas
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Asigna envíos en tránsito a la ruta diaria de un conductor y
            organiza el orden de sus paradas.
          </p>
        </div>
        {role === "OPERADOR" && (
          <Button
            variant="outline"
            onClick={() => void loadPending()}
            disabled={loading}
          >
            <RefreshCw className="size-4" />
            Actualizar
          </Button>
        )}
      </header>
      {(error || success) && (
        <p
          role={error ? "alert" : "status"}
          className={`mt-6 rounded-lg px-4 py-3 text-sm ${error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}
        >
          {error || success}
        </p>
      )}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Bandeja logística
              </p>
              <h2 className="mt-1 text-xl font-semibold">Envíos sin asignar</h2>
            </div>
            <Map className="size-5 text-emerald-700" />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Solo aparecen envíos que ya tienen tracking activo.
          </p>
          <div className="mt-4 space-y-3">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <LoaderCircle className="size-4 animate-spin" />
                Cargando...
              </div>
            )}
            {!loading && pending.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No hay envíos pendientes de asignación.
              </div>
            )}
            {pending.map((order) => (
              <button
                type="button"
                key={order.id}
                onClick={() => setSelectedOrder(order.id)}
                className={`w-full rounded-xl border bg-white p-5 text-left shadow-sm transition ${selectedOrder === order.id ? "border-emerald-500 ring-4 ring-emerald-500/10" : "border-slate-200 hover:border-emerald-300"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold">
                      {order.numeroTracking}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {order.direccionDestino}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {order.numeroPedido}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Ruta del día</h2>
          <p className="mt-1 text-sm text-slate-500">
            Consulta o abre la ruta activa de un conductor.
          </p>
          <form className="mt-5 flex gap-3" onSubmit={loadRoute}>
            <FormField
              label="ID usuario del conductor"
              name="conductorId"
              type="number"
              min="1"
              required
              value={conductorId}
              onChange={(e) => setConductorId(e.target.value)}
            />
            <Button type="submit" className="mt-7" variant="outline">
              Consultar
            </Button>
          </form>
          <Button
            className="mt-4 w-full"
            onClick={() => void assign()}
            disabled={saving || role !== "OPERADOR"}
          >
            <Send className="size-4" />
            {saving ? "Asignando..." : "Asignar envío seleccionado"}
          </Button>
          {role === "OPERADOR" && (
            <div className="mt-4">
              <FormField
                label="Nuevo conductor para reasignar"
                name="newConductorId"
                type="number"
                min="1"
                value={newConductorId}
                onChange={(e) => setNewConductorId(e.target.value)}
              />
            </div>
          )}
          {route && (
            <div className="mt-7 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Ruta #{route.id}
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {route.fecha} · conductor {route.conductorId}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  {route.paradas.length} paradas
                </span>
              </div>
              <ol className="mt-4 space-y-2">
                {route.paradas.map((stop, index) => (
                  <li
                    key={stop.id}
                    className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                      {stop.orden}
                    </span>
                    <span className="flex-1 text-sm">
                      Pedido #{stop.pedidoId}
                      <br />
                      <span className="text-xs text-slate-500">
                        {stop.estado}
                      </span>
                    </span>
                    {role === "OPERADOR" && (
                      <div className="flex gap-1">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          aria-label="Subir parada"
                          disabled={index === 0}
                          onClick={() => void reorder(stop.id, "up")}
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          aria-label="Bajar parada"
                          disabled={index === route.paradas.length - 1}
                          onClick={() => void reorder(stop.id, "down")}
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => void reassign(stop.pedidoId)}
                        >
                          Reasignar
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
