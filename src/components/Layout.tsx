
import { ReactNode, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { 
  Home, 
  Calculator, 
  BookOpen, 
  TrendingUp, 
  Ticket,
  Menu, 
  User, 
  Users, 
  BarChart3, 
  LogOut, 
  CreditCard,
  LineChart,
  LayoutDashboard,
  X,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import { getRoleLabel, getRoleBadgeVariant } from "@/lib/roles";
import { NotificationSystem } from "@/components/NotificationSystem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: ReactNode;
}

const getNavigationItems = (userRole: UserRole, viewAsUser: boolean = false) => {
  if (viewAsUser) {
    return [
      {
        title: "PRIMEIROS PASSOS",
        items: [
          { title: "Home", url: "/", icon: Home },
        ]
      },
      {
        title: "FERRAMENTAS DNB",
        items: [
          { title: "Planner de Compras", url: "/planner", icon: Calculator },
          { title: "Análise de Mercado", url: "/analise", icon: TrendingUp },
          { title: "Cupons de Parceiros", url: "/coupons", icon: Ticket },
        ]
      },
      {
        title: "DNB ACADEMY",
        items: [
          { title: "Cursos", url: "/academy", icon: BookOpen },
        ]
      },
      {
        title: "CONTA",
        items: [
          { title: "Assinatura", url: "/subscription", icon: CreditCard },
        ]
      }
    ];
  }

  if (userRole === UserRole.ADMIN) {
    return [
      {
        title: "PAINEL",
        items: [
          { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
          { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
        ]
      },
      {
        title: "CONTEÚDO",
        items: [
          { title: "Cursos", url: "/admin/content", icon: BookOpen },
          { title: "Análises", url: "/admin/analyses", icon: LineChart },
          { title: "Cupons", url: "/admin/coupons", icon: Ticket },
        ]
      },
      {
        title: "GESTÃO",
        items: [
          { title: "Usuários", url: "/admin/users", icon: Users },
          { title: "Assinaturas", url: "/admin/subscriptions", icon: CreditCard },
          { title: "Planner", url: "/admin/planner", icon: Calculator },
        ]
      },
    ];
  }

  return [
    {
      title: "PRIMEIROS PASSOS",
      items: [
        { title: "Home", url: "/", icon: Home },
      ]
    },
    {
      title: "FERRAMENTAS DNB",
      items: [
        { title: "Planner de Compras", url: "/planner", icon: Calculator },
        { title: "Análise de Mercado", url: "/analise", icon: TrendingUp },
        { title: "Cupons de Parceiros", url: "/coupons", icon: Ticket },
      ]
    },
      {
        title: "DNB ACADEMY",
        items: [
          { title: "Cursos", url: "/academy", icon: BookOpen },
        ]
      },
    {
      title: "CONTA",
      items: [
        { title: "Assinatura", url: "/subscription", icon: CreditCard },
      ]
    }
  ];
};

interface SidebarNavContentProps {
  navigationItems: ReturnType<typeof getNavigationItems>;
  currentPath: string;
  onNavClick?: () => void;
}

function SidebarNavContent({ navigationItems, currentPath, onNavClick }: SidebarNavContentProps) {
  const platformLogo = localStorage.getItem('platform_logo') || null;

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = (active: boolean) =>
    active 
      ? "bg-primary/10 text-primary font-semibold border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <div className="p-4 scroll-area flex-1 overflow-y-auto">
      {/* Logo Area */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-3">
          {platformLogo ? (
            <img src={platformLogo} alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
          ) : (
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">DNB</span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-bold text-lg text-foreground truncate">Comunidade DNB</h1>
            <p className="text-xs text-muted-foreground">Viaje com inteligência</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {navigationItems.map((section) => (
        <div key={section.title} className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            {section.title}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                end
                onClick={onNavClick}
                className={`${getNavClasses(isActive(item.url))} flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${isActive(item.url) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span className="font-medium">{item.title}</span>
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { user, viewAsUser, setViewAsUser, logout } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine display role: if user is free but has active subscription, show Premium
  const displayRole = user?.role === UserRole.FREE && subscription.subscribed
    ? UserRole.PREMIUM
    : user?.role;

  const displayRoleLabel = displayRole ? getRoleLabel(displayRole) : '';
  const displayRoleBadgeVariant = displayRole ? getRoleBadgeVariant(displayRole) : 'outline' as const;

  const navigationItems = user ? getNavigationItems(user.role, viewAsUser) : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-sidebar flex-col shrink-0 sticky top-0 h-screen">
        <SidebarNavContent navigationItems={navigationItems} currentPath={currentPath} />
      </aside>
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 lg:h-16 flex items-center justify-between px-3 sm:px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Mobile menu trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden shrink-0 -ml-1">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col">
                <SidebarNavContent 
                  navigationItems={navigationItems} 
                  currentPath={currentPath} 
                  onNavClick={() => setMobileOpen(false)} 
                />
              </SheetContent>
            </Sheet>

            <div className="hidden sm:block min-w-0">
              <h2 className="text-base lg:text-lg font-semibold text-foreground truncate">
                {user?.role === UserRole.ADMIN ? 'Administração' : 'Dashboard'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {viewAsUser ? 'Visualizando como usuário' : 'Painel de controle'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* System Actions: Notifications + View Toggle */}
            {user && user.role === UserRole.ADMIN && (
              <div className="flex items-center gap-1 sm:gap-2">
                <NotificationSystem />
                <Button
                  variant={viewAsUser ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewAsUser(!viewAsUser)}
                  className="hidden md:flex text-xs"
                >
                  {viewAsUser ? 'Voltar ao Admin' : 'Ver como Usuário'}
                </Button>
              </div>
            )}

            {/* Separator */}
            {user && user.role === UserRole.ADMIN && (
              <div className="hidden md:block border-l border-border h-6" />
            )}

            {/* User Identity Block */}
            {user && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="hidden md:flex items-center gap-2.5 rounded-lg hover:bg-muted/50 px-2 py-1.5 transition-colors">
                  <div className="text-right">
                    <p className="text-sm font-medium leading-tight">{user.name}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{user.email}</p>
                  </div>
                  <Badge variant={displayRoleBadgeVariant} className="text-xs">
                    {displayRoleLabel}
                  </Badge>
                </div>

                {/* Separator */}
                <div className="hidden md:block border-l border-border h-6" />

                {/* Profile + Logout */}
                <div className="flex items-center gap-0.5">
                  <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <NavLink to="/profile">
                      <User className="h-4 w-4" />
                    </NavLink>
                  </Button>
                  <Button 
                    onClick={handleLogout} 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 scroll-area">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <footer className="py-3 px-4 text-center border-t border-border">
          <p className="text-xs text-muted-foreground">
            Desenvolvido por McKinley Avenue
          </p>
        </footer>
      </div>
    </div>
  );
}
