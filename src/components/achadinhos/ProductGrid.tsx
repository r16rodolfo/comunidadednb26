import { Star, ShoppingBag, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/achadinhos';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-muted-foreground">
          Tente ajustar os filtros para encontrar o que você procura.
        </p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getLowestPrice = (product: Product) => {
    const prices = product.affiliateLinks.map(link => link.price);
    return Math.min(product.price, ...prices);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const lowestPrice = getLowestPrice(product);
        const hasDiscount = product.originalPrice && product.originalPrice > product.price;
        
        return (
          <Card 
            key={product.id} 
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            onClick={() => onProductClick(product)}
          >
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
                {product.rating && (
                  <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="mb-2">
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                      {formatPrice(lowestPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.originalPrice!)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <span>a partir de</span>
                  </div>
                </div>
                
                <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                  Ver Mais
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};