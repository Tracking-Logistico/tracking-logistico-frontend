/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Check,
  ClipboardList,
  LoaderCircle,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { api, getApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { usePageMeta } from "@/hooks/usePageMeta";
import type {
  OrderResponse,
  Priority,
  ReceiveOrderPayload,
  ServiceType,
} from "@/types/api";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";
const initialForm: ReceiveOrderPayload = {
  clienteId: 0,
  direccionOrigen: "",
  direccionDestino: "",
  descripcionPaquete: "",
  pesoKg: 0,
  largoCm: 0,
  anchoCm: 0,
  altoCm: 0,
  tipoServicio: "ESTANDAR",
};

export function OrdersPage() {
  usePageMeta("Pedidos", "Recepción, validación y priorización de pedidos.");
  const token = useAuthStore((state) => state.accessToken);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [form, setForm] = useState(initialForm);
  const [operatorId, setOperatorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const loadOrders = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setOrders(await api.listPendingOrders(token));
    } catch (err) {
      setError(
        getApiError(err, "No se pudieron cargar los pedidos pendientes."),
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadOrders();
  }, [token]);
  const update = <K extends keyof ReceiveOrderPayload>(
    key: K,
    value: ReceiveOrderPayload[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const created = await api.receiveOrder(form, token);
      setOrders((current) => [created, ...current]);
      setForm(initialForm);
      setSuccess(
        `Pedido ${created.numeroPedido} recibido. Prioridad sugerida: ${created.prioridadSugerida}.`,
      );
    } catch (err) {
      setError(getApiError(err, "Revisa los campos obligatorios del pedido."));
    } finally {
      setSaving(false);
    }
  }
  async function validateOrder(order: OrderResponse, approve: boolean) {
    if (!token || !operatorId) {
      setError("Indica el ID del operador que valida el pedido.");
      return;
    }
    setError("");
    try {
      const updated = await api.validateOrder(
        order.id,
        {
          operadorId: Number(operatorId),
          aprobar: approve,
          prioridadConfirmada: order.prioridadSugerida as Priority,
        },
        token,
      );
      setOrders((current) => current.filter((item) => item.id !== updated.id));
      setSuccess(
        `Pedido ${updated.numeroPedido} ${approve ? "validado" : "rechazado"}.`,
      );
    } catch (err) {
      setError(getApiError(err, "No se pudo validar el pedido."));
    }
  }
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            HU-03A
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Recepción y priorización
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Registra envíos, revisa la prioridad sugerida y decide qué pedidos
            entran al flujo operativo.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void loadOrders()}
          disabled={loading}
        >
          <RefreshCw className="size-4" />
          Actualizar
        </Button>
      </header>
      {(error || success) && (
        <p
          role={error ? "alert" : "status"}
          className={`mt-6 rounded-lg px-4 py-3 text-sm ${error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}
        >
          {error || success}
        </p>
      )}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-slate-950 text-emerald-300">
              <Plus className="size-4" />
            </span>
            <div>
              <h2 className="font-semibold">Registrar envío</h2>
              <p className="text-xs text-slate-500">
                La API genera el número de pedido automáticamente.
              </p>
            </div>
          </div>
          <form className="mt-6 space-y-4" onSubmit={createOrder}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="ID del cliente"
                name="clienteId"
                type="number"
                min="1"
                required
                value={form.clienteId || ""}
                onChange={(e) => update("clienteId", Number(e.target.value))}
              />
              <div className="space-y-2">
                <label htmlFor="tipoServicio" className="text-sm font-medium">
                  Tipo de servicio
                </label>
                <select
                  id="tipoServicio"
                  className={inputClass}
                  value={form.tipoServicio}
                  onChange={(e) =>
                    update("tipoServicio", e.target.value as ServiceType)
                  }
                >
                  <option value="ESTANDAR">Estándar</option>
                  <option value="EXPRESS">Express</option>
                  <option value="PROGRAMADO">Programado</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Dirección de origen"
                name="direccionOrigen"
                required
                value={form.direccionOrigen}
                onChange={(e) => update("direccionOrigen", e.target.value)}
              />
              <FormField
                label="Dirección de destino"
                name="direccionDestino"
                required
                value={form.direccionDestino}
                onChange={(e) => update("direccionDestino", e.target.value)}
              />
            </div>
            <FormField
              label="Descripción del paquete"
              name="descripcionPaquete"
              required
              value={form.descripcionPaquete}
              onChange={(e) => update("descripcionPaquete", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <FormField
                label="Peso (kg)"
                name="pesoKg"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.pesoKg || ""}
                onChange={(e) => update("pesoKg", Number(e.target.value))}
              />
              <FormField
                label="Largo (cm)"
                name="largoCm"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.largoCm || ""}
                onChange={(e) => update("largoCm", Number(e.target.value))}
              />
              <FormField
                label="Ancho (cm)"
                name="anchoCm"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.anchoCm || ""}
                onChange={(e) => update("anchoCm", Number(e.target.value))}
              />
              <FormField
                label="Alto (cm)"
                name="altoCm"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.altoCm || ""}
                onChange={(e) => update("altoCm", Number(e.target.value))}
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Registrando..." : "Registrar pedido"}
            </Button>
          </form>
        </section>
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Bandeja de entrada
              </p>
              <h2 className="mt-1 text-xl font-semibold">Pedidos pendientes</h2>
            </div>
            <div className="w-40">
              <FormField
                label="ID operador"
                name="operatorId"
                type="number"
                min="1"
                required
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {loading && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                <LoaderCircle className="size-4 animate-spin" />
                Cargando pedidos...
              </div>
            )}
            {!loading && orders.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                <ClipboardList className="mx-auto size-7 text-slate-300" />
                <p className="mt-3">No hay pedidos pendientes.</p>
              </div>
            )}
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-sm font-semibold">
                      {order.numeroPedido}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {order.direccionDestino}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    {order.prioridadSugerida}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {order.descripcionPaquete} · {order.pesoKg} kg ·{" "}
                  {order.tipoServicio}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => void validateOrder(order, true)}
                  >
                    <Check className="size-4" />
                    Validar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void validateOrder(order, false)}
                  >
                    <X className="size-4" />
                    Rechazar
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
