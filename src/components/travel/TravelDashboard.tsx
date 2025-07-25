import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Route, 
  Calendar as CalendarEvent,
  BookOpen,
  FileText,
  Bell,
  Download,
  Users,
  Plane,
  Car,
  Bus,
  Train
} from 'lucide-react';
import { TravelReport } from '@/types/travel';
import { format, differenceInDays } from 'date-fns';

interface TravelDashboardProps {
  report: TravelReport;
  onViewModule: (module: string) => void;
  onGeneratePDF: () => void;
  onActivateMonitoring: () => void;
  canActivateMonitoring: boolean;
}

export function TravelDashboard({ 
  report, 
  onViewModule, 
  onGeneratePDF, 
  onActivateMonitoring,
  canActivateMonitoring 
}: TravelDashboardProps) {
  const { plan } = report;
  const daysUntilTrip = differenceInDays(plan.dateStart, new Date());
  const tripDuration = differenceInDays(plan.dateEnd, plan.dateStart) + 1;

  const getTransportIcon = (transport: string) => {
    switch (transport) {
      case 'car': return <Car className="h-4 w-4" />;
      case 'plane': return <Plane className="h-4 w-4" />;
      case 'bus': return <Bus className="h-4 w-4" />;
      case 'train': return <Train className="h-4 w-4" />;
      default: return <Route className="h-4 w-4" />;
    }
  };

  const modules = [
    {
      id: 'itinerary',
      title: 'Roteiro Dia a Dia',
      description: 'Plano detalhado para cada dia da viagem',
      icon: <Calendar className="h-8 w-8" />,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      id: 'logistics',
      title: 'Logística e Transporte',
      description: 'Rotas, custos e informações de transporte',
      icon: <Route className="h-8 w-8" />,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
    },
    {
      id: 'events',
      title: 'Calendário de Eventos',
      description: 'Shows, festivais e eventos durante a viagem',
      icon: <CalendarEvent className="h-8 w-8" />,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
    {
      id: 'guides',
      title: 'Guias e Dicas',
      description: 'Gastronomia, hacks e pontos de atenção',
      icon: <BookOpen className="h-8 w-8" />,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
    },
    {
      id: 'weather',
      title: 'Clima e Bagagem',
      description: 'Previsão do tempo e sugestões de mala',
      icon: <FileText className="h-8 w-8" />,
      color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <MapPin className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">
            O seu plano de viagem para {plan.destinationPrimary}
          </h1>
        </div>
        
        {plan.destinationsSecondary.length > 0 && (
          <p className="text-lg text-muted-foreground">
            + {plan.destinationsSecondary.join(', ')}
          </p>
        )}
      </div>

      {/* Trip Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">
              {daysUntilTrip > 0 ? daysUntilTrip : 0}
            </div>
            <p className="text-sm text-muted-foreground">
              {daysUntilTrip > 0 ? 'dias até a viagem' : 'viagem em curso'}
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{tripDuration}</div>
            <p className="text-sm text-muted-foreground">dias de viagem</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-lg font-bold capitalize">{plan.travelerProfile}</div>
            <p className="text-sm text-muted-foreground">perfil de viagem</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            {getTransportIcon(plan.mainTransport || 'plane')}
            <div className="text-lg font-bold capitalize mt-2">
              {plan.mainTransport || 'Avião'}
            </div>
            <p className="text-sm text-muted-foreground">transporte principal</p>
          </CardContent>
        </Card>
      </div>

      {/* Trip Details */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-semibold">Período da Viagem</p>
              <p className="text-muted-foreground">
                {format(plan.dateStart, 'dd/MM/yyyy')} - {format(plan.dateEnd, 'dd/MM/yyyy')}
              </p>
            </div>
            <div>
              <p className="font-semibold">Motivo</p>
              <Badge variant="secondary" className="capitalize">
                {plan.tripReason}
              </Badge>
            </div>
            <div>
              <p className="font-semibold">Estilo</p>
              <Badge variant="outline" className="capitalize">
                {plan.tripStyle}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Alert */}
      {canActivateMonitoring && (
        <Alert className="border-blue-200 bg-blue-50/80 backdrop-blur-sm">
          <Bell className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              A sua viagem é em mais de 60 dias! Ative o <strong>Roteiro Vivo</strong> para receber 
              atualizações sobre novos eventos e informações importantes.
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onActivateMonitoring}
              className="ml-4"
            >
              Ativar Monitoramento
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card 
            key={module.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => onViewModule(module.id)}
          >
            <CardContent className="p-6">
              <div className={`${module.color} text-white p-4 rounded-lg mb-4 flex items-center justify-center`}>
                {module.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{module.title}</h3>
              <p className="text-muted-foreground text-sm">{module.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          size="lg" 
          onClick={onGeneratePDF}
          className="flex items-center gap-2"
        >
          <Download className="h-5 w-5" />
          📄 Gerar Checklist PDF
        </Button>
      </div>

      {/* Notifications Area */}
      {plan.monitoringActive && (
        <Card className="border-green-200 bg-green-50/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Bell className="h-5 w-5" />
              Roteiro Vivo Ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              Está a receber notificações sobre novos eventos e informações importantes para a sua viagem.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}