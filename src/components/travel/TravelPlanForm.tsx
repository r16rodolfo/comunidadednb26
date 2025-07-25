import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X, MapPin, Plane } from 'lucide-react';
import { TravelPlanInput, TRIP_REASONS, TRAVELER_PROFILES, TRIP_STYLES, INTERESTS, TRANSPORT_OPTIONS } from '@/types/travel';

interface TravelPlanFormProps {
  onSubmit: (data: TravelPlanInput) => void;
  isLoading?: boolean;
}

export function TravelPlanForm({ onSubmit, isLoading }: TravelPlanFormProps) {
  const [formData, setFormData] = useState<Partial<TravelPlanInput>>({
    destinationsSecondary: [],
    mainInterests: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.destinationPrimary || !formData.dateStart || !formData.dateEnd || 
        !formData.tripReason || !formData.travelerProfile || !formData.tripStyle ||
        !formData.mainInterests?.length) {
      return;
    }

    onSubmit(formData as TravelPlanInput);
  };

  const addSecondaryDestination = () => {
    if ((formData.destinationsSecondary?.length || 0) < 4) {
      setFormData(prev => ({
        ...prev,
        destinationsSecondary: [...(prev.destinationsSecondary || []), '']
      }));
    }
  };

  const removeSecondaryDestination = (index: number) => {
    setFormData(prev => ({
      ...prev,
      destinationsSecondary: prev.destinationsSecondary?.filter((_, i) => i !== index) || []
    }));
  };

  const updateSecondaryDestination = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      destinationsSecondary: prev.destinationsSecondary?.map((dest, i) => i === index ? value : dest) || []
    }));
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => {
      const currentInterests = prev.mainInterests || [];
      const hasInterest = currentInterests.includes(interest);
      
      if (hasInterest) {
        return {
          ...prev,
          mainInterests: currentInterests.filter(i => i !== interest)
        };
      } else if (currentInterests.length < 3) {
        return {
          ...prev,
          mainInterests: [...currentInterests, interest]
        };
      }
      return prev;
    });
  };

  const showTransportField = (formData.destinationsSecondary?.length || 0) > 0;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Plane className="h-8 w-8" />
          <CardTitle className="text-3xl">Planejador de Viagem Inteligente</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Transforme o seu sonho de viagem numa experiência única e personalizada
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Destino Principal */}
          <div className="space-y-2">
            <Label htmlFor="destination" className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Para onde vamos?
            </Label>
            <Input
              id="destination"
              placeholder="Ex: Lisboa, Madrid, Paris..."
              value={formData.destinationPrimary || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, destinationPrimary: e.target.value }))}
              className="text-lg p-4"
              required
            />
          </div>

          {/* Destinos Secundários */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Paradas Adicionais (opcional)</Label>
              {(formData.destinationsSecondary?.length || 0) < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSecondaryDestination}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Cidade
                </Button>
              )}
            </div>
            
            {formData.destinationsSecondary?.map((dest, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Parada ${index + 1}`}
                  value={dest}
                  onChange={(e) => updateSecondaryDestination(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeSecondaryDestination(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateStart && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateStart ? format(formData.dateStart, "PPP") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateStart}
                    onSelect={(date) => setFormData(prev => ({ ...prev, dateStart: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-lg font-semibold">Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateEnd && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateEnd ? format(formData.dateEnd, "PPP") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateEnd}
                    onSelect={(date) => setFormData(prev => ({ ...prev, dateEnd: date }))}
                    disabled={(date) => date < (formData.dateStart || new Date())}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Selects em Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Motivo da viagem</Label>
              <Select
                value={formData.tripReason}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tripReason: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  {TRIP_REASONS.map(reason => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-lg font-semibold">Quem vai viajar</Label>
              <Select
                value={formData.travelerProfile}
                onValueChange={(value) => setFormData(prev => ({ ...prev, travelerProfile: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar perfil" />
                </SelectTrigger>
                <SelectContent>
                  {TRAVELER_PROFILES.map(profile => (
                    <SelectItem key={profile.value} value={profile.value}>
                      {profile.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-lg font-semibold">Estilo de viagem</Label>
              <Select
                value={formData.tripStyle}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tripStyle: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar estilo" />
                </SelectTrigger>
                <SelectContent>
                  {TRIP_STYLES.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transporte (só aparece se houver destinos secundários) */}
          {showTransportField && (
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Transporte entre cidades</Label>
              <Select
                value={formData.mainTransport}
                onValueChange={(value) => setFormData(prev => ({ ...prev, mainTransport: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar transporte" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSPORT_OPTIONS.map(transport => (
                    <SelectItem key={transport.value} value={transport.value}>
                      {transport.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Interesses */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">
              Principais interesses (máximo 3)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {INTERESTS.map(interest => (
                <div key={interest.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest.value}
                    checked={formData.mainInterests?.includes(interest.value) || false}
                    onCheckedChange={() => toggleInterest(interest.value)}
                    disabled={(formData.mainInterests?.length || 0) >= 3 && !formData.mainInterests?.includes(interest.value)}
                  />
                  <Label
                    htmlFor={interest.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {interest.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {formData.mainInterests?.length || 0}/3 selecionados
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full text-lg py-6"
            disabled={isLoading}
          >
            {isLoading ? 'A planear a sua viagem...' : '🎯 Planear a Minha Viagem'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}