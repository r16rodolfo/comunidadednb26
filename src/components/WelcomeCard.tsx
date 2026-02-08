import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import type { WelcomeCardConfig, LucideIconName } from "@/types/admin";

const iconMap: Record<LucideIconName, React.ComponentType<{ className?: string }>> = {
  Plane: LucideIcons.Plane,
  Globe: LucideIcons.Globe,
  Map: LucideIcons.Map,
  Compass: LucideIcons.Compass,
  Luggage: LucideIcons.Luggage,
  Wallet: LucideIcons.Wallet,
  TrendingUp: LucideIcons.TrendingUp,
  BarChart3: LucideIcons.BarChart3,
  PiggyBank: LucideIcons.PiggyBank,
  DollarSign: LucideIcons.DollarSign,
  CreditCard: LucideIcons.CreditCard,
  Banknote: LucideIcons.Banknote,
  Star: LucideIcons.Star,
  Heart: LucideIcons.Heart,
  Sparkles: LucideIcons.Sparkles,
  Rocket: LucideIcons.Rocket,
  Target: LucideIcons.Target,
  Award: LucideIcons.Award,
  Zap: LucideIcons.Zap,
  Sun: LucideIcons.Sun,
};

interface WelcomeCardProps {
  config: WelcomeCardConfig;
}

export default function WelcomeCard({ config }: WelcomeCardProps) {
  const navigate = useNavigate();
  const IconComponent = iconMap[config.icon] || LucideIcons.Plane;

  return (
    <Card className="bg-gradient-subtle border-border/50 shadow-card hover:shadow-elegant transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              {config.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {config.subtitle}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground/80 leading-relaxed">
          {config.body}
        </p>
        
        <div className="pt-2">
          <Button variant="dnb" className="group" onClick={() => navigate(config.ctaUrl)}>
            {config.ctaLabel}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
