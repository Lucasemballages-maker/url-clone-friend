import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Search, 
  Store, 
  Megaphone, 
  Sparkles, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  Menu,
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Top Products", href: "/dashboard/products", icon: Search },
  { name: "Top Shops", href: "/dashboard/shops", icon: Store },
  { name: "Top Ads", href: "/dashboard/ads", icon: Megaphone },
  { name: "Génère ta boutique", href: "/dashboard/generate", icon: Sparkles, highlight: true },
];

const bottomNavigation = [
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
  { name: "Aide", href: "/dashboard/help", icon: HelpCircle },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg border border-border"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen bg-card border-r border-border
          transition-all duration-300 flex flex-col
          ${sidebarCollapsed ? "w-20" : "w-64"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-lg">copyfy</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : item.highlight 
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
                {item.highlight && !sidebarCollapsed && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded font-semibold">
                    IA
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-border space-y-1">
          {bottomNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
          
          {/* User */}
          <div className={`flex items-center gap-3 px-3 py-2 mt-4 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Utilisateur</p>
                <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <Button variant="ghost" size="icon" className="shrink-0">
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
