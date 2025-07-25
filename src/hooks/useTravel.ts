import { useState, useEffect } from 'react';
import { TravelPlan, TravelPlanInput, TravelReport } from '@/types/travel';

const STORAGE_KEYS = {
  TRAVEL_PLANS: 'dnb_travel_plans',
  CURRENT_PLAN: 'dnb_current_travel_plan',
  TRAVEL_REPORTS: 'dnb_travel_reports',
};

export function useTravel() {
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<TravelPlan | null>(null);
  const [travelReports, setTravelReports] = useState<{ [planId: string]: TravelReport }>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPlans = localStorage.getItem(STORAGE_KEYS.TRAVEL_PLANS);
    const savedCurrentPlan = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN);
    const savedReports = localStorage.getItem(STORAGE_KEYS.TRAVEL_REPORTS);

    if (savedPlans) {
      const plans = JSON.parse(savedPlans);
      const parsedPlans = plans.map((plan: any) => ({
        ...plan,
        dateStart: new Date(plan.dateStart),
        dateEnd: new Date(plan.dateEnd),
        createdAt: new Date(plan.createdAt),
        updatedAt: new Date(plan.updatedAt),
      }));
      setTravelPlans(parsedPlans);
    }

    if (savedCurrentPlan) {
      const plan = JSON.parse(savedCurrentPlan);
      plan.dateStart = new Date(plan.dateStart);
      plan.dateEnd = new Date(plan.dateEnd);
      plan.createdAt = new Date(plan.createdAt);
      plan.updatedAt = new Date(plan.updatedAt);
      setCurrentPlan(plan);
    }

    if (savedReports) {
      const reports = JSON.parse(savedReports);
      Object.keys(reports).forEach(planId => {
        reports[planId].generatedAt = new Date(reports[planId].generatedAt);
        reports[planId].plan.dateStart = new Date(reports[planId].plan.dateStart);
        reports[planId].plan.dateEnd = new Date(reports[planId].plan.dateEnd);
        reports[planId].itinerary.forEach((day: any) => {
          day.date = new Date(day.date);
        });
        reports[planId].events.forEach((event: any) => {
          event.date = new Date(event.date);
        });
      });
      setTravelReports(reports);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRAVEL_PLANS, JSON.stringify(travelPlans));
  }, [travelPlans]);

  useEffect(() => {
    if (currentPlan) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PLAN, JSON.stringify(currentPlan));
    }
  }, [currentPlan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRAVEL_REPORTS, JSON.stringify(travelReports));
  }, [travelReports]);

  const createTravelPlan = async (input: TravelPlanInput): Promise<TravelPlan> => {
    const newPlan: TravelPlan = {
      id: crypto.randomUUID(),
      userId: 'current-user', // TODO: Get from auth context
      ...input,
      monitoringActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTravelPlans(prev => [newPlan, ...prev]);
    setCurrentPlan(newPlan);
    return newPlan;
  };

  const generateTravelReport = async (planId: string): Promise<TravelReport> => {
    setIsGenerating(true);
    
    try {
      const plan = travelPlans.find(p => p.id === planId) || currentPlan;
      if (!plan) throw new Error('Plano não encontrado');

      // Simulate API calls and report generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockReport: TravelReport = {
        plan,
        itinerary: generateMockItinerary(plan),
        logistics: generateMockLogistics(plan),
        events: generateMockEvents(plan),
        guides: generateMockGuides(plan),
        weather: generateMockWeather(plan),
        generatedAt: new Date(),
      };

      setTravelReports(prev => ({
        ...prev,
        [planId]: mockReport,
      }));

      return mockReport;
    } finally {
      setIsGenerating(false);
    }
  };

  const activateMonitoring = (planId: string) => {
    setTravelPlans(prev => 
      prev.map(plan => 
        plan.id === planId 
          ? { ...plan, monitoringActive: true, updatedAt: new Date() }
          : plan
      )
    );

    if (currentPlan?.id === planId) {
      setCurrentPlan(prev => prev ? { ...prev, monitoringActive: true, updatedAt: new Date() } : null);
    }
  };

  const getDaysUntilTrip = (plan: TravelPlan): number => {
    const today = new Date();
    const tripDate = new Date(plan.dateStart);
    const diffTime = tripDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const canActivateMonitoring = (plan: TravelPlan): boolean => {
    return getDaysUntilTrip(plan) > 60 && !plan.monitoringActive;
  };

  return {
    travelPlans,
    currentPlan,
    travelReports,
    isGenerating,
    createTravelPlan,
    generateTravelReport,
    activateMonitoring,
    getDaysUntilTrip,
    canActivateMonitoring,
    setCurrentPlan,
  };
}

