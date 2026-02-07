import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Pencil, RotateCcw, Crown, Check } from 'lucide-react';
import { SubscriptionPlan, formatPrice, formatMonthlyEquivalent } from '@/data/mock-plans';
import { usePlans } from '@/hooks/usePlans';

export function PlanManagementCard() {
  const { plans, updatePlan, togglePlanActive, resetToDefaults } = usePlans();
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editFeatures, setEditFeatures] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setEditPrice((plan.priceCents / 100).toFixed(2).replace('.', ','));
    setEditFeatures(plan.features.join('\n'));
    setEditDescription(plan.description);
  };

  const handleSave = () => {
    if (!editingPlan) return;

    const priceValue = parseFloat(editPrice.replace(',', '.'));
    if (isNaN(priceValue) || priceValue < 0) return;

    const features = editFeatures
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    updatePlan(editingPlan.id, {
      priceCents: Math.round(priceValue * 100),
      features,
      description: editDescription,
    });

    setEditingPlan(null);
  };

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case 'free': return 'Gratuito';
      case 'monthly': return 'Mensal';
      case 'quarterly': return 'Trimestral';
      case 'semiannual': return 'Semestral';
      case 'yearly': return 'Anual';
      default: return interval;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Gestão de Planos
              </CardTitle>
              <CardDescription>Configure preços, features e status dos planos de assinatura</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar Padrão
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  plan.isActive ? 'bg-card' : 'bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="min-w-[100px]">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{plan.name}</p>
                      {plan.popular && (
                        <Badge variant="default" className="text-xs">Popular</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {getIntervalLabel(plan.interval)}
                    </Badge>
                  </div>

                  <Separator orientation="vertical" className="h-10" />

                  <div className="min-w-[120px]">
                    <p className="text-lg font-bold">{formatPrice(plan.priceCents)}</p>
                    {plan.interval !== 'free' && plan.interval !== 'monthly' && (
                      <p className="text-xs text-muted-foreground">
                        ≈ {formatMonthlyEquivalent(plan)}/mês
                      </p>
                    )}
                  </div>

                  <Separator orientation="vertical" className="h-10" />

                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.features.length} features
                      {plan.savingsPercent ? ` • ${plan.savingsPercent}% de economia` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {plan.interval !== 'free' && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${plan.id}`} className="text-xs text-muted-foreground">
                        Ativo
                      </Label>
                      <Switch
                        id={`active-${plan.id}`}
                        checked={plan.isActive}
                        onCheckedChange={() => togglePlanActive(plan.id)}
                      />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(plan)}
                    disabled={plan.interval === 'free'}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Plan Modal */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Plano: {editingPlan?.name}</DialogTitle>
            <DialogDescription>
              Altere o preço, descrição e features deste plano
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Preço (R$)</Label>
              <Input
                id="edit-price"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="0,00"
              />
              {editingPlan && editingPlan.interval !== 'monthly' && (
                <p className="text-xs text-muted-foreground">
                  Equivalente mensal: R$ {(
                    parseFloat(editPrice.replace(',', '.')) / 
                    (editingPlan.interval === 'quarterly' ? 3 : 
                     editingPlan.interval === 'semiannual' ? 6 : 12)
                  ).toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descrição curta do plano"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-features">Features (uma por linha)</Label>
              <Textarea
                id="edit-features"
                value={editFeatures}
                onChange={(e) => setEditFeatures(e.target.value)}
                rows={6}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              />
            </div>

            {editingPlan && (
              <div className="rounded-lg border p-3 bg-muted/50">
                <p className="text-xs font-medium mb-2">Preview:</p>
                <ul className="space-y-1">
                  {editFeatures.split('\n').filter(f => f.trim()).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-success" />
                      {feature.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlan(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
