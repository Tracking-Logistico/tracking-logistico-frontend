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

export interface OperationalModule {
  key: "orders" | "shipments" | "routes" | "users";
  title: string;
  description: string;
  story: string;
  roles: Role[];
}
