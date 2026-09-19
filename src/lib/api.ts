import type {
  ApiErrorShape,
  LoginResponse,
  RegisterPayload,
  ClientResponse,
  LabelResponse,
  OrderResponse,
  ReceiveOrderPayload,
  RouteResponse,
  ValidateOrderPayload,
} from "@/types/api";

const API_URL = (
  import.meta.env.VITE_API_URL ??
  "https://tracking-logistico-backend.onrender.com/api/v1"
).replace(/\/$/, "");

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const body: unknown = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const errorBody =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : {};
    const details =
      typeof errorBody.errors === "object" && errorBody.errors !== null
        ? (errorBody.errors as Record<string, string>)
        : (Object.fromEntries(
            Object.entries(errorBody).filter(
              ([key, value]) =>
                key !== "message" &&
                key !== "error" &&
                typeof value === "string",
            ),
          ) as Record<string, string>);
    const message =
      typeof errorBody.message === "string"
        ? errorBody.message
        : typeof errorBody.error === "string"
          ? errorBody.error
          : Object.values(details)[0]
            ? Object.values(details)[0]
            : typeof body === "string" && body.length > 0
              ? body
              : "No se pudo completar la operación.";
    throw { message, status: response.status, details } satisfies ApiErrorShape;
  }

  return body as T;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  return parseResponse<T>(response);
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  refresh: (refreshToken: string) =>
    request<LoginResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  logout: (accessToken: string) =>
    request<void>(
      "/auth/logout",
      {
        method: "POST",
      },
      accessToken,
    ),
  forgotPassword: (email: string) =>
    request<string>("/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (
    token: string,
    nuevaPassword: string,
    confirmarPassword: string,
  ) =>
    request<void>("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ token, nuevaPassword, confirmarPassword }),
    }),
  registerClient: (payload: RegisterPayload) =>
    request<ClientResponse>("/clientes/registro", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  verifyClient: (token: string) =>
    request<string>(`/clientes/verificar?token=${encodeURIComponent(token)}`),
  receiveOrder: (payload: ReceiveOrderPayload, token: string) =>
    request<OrderResponse>(
      "/pedidos",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    ),
  listPendingOrders: (token: string) =>
    request<OrderResponse[]>("/pedidos/pendientes", {}, token),
  listInTransitOrders: (token: string) =>
    request<OrderResponse[]>("/pedidos/activables", {}, token),
  listValidatedOrders: (token: string) =>
    request<OrderResponse[]>("/pedidos/validados", {}, token),
  getOrder: (id: number, token: string) =>
    request<OrderResponse>(`/pedidos/${id}`, {}, token),
  getOrderByTracking: (tracking: string, token: string) =>
    request<OrderResponse>(
      `/pedidos/tracking/${encodeURIComponent(tracking)}`,
      {},
      token,
    ),
  validateOrder: (id: number, payload: ValidateOrderPayload, token: string) =>
    request<OrderResponse>(
      `/pedidos/${id}/validar`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      token,
    ),
  activateTracking: (id: number, token: string) =>
    request<OrderResponse>(
      `/pedidos/${id}/activar-tracking`,
      { method: "PUT" },
      token,
    ),
  generateLabel: (id: number, token: string) =>
    request<LabelResponse>(
      `/pedidos/${id}/etiqueta`,
      { method: "POST" },
      token,
    ),
  listPendingRouteOrders: (token: string) =>
    request<OrderResponse[]>("/rutas/envios-pendientes", {}, token),
  assignRouteOrder: (pedidoId: number, conductorId: number, token: string) =>
    request<RouteResponse>(
      "/rutas/asignaciones",
      {
        method: "POST",
        body: JSON.stringify({ pedidoId, conductorId }),
      },
      token,
    ),
  getDriverRoute: (conductorId: number, token: string) =>
    request<RouteResponse>(`/rutas/conductores/${conductorId}`, {}, token),
  reorderRoute: (routeId: number, pedidoIdsEnOrden: number[], token: string) =>
    request<RouteResponse>(
      `/rutas/${routeId}/orden`,
      {
        method: "PUT",
        body: JSON.stringify({ pedidoIdsEnOrden }),
      },
      token,
    ),
  reassignRouteOrder: (
    pedidoId: number,
    nuevoConductorId: number,
    token: string,
  ) =>
    request<RouteResponse>(
      "/rutas/asignaciones/reasignar",
      {
        method: "PUT",
        body: JSON.stringify({ pedidoId, nuevoConductorId }),
      },
      token,
    ),
};

export function getApiError(
  error: unknown,
  fallback = "Ocurrió un error inesperado.",
): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  if (typeof error === "object" && error !== null && "details" in error) {
    const details = (error as { details?: Record<string, string> }).details;
    if (details) return Object.values(details).join(" ");
  }
  return fallback;
}
