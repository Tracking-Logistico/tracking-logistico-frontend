import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Check, LoaderCircle, PackagePlus, RefreshCw, RotateCcw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { api, getApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { OrderEvent, OrderResponse, Priority, ReceiveOrderPayload, ServiceType } from "@/types/api";

const inputClass = "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";
const emptyForm: ReceiveOrderPayload = {
  direccionOrigen: "", ciudadOrigen: "", codigoPostalOrigen: "", direccionDestino: "", ciudadDestino: "",
  codigoPostalDestino: "", remitenteTelefono: "", descripcionPaquete: "", pesoKg: 0,
  largoCm: 0, anchoCm: 0, altoCm: 0, tipoServicio: "ESTANDAR", destinatarioNombre: "", destinatarioTelefono: "",
};
const statusLabels: Record<string, string> = {
  SOLICITADO: "Pendiente de validación", CORRECCION_SOLICITADA: "Se requieren correcciones", CREADO: "Despacho aprobado",
  RECIBIDO_EN_ORIGEN: "Recibido en origen", EN_TRANSITO: "En tránsito", EN_REPARTO: "En reparto",
  ENTREGADO: "Entregado", RECHAZADO: "Rechazado",
};
const priorityLabels: Record<Priority, string> = { ALTA: "Alta", MEDIA: "Media", BAJA: "Baja" };

export function OrdersPage() {
  const role = useAuthStore((s) => s.role);
  return role === "CLIENTE" ? <ClientOrders /> : <OperatorInbox />;
}

function ClientOrders() {
  usePageMeta("Mis pedidos", "Solicita envíos y consulta su avance.");
  const token = useAuthStore((s) => s.accessToken);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [form, setForm] = useState<ReceiveOrderPayload>({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try { setOrders(await api.myOrders(token)); setError(""); }
    catch (e) { setError(getApiError(e)); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { void load(); }, [load]);

  const update = <K extends keyof ReceiveOrderPayload>(key: K, value: ReceiveOrderPayload[K]) => setForm((f) => ({ ...f, [key]: value }));
  async function submit(e: FormEvent) {
    e.preventDefault(); if (!token || saving) return;
    setError(""); setMessage(""); setSaving(true);
    try {
      const result = editingId !== null ? await api.correctOrder(editingId, form, token) : await api.createOrder(form, token);
      setMessage(editingId !== null ? `Pedido ${result.numeroPedido} corregido y enviado a nueva validación.` : `Pedido ${result.numeroPedido} enviado a validación.`);
      setForm({ ...emptyForm }); setEditingId(null); await load();
    } catch (err) { setError(getApiError(err, "Revisa los datos del envío.")); }
    finally { setSaving(false); }
  }
  function edit(o: OrderResponse) {
    setEditingId(o.id);
    setForm({ direccionOrigen: o.direccionOrigen, ciudadOrigen: o.ciudadOrigen ?? "", codigoPostalOrigen: o.codigoPostalOrigen ?? "",
      direccionDestino: o.direccionDestino, ciudadDestino: o.ciudadDestino ?? "", codigoPostalDestino: o.codigoPostalDestino ?? "",
      remitenteTelefono: o.remitenteTelefono ?? "", descripcionPaquete: o.descripcionPaquete, pesoKg: o.pesoKg, largoCm: o.largoCm,
      anchoCm: o.anchoCm, altoCm: o.altoCm, tipoServicio: o.tipoServicio, destinatarioNombre: o.destinatarioNombre,
      destinatarioTelefono: o.destinatarioTelefono });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <Page>
    <Header eyebrow="Clientes" title="Mis pedidos" description="Solicita un envío y consulta su trazabilidad desde la solicitud hasta la entrega." onRefresh={load} />
    <Feedback error={error} message={message}/>
    <div className="mt-8 grid gap-8 xl:grid-cols-[.95fr_1.05fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><PackagePlus className="size-5" /></span>
          <div><h2 className="font-semibold">{editingId !== null ? "Corregir pedido" : "Solicitar envío"}</h2><p className="text-xs text-slate-500">La prioridad inicial se sugiere según el servicio; la confirma un operador.</p></div></div>
        <form className="mt-6 space-y-5" onSubmit={submit}>
          <div className="border-b border-slate-100 pb-2 text-sm font-semibold">Origen y remitente</div>
          <FormField label="Dirección de recogida" name="direccionOrigen" required minLength={8} maxLength={250} placeholder="Calle y número o referencia rural" value={form.direccionOrigen} onChange={(e)=>update("direccionOrigen",e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Ciudad de origen" name="ciudadOrigen" required maxLength={100} value={form.ciudadOrigen} onChange={e=>update("ciudadOrigen",e.target.value)}/>
            <FormField label="Código postal (si aplica)" name="codigoPostalOrigen" maxLength={12} value={form.codigoPostalOrigen ?? ""} onChange={e=>update("codigoPostalOrigen",e.target.value)}/></div>
          <FormField label="Tu teléfono de contacto" name="remitenteTelefono" type="tel" required placeholder="+573001234567" pattern="\+?[1-9][0-9]{7,14}" value={form.remitenteTelefono} onChange={e=>update("remitenteTelefono",e.target.value)}/>
          <div className="border-b border-slate-100 pb-2 pt-2 text-sm font-semibold">Destino y destinatario</div>
          <FormField label="Dirección de entrega" name="direccionDestino" required minLength={8} maxLength={250} placeholder="Calle y número o referencia rural" value={form.direccionDestino} onChange={e=>update("direccionDestino",e.target.value)}/>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Ciudad de destino" name="ciudadDestino" required maxLength={100} value={form.ciudadDestino} onChange={e=>update("ciudadDestino",e.target.value)}/>
            <FormField label="Código postal (si aplica)" name="codigoPostalDestino" maxLength={12} value={form.codigoPostalDestino ?? ""} onChange={e=>update("codigoPostalDestino",e.target.value)}/></div>
          <div className="grid gap-4 sm:grid-cols-2"><FormField label="Nombre del destinatario" name="destinatarioNombre" required value={form.destinatarioNombre} onChange={e=>update("destinatarioNombre",e.target.value)}/>
            <FormField label="Teléfono destinatario" name="destinatarioTelefono" type="tel" pattern="\+?[1-9][0-9]{7,14}" required placeholder="+573001234567" value={form.destinatarioTelefono} onChange={e=>update("destinatarioTelefono",e.target.value)}/></div>
          <div className="border-b border-slate-100 pb-2 pt-2 text-sm font-semibold">Paquete y servicio</div>
          <FormField label="Descripción del contenido" name="descripcionPaquete" maxLength={255} required value={form.descripcionPaquete} onChange={e=>update("descripcionPaquete",e.target.value)}/>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {([['pesoKg','Peso (kg)'],['largoCm','Largo (cm)'],['anchoCm','Ancho (cm)'],['altoCm','Alto (cm)']] as const).map(([key,label]) => <FormField key={key} label={label} name={key} type="number" min="0.01" step="0.01" required value={form[key] || ""} onChange={e=>update(key,Number(e.target.value))}/>)}
          </div>
          <div><label className="text-sm font-medium" htmlFor="service">Modalidad de servicio</label><select id="service" className={`${inputClass} mt-2`} value={form.tipoServicio} onChange={e=>update("tipoServicio",e.target.value as ServiceType)}><option value="ESTANDAR">Estándar (prioridad sugerida: media)</option><option value="EXPRESS">Express (prioridad sugerida: alta)</option><option value="PROGRAMADO">Programado (prioridad sugerida: baja)</option></select></div>
          <div className="flex gap-3"><Button type="submit" className="flex-1" disabled={saving}>{saving?"Guardando...":editingId!==null?"Enviar corrección":"Solicitar envío"}</Button>{editingId!==null&&<Button type="button" variant="outline" onClick={()=>{setEditingId(null);setForm({...emptyForm})}}><RotateCcw className="size-4"/>Cancelar</Button>}</div>
        </form>
      </section>
      <section><h2 className="text-xl font-semibold">Tus envíos</h2><p className="mt-1 text-sm text-slate-500">Identificador, estado, prioridad e historial de cada solicitud.</p>
        <div className="mt-4 space-y-3">{loading&&<Loading/>}{!loading&&orders.length===0&&<Empty text="Aún no tienes pedidos. Crea tu primera solicitud."/>}
          {orders.map(o=><article key={o.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-mono text-sm font-semibold">{o.numeroPedido}</p><p className="mt-1 text-sm text-slate-600">{o.ciudadDestino ? `${o.ciudadDestino} · ` : ""}{o.direccionDestino}</p></div><Status value={o.estado}/></div>
            <p className="mt-3 text-xs text-slate-500">Prioridad {priorityLabels[o.prioridadConfirmada ?? o.prioridadSugerida]}{o.numeroTracking?` · Guía ${o.numeroTracking}`:" · Guía pendiente"}</p>
            {o.observacionesValidacion&&<p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{o.observacionesValidacion}</p>}
            <div className="mt-4 flex flex-wrap gap-2">{o.estado==="CORRECCION_SOLICITADA"&&<Button size="sm" variant="outline" onClick={()=>edit(o)}>Corregir información</Button>}<HistoryButton id={o.id} token={token}/></div>
          </article>)}
        </div>
      </section>
    </div>
  </Page>;
}

function OperatorInbox() {
  usePageMeta("Bandeja de pedidos", "Verifica datos de despacho y prioridades.");
  const token = useAuthStore(s=>s.accessToken);
  const [orders,setOrders] = useState<OrderResponse[]>([]);
  const [loading,setLoading] = useState(true); const [error,setError] = useState(""); const [message,setMessage] = useState("");
  const [working,setWorking] = useState<number|null>(null);
  const [priority,setPriority] = useState<Record<number,Priority>>({});
  const [notes,setNotes] = useState<Record<number,string>>({});
  const [field,setField] = useState<Record<number,string>>({});
  const [justification,setJustification] = useState<Record<number,string>>({});
  const load=useCallback(async()=>{if(!token)return;setLoading(true);try{setOrders(await api.listPendingOrders(token));setError("")}catch(e){setError(getApiError(e))}finally{setLoading(false)}},[token]);
  useEffect(()=>{void load()},[load]);
  async function validate(o:OrderResponse, action:"approve"|"reject"|"correct") {
    if(!token||working!==null)return;setError("");setMessage("");
    const p=priority[o.id]??o.prioridadSugerida;const changed=p!==o.prioridadSugerida;
    if(action==="correct"&&(!notes[o.id]?.trim()||!field[o.id])){setError("Selecciona el campo observado y describe la corrección requerida.");return}
    if(action==="reject"&&!notes[o.id]?.trim()){setError("Indica el motivo del rechazo.");return}
    if(action==="approve"&&changed&&!justification[o.id]?.trim()){setError("Justifica la modificación de prioridad.");return}
    setWorking(o.id);
    try {
      await api.validateOrder(o.id,{aprobar:action==="approve",prioridadConfirmada:action==="approve"?p:undefined,
        observaciones:notes[o.id],justificacionPrioridad:action==="approve"&&changed?justification[o.id]:undefined,
        campoObservado:action==="correct"?field[o.id]:undefined,solicitarCorreccion:action==="correct"},token);
      setMessage(action==="correct"?"Corrección solicitada al cliente.":action==="approve"?"Pedido aprobado para despacho.":"Pedido rechazado.");await load();
    }catch(e){setError(getApiError(e))}finally{setWorking(null)}
  }
  return <Page><Header eyebrow="Operación" title="Bandeja de pedidos" description="Confirma remitente, destinatario, contenido, medidas y prioridad antes de activar el seguimiento." onRefresh={load}/><Feedback error={error} message={message}/>
    <div className="mt-8 space-y-4">{loading&&<Loading/>}{!loading&&orders.length===0&&<Empty text="No hay solicitudes pendientes de revisión."/>}
      {orders.map(o=><article key={o.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap justify-between gap-4"><div><p className="font-mono text-sm font-semibold">{o.numeroPedido}</p><h2 className="mt-2 text-lg font-semibold">{o.destinatarioNombre}</h2><p className="text-sm text-slate-500">{o.destinatarioTelefono} · {o.ciudadDestino} · {o.direccionDestino}</p></div><Status value={o.estado}/></div>
        <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3"><span><b>Remitente:</b> {o.remitenteNombre||"Sin dato histórico"}</span><span><b>Teléfono origen:</b> {o.remitenteTelefono||"Sin dato histórico"}</span><span><b>Origen:</b> {o.ciudadOrigen} · {o.direccionOrigen}</span><span><b>Paquete:</b> {o.descripcionPaquete}</span><span><b>Medidas:</b> {o.pesoKg} kg · {o.largoCm} × {o.anchoCm} × {o.altoCm} cm</span><span><b>Servicio:</b> {o.tipoServicio}</span></div>
        {o.observacionesValidacion&&<p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{o.observacionesValidacion}</p>}
        {o.estado==="SOLICITADO"&&<><div className="mt-5 grid gap-4 lg:grid-cols-2"><div><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prioridad sugerida: {priorityLabels[o.prioridadSugerida]}</label><select className={`${inputClass} mt-2`} value={priority[o.id]??o.prioridadSugerida} onChange={e=>setPriority(v=>({...v,[o.id]:e.target.value as Priority}))}><option value="ALTA">Alta</option><option value="MEDIA">Media</option><option value="BAJA">Baja</option></select></div><FormField label="Justificación de cambio de prioridad" name={`just-${o.id}`} maxLength={500} value={justification[o.id]??""} onChange={e=>setJustification(v=>({...v,[o.id]:e.target.value}))}/></div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2"><div><label className="text-sm font-medium" htmlFor={`field-${o.id}`}>Campo a corregir</label><select id={`field-${o.id}`} className={`${inputClass} mt-2`} value={field[o.id]??""} onChange={e=>setField(v=>({...v,[o.id]:e.target.value}))}><option value="">Selecciona un campo</option>{["direccionOrigen","ciudadOrigen","direccionDestino","ciudadDestino","remitenteTelefono","destinatarioNombre","destinatarioTelefono","descripcionPaquete","pesoKg","largoCm","anchoCm","altoCm","tipoServicio"].map(name=><option key={name} value={name}>{name.replace(/([A-Z])/g," $1")}</option>)}</select></div><FormField label="Observación / motivo de rechazo" name={`notes-${o.id}`} maxLength={500} value={notes[o.id]??""} onChange={e=>setNotes(v=>({...v,[o.id]:e.target.value}))}/></div>
          <div className="mt-5 flex flex-wrap gap-2"><Button size="sm" disabled={working!==null} onClick={()=>void validate(o,"approve")}><Check className="size-4"/>Confirmar prioridad y aprobar</Button><Button size="sm" variant="outline" disabled={working!==null} onClick={()=>void validate(o,"correct")}>Solicitar corrección</Button><Button size="sm" variant="ghost" disabled={working!==null} onClick={()=>void validate(o,"reject")}>Rechazar</Button></div></>}
        <div className="mt-4"><HistoryButton id={o.id} token={token}/></div>
      </article>)}
    </div>
  </Page>;
}

function HistoryButton({id,token}:{id:number;token:string|null}) {
  const [open,setOpen]=useState(false);const [events,setEvents]=useState<OrderEvent[]>([]);
  const [error,setError]=useState("");const [loading,setLoading]=useState(false);
  async function toggle(){if(open){setOpen(false);return}if(!token)return;setLoading(true);setError("");try{setEvents(await api.orderHistory(id,token));setOpen(true)}catch(e){setError(getApiError(e))}finally{setLoading(false)}}
  return <div><Button size="sm" variant="ghost" onClick={()=>void toggle()} disabled={loading}><History className="size-4"/>{open?"Ocultar historial":loading?"Cargando...":"Ver historial"}</Button>{error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}{open&&<ol className="mt-3 space-y-3 border-l-2 border-emerald-200 pl-4">{events.map(event=><li key={event.id} className="text-sm"><p className="font-semibold">{event.tipoEvento.replaceAll("_"," ")}</p><p className="text-xs text-slate-500">{new Date(event.fecha).toLocaleString("es-CO")}{event.campoObservado?` · ${event.campoObservado}`:""}</p>{event.detalle&&<p className="mt-1 text-slate-600">{event.detalle}</p>}</li>)}</ol>}</div>;
}
function Page({children}:{children:ReactNode}){return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">{children}</div>}
function Header({eyebrow,title,description,onRefresh}:{eyebrow:string;title:string;description:string;onRefresh:()=>void|Promise<void>}){return <header className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[.16em] text-emerald-700">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{description}</p></div><Button variant="outline" onClick={()=>void onRefresh()}><RefreshCw className="size-4"/>Actualizar</Button></header>}
function Feedback({error,message}:{error:string;message:string}){return(error||message)?<p role={error?"alert":"status"} className={`mt-6 rounded-lg px-4 py-3 text-sm ${error?"bg-rose-50 text-rose-700":"bg-emerald-50 text-emerald-700"}`}>{error||message}</p>:null}
function Loading(){return <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><LoaderCircle className="size-4 animate-spin"/>Cargando...</div>}
function Empty({text}:{text:string}){return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{text}</div>}
function Status({value}:{value:string}){return <span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{statusLabels[value]??value.replaceAll("_"," ")}</span>}
