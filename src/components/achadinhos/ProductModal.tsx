import { ExternalLink, Star, ShoppingBag, Check, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/types/achadinhos';

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export const ProductModal = ({ product, open, onClose }: ProductModalProps) => {
  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Amazon': return 'bg-orange-500 hover:bg-orange-600';
      case 'Shopee': return 'bg-red-500 hover:bg-red-600';
      case 'AliExpress': return 'bg-blue-500 hover:bg-blue-600';
      case 'Mercado Livre': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      default: return 'bg-primary hover:bg-primary/90';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'in-stock':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'limited':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'out-of-stock':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'in-stock': return 'Em estoque';
      case 'limited': return 'Estoque limitado';
      case 'out-of-stock': return 'Fora de estoque';
    }
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Imagem do Produto */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-80 object-cover rounded-lg"
              />
              {product.featured && (
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                  Destaque
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
                  -{product.discount}%
                </Badge>
              )}
            </div>

            {/* Avaliações */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">
                  ({product.reviewCount} avaliações)
                </span>
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            {/* Categoria e Preço */}
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.category}
              </Badge>
              
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice!)}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                * Preços podem variar entre as plataformas
              </p>
            </div>

            <Separator />

            {/* Descrição */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Descrição</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Especificações */}
            {product.specifications && product.specifications.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Especificações</h3>
                <ul className="space-y-2">
                  {product.specifications.map((spec, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            {/* Links de Afiliados */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Onde Comprar
              </h3>
              
              <div className="space-y-3">
                {product.affiliateLinks.map((link, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getAvailabilityIcon(link.availability)}
                            <span className="font-medium">{link.platform}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {getAvailabilityText(link.availability)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">
                            {formatPrice(link.price)}
                          </span>
                          
                          <Button
                            size="sm"
                            className={`${getPlatformColor(link.platform)} text-white`}
                            onClick={() => window.open(link.url, '_blank')}
                            disabled={link.availability === 'out-of-stock'}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Comprar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground mt-4 text-center">
                * Ao clicar em "Comprar", você será redirecionado para o site da loja.
                Os preços podem variar e estão sujeitos a alterações.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};