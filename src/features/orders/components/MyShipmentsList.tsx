import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import type { MyOrderResponse } from "@/types/api";

const statusLabels: Record<string, string> = {
  SOLICITADO: "Pendiente de validación",
  CORRECCION_SOLICITADA: "Corrección solicitada",
  CREADO: "Despacho aprobado",
  RECIBIDO_EN_ORIGEN: "Recibido en origen",
  EN_TRANSITO: "En tránsito",
  EN_REPARTO: "En reparto",
  ENTREGADO: "Entregado",
  RECHAZADO: "Rechazado",
};

function formatDate(value?: string) {
  return value
    ? new Date(value).toLocaleDateString("es-CO", { dateStyle: "medium" })
    : "Pendiente de definir";
}

function StatusBadge({ value }: { value: string }) {
  return (
    <Badge
      className={
        value === "ENTREGADO"
          ? "border-emerald-200 bg-emerald-100 text-emerald-800"
          : value === "RECHAZADO"
            ? "border-rose-200 bg-rose-100 text-rose-800"
            : "border-slate-200 bg-slate-100 text-slate-700"
      }
    >
      {statusLabels[value] ?? value.replaceAll("_", " ")}
    </Badge>
  );
}

export function MyShipmentsList({
  shipments,
  loading,
  onCorrect,
}: {
  shipments: MyOrderResponse[];
  loading: boolean;
  onCorrect: (id: number) => void;
}) {
  if (loading)
    return (
      <div className="space-y-3" aria-label="Cargando envíos">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  return (
    <div className="space-y-3">
      {shipments.map((shipment) => (
        <Card key={shipment.id}>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="font-mono text-sm font-semibold">
                {shipment.numeroPedido}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-medium">Remitente:</span>{" "}
                {shipment.remitenteNombre}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-medium">Destinatario:</span>{" "}
                {shipment.destinatarioNombre}
              </p>
              {shipment.numeroTracking && (
                <Link
                  to={`/panel/pedidos/seguimiento/${encodeURIComponent(shipment.numeroTracking)}`}
                  className="mt-2 inline-flex min-h-11 items-center rounded-md px-2 py-1 font-mono text-sm font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  Ver seguimiento: {shipment.numeroTracking}
                </Link>
              )}
            </div>
            <div className="sm:text-right">
              <StatusBadge value={shipment.estado} />
              <p className="mt-2 text-sm text-slate-600">
                Entrega estimada:{" "}
                <span className="font-medium text-slate-800">
                  {formatDate(shipment.fechaEstimadaEntrega)}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Creado: {formatDate(shipment.fechaCreacion)}
              </p>
              {shipment.estado === "CORRECCION_SOLICITADA" && (
                <Button
                  className="mt-3"
                  size="sm"
                  variant="outline"
                  onClick={() => onCorrect(shipment.id)}
                >
                  Corregir información
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
