import { useState, useMemo } from 'react';
import type { Product, ProductFilters } from '@/types/achadinhos';

// Mock data para demonstração
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Adaptador Universal de Tomada',
    description: 'Adaptador universal para viagens internacionais com USB e carregamento rápido. Compatível com mais de 150 países.',
    image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop',
    price: 89.90,
    originalPrice: 129.90,
    category: 'Viagem',
    discount: 31,
    rating: 4.8,
    reviewCount: 234,
    affiliateLinks: [
      { platform: 'Amazon', url: 'https://amazon.com.br/product1', price: 89.90, availability: 'in-stock' },
      { platform: 'Shopee', url: 'https://shopee.com.br/product1', price: 85.90, availability: 'in-stock' },
      { platform: 'AliExpress', url: 'https://aliexpress.com/product1', price: 79.90, availability: 'limited' }
    ],
    specifications: [
      'Compatível com 150+ países',
      'Portas USB duplas',
      'Carregamento rápido 3.0',
      'Proteção contra sobrecarga'
    ],
    featured: true
  },
  {
    id: '2',
    name: 'Mala de Bordo Premium',
    description: 'Mala de bordo rígida com rodas 360° e sistema de segurança TSA. Design moderno e resistente.',
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop',
    price: 299.90,
    originalPrice: 399.90,
    category: 'Bagagem',
    discount: 25,
    rating: 4.6,
    reviewCount: 156,
    affiliateLinks: [
      { platform: 'Amazon', url: 'https://amazon.com.br/product2', price: 299.90, availability: 'in-stock' },
      { platform: 'Mercado Livre', url: 'https://mercadolivre.com.br/product2', price: 289.90, availability: 'in-stock' }
    ],
    specifications: [
      'Material ABS rígido',
      'Rodas 360° silenciosas',
      'Fechadura TSA',
      'Capacidade 35L'
    ]
  },
  {
    id: '3',
    name: 'Power Bank 20.000mAh',
    description: 'Carregador portátil de alta capacidade com carregamento rápido e múltiplas portas.',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop',
    price: 159.90,
    category: 'Eletrônicos',
    rating: 4.7,
    reviewCount: 89,
    affiliateLinks: [
      { platform: 'Amazon', url: 'https://amazon.com.br/product3', price: 159.90, availability: 'in-stock' },
      { platform: 'Shopee', url: 'https://shopee.com.br/product3', price: 149.90, availability: 'in-stock' }
    ],
    specifications: [
      'Capacidade 20.000mAh',
      'Carregamento rápido PD',
      '3 portas USB',
      'Display LED'
    ]
  }
];

export const useAchadinhos = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: 'Todos',
    sortBy: 'featured'
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = [...mockProducts];

    // Filtro por busca
    if (filters.search) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro por categoria
    if (filters.category && filters.category !== 'Todos') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Filtro por preço
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice!);
    }

    // Ordenação
    switch (filters.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return filtered;
  }, [filters]);

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  return {
    products: filteredProducts,
    filters,
    updateFilters,
    selectedProduct,
    isModalOpen,
    openProductModal,
    closeProductModal
  };
};