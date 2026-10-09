import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { DriverDelivery } from "@/types/api";

const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ENTREGADO: "Entregado",
  FALLIDA: "Entrega fallida",
  DEVOLUCION_AL_REMITENTE: "Devolución al remitente",
  CANCELADA: "Cancelada",
};

function deliveryBadge(state: string) {
  if (state === "ENTREGADO")
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (state === "FALLIDA" || state === "DEVOLUCION_AL_REMITENTE")
    return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

interface DriverDeliveryListProps {
  deliveries: DriverDelivery[];
  loading: boolean;
  tab: "pending" | "completed";
  onTabChange: (tab: "pending" | "completed") => void;
  onSelect: (delivery: DriverDelivery) => void;
  onRegister: (delivery: DriverDelivery) => void;
}

export function DriverDeliveryList({
  deliveries,
  loading,
  tab,
  onTabChange,
  onSelect,
  onRegister,
}: DriverDeliveryListProps) {
  const pending = deliveries.filter(
    (item) => item.estadoParada === "PENDIENTE",
  );
  const completed = deliveries.filter(
    (item) => item.estadoParada !== "PENDIENTE",
  );
  const visible = tab === "pending" ? pending : completed;

  return (
    <section>
      <div className="flex gap-2 border-b border-slate-200">
        <button
          className={`px-4 py-3 text-sm font-semibold ${tab === "pending" ? "border-b-2 border-emerald-600 text-emerald-700" : "text-slate-500"}`}
          onClick={() => onTabChange("pending")}
        >
          Pendientes ({pending.length})
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold ${tab === "completed" ? "border-b-2 border-emerald-600 text-emerald-700" : "text-slate-500"}`}
          onClick={() => onTabChange("completed")}
        >
          Completadas ({completed.length})
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        {loading &&
          [1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        {!loading &&
          visible.map((delivery) => (
            <Card key={delivery.pedidoId}>
              <CardContent className="pt-6">
                <button
                  className="w-full text-left"
                  onClick={() => onSelect(delivery)}
                  aria-label={`Ver información de ${delivery.numeroPedido}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">#{delivery.numeroPedido}</p>
                      <p className="text-xs text-slate-500">
                        {delivery.numeroTracking}
                      </p>
                    </div>
                    <Badge className={deliveryBadge(delivery.estadoParada)}>
                      {statusLabels[delivery.estadoParada] ??
                        delivery.estadoParada}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm">{delivery.destinatarioNombre}</p>
                  <p className="text-sm text-slate-600">
                    {delivery.direccionDestino}, {delivery.ciudadDestino}
                  </p>
                </button>
                {delivery.estadoParada === "PENDIENTE" && (
                  <Button
                    className="mt-2 w-full sm:w-auto"
                    onClick={() => onRegister(delivery)}
                  >
                    Registrar resultado
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        {!loading && !visible.length && (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
            No hay entregas en esta sección.
          </p>
        )}
      </div>
    </section>
  );
}
