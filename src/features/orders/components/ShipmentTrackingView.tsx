import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ShipmentTrackingResponse } from "@/types/api";

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
    ? new Date(value).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })
    : "Pendiente de definir";
}

export function ShipmentTrackingView({ shipment, loading, showSkeleton, error }: {
  shipment: ShipmentTrackingResponse | null;
  loading: boolean;
  showSkeleton: boolean;
  error: string;
}) {
  if (loading || showSkeleton) {
    return <div className="space-y-4" aria-label="Cargando seguimiento">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>;
  }

  if (error) {
    return <Alert variant="destructive">
      <AlertTitle>No pudimos cargar el seguimiento</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>;
  }

  if (!shipment) return null;

  return <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-3">
          <span>Pedido {shipment.numeroPedido}</span>
          <Badge>{statusLabels[shipment.estado] ?? shipment.estado.replaceAll("_", " ")}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Número de seguimiento</p>
        <p className="mt-1 break-all font-mono text-base font-semibold">{shipment.numeroTracking}</p>
        <p className="mt-4 text-base font-medium text-slate-900">{shipment.descripcionEstado}</p>
        <p className="mt-2 text-sm text-muted-foreground">Entrega estimada: {formatDate(shipment.fechaEstimadaEntrega)}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>Historial de movimientos</CardTitle></CardHeader>
      <CardContent>
        {shipment.movimientos.length === 0
          ? <p className="text-sm text-muted-foreground">Aún no hay movimientos registrados.</p>
          : <div className="space-y-5 border-l-2 border-emerald-200 pl-4">
            {shipment.movimientos.map((movement, index) => <div key={`${movement.fecha}-${movement.tipo}-${index}`} className="relative">
              <span className="absolute -left-[1.65rem] top-1 size-3 rounded-full bg-emerald-600 ring-4 ring-white" />
              <p className="font-medium">{movement.descripcion}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(movement.fecha)}</p>
            </div>)}
          </div>}
      </CardContent>
    </Card>

    {shipment.novedad && <Alert>
      <AlertTitle>{shipment.novedad.titulo}</AlertTitle>
      <AlertDescription>{shipment.novedad.mensaje}</AlertDescription>
    </Alert>}
  </div>;
}
