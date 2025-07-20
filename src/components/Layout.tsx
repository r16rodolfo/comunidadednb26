
import { ReactNode } from "react";
import { Home, Calculator, BookOpen, Target, TrendingUp, ShoppingBag, Menu, User, Settings, Users, BarChart3, LogOut } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
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

const getNavigationItems = (userRole: UserRole) => {
  const baseItems = [
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
      ]
    },
    {
      title: "DNB ACADEMY",
      items: [
        { title: "Aprenda Câmbio", url: "/academy", icon: BookOpen },
      ]
    }
  ];

  // Add admin sections based on role
  if (userRole === UserRole.ADMIN) {
    baseItems.push({
      title: "ADMINISTRAÇÃO",
      items: [
        { title: "Configurações", url: "/admin/settings", icon: Settings },
        { title: "Dashboard Gestor", url: "/manager/dashboard", icon: BarChart3 },
      ]
    });
  } else if (userRole === UserRole.MANAGER) {
    baseItems.push({
      title: "GESTÃO",
      items: [
        { title: "Dashboard", url: "/manager/dashboard", icon: BarChart3 },
        { title: "Usuários", url: "/manager/users", icon: Users },
      ]
    });
  }

  return baseItems;
};

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const navigationItems = user ? getNavigationItems(user.role) : [];

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
      <SidebarContent className="p-4">
        {/* Logo Area */}
        <div className="mb-8 px-2">
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

        {/* User Info */}
        {user && !isCollapsed && (
          <div className="mb-6 px-2">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button asChild variant="ghost" size="sm" className="h-8 px-2 flex-1">
                  <NavLink to="/profile">
                    <User className="h-3 w-3 mr-1" />
                    Perfil
                  </NavLink>
                </Button>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="h-8 px-2">
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

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
  const { user } = useAuth();

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
                <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
                <p className="text-sm text-muted-foreground">Gerencie suas viagens e câmbio</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              )}
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Sistema ativo
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
