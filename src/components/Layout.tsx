
import { ReactNode } from "react";
import { 
  Home, 
  Calculator, 
  BookOpen, 
  TrendingUp, 
  Ticket,
  Menu, 
  User, 
  Settings, 
  Users, 
  BarChart3, 
  LogOut, 
  CreditCard, 
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import { NotificationSystem } from "@/components/NotificationSystem";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LayoutProps {
  children: ReactNode;
}

const getRoleLabel = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN: return 'Admin';
    case UserRole.PREMIUM: return 'Premium';
    case UserRole.FREE: return 'Gratuito';
  }
};

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN: return 'destructive';
    case UserRole.PREMIUM: return 'secondary';
    case UserRole.FREE: return 'outline';
  }
};

const getNavigationItems = (userRole: UserRole, viewAsUser: boolean = false) => {
  // If viewing as user, show user navigation
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
          { title: "Aprenda Câmbio", url: "/academy", icon: BookOpen },
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

  // Admin navigation - all management in one place
  if (userRole === UserRole.ADMIN) {
    return [
      {
        title: "ADMINISTRAÇÃO",
        items: [
          { title: "Dashboard", url: "/admin/dashboard", icon: BarChart3 },
          { title: "Usuários", url: "/admin/users", icon: Users },
          { title: "Conteúdo", url: "/admin/content", icon: BookOpen },
          { title: "Cupons", url: "/admin/coupons", icon: Ticket },
          { title: "Analytics", url: "/admin/analytics", icon: TrendingUp },
        ]
      },
      {
        title: "SISTEMA",
        items: [
          { title: "Configurações", url: "/admin/settings", icon: Settings },
          { title: "Assinaturas", url: "/admin/subscriptions", icon: CreditCard },
        ]
      }
    ];
  }

  // User navigation (Premium/Free)
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
        { title: "Aprenda Câmbio", url: "/academy", icon: BookOpen },
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

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout, viewAsUser } = useAuth();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const navigationItems = user ? getNavigationItems(user.role, viewAsUser) : [];

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = (isActive: boolean) =>
    isActive 
      ? "bg-primary/10 text-primary font-semibold border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar
      className={`${isCollapsed ? "w-16" : "w-64"} border-r border-border bg-sidebar transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="p-4 scroll-area">
        {/* Logo Area */}
        <div className="mb-6 px-2">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">DNB</span>
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">Comunidade DNB</h1>
                <p className="text-xs text-muted-foreground">Viaje com inteligência</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-lg">DNB</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        {navigationItems.map((section) => (
          <SidebarGroup key={section.title} className="mb-6">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className={`${getNavClasses(isActive(item.url))} flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group`}
                          end
                        >
                          <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                          {!isCollapsed && (
                            <span className="font-medium">{item.title}</span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { user, viewAsUser, setViewAsUser, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-foreground">
                  {user?.role === UserRole.ADMIN ? 'Administração' : 'Dashboard'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {viewAsUser ? 'Visualizando como usuário' : 'Painel de controle'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications for Admin */}
              {user && user.role === UserRole.ADMIN && (
                <NotificationSystem />
              )}

              {/* View Toggle for Admin */}
              {user && user.role === UserRole.ADMIN && (
                <Button
                  variant={viewAsUser ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewAsUser(!viewAsUser)}
                  className="hidden md:flex"
                >
                  {viewAsUser ? 'Voltar ao Admin' : 'Ver como Usuário'}
                </Button>
              )}

              {/* User Menu */}
              {user && (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <NavLink to="/profile">
                        <User className="h-4 w-4" />
                      </NavLink>
                    </Button>
                    <Button 
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }} 
                      variant="ghost" 
                      size="sm"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Sistema ativo
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 scroll-area">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
