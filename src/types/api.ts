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
