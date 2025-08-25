import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth";


export function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-20 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <img src="Sumori.png" alt="Sumori Logo" className="h-16 w-auto"/>
            </div>
            <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2"/>
              Logout
            </Button>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}