import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Navigation, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, getApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useOfflineDeliveryQueue } from "@/features/driver/hooks/useOfflineDeliveryQueue";
import type { DeliveryEvent, DeliveryResult, DriverDelivery, DriverProgress, DriverRoute, NoveltyOption } from "@/types/api";

const resultLabels: Record<DeliveryResult, string> = {
  ENTREGADO: "Entregado",
  ENTREGA_FALLIDA: "Entrega fallida",
  DEVOLUCION_AL_REMITENTE: "Devolución al remitente",
};

function deliveryBadge(state: string) {
  if (state === "ENTREGADO") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (state === "FALLIDA" || state === "DEVOLUCION_AL_REMITENTE") return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

export function DriverDashboard() {
  const token = useAuthStore(state => state.accessToken);
  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [progress, setProgress] = useState<DriverProgress | null>(null);
  const [route, setRoute] = useState<DriverRoute | null>(null);
  const [catalog, setCatalog] = useState<NoveltyOption[]>([]);
  const [selected, setSelected] = useState<DriverDelivery | null>(null);
  const [result, setResult] = useState<DeliveryResult>("ENTREGADO");
  const [novelty, setNovelty] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"pending" | "completed">("pending");
  const offline = useOfflineDeliveryQueue();

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [nextDeliveries, nextProgress, nextRoute, nextCatalog] = await Promise.all([
        api.driverDeliveries(token),
        api.driverProgress(token),
        api.driverRoute(token),
        api.driverNoveltyCatalog(token),
      ]);
      setDeliveries(nextDeliveries);
      setProgress(nextProgress);
      setRoute(nextRoute);
      setCatalog(nextCatalog);
    } catch (e) {
      setError(getApiError(e, "No fue posible cargar tu jornada."));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void Promise.resolve().then(refresh); }, [refresh]);
  useEffect(() => {
    const listener = () => void refresh();
    window.addEventListener("logistrack-driver-refresh", listener);
    return () => window.removeEventListener("logistrack-driver-refresh", listener);
  }, [refresh]);

  const pending = useMemo(() => deliveries.filter(item => item.estadoParada === "PENDIENTE"), [deliveries]);
  const completed = useMemo(() => deliveries.filter(item => item.estadoParada !== "PENDIENTE"), [deliveries]);
  const availableNovelties = catalog.filter(item => item.resultado === result);
  const percentage = progress && progress.totalEntregas ? Math.round((progress.entregadas / progress.totalEntregas) * 100) : 0;

  function openResult(delivery: DriverDelivery) {
    setSelected(delivery);
    setResult("ENTREGADO");
    setNovelty("");
    setReason("");
  }

  async function getLocation() {
    if (!navigator.geolocation) return { latitud: null, longitud: null };
    return new Promise<{ latitud: number | null; longitud: number | null }>(resolve => {
      navigator.geolocation.getCurrentPosition(
        position => resolve({ latitud: position.coords.latitude, longitud: position.coords.longitude }),
        () => {
          toast.warning("No se pudo obtener tu ubicación. El registro continuará sin coordenadas.");
          resolve({ latitud: null, longitud: null });
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    });
  }

  async function submitResult() {
    if (!selected || !token || submitting) return;
    if (result !== "ENTREGADO" && (!novelty || !reason.trim())) {
      toast.error("Selecciona un motivo y escribe la descripción de la novedad.");
      return;
    }
    if (result === "ENTREGADO") {
      setNovelty("");
      setReason("");
    }
    if (!offline.isOnline && offline.limitReached) {
      toast.error("La cola sin conexión está llena. Conéctate a internet para continuar.");
      return;
    }
    setSubmitting(true);
    const location = await getLocation();
    const event: DeliveryEvent = {
      resultado: result,
      codigoNovedad: result === "ENTREGADO" ? null : novelty,
      motivo: result === "ENTREGADO" ? null : reason.trim(),
      ...location,
      fechaEvento: new Date().toISOString(),
      idEventoCliente: crypto.randomUUID(),
    };
    try {
      if (!offline.isOnline) {
        offline.queueEvent(selected.pedidoId, event);
        toast.success("Sin conexión: evento guardado para sincronización.");
      } else {
        await api.registerDriverDelivery(selected.pedidoId, event, token);
        toast.success("Resultado de entrega registrado.");
      }
      setSelected(null);
      await refresh();
    } catch (e) {
      if (offline.isOnline && (e instanceof TypeError || (typeof e === "object" && e !== null && !("status" in e)))) {
        try {
          offline.queueEvent(selected.pedidoId, event);
          toast.warning("La red falló. Evento guardado para sincronización.");
          setSelected(null);
        } catch (queueError) {
          toast.error(queueError instanceof Error ? queueError.message : "No se pudo guardar el evento.");
        }
      } else {
        toast.error(getApiError(e, "No fue posible registrar el resultado."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.19em] text-emerald-700">Jornada del conductor</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Mis entregas de hoy</h1>
          <p className="mt-2 text-sm text-slate-600">Registra cada resultado y mantén actualizada tu ruta.</p>
        </div>
        <Button variant="outline" disabled={loading} onClick={() => void refresh()}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Actualizar</Button>
      </header>

      <div className={`mt-5 flex flex-wrap items-center gap-3 rounded-xl border p-3 text-sm ${offline.isOnline ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
        {offline.isOnline ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
        <span>{offline.isOnline ? "En línea" : "Sin conexión"}</span>
        <span className="font-medium">{offline.pendingEvents} eventos pendientes</span>
        {offline.limitReached && <span className="font-semibold">Límite offline alcanzado</span>}
        {offline.ageWarning && <span>Hay eventos próximos a cumplir 24 horas.</span>}
      </div>
      {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}

      <Card className="mt-6">
        <CardHeader><CardTitle className="flex items-center justify-between"><span>Avance de la jornada</span><span>{percentage}%</span></CardTitle></CardHeader>
        <CardContent>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${percentage}%` }} /></div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-5">
            <span>Total: {progress?.totalEntregas ?? 0}</span><span>Entregadas: {progress?.entregadas ?? 0}</span><span>Pendientes: {progress?.pendientes ?? 0}</span><span>Fallidas: {progress?.fallidas ?? 0}</span><span>Canceladas: {progress?.canceladas ?? 0}</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <div className="flex gap-2 border-b border-slate-200">
            <button className={`px-4 py-3 text-sm font-semibold ${tab === "pending" ? "border-b-2 border-emerald-600 text-emerald-700" : "text-slate-500"}`} onClick={() => setTab("pending")}>Pendientes ({pending.length})</button>
            <button className={`px-4 py-3 text-sm font-semibold ${tab === "completed" ? "border-b-2 border-emerald-600 text-emerald-700" : "text-slate-500"}`} onClick={() => setTab("completed")}>Completadas ({completed.length})</button>
          </div>
          <div className="mt-4 grid gap-3">
            {(tab === "pending" ? pending : completed).map(delivery => (
              <Card key={delivery.pedidoId}>
                <CardContent className="gap-2 pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold">#{delivery.numeroPedido}</p><p className="text-xs text-slate-500">{delivery.numeroTracking}</p></div><Badge className={deliveryBadge(delivery.estadoParada)}>{delivery.estadoParada}</Badge></div>
                  <p className="text-sm">{delivery.destinatarioNombre}</p><p className="text-sm text-slate-600">{delivery.direccionDestino}, {delivery.ciudadDestino}</p>
                  {delivery.estadoParada === "PENDIENTE" && <Button className="mt-2 w-full sm:w-auto" onClick={() => openResult(delivery)}>Registrar resultado</Button>}
                </CardContent>
              </Card>
            ))}
            {!loading && !(tab === "pending" ? pending : completed).length && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">No hay entregas en esta sección.</p>}
          </div>
        </section>

        <section>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Navigation className="size-5 text-emerald-700" /> Ruta calculada</CardTitle></CardHeader>
            <CardContent className="gap-3">
              {route?.siguiente && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3"><p className="text-xs font-semibold uppercase text-emerald-800">Siguiente parada recomendada</p><p className="mt-1 font-medium">{route.siguiente.direccion}, {route.siguiente.ciudad}</p></div>}
              {route?.paradas.map(stop => <div key={stop.paradaId} className="flex gap-3 rounded-lg border p-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{stop.orden}</span><div className="min-w-0 flex-1"><p className="text-sm font-medium">{stop.direccion}, {stop.ciudad}</p><p className="text-xs text-slate-500">{stop.estado}</p>{stop.sinUbicacion && <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-700"><MapPin className="size-3" /> Sin ubicación</p>}</div></div>)}
              {!route?.paradas.length && <p className="text-sm text-slate-500">No hay paradas pendientes en la ruta.</p>}
            </CardContent>
          </Card>
        </section>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar resultado</DialogTitle><DialogDescription>{selected ? `Pedido ${selected.numeroPedido}. Esta acción actualiza la trazabilidad.` : ""}</DialogDescription></DialogHeader>
          <div className="grid gap-4">
            <fieldset className="grid gap-2"><legend className="text-sm font-medium">Resultado</legend>{(Object.keys(resultLabels) as DeliveryResult[]).map(option => <label key={option} className="flex min-h-11 items-center gap-3 rounded-lg border p-3"><input type="radio" name="result" value={option} checked={result === option} onChange={() => { setResult(option); setNovelty(""); }} />{resultLabels[option]}</label>)}</fieldset>
            {result !== "ENTREGADO" && <><label className="grid gap-2 text-sm font-medium">Motivo<select className="h-11 rounded-md border bg-background px-3 font-normal" value={novelty} onChange={event => setNovelty(event.target.value)}><option value="">Selecciona un motivo</option>{availableNovelties.map(option => <option key={option.codigo} value={option.codigo}>{option.descripcion}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Descripción<textarea className="min-h-24 rounded-md border bg-background p-3 font-normal" value={reason} onChange={event => setReason(event.target.value)} placeholder="Describe la novedad" /></label></>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setSelected(null)}>Cancelar</Button><Button disabled={submitting} onClick={() => void submitResult()}>{submitting ? "Guardando..." : "Confirmar registro"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
