import { Routes, Route, Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { VerifyPage } from "./pages/VerifyPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsPage } from "./pages/SettingsPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ShipmentsPage } from "./pages/ShipmentsPage";
import { RoutesPage } from "./pages/RoutesPage";

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
          <Route
            path="/restablecer-password/:token"
            element={<ResetPasswordPage />}
          />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/panel" element={<DashboardPage />} />
            <Route path="/panel/configuracion" element={<SettingsPage />} />
            <Route element={<ProtectedRoute roles={["OPERADOR"]} />}>
              <Route path="/panel/pedidos" element={<OrdersPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={["OPERADOR"]} />}>
              <Route path="/panel/envios" element={<ShipmentsPage />} />
            </Route>
            <Route
              element={<ProtectedRoute roles={["OPERADOR", "CONDUCTOR"]} />}
            >
              <Route path="/panel/rutas" element={<RoutesPage />} />
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
