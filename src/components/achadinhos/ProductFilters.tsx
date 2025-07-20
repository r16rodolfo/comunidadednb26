import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ProductFilters } from '@/types/achadinhos';
import { CATEGORIES } from '@/types/achadinhos';

interface ProductFiltersComponentProps {
  filters: ProductFilters;
  onFiltersChange: (filters: Partial<ProductFilters>) => void;
  resultsCount: number;
}

export const ProductFiltersComponent = ({ filters, onFiltersChange, resultsCount }: ProductFiltersComponentProps) => {
  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
        <span className="text-sm text-muted-foreground ml-auto">
          {resultsCount} produto{resultsCount !== 1 ? 's' : ''} encontrado{resultsCount !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar produtos..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Categoria */}
        <Select value={filters.category} onValueChange={(value) => onFiltersChange({ category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ordenação */}
        <Select value={filters.sortBy} onValueChange={(value: any) => onFiltersChange({ sortBy: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Destaques</SelectItem>
            <SelectItem value="name">Nome A-Z</SelectItem>
            <SelectItem value="price-low">Menor preço</SelectItem>
            <SelectItem value="price-high">Maior preço</SelectItem>
            <SelectItem value="rating">Melhor avaliados</SelectItem>
          </SelectContent>
        </Select>

        {/* Limpar filtros */}
        <Button 
          variant="outline" 
          onClick={() => onFiltersChange({ search: '', category: 'Todos', sortBy: 'featured' })}
          className="w-full"
        >
          Limpar Filtros
        </Button>
      </div>
    </Card>
  );
};