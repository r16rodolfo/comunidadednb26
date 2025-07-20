import { ReactNode } from "react";
import { Home, Calculator, BookOpen, Target, TrendingUp, ShoppingBag, Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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

interface LayoutProps {
  children: ReactNode;
}

const navigationItems = [
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

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = (isActive: boolean) =>
    isActive 
      ? "bg-primary/10 text-primary font-semibold border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

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