// Mock data generators
function generateMockItinerary(plan: TravelPlan) {
  const days = [];
  const startDate = new Date(plan.dateStart);
  const endDate = new Date(plan.dateEnd);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    days.push({
      day: i + 1,
      date,
      morning: `Manhã do dia ${i + 1}: Explorar pontos turísticos principais de ${plan.destinationPrimary}`,
      afternoon: `Tarde do dia ${i + 1}: Almoço local e visita a museus ou centros culturais`,
      evening: `Noite do dia ${i + 1}: Jantar em restaurante típico e vida noturna local`,
    });
  }

  return days;
}

function generateMockLogistics(plan: TravelPlan) {
  return {
    carRoute: plan.mainTransport === 'car' ? {
      totalDistance: '350 km',
      estimatedTime: '4h 30min',
      fuelCost: 45.00,
      tollCost: 15.50,
      tollPlazas: 3,
      paymentMethods: ['Cartão', 'Dinheiro', 'Via Verde'],
      mapLink: 'https://maps.google.com',
    } : undefined,
    publicTransport: `Para se deslocar em ${plan.destinationPrimary}, recomendamos o uso do metro e autocarros urbanos. O passe diário custa aproximadamente €5-8.`,
  };
}

function generateMockEvents(plan: TravelPlan) {
  return [
    {
      id: '1',
      name: 'Festival de Música Local',
      date: new Date(plan.dateStart.getTime() + 86400000), // +1 day
      location: plan.destinationPrimary,
      ticketLink: 'https://example.com/tickets',
      category: 'Música',
    },
    {
      id: '2',
      name: 'Exposição de Arte Contemporânea',
      date: new Date(plan.dateStart.getTime() + 172800000), // +2 days
      location: plan.destinationPrimary,
      category: 'Cultura',
    },
  ];
}

function generateMockGuides(plan: TravelPlan) {
  return {
    gastronomy: `A gastronomia de ${plan.destinationPrimary} é rica e diversificada. Não deixe de experimentar os pratos típicos locais e visite os mercados tradicionais.`,
    hacks: 'Dica: Baixe o app de transporte local antes de chegar. Use sempre protetor solar e mantenha-se hidratado.',
    warnings: 'Cuidado com carteiristas em áreas turísticas. Evite ostentar objetos de valor e mantenha documentos em local seguro.',
    shopping: 'Os melhores outlets ficam na zona central. Horário de funcionamento: 10h-22h. Aproveite as promoções de fim de semana.',
    culture: `${plan.destinationPrimary} tem uma rica herança cultural. Visite os museus principais e participe em eventos locais para uma experiência autêntica.`,
  };
}

function generateMockWeather(plan: TravelPlan) {
  return {
    historical: 'Historicamente, a temperatura varia entre 18°C e 28°C nesta época do ano.',
    forecast: 'Previsão: Dias ensolarados com possibilidade de chuva ligeira no final da semana.',
    packingRecommendations: [
      'Roupa leve para o dia',
      'Casaco para as noites',
      'Calçado confortável para caminhadas',
      'Capa de chuva',
      'Protetor solar',
      'Chapéu ou boné',
    ],
  };
}