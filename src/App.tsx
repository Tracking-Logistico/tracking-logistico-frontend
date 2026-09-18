import { Routes, Route, Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { VerifyPage } from "./pages/VerifyPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ModulePage } from "./pages/ModulePage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
          <Route path="/verificar" element={<VerifyPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/panel" element={<DashboardPage />} />
            <Route path="/panel/configuracion" element={<SettingsPage />} />
            <Route element={<ProtectedRoute roles={["CLIENTE", "OPERADOR"]} />}>
              <Route path="/panel/pedidos" element={<ModulePage />} />
            </Route>
            <Route
              element={
                <ProtectedRoute roles={["CLIENTE", "OPERADOR", "CONDUCTOR"]} />
              }
            >
              <Route path="/panel/envios" element={<ModulePage />} />
            </Route>
            <Route
              element={<ProtectedRoute roles={["OPERADOR", "CONDUCTOR"]} />}
            >
              <Route path="/panel/rutas" element={<ModulePage />} />
            </Route>
            <Route element={<ProtectedRoute roles={["OPERADOR"]} />}>
              <Route path="/panel/usuarios" element={<ModulePage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
