import { ShoppingBag, Sparkles, Users, Star, Shield } from 'lucide-react';
import { ProductFiltersComponent } from '@/components/achadinhos/ProductFilters';
import { ProductGrid } from '@/components/achadinhos/ProductGrid';
import { ProductModal } from '@/components/achadinhos/ProductModal';
import { useAchadinhos } from '@/hooks/useAchadinhos';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const AchadinhosPub = () => {
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
    <div className="min-h-screen bg-background">
      {/* Header Público */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">DNB Achadinhos</h1>
                <p className="text-sm text-muted-foreground">Produtos selecionados para viajantes</p>
              </div>
            </div>
            <Button>Acessar Plataforma</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h2 className="text-4xl font-bold text-foreground">
              Produtos Essenciais para Viagem
            </h2>
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Descubra produtos cuidadosamente selecionados pela nossa comunidade de viajantes. 
            Compare preços, leia avaliações e encontre os melhores deals para sua próxima aventura.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-lg mb-1">5.000+</h3>
                <p className="text-muted-foreground">Viajantes confiam</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-lg mb-1">4.8/5</h3>
                <p className="text-muted-foreground">Avaliação média</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-lg mb-1">100%</h3>
                <p className="text-muted-foreground">Links verificados</p>
              </CardContent>
            </Card>
          </div>
        </section>

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

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">DNB Achadinhos</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Produtos selecionados por viajantes, para viajantes
            </p>
            <Button variant="outline">
              Faça parte da comunidade DNB
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AchadinhosPub;