import Layout from "@/components/Layout";
import PromoBanner from "@/components/PromoBanner";
import WelcomeCard from "@/components/WelcomeCard";
import { useHomeConfig } from "@/hooks/useHomeConfig";

const Index = () => {
  const { config } = useHomeConfig();

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <WelcomeCard config={config.welcomeCard} />

        {/* Hero Banner */}
        <PromoBanner banners={config.banners} />

        {/* Step Cards */}
        {config.stepCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            {config.stepCards.map((step, idx) => (
              <div key={step.id} className="text-center p-4 sm:p-6 bg-card rounded-xl border border-border/50">
                <div className={`w-12 h-12 ${idx % 2 === 0 ? 'bg-primary/10' : 'bg-accent/10'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <span className={`${idx % 2 === 0 ? 'text-primary' : 'text-accent'} font-bold text-lg`}>{step.number}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
