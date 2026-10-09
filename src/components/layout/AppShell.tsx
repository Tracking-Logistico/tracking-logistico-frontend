import { Outlet, useNavigate } from "react-router-dom";
import { PackageCheck } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { SessionIdleGuard } from "./SessionIdleGuard";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

export function AppShell() {
  const { role, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <SidebarProvider open className="min-h-screen bg-[#f4f7f5] text-slate-950">
      <SessionIdleGuard />
      <AppSidebar role={role} onSignOut={handleSignOut} />
      <SidebarInset className="min-h-screen bg-[#f4f7f5]">
        {/* Barra superior visible solo en celular con SidebarTrigger para abrir el menú */}
        <header className="flex h-14 items-center gap-3 border-b border-slate-200/80 bg-white px-4 md:hidden">
          <SidebarTrigger className="text-slate-950 hover:bg-slate-100" />
          <div className="flex items-center gap-2 font-semibold text-slate-950">
            <PackageCheck className="size-5 text-emerald-600" />
            <span>LogisTrack</span>
          </div>
        </header>

        {/* Contenido principal de cada módulo */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
