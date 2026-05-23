import { Link, useLocation } from "wouter";
import { useAuthStore } from "../../store/auth";
import {
  Activity,
  AlertTriangle,
  BarChart2,
  LayoutDashboard,
  Map as MapIcon,
  RadioTower,
  ShieldAlert,
  LogOut,
  Crosshair,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ThemeToggle } from "../theme-toggle";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mapa", href: "/map", icon: MapIcon },
  { name: "Analíticos", href: "/analytics", icon: BarChart2 },
  { name: "Alertas", href: "/alerts", icon: AlertTriangle },
  { name: "Estações", href: "/stations", icon: RadioTower },
];

const adminItems = [
  { name: "Centro de Controle", href: "/control-center", icon: Crosshair },
  { name: "Admin", href: "/admin", icon: Activity },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="flex flex-col w-64 h-screen bg-sidebar border-r border-sidebar-border p-4 flex-shrink-0">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <ShieldAlert className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-bold text-xl tracking-wider text-primary font-mono">SAI</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
            Imperatech
          </p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </div>
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="mt-6 mb-2 px-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Command
            </div>
            {adminItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm font-medium",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{user?.name || "Operador"}</span>
            <span className="text-xs text-muted-foreground font-mono uppercase truncate">
              {user?.role || "user"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-muted-foreground hover:text-destructive flex-shrink-0"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Tema
          </span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
