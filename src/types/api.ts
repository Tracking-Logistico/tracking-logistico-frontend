export type Role = "CLIENTE" | "OPERADOR" | "CONDUCTOR";
export type UserStatus =
  | "PENDIENTE_ACTIVACION"
  | "PENDIENTE_VERIFICACION"
  | "ACTIVO"
  | "INACTIVO"
  | "BLOQUEADO";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  rol: Role;
  panel: string;
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

export interface ApiErrorShape {
  message: string;
  status: number;
  details?: Record<string, string>;
}

export type ServiceType = "ESTANDAR" | "EXPRESS" | "PROGRAMADO";
export type Priority = "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
export type OrderStatus =
  | "RECIBIDO"
  | "EN_VALIDACION"
  | "VALIDADO"
  | "RECHAZADO"
  | "EN_TRANSITO";

export interface ReceiveOrderPayload {
  clienteId: number;
  direccionOrigen: string;
  direccionDestino: string;
  descripcionPaquete: string;
  pesoKg: number;
  largoCm: number;
  anchoCm: number;
  altoCm: number;
  tipoServicio: ServiceType;
}

export interface ValidateOrderPayload {
  operadorId: number;
  aprobar: boolean;
  prioridadConfirmada?: Priority;
  observaciones?: string;
}

export interface OrderResponse extends ReceiveOrderPayload {
  id: number;
  numeroPedido: string;
  prioridadSugerida: Priority;
  prioridadConfirmada?: Priority;
  estado: OrderStatus;
  observacionesValidacion?: string;
  operadorValidadorId?: number;
  fechaCreacion: string;
  fechaValidacion?: string;
  numeroTracking?: string;
  fechaActivacionTracking?: string;
  etiquetaImpresa: boolean;
  fechaImpresionEtiqueta?: string;
}

export interface LabelResponse {
  numeroPedido: string;
  numeroTracking: string;
  contenido: string;
  fechaImpresion: string;
}

export interface RouteStop {
  id: number;
  pedidoId: number;
  orden: number;
  estado: "PENDIENTE" | "ENTREGADO" | "CANCELADA";
  fechaAsignacion: string;
}

export interface RouteResponse {
  id: number;
  conductorId: number;
  fecha: string;
  paradas: RouteStop[];
}

export interface OperationalModule {
  key: "orders" | "shipments" | "routes" | "users";
  title: string;
  description: string;
  story: string;
  roles: Role[];
}
