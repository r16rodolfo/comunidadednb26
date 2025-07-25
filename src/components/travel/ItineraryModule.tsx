import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Utensils, 
  Camera, 
  ArrowLeft,
  Sunrise,
  Sun,
  Moon
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DailyItinerary } from '@/types/travel';

interface ItineraryModuleProps {
  itinerary: DailyItinerary[];
  destination: string;
  onBack: () => void;
}

export function ItineraryModule({ itinerary, destination, onBack }: ItineraryModuleProps) {
  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'morning': return <Sunrise className="h-5 w-5 text-yellow-500" />;
      case 'afternoon': return <Sun className="h-5 w-5 text-orange-500" />;
      case 'evening': return <Moon className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'morning': return 'Manhã';
      case 'afternoon': return 'Tarde';
      case 'evening': return 'Noite';
      default: return period;
    }
  };

  const renderActivity = (content: string, period: string) => {
    return (
      <div className="bg-background/50 rounded-lg p-4 border border-border/30">
        <div className="flex items-center gap-2 mb-3">
          {getPeriodIcon(period)}
          <h4 className="font-semibold text-lg">{getPeriodLabel(period)}</h4>
        </div>
        <p className="text-muted-foreground leading-relaxed">{content}</p>
        
        {/* Activity tags based on content */}
        <div className="flex flex-wrap gap-2 mt-3">
          {content.toLowerCase().includes('museu') && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Camera className="h-3 w-3" />
              Cultura
            </Badge>
          )}
          {content.toLowerCase().includes('restaurante') && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Utensils className="h-3 w-3" />
              Gastronomia
            </Badge>
          )}
          {content.toLowerCase().includes('turístico') && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Turismo
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Roteiro Dia a Dia
          </h1>
          <p className="text-muted-foreground">
            Plano detalhado para sua viagem em {destination}
          </p>
        </div>
      </div>

      {/* Itinerary Timeline */}
      <div className="space-y-8">
        {itinerary.map((day, index) => (
          <Card key={day.day} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {day.day}
                  </div>
                  <div>
                    <h3 className="text-xl">Dia {day.day}</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {format(day.date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                </CardTitle>
                <Badge variant="outline" className="capitalize">
                  {format(day.date, 'EEEE', { locale: ptBR })}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Morning Activities */}
                {renderActivity(day.morning, 'morning')}
                
                {/* Afternoon Activities */}
                {renderActivity(day.afternoon, 'afternoon')}
                
                {/* Evening Activities */}
                {renderActivity(day.evening, 'evening')}
              </div>

              {/* Day Summary */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                <h5 className="font-semibold mb-2">💡 Dicas do Dia</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Leve calçado confortável para caminhadas</li>
                  <li>• Reserve restaurantes com antecedência</li>
                  <li>• Verifique horários de funcionamento dos locais</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Resumo da Viagem
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{itinerary.length}</div>
              <p className="text-sm text-muted-foreground">Dias de viagem</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{itinerary.length * 3}</div>
              <p className="text-sm text-muted-foreground">Atividades planejadas</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Math.ceil(itinerary.length * 2.5)}
              </div>
              <p className="text-sm text-muted-foreground">Locais a visitar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}