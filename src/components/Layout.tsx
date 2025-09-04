
import { ReactNode } from "react";
import { 
  Home, 
  Calculator, 
  BookOpen, 
  Target, 
  TrendingUp, 
  ShoppingBag, 
  Ticket,
  Menu, 
  User, 
  Settings, 
  Users, 
  BarChart3, 
  LogOut, 
  CreditCard, 
  Plane,
  Bell,
  ChevronDown,
  Calendar,
  Route,
  CalendarDays,
  Luggage
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

const getRoleLabel = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN: return 'Admin';
    case UserRole.MANAGER: return 'Gestor';
    case UserRole.PREMIUM: return 'Premium';
    case UserRole.FREE: return 'Gratuito';
  }
};

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN: return 'destructive';
    case UserRole.MANAGER: return 'default';
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
          { title: "Meus Objetivos", url: "/objetivos", icon: Target },
        ]
      },
      {
        title: "FERRAMENTAS DNB",
        items: [
        { title: "Planner de Compras", url: "/planner", icon: Calculator },
        { title: "Análise de Mercado", url: "/analise", icon: TrendingUp },
        { title: "Achadinhos", url: "/achadinhos", icon: ShoppingBag },
        { title: "Cupons de Parceiros", url: "/coupons", icon: Ticket },
        ]
      },
      {
        title: "AGÊNCIA DNB",
        items: [
          { title: "Planejador de Viagem", url: "/agencia", icon: Plane },
        ],
        subItems: [
          { title: "Roteiro Dia a Dia", url: "/agencia/roteiro", icon: Calendar },
          { title: "Logística e Transporte", url: "/agencia/logistica", icon: Route },
          { title: "Calendário de Eventos", url: "/agencia/eventos", icon: CalendarDays },
          { title: "Guias e Dicas", url: "/agencia/guias", icon: BookOpen },
          { title: "Clima e Bagagem", url: "/agencia/clima", icon: Luggage },
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

  // Admin navigation - focused on administration
  if (userRole === UserRole.ADMIN) {
    return [
      {
        title: "ADMINISTRAÇÃO",
        items: [
          { title: "Configurações", url: "/admin/settings", icon: Settings },
          { title: "Assinaturas", url: "/admin/subscriptions", icon: CreditCard },
          { title: "Dashboard Gestor", url: "/manager/dashboard", icon: BarChart3 },
        ]
      }
    ];
  }

  // Manager navigation - focused on management
  if (userRole === UserRole.MANAGER) {
    return [
      {
        title: "GESTÃO",
        items: [
          { title: "Dashboard", url: "/manager/dashboard", icon: BarChart3 },
          { title: "Usuários", url: "/manager/users", icon: Users },
          { title: "Conteúdo", url: "/manager/content", icon: BookOpen },
          { title: "Cupons", url: "/manager/coupons", icon: Ticket },
          { title: "Analytics", url: "/manager/analytics", icon: TrendingUp },
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
        { title: "Meus Objetivos", url: "/objetivos", icon: Target },
      ]
    },
    {
      title: "FERRAMENTAS DNB",
      items: [
        { title: "Planner de Compras", url: "/planner", icon: Calculator },
        { title: "Análise de Mercado", url: "/analise", icon: TrendingUp },
        { title: "Achadinhos", url: "/achadinhos", icon: ShoppingBag },
        { title: "Cupons de Parceiros", url: "/coupons", icon: Ticket },
      ]
    },
    {
      title: "AGÊNCIA DNB",
      items: [
        { title: "Planejador de Viagem", url: "/agencia", icon: Plane },
      ],
      subItems: [
        { title: "Roteiro Dia a Dia", url: "/agencia/roteiro", icon: Calendar },
        { title: "Logística e Transporte", url: "/agencia/logistica", icon: Route },
        { title: "Calendário de Eventos", url: "/agencia/eventos", icon: CalendarDays },
        { title: "Guias e Dicas", url: "/agencia/guias", icon: BookOpen },
        { title: "Clima e Bagagem", url: "/agencia/clima", icon: Luggage },
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
                  <div key={item.title}>
                    <SidebarMenuItem>
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
                    
                    {/* Render sub-items if they exist and parent route is active */}
                    {section.subItems && !isCollapsed && currentPath.startsWith('/agencia') && (
                      <div className="ml-6 mt-1 space-y-1">
                        {section.subItems.map((subItem) => (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton asChild>
                              <NavLink
                                to={subItem.url}
                                className={({ isActive }) =>
                                  `flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-all duration-200 ${
                                    isActive
                                      ? 'bg-primary/20 text-primary font-medium'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                                  }`
                                }
                              >
                                <subItem.icon className="h-3 w-3" />
                                <span>{subItem.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </div>
                    )}
                  </div>
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
                  {user?.role === UserRole.ADMIN ? 'Administração' : 
                   user?.role === UserRole.MANAGER ? 'Gestão' : 'Dashboard'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {viewAsUser ? 'Visualizando como usuário' : 'Painel de controle'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications for Admin/Manager */}
              {user && (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) && (
                <NotificationSystem />
              )}

              {/* View Toggle for Admin/Manager */}
              {user && (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) && (
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
