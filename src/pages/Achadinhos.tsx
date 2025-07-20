import { ShoppingBag, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import { ProductFiltersComponent } from '@/components/achadinhos/ProductFilters';
import { ProductGrid } from '@/components/achadinhos/ProductGrid';
import { ProductModal } from '@/components/achadinhos/ProductModal';
import { useAchadinhos } from '@/hooks/useAchadinhos';

const Achadinhos = () => {
  const {
    products,
    filters,
    updateFilters,
    selectedProduct,
    isModalOpen,
    openProductModal,
    closeProductModal
  } = useAchadinhos();

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Achadinhos</h1>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra produtos incríveis para suas viagens com os melhores preços 
            do mercado. Compare preços entre diferentes plataformas e economize!
          </p>
        </div>

        {/* Filtros */}
        <ProductFiltersComponent
          filters={filters}
          onFiltersChange={updateFilters}
          resultsCount={products.length}
        />

        {/* Grid de Produtos */}
        <ProductGrid
          products={products}
          onProductClick={openProductModal}
        />

        {/* Modal de Detalhes */}
        <ProductModal
          product={selectedProduct}
          open={isModalOpen}
          onClose={closeProductModal}
        />
      </div>
    </Layout>
  );
};

export default Achadinhos;