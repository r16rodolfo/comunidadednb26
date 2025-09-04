import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import { CouponFilters as Filters, CouponCategory } from "@/types/coupons";

interface CouponFiltersProps {
  filters: Filters;
  categories: CouponCategory[];
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
  totalResults: number;
}

export const CouponFilters = ({ 
  filters, 
  categories, 
  onFiltersChange, 
  onClearFilters,
  totalResults 
}: CouponFiltersProps) => {
  const hasActiveFilters = filters.category || filters.search || filters.status !== 'all';

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      category: value === 'all' ? undefined : value 
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      status: value as 'active' | 'inactive' | 'all'
    });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      sortBy: value as 'newest' | 'expiring' | 'partner' | 'clicks'
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por parceiro ou oferta..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="shrink-0"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.filter(cat => cat.isActive).map(category => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortBy || 'newest'} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mais recentes</SelectItem>
            <SelectItem value="expiring">Expira em breve</SelectItem>
            <SelectItem value="partner">Nome do parceiro</SelectItem>
            <SelectItem value="clicks">Mais populares</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters and Results */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.category && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Filter className="w-3 h-3" />
            {filters.category}
            <button 
              onClick={() => handleCategoryChange('all')}
              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
        
        {filters.search && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Search className="w-3 h-3" />
            "{filters.search}"
            <button 
              onClick={() => handleSearchChange('')}
              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        <span className="text-sm text-muted-foreground ml-auto">
          {totalResults} {totalResults === 1 ? 'cupom encontrado' : 'cupons encontrados'}
        </span>
      </div>
    </div>
  );
};