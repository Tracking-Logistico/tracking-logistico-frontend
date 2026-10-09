export type Role = "CLIENTE" | "OPERADOR" | "CONDUCTOR";
export type UserStatus = "PENDIENTE_ACTIVACION" | "PENDIENTE_VERIFICACION" | "ACTIVO" | "INACTIVO" | "BLOQUEADO";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  rol: Role;
  panel: string;
  usuarioId: number;
  requiereCambioPassword: boolean;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  confirmarPassword: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  aceptoTerminos: boolean;
  versionTerminos: string;
  aceptoPoliticaDatos: boolean;
  versionPoliticaDatos: string;
}

export interface ClientResponse {
  idCliente: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  rol: Role;
  estado: UserStatus;
  fechaCreacion: string;
}

export interface ApiErrorShape { message: string; status: number; details?: Record<string, string>; }
export type ServiceType = "ESTANDAR" | "EXPRESS" | "PROGRAMADO";
export type Priority = "BAJA" | "MEDIA" | "ALTA";
export type OrderStatus = "SOLICITADO" | "CORRECCION_SOLICITADA" | "CREADO" | "RECIBIDO_EN_ORIGEN" | "EN_TRANSITO" | "EN_REPARTO" | "ENTREGADO" | "RECHAZADO";

export interface ReceiveOrderPayload {
  direccionOrigen: string;
  ciudadOrigen: string;
  codigoPostalOrigen?: string;
  direccionDestino: string;
  ciudadDestino: string;
  codigoPostalDestino?: string;
  remitenteTelefono: string;
  descripcionPaquete: string;
  pesoKg: number;
  largoCm: number;
  anchoCm: number;
  altoCm: number;
  tipoServicio: ServiceType;
  destinatarioNombre: string;
  destinatarioTelefono: string;
}

export interface ValidateOrderPayload {
  aprobar: boolean;
  prioridadConfirmada?: Priority;
  observaciones?: string;
  justificacionPrioridad?: string;
  campoObservado?: string;
  solicitarCorreccion?: boolean;
}

export interface OrderResponse extends ReceiveOrderPayload {
  id: number;
  numeroPedido: string;
  clienteId: number;
  prioridadSugerida: Priority;
  prioridadConfirmada?: Priority;
  estado: OrderStatus;
  observacionesValidacion?: string;
  justificacionPrioridad?: string;
  operadorValidadorId?: number;
  fechaCreacion: string;
  fechaValidacion?: string;
  numeroTracking?: string;
  fechaActivacionTracking?: string;
  etiquetaImpresa: boolean;
  fechaImpresionEtiqueta?: string;
  remitenteNombre?: string;
  remitenteEmail?: string;
}

export interface OrderEvent { id: number; usuarioId?: number; tipoEvento: string; campoObservado?: string; detalle?: string; fecha: string; }
export interface LabelResponse { numeroPedido: string; numeroTracking: string; contenido: string; fechaImpresion: string; }
export interface RouteStop {
  id: number;
  pedidoId: number;
  orden: number;
  estado: 'PENDIENTE' | 'ENTREGADO' | 'CANCELADA';
  fechaAsignacion: string;
  numeroPedido?: string;
  numeroTracking?: string;
  direccionDestino?: string;
  ciudadDestino?: string;
  destinatarioNombre?: string;
  destinatarioTelefono?: string;
  prioridad?: Priority;
  pesoKg?: number;
}
export interface RouteResponse { id: number; conductorId: number; fecha: string; paradas: RouteStop[]; }
export interface DriverResponse {
  usuarioId: number;
  nombre: string;
  estado: string;
  capacidadMaxKg: number;
  capacidadMaxVolumenCm3: number;
  maxEntregasDia: number;
  entregasAsignadas: number;
  pesoAsignadoKg: number;
  volumenAsignadoCm3: number;
}
export interface RouteNotification { id: number; pedidoId: number; mensaje: string; fecha: string; leida: boolean; }
export interface AssignmentEvent {
  id: number; pedidoId: number; conductorAnteriorId?: number; conductorNuevoId: number;
  operadorId: number; accion: 'ASIGNACION' | 'REASIGNACION'; motivo?: string; fecha: string;
}
export interface UserResponse { id: number; nombre: string; email: string; telefono?: string; direccion?: string; rol: Role; estado: UserStatus; fechaCreacion: string; }

export type DeliveryResult = "ENTREGADO" | "ENTREGA_FALLIDA" | "DEVOLUCION_AL_REMITENTE";
export type DeliveryState = "PENDIENTE" | "ENTREGADO" | "FALLIDA" | "DEVOLUCION_AL_REMITENTE" | "CANCELADA";

export interface DriverProgress {
  fecha: string;
  totalEntregas: number;
  entregadas: number;
  pendientes: number;
  fallidas: number;
  canceladas: number;
}

export interface DriverDelivery {
  idParada: number;
  pedidoId: number;
  orden: number;
  numeroPedido: string;
  numeroTracking: string;
  direccionDestino: string;
  ciudadDestino: string;
  destinatarioNombre: string;
  destinatarioTelefono: string;
  prioridad: Priority;
  pesoKg: number;
  estadoParada: DeliveryState;
  estadoPedido: string;
}

export interface DriverDeliveryDetail extends DriverDelivery {
  codigoPostalDestino: string;
  indicacionesAcceso: string | null;
  descripcionPaquete: string | null;
  largoCm: number | null;
  anchoCm: number | null;
  altoCm: number | null;
  observacionesValidacion: string | null;
  fechaEntregaReprogramada: string | null;
  ultimosEventos: OrderEvent[];
}

export interface NextStop {
  idParada: number;
  pedidoId: number;
  orden: number;
  numeroTracking: string;
  direccionDestino: string;
  ciudadDestino: string;
  destinatarioNombre: string;
  destinatarioTelefono: string;
  indicacionesAcceso: string | null;
  pesoKg: number;
}

export interface DriverRouteStop {
  paradaId: number;
  pedidoId: number;
  orden: number;
  direccion: string;
  ciudad: string;
  estado: DeliveryState;
  sinUbicacion: boolean;
}

export interface DriverRoute {
  paradas: DriverRouteStop[];
  siguiente: DriverRouteStop | null;
}

export interface NoveltyOption {
  codigo: string;
  resultado: Exclude<DeliveryResult, "ENTREGADO">;
  descripcion: string;
}

export interface DeliveryEvent {
  resultado: DeliveryResult;
  codigoNovedad: string | null;
  motivo: string | null;
  latitud: number | null;
  longitud: number | null;
  fechaEvento: string;
  idEventoCliente: string;
}

export interface DeliveryResultResponse {
  idEventoCliente: string;
  pedidoId: number;
  resultado: DeliveryResult;
  estado: "APLICADO" | "DUPLICADO";
  fechaEvento: string;
  duplicado: boolean;
}

export interface OfflineDeliveryEvent {
  pedidoId: number;
  evento: DeliveryEvent;
  queuedAt: string;
}

export interface SyncResult {
  idEventoCliente: string;
  estado: "APLICADO" | "DUPLICADO" | "RECHAZADO";
  motivoRechazo: string | null;
}

export interface SyncResponse {
  resultados: SyncResult[];
}
