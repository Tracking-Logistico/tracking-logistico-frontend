import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { api, getApiError } from "@/lib/api";
import { usePageMeta } from "@/hooks/usePageMeta";

const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
const TERMS_VERSION = "2026-09";
const PRIVACY_VERSION = "2026-09";

function passwordStrength(password: string) {
  const checks = [password.length >= 8, password.length >= 12, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  if (!password) return { label: "Sin definir", width: "0%" };
  if (score <= 3) return { label: "Débil", width: "33%" };
  if (score <= 5) return { label: "Media", width: "66%" };
  return { label: "Fuerte", width: "100%" };
}

export function RegisterPage() {
  usePageMeta("Registro de cliente", "Crea una cuenta de cliente para gestionar tus envíos.");
  const [form, setForm] = useState({ nombre: "", email: "", password: "", confirmarPassword: "", telefono: "", direccion: "", ciudad: "", aceptoTerminos: false, aceptoPoliticaDatos: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const navigate = useNavigate();
  const strength = useMemo(() => passwordStrength(form.password), [form.password]);
  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!passwordPattern.test(form.password)) { setError("La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial."); return; }
    if (form.password.toLowerCase() === form.email.toLowerCase() || form.password.toLowerCase() === form.nombre.toLowerCase()) { setError("La contraseña no puede ser igual a tu correo o nombre."); return; }
    if (form.password !== form.confirmarPassword) { setError("Las contraseñas no coinciden."); return; }
    if (!form.aceptoTerminos || !form.aceptoPoliticaDatos) { setError("Debes aceptar los Términos y la Política de Tratamiento de Datos."); return; }
    setLoading(true);
    try {
      await api.registerClient({ ...form, versionTerminos: TERMS_VERSION, versionPoliticaDatos: PRIVACY_VERSION });
      setDone(true);
    } catch (err) { setError(getApiError(err, "No fue posible crear la cuenta.")); } finally { setLoading(false); }
  }

  if (done) return <main className="grid min-h-[calc(100vh-4.5rem)] place-items-center px-5"><div className="max-w-md text-center"><CheckCircle2 className="mx-auto size-14 text-emerald-600"/><h1 className="mt-6 text-3xl font-semibold">Tu cuenta está lista</h1><p className="mt-3 leading-7 text-slate-600">Ya puedes iniciar sesión y gestionar tus envíos. La verificación por correo es opcional y no necesitas esperar un mensaje para utilizar tu cuenta.</p>{resendMessage && <p role="status" className="mt-4 text-sm text-emerald-700">{resendMessage}</p>}<div className="mt-8 flex flex-wrap justify-center gap-3"><Button variant="outline" onClick={async () => { try { setResendMessage(await api.resendVerification(form.email)); } catch (e) { setResendMessage(getApiError(e)); } }}>Reenviar correo opcional</Button><Button onClick={() => navigate("/login")}>Ir a iniciar sesión <ArrowRight className="size-4"/></Button></div></div></main>;

  return <main className="min-h-[calc(100vh-4.5rem)] bg-[#f4f7f5] px-5 py-12 sm:px-8"><div className="mx-auto max-w-3xl"><Link to="/" className="inline-flex items-center gap-2 font-semibold"><PackageCheck className="size-5 text-emerald-600"/>LogisTrack</Link><div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Cuenta personal</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Crea tu cuenta de cliente</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Regístrate para solicitar envíos y consultar su avance. La verificación del correo es opcional y no bloquea tu acceso.</p>
  <form className="mt-8 space-y-7" onSubmit={submit}><div className="grid gap-5 sm:grid-cols-2"><FormField label="Nombre completo" name="nombre" required value={form.nombre} onChange={(e)=>update("nombre",e.target.value)}/><FormField label="Correo electrónico" name="email" type="email" required value={form.email} onChange={(e)=>update("email",e.target.value)}/><FormField label="Teléfono" name="telefono" type="tel" required hint="Formato internacional, por ejemplo +573001234567" value={form.telefono} onChange={(e)=>update("telefono",e.target.value)}/><FormField label="Ciudad" name="ciudad" required value={form.ciudad} onChange={(e)=>update("ciudad",e.target.value)}/></div><FormField label="Dirección" name="direccion" required value={form.direccion} onChange={(e)=>update("direccion",e.target.value)}/><div className="grid gap-5 sm:grid-cols-2"><FormField label="Contraseña" name="password" type="password" required hint="8+ caracteres con mayúscula, minúscula, número y símbolo." value={form.password} onChange={(e)=>update("password",e.target.value)}/><FormField label="Confirmar contraseña" name="confirmarPassword" type="password" required value={form.confirmarPassword} onChange={(e)=>update("confirmarPassword",e.target.value)}/></div>
  <div><div className="flex justify-between text-xs text-slate-500"><span>Fortaleza de contraseña</span><span className="font-medium">{strength.label}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-600 transition-all" style={{width: strength.width}}/></div></div>
  <div className="space-y-3"><label className="flex items-start gap-3 text-sm text-slate-600"><input type="checkbox" className="mt-1 size-4 accent-emerald-600" checked={form.aceptoTerminos} onChange={(e)=>update("aceptoTerminos",e.target.checked)}/>Acepto los <Link to="/terminos" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-700 underline">Términos y Condiciones (2026-09)</Link>.</label><label className="flex items-start gap-3 text-sm text-slate-600"><input type="checkbox" className="mt-1 size-4 accent-emerald-600" checked={form.aceptoPoliticaDatos} onChange={(e)=>update("aceptoPoliticaDatos",e.target.checked)}/>Acepto la <Link to="/politica-datos" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-700 underline">Política de Tratamiento de Datos Personales (2026-09)</Link>.</label></div>
  {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}<div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">¿Ya tienes cuenta? <Link to="/login" className="font-medium text-emerald-700 hover:underline">Inicia sesión</Link></p><Button type="submit" disabled={loading}>{loading ? "Creando cuenta..." : "Crear cuenta"}<ArrowRight className="size-4"/></Button></div></form></div></div></main>;
}
