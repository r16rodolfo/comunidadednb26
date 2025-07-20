import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";
import heroImage from "@/assets/dnb-hero.jpg";

export default function PromoBanner() {
  return (
    <Card className="relative overflow-hidden border-0 shadow-glow bg-gradient-hero text-white">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-hero/80" />
      
      <CardContent className="relative p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Novidade
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Transforme seus 
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-glow to-white">
                  sonhos de viagem
                </span>
                em realidade
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                Planeje, compre e acompanhe suas operações de câmbio com inteligência. 
                A Comunidade DNB oferece todas as ferramentas para otimizar suas viagens internacionais.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button variant="secondary" size="hero" className="group font-semibold bg-white text-primary hover:bg-white/90">
                  Começar Agora
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="hero" className="border-white/30 text-white hover:bg-white/10">
                  Ver Demonstração
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="lg:flex-shrink-0">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">15%</div>
                  <div className="text-sm text-white/80">Economia média</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">10mil+</div>
                  <div className="text-sm text-white/80">Usuários ativos</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-sm text-white/80">Países atendidos</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">4.9★</div>
                  <div className="text-sm text-white/80">Avaliação média</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}