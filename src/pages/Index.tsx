import Layout from "@/components/Layout";
import PromoBanner from "@/components/PromoBanner";
import WelcomeCard from "@/components/WelcomeCard";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <WelcomeCard />

        {/* Hero Banner */}
        <PromoBanner />

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 bg-card rounded-xl border border-border/50">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-primary font-bold text-lg">1</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Defina suas Metas</h3>
            <p className="text-sm text-muted-foreground">
              Estabeleça objetivos claros para suas viagens e compras de câmbio
            </p>
          </div>
          
          <div className="text-center p-6 bg-card rounded-xl border border-border/50">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-accent font-bold text-lg">2</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Acompanhe o Mercado</h3>
            <p className="text-sm text-muted-foreground">
              Monitore cotações e tome decisões inteligentes no momento certo
            </p>
          </div>
          
          <div className="text-center p-6 bg-card rounded-xl border border-border/50">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-primary font-bold text-lg">3</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Execute com Confiança</h3>
            <p className="text-sm text-muted-foreground">
              Realize suas compras com base em análises e planejamento sólido
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
