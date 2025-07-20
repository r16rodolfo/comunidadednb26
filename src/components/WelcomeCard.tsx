import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plane } from "lucide-react";

export default function WelcomeCard() {
  return (
    <Card className="bg-gradient-subtle border-border/50 shadow-card hover:shadow-elegant transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Plane className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              Bem-vinda à Comunidade DNB! 
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sua jornada financeira para viagens internacionais começa aqui
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground/80 leading-relaxed">
          Transforme seus sonhos de viagem em realidade com planejamento inteligente. 
          Nossa plataforma oferece todas as ferramentas necessárias para otimizar suas 
          compras de câmbio e garantir que você aproveite cada centavo da sua viagem.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button variant="dnb" className="group">
            Começar Planejamento
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" className="hover:bg-accent/50">
            Conhecer a Academy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}