export interface TravelPlan {
  id: string;
  userId: string;
  destinationPrimary: string;
  destinationsSecondary: string[];
  dateStart: Date;
  dateEnd: Date;
  tripReason: 'leisure' | 'business' | 'shopping' | 'hybrid';
  travelerProfile: 'solo' | 'couple' | 'family' | 'friends';
  tripStyle: 'budget' | 'comfort' | 'luxury';
  mainInterests: string[];
  mainTransport?: 'car' | 'plane' | 'bus' | 'train';
  monitoringActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TravelPlanInput {
  destinationPrimary: string;
  destinationsSecondary: string[];
  dateStart: Date;
  dateEnd: Date;
  tripReason: 'leisure' | 'business' | 'shopping' | 'hybrid';
  travelerProfile: 'solo' | 'couple' | 'family' | 'friends';
  tripStyle: 'budget' | 'comfort' | 'luxury';
  mainInterests: string[];
  mainTransport?: 'car' | 'plane' | 'bus' | 'train';
}

export interface DailyItinerary {
  day: number;
  date: Date;
  morning: string;
  afternoon: string;
  evening: string;
}

export interface TravelLogistics {
  carRoute?: {
    totalDistance: string;
    estimatedTime: string;
    fuelCost: number;
    tollCost: number;
    tollPlazas: number;
    paymentMethods: string[];
    mapLink: string;
  };
  publicTransport: string;
}

export interface TravelEvent {
  id: string;
  name: string;
  date: Date;
  location: string;
  ticketLink?: string;
  category: string;
}

export interface TravelGuide {
  gastronomy: string;
  hacks: string;
  warnings: string;
  shopping: string;
  culture: string;
}

export interface WeatherInfo {
  historical: string;
  forecast: string;
  packingRecommendations: string[];
}

export interface TravelReport {
  plan: TravelPlan;
  itinerary: DailyItinerary[];
  logistics: TravelLogistics;
  events: TravelEvent[];
  guides: TravelGuide;
  weather: WeatherInfo;
  generatedAt: Date;
}

export const TRIP_REASONS = [
  { value: 'leisure', label: 'Lazer' },
  { value: 'business', label: 'Negócios' },
  { value: 'shopping', label: 'Compras' },
  { value: 'hybrid', label: 'Híbrido (Negócios + Lazer)' },
] as const;

export const TRAVELER_PROFILES = [
  { value: 'solo', label: 'Sozinho(a)' },
  { value: 'couple', label: 'Casal' },
  { value: 'family', label: 'Família com Crianças' },
  { value: 'friends', label: 'Grupo de Amigos' },
] as const;

export const TRIP_STYLES = [
  { value: 'budget', label: 'Económico (Mochilão)' },
  { value: 'comfort', label: 'Conforto' },
  { value: 'luxury', label: 'Luxo' },
] as const;

export const INTERESTS = [
  { value: 'gastronomy', label: 'Gastronomia' },
  { value: 'adventure', label: 'Aventura' },
  { value: 'nature', label: 'Natureza' },
  { value: 'culture', label: 'Cultura' },
  { value: 'nightlife', label: 'Vida Noturna' },
  { value: 'relaxation', label: 'Relaxamento' },
  { value: 'history', label: 'História' },
] as const;

export const TRANSPORT_OPTIONS = [
  { value: 'car', label: 'Carro' },
  { value: 'plane', label: 'Avião' },
  { value: 'bus', label: 'Autocarro' },
  { value: 'train', label: 'Comboio' },
] as const;