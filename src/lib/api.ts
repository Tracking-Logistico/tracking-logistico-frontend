import type {
  ApiErrorShape,
  LoginResponse,
  RegisterPayload,
  ClientResponse,
} from "@/types/api";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1"
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
        : undefined;
    const message =
      typeof errorBody.message === "string"
        ? errorBody.message
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
};

export function getApiError(
  error: unknown,
  fallback = "Ocurrió un error inesperado.",
): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}
