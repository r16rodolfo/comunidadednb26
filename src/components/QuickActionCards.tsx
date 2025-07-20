import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, BookOpen, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const quickActions = [
  {
    title: "Planner de Compras",
    description: "Planeje suas compras de moeda estrangeira com metas e acompanhamento visual",
    icon: Calculator,
    href: "/planner",
    gradient: "bg-gradient-primary",
    stats: "Economize até 15% nas suas compras"
  },
  {
    title: "Análise de Mercado",
    description: "Acompanhe cotações em tempo real e tome decisões inteligentes",
    icon: TrendingUp,
    href: "/analise",
    gradient: "bg-gradient-accent",
    stats: "Dados atualizados a cada minuto"
  },
  {
    title: "Acessar Aulas",
    description: "Aprenda sobre câmbio, viagens e finanças com nossos especialistas",
    icon: BookOpen,
    href: "/academy",
    gradient: "bg-gradient-hero",
    stats: "Mais de 50 artigos e guias"
  },
  {
    title: "Meus Objetivos",
    description: "Defina e acompanhe suas metas de viagem e câmbio",
    icon: Target,
    href: "/objetivos",
    gradient: "bg-gradient-subtle",
    stats: "Acompanhamento personalizado"
  }
];

export default function QuickActionCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {quickActions.map((action) => (
        <Card key={action.title} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 ${action.gradient} rounded-xl flex items-center justify-center shadow-md`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {action.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {action.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mb-4">
              <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                {action.stats}
              </span>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
              <Link to={action.href}>
                Acessar
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}