import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { api, getApiError } from "@/lib/api";
import { usePageMeta } from "@/hooks/usePageMeta";

const passwordPattern =
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!._-]).{8,}$/;

export function RegisterPage() {
  usePageMeta(
    "Registro de cliente",
    "Crea una cuenta de cliente para gestionar tus envíos.",
  );
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmarPassword: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    aceptoTerminos: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!passwordPattern.test(form.password)) {
      setError(
        "La contraseña debe tener 8 caracteres, mayúscula, minúscula, número y carácter especial.",
      );
      return;
    }
    if (form.password !== form.confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!form.aceptoTerminos) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }
    setLoading(true);
    try {
      await api.registerClient({ ...form, versionTerminos: "v1.0" });
      setDone(true);
    } catch (err) {
      setError(getApiError(err, "No fue posible crear la cuenta."));
    } finally {
      setLoading(false);
    }
  }

  if (done)
    return (
      <main className="grid min-h-[calc(100vh-4.5rem)] place-items-center px-5">
        <div className="max-w-md text-center">
          <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
          <h1 className="mt-6 text-3xl font-semibold">Cuenta creada</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Revisa tu correo para verificar la cuenta. Después podrás iniciar
            sesión.
          </p>
          <Button className="mt-8" onClick={() => navigate("/login")}>
            Ir a iniciar sesión
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </main>
    );
  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[#f4f7f5] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 font-semibold">
          <PackageCheck className="size-5 text-emerald-600" />
          LogisTrack
        </Link>
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            HU-01A · Clientes
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Crea tu cuenta de cliente
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Regístrate para consultar y coordinar tus envíos desde un único
            lugar.
          </p>
          <form className="mt-8 space-y-7" onSubmit={submit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Nombre completo"
                name="nombre"
                required
                value={form.nombre}
                onChange={(e) => update("nombre", e.target.value)}
              />
              <FormField
                label="Correo electrónico"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
              <FormField
                label="Teléfono"
                name="telefono"
                type="tel"
                value={form.telefono}
                onChange={(e) => update("telefono", e.target.value)}
              />
              <FormField
                label="Ciudad"
                name="ciudad"
                value={form.ciudad}
                onChange={(e) => update("ciudad", e.target.value)}
              />
            </div>
            <FormField
              label="Dirección"
              name="direccion"
              value={form.direccion}
              onChange={(e) => update("direccion", e.target.value)}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Contraseña"
                name="password"
                type="password"
                required
                hint="Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo."
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
              <FormField
                label="Confirmar contraseña"
                name="confirmarPassword"
                type="password"
                required
                value={form.confirmarPassword}
                onChange={(e) => update("confirmarPassword", e.target.value)}
              />
            </div>
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-emerald-600"
                checked={form.aceptoTerminos}
                onChange={(e) => update("aceptoTerminos", e.target.checked)}
              />
              Acepto los términos y condiciones de uso de LogisTrack.
            </label>
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
              >
                {error}
              </p>
            )}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="font-medium text-emerald-700 hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
              <Button disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
