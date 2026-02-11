import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, TrendingUp, TrendingDown, AlertTriangle, Clock, Video, ImageIcon } from 'lucide-react';
import { MarketAnalysis } from '@/types/dnb';
import { useToast } from '@/hooks/use-toast';

interface CreateAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (analysis: MarketAnalysis) => void;
  editingAnalysis?: MarketAnalysis | null;
}

const recommendationOptions = [
  { value: 'ideal', label: 'Momento Ideal', icon: TrendingUp, color: 'bg-success/10 text-success' },
  { value: 'alert', label: 'Momento de Alerta', icon: AlertTriangle, color: 'bg-warning/10 text-warning' },
  { value: 'not-ideal', label: 'Momento Não Ideal', icon: TrendingDown, color: 'bg-destructive/10 text-destructive' },
  { value: 'wait', label: 'Momento de Aguardar', icon: Clock, color: 'bg-info/10 text-info' },
] as const;

const defaultForm = {
  date: new Date().toISOString().split('T')[0],
  recommendation: '' as string,
  dollarPrice: '',
  dollarVariation: '',
  euroPrice: '',
  euroVariation: '',
  summary: '',
  fullAnalysis: '',
  videoUrl: '',
  imageUrl: '',
};

export function CreateAnalysisModal({ open, onOpenChange, onSave, editingAnalysis }: CreateAnalysisModalProps) {
  const { toast } = useToast();
  const isEditing = !!editingAnalysis;

  const [form, setForm] = useState(defaultForm);
  const [supports, setSupports] = useState<string[]>(['']);
  const [resistances, setResistances] = useState<string[]>(['']);

  // Correctly reset form when modal opens / editingAnalysis changes
  useEffect(() => {
    if (open && editingAnalysis) {
      setForm({
        date: editingAnalysis.date,
        recommendation: editingAnalysis.recommendation,
        dollarPrice: editingAnalysis.dollarPrice.toString(),
        dollarVariation: editingAnalysis.dollarVariation.toString(),
        euroPrice: editingAnalysis.euroPrice.toString(),
        euroVariation: editingAnalysis.euroVariation.toString(),
        summary: editingAnalysis.summary,
        fullAnalysis: editingAnalysis.fullAnalysis,
        videoUrl: editingAnalysis.videoUrl || '',
        imageUrl: editingAnalysis.imageUrl || '',
      });
      setSupports(editingAnalysis.supports.length > 0 ? editingAnalysis.supports.map(String) : ['']);
      setResistances(editingAnalysis.resistances.length > 0 ? editingAnalysis.resistances.map(String) : ['']);
    } else if (open && !editingAnalysis) {
      setForm({ ...defaultForm, date: new Date().toISOString().split('T')[0] });
      setSupports(['']);
      setResistances(['']);
    }
  }, [open, editingAnalysis]);

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addLevel = (type: 'supports' | 'resistances') => {
    if (type === 'supports') setSupports(prev => [...prev, '']);
    else setResistances(prev => [...prev, '']);
  };

  const removeLevel = (type: 'supports' | 'resistances', index: number) => {
    if (type === 'supports') setSupports(prev => prev.filter((_, i) => i !== index));
    else setResistances(prev => prev.filter((_, i) => i !== index));
  };

  const updateLevel = (type: 'supports' | 'resistances', index: number, value: string) => {
    if (type === 'supports') {
      setSupports(prev => prev.map((v, i) => i === index ? value : v));
    } else {
      setResistances(prev => prev.map((v, i) => i === index ? value : v));
    }
  };

  const hasData = form.summary || form.dollarPrice || form.euroPrice || form.fullAnalysis;

  const handleClose = () => {
    if (hasData && !isEditing) {
      if (!confirm('Tem certeza que deseja sair? Os dados preenchidos serão perdidos.')) return;
    }
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!form.date || !form.recommendation || !form.dollarPrice || !form.euroPrice || !form.summary || !form.fullAnalysis) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const analysis: MarketAnalysis = {
      id: editingAnalysis?.id || crypto.randomUUID(),
      date: form.date,
      recommendation: form.recommendation as MarketAnalysis['recommendation'],
      dollarPrice: parseFloat(form.dollarPrice),
      dollarVariation: parseFloat(form.dollarVariation || '0'),
      euroPrice: parseFloat(form.euroPrice),
      euroVariation: parseFloat(form.euroVariation || '0'),
      summary: form.summary,
      fullAnalysis: form.fullAnalysis,
      videoUrl: form.videoUrl || undefined,
      imageUrl: form.imageUrl || undefined,
      supports: supports.filter(s => s).map(Number),
      resistances: resistances.filter(r => r).map(Number),
    };

    onSave(analysis);
    toast({ title: isEditing ? 'Análise atualizada!' : 'Análise criada!' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(v); }}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Análise' : 'Nova Análise de Mercado'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize os dados da análise.' : 'Cadastre uma nova análise diária do mercado cambial.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Date + Recommendation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={e => updateField('date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Recomendação *</Label>
              <Select value={form.recommendation} onValueChange={v => updateField('recommendation', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {recommendationOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="h-3.5 w-3.5" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Prices */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Cotações</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dollarPrice">USD/BRL (R$) *</Label>
                <Input id="dollarPrice" type="number" step="0.01" placeholder="5.59" value={form.dollarPrice} onChange={e => updateField('dollarPrice', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dollarVariation">Variação USD (%)</Label>
                <Input id="dollarVariation" type="number" step="0.01" placeholder="-0.35" value={form.dollarVariation} onChange={e => updateField('dollarVariation', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="euroPrice">EUR/BRL (R$) *</Label>
                <Input id="euroPrice" type="number" step="0.01" placeholder="6.44" value={form.euroPrice} onChange={e => updateField('euroPrice', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="euroVariation">Variação EUR (%)</Label>
                <Input id="euroVariation" type="number" step="0.01" placeholder="-0.67" value={form.euroVariation} onChange={e => updateField('euroVariation', e.target.value)} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Analysis Text */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="summary">Resumo *</Label>
              <Input id="summary" placeholder="Dólar em baixa mas cenário lateral mantido" value={form.summary} onChange={e => updateField('summary', e.target.value)} />
              <p className="text-xs text-muted-foreground">Uma frase curta que aparece no card do feed.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullAnalysis">Análise Completa *</Label>
              <Textarea id="fullAnalysis" rows={5} placeholder="O dólar fechou em baixa de -0,35% nessa quinta..." value={form.fullAnalysis} onChange={e => updateField('fullAnalysis', e.target.value)} />
            </div>
          </div>

          <Separator />

          {/* Technical Levels */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5"><TrendingDown className="h-3.5 w-3.5 text-primary" />Suportes</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => addLevel('supports')} className="h-7 text-xs gap-1"><Plus className="h-3 w-3" /> Adicionar</Button>
              </div>
              {supports.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input type="number" step="0.01" placeholder="R$ 5.50" value={val} onChange={e => updateLevel('supports', i, e.target.value)} className="h-8 text-sm" />
                  {supports.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeLevel('supports', i)} className="h-8 w-8 p-0 shrink-0"><X className="h-3 w-3" /></Button>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-destructive" />Resistências</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => addLevel('resistances')} className="h-7 text-xs gap-1"><Plus className="h-3 w-3" /> Adicionar</Button>
              </div>
              {resistances.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input type="number" step="0.01" placeholder="R$ 5.63" value={val} onChange={e => updateLevel('resistances', i, e.target.value)} className="h-8 text-sm" />
                  {resistances.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeLevel('resistances', i)} className="h-8 w-8 p-0 shrink-0"><X className="h-3 w-3" /></Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Media */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              Mídias
              <Badge variant="outline" className="text-xs font-normal">Opcional</Badge>
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Cole o GUID do vídeo Bunny ou uma URL externa. Para imagens, cole a URL do CDN.
            </p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="videoUrl" className="flex items-center gap-1.5 text-sm"><Video className="h-3.5 w-3.5" /> URL / GUID do Vídeo</Label>
                <Input id="videoUrl" placeholder="GUID do Bunny ou URL externa" value={form.videoUrl} onChange={e => updateField('videoUrl', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="flex items-center gap-1.5 text-sm"><ImageIcon className="h-3.5 w-3.5" /> URL da Imagem/Gráfico</Label>
                <Input id="imageUrl" placeholder="https://..." value={form.imageUrl} onChange={e => updateField('imageUrl', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">Cancelar</Button>
            <Button onClick={handleSubmit} className="flex-1">
              {isEditing ? 'Salvar Alterações' : 'Publicar Análise'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
