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
  Moon,
  Plane,
  Car,
  DollarSign,
  Star,
  Info,
  Mountain,
  Users,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Estrutura mais rica para o itinerário
interface DetailedActivity {
  time: string;
  title: string;
  description: string;
  location?: string;
  cost?: string;
  tip?: string;
  instagramSpot?: string;
  difficulty?: 'Fácil' | 'Médio' | 'Difícil';
  duration?: string;
  type: 'transport' | 'meal' | 'activity' | 'sightseeing' | 'culture' | 'nature' | 'nightlife';
}

interface EnhancedDailyItinerary {
  day: number;
  date: Date;
  theme: string;
  activities: DetailedActivity[];
  dayTips: string[];
}

interface ItineraryModuleProps {
  destination: string;
  onBack: () => void;
}

export function ItineraryModule({ destination, onBack }: ItineraryModuleProps) {
  // Mock data mais rico e detalhado
  const enhancedItinerary: EnhancedDailyItinerary[] = [
    {
      day: 1,
      date: new Date(2024, 2, 15), // 15 de março
      theme: "Chegada e Exploração Local",
      activities: [
        {
          time: "09:00",
          title: "Desembarque no Aeroporto Santos Dumont",
          description: "Chegada ao Rio de Janeiro",
          tip: "Uber custa em média R$25 até Copacabana, opção de metrô R$4,30",
          type: "transport"
        },
        {
          time: "11:00",
          title: "Check-in no Hotel",
          description: "Instalação no hotel em Copacabana",
          location: "Hotel Copacabana Palace",
          type: "activity"
        },
        {
          time: "14:00",
          title: "Passeio pelo Cristo Redentor",
          description: "Visita ao cartão postal mais famoso do Rio",
          location: "Corcovado",
          cost: "R$62 (trem) + R$31 (van)",
          duration: "4h",
          tip: "Vá preferencialmente pela manhã para evitar multidões",
          type: "sightseeing"
        },
        {
          time: "18:00",
          title: "Pôr do Sol na Praia Vermelha",
          description: "Momento perfeito para fotos instagramáveis",
          instagramSpot: "Na mureta da Praia Vermelha, com o Pão de Açúcar ao fundo",
          location: "Urca",
          type: "sightseeing"
        },
        {
          time: "20:00",
          title: "Jantar no Aprazível",
          description: "Restaurante tradicional carioca com vista panorâmica",
          location: "Santa Teresa",
          cost: "R$120-180 por pessoa",
          tip: "É um local casual e muito frequentado por locais. Reserve com antecedência!",
          type: "meal"
        }
      ],
      dayTips: [
        "Leve protetor solar e chapéu - o sol carioca é forte!",
        "Tenha sempre dinheiro em espécie para emergências",
        "Use calçado confortável para as caminhadas"
      ]
    },
    {
      day: 2,
      date: new Date(2024, 2, 16),
      theme: "Aventura e Cultura",
      activities: [
        {
          time: "08:00",
          title: "Trilha da Pedra Bonita",
          description: "Uma das trilhas mais bonitas do Rio com vista espetacular",
          location: "São Conrado",
          difficulty: "Médio",
          duration: "3h",
          tip: "Leve sua própria garrafa de água; há um bebedouro no início da trilha para reabastecer",
          type: "nature"
        },
        {
          time: "13:00",
          title: "Almoço no Bar da Praia",
          description: "Pratos feitos autênticos e com bom preço",
          location: "Próximo à trilha",
          cost: "R$25-35 por pessoa",
          tip: "Experimente o peixe grelhado com farofa - especialidade da casa",
          type: "meal"
        },
        {
          time: "15:00",
          title: "Museu do Amanhã",
          description: "Museu de ciências interativo no Porto Maravilha",
          location: "Centro",
          cost: "R$20 entrada",
          duration: "2h",
          tip: "Compre o ingresso online para evitar filas",
          type: "culture"
        },
        {
          time: "18:00",
          title: "Passeio pela Lapa",
          description: "Explore os famosos Arcos da Lapa e arredores",
          location: "Lapa",
          type: "sightseeing"
        },
        {
          time: "21:00",
          title: "Vida Noturna na Lapa",
          description: "Experimente a autêntica vida noturna carioca",
          location: "Rua da Lapa",
          tip: "Comece no Rio Scenarium e depois explore os bares da região",
          cost: "R$15-25 por bebida",
          type: "nightlife"
        }
      ],
      dayTips: [
        "Para trilhas, sempre informe alguém sobre seu roteiro",
        "Na Lapa, mantenha objetos de valor em segurança",
        "Use repelente à tarde - há muitos mosquitos na região"
      ]
    },
    {
      day: 3,
      date: new Date(2024, 2, 17),
      theme: "Praias e Relaxamento",
      activities: [
        {
          time: "09:00",
          title: "Manhã em Ipanema",
          description: "Relaxe na praia mais famosa do Rio",
          location: "Posto 9, Ipanema",
          tip: "Alugue cadeira e guarda-sol por R$15. Experimente água de coco gelada!",
          type: "activity"
        },
        {
          time: "12:00",
          title: "Almoço no Garota de Ipanema",
          description: "Bar histórico que inspirou a famosa música",
          location: "Ipanema",
          cost: "R$40-70 por pessoa",
          tip: "Peça a caipirinha da casa - é imperdível!",
          type: "meal"
        },
        {
          time: "15:00",
          title: "Lagoa Rodrigo de Freitas",
          description: "Pedalinho ou caminhada ao redor da lagoa",
          location: "Lagoa",
          cost: "R$25 pedalinho (30min)",
          duration: "2h",
          instagramSpot: "Deck da Lagoa com o Cristo ao fundo",
          type: "activity"
        },
        {
          time: "17:00",
          title: "Feira Hippie de Ipanema",
          description: "Artesanato local e souvenirs únicos",
          location: "Praça General Osório",
          tip: "Pechinche sempre! Preços podem baixar até 30%",
          type: "activity"
        },
        {
          time: "19:30",
          title: "Jantar no Zuka",
          description: "Gastronomia contemporânea brasileira",
          location: "Leblon",
          cost: "R$150-220 por pessoa",
          tip: "Reserve mesa na varanda para uma experiência especial",
          type: "meal"
        }
      ],
      dayTips: [
        "Domingos a feira funciona das 9h às 18h",
        "Leve uma canga extra para secar na praia",
        "Hidrate-se constantemente - o calor é intenso"
      ]
    }
  ];
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transport': return <Car className="h-4 w-4" />;
      case 'meal': return <Utensils className="h-4 w-4" />;
      case 'sightseeing': return <Camera className="h-4 w-4" />;
      case 'culture': return <Star className="h-4 w-4" />;
      case 'nature': return <Mountain className="h-4 w-4" />;
      case 'nightlife': return <Users className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const renderActivity = (activity: DetailedActivity) => {
    return (
      <div className="bg-background/50 rounded-lg p-5 border border-border/30 hover:border-primary/30 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
              <Clock className="h-3 w-3 text-primary" />
              <span className="text-sm font-medium text-primary">{activity.time}</span>
            </div>
            {getActivityIcon(activity.type)}
          </div>
          {activity.cost && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              <DollarSign className="h-3 w-3 mr-1" />
              {activity.cost}
            </Badge>
          )}
        </div>

        <h4 className="font-semibold text-lg mb-2">{activity.title}</h4>
        <p className="text-muted-foreground leading-relaxed mb-3">{activity.description}</p>

        {activity.location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            {activity.location}
          </div>
        )}

        {activity.duration && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <Clock className="h-3 w-3" />
            Duração: {activity.duration}
          </div>
        )}

        {activity.difficulty && (
          <div className="flex items-center gap-1 text-sm mb-2">
            <Mountain className="h-3 w-3" />
            <span className={`font-medium ${
              activity.difficulty === 'Fácil' ? 'text-green-600' :
              activity.difficulty === 'Médio' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              Nível: {activity.difficulty}
            </span>
          </div>
        )}

        {activity.tip && (
          <div className="bg-blue-50 border-l-4 border-blue-200 p-3 mt-3 rounded-r">
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">💡 Dica:</p>
                <p className="text-sm text-blue-700">{activity.tip}</p>
              </div>
            </div>
          </div>
        )}

        {activity.instagramSpot && (
          <div className="bg-pink-50 border-l-4 border-pink-200 p-3 mt-3 rounded-r">
            <div className="flex items-start gap-2">
              <Camera className="h-4 w-4 text-pink-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-pink-800 mb-1">📸 Ponto Instagramável:</p>
                <p className="text-sm text-pink-700">{activity.instagramSpot}</p>
              </div>
            </div>
          </div>
        )}
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

      {/* Destination Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
        <h2 className="text-2xl font-bold text-primary mb-2">Cidade: {destination}</h2>
        <p className="text-muted-foreground">Roteiro detalhado com horários, custos e dicas especiais</p>
      </div>

      {/* Itinerary Timeline */}
      <div className="space-y-8">
        {enhancedItinerary.map((day, index) => (
          <Card key={day.day} className="overflow-hidden shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {day.day}
                  </div>
                  <div>
                    <h3 className="text-xl">Dia {day.day}: {day.theme}</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {format(day.date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                </CardTitle>
                <Badge variant="outline" className="capitalize text-primary border-primary">
                  {format(day.date, 'EEEE', { locale: ptBR })}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-6">
                {day.activities.map((activity, actIndex) => (
                  <div key={actIndex}>
                    {renderActivity(activity)}
                  </div>
                ))}
              </div>

              {/* Day Tips */}
              <div className="mt-8 p-5 bg-amber-50 rounded-lg border-l-4 border-amber-300">
                <h5 className="font-semibold mb-3 flex items-center gap-2 text-amber-800">
                  <Info className="h-4 w-4" />
                  💡 Dicas Especiais do Dia
                </h5>
                <ul className="text-sm text-amber-700 space-y-2">
                  {day.dayTips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-lg">
        <CardContent className="p-6">
          <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Resumo da Viagem
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white/50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-primary">{enhancedItinerary.length}</div>
              <p className="text-sm text-muted-foreground">Dias de viagem</p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {enhancedItinerary.reduce((total, day) => total + day.activities.length, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Atividades planejadas</p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {enhancedItinerary.reduce((total, day) => 
                  total + day.activities.filter(a => a.type === 'meal').length, 0
                )}
              </div>
              <p className="text-sm text-muted-foreground">Refeições inclusas</p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {enhancedItinerary.reduce((total, day) => total + day.dayTips.length, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Dicas especiais</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}