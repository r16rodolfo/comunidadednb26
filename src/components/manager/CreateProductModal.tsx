import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Link, Image, DollarSign } from 'lucide-react';

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductModal({ open, onOpenChange }: CreateProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    partnerName: '',
    commissionRate: '',
    affiliateLink: '',
    imageUrl: '',
    features: [] as string[],
    isActive: true,
    isFeatured: false
  });

  const [newFeature, setNewFeature] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the data to your backend
    toast({
      title: 'Produto criado com sucesso!',
      description: `O produto "${formData.name}" foi adicionado aos Achadinhos.`
    });
    
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      originalPrice: '',
      partnerName: '',
      commissionRate: '',
      affiliateLink: '',
      imageUrl: '',
      features: [],
      isActive: true,
      isFeatured: false
    });
    setNewFeature('');
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Criar Novo Produto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Cartão Pré-pago Internacional"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cartoes">Cartões</SelectItem>
                      <SelectItem value="seguros">Seguros</SelectItem>
                      <SelectItem value="cambio">Câmbio</SelectItem>
                      <SelectItem value="hospedagem">Hospedagem</SelectItem>
                      <SelectItem value="transporte">Transporte</SelectItem>
                      <SelectItem value="apps">Apps e Serviços</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva os benefícios e características do produto..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <div className="flex gap-2">
                  <Image className="h-9 w-9 text-muted-foreground flex-shrink-0 mt-1" />
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing and Partner */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Preços e Parceria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Preço Promocional</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="R$ 29,90"
                  />
                </div>

                <div>
                  <Label htmlFor="originalPrice">Preço Original</Label>
                  <Input
                    id="originalPrice"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                    placeholder="R$ 49,90"
                  />
                </div>

                <div>
                  <Label htmlFor="commissionRate">Taxa de Comissão (%)</Label>
                  <Input
                    id="commissionRate"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: e.target.value }))}
                    placeholder="15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="partnerName">Nome do Parceiro</Label>
                  <Input
                    id="partnerName"
                    value={formData.partnerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, partnerName: e.target.value }))}
                    placeholder="Ex: Banco XYZ"
                  />
                </div>

                <div>
                  <Label htmlFor="affiliateLink">Link de Afiliado</Label>
                  <div className="flex gap-2">
                    <Link className="h-9 w-9 text-muted-foreground flex-shrink-0 mt-1" />
                    <Input
                      id="affiliateLink"
                      value={formData.affiliateLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, affiliateLink: e.target.value }))}
                      placeholder="https://parceiro.com/produto?ref=dnb"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Características</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Ex: Sem taxa de IOF"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature}>
                  Adicionar
                </Button>
              </div>

              {formData.features.length > 0 && (
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Produto Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      O produto aparecerá nos Achadinhos
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Produto Destacado</Label>
                    <p className="text-sm text-muted-foreground">
                      Aparecerá em posição de destaque
                    </p>
                  </div>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Produto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}