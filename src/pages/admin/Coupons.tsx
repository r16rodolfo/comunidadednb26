import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Search, MoreHorizontal, ToggleLeft, ToggleRight, Ticket, MousePointerClick, CheckCircle, Clock, Tag } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CreateCouponModal } from "@/components/admin/CreateCouponModal";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { useCoupons } from "@/hooks/useCoupons";
import { Coupon, CouponFilters, CreateCouponData } from "@/types/coupons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";

export default function AdminCoupons() {
  const {
    coupons, categories, loading,
    getCoupons, fetchCategories,
    createCoupon, updateCoupon, deleteCoupon,
    addCategory, updateCategory, toggleCategory, deleteCategory,
    getCouponsCountByCategory,
  } = useCoupons();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [filters, setFilters] = useState<CouponFilters>({
    status: 'all',
    sortBy: 'newest'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    getCoupons(filters);
  }, [filters, getCoupons]);

  const handleCreateCoupon = async (data: CreateCouponData) => {
    await createCoupon(data);
    getCoupons(filters);
  };

  const handleUpdateCoupon = async (data: CreateCouponData) => {
    if (editingCoupon) {
      await updateCoupon({ ...data, id: editingCoupon.id });
      setEditingCoupon(null);
      getCoupons(filters);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    await deleteCoupon(id);
    toast({ title: "Cupom excluído", description: "O cupom foi excluído com sucesso." });
    getCoupons(filters);
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    await updateCoupon({ id: coupon.id, isActive: !coupon.isActive });
    toast({
      title: `Cupom ${!coupon.isActive ? 'ativado' : 'desativado'}`,
      description: `O cupom foi ${!coupon.isActive ? 'ativado' : 'desativado'} com sucesso.`,
    });
    getCoupons(filters);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingCoupon(null);
  };

  const getStatusBadge = (coupon: Coupon) => {
    if (!coupon.isActive) return <Badge variant="secondary">Inativo</Badge>;
    if (coupon.expirationDate && new Date(coupon.expirationDate) < new Date()) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    return <Badge variant="default">Ativo</Badge>;
  };

  const computedStats = {
    total: coupons.length,
    active: coupons.filter(c => c.isActive).length,
    expired: coupons.filter(c => c.expirationDate && new Date(c.expirationDate) < new Date()).length,
    totalClicks: coupons.reduce((sum, c) => sum + c.clickCount, 0)
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader icon={Ticket} title="Gerenciar Cupons" description="Gerencie cupons de parceiros e acompanhe o desempenho">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsCategorySheetOpen(true)}>
              <Tag className="w-4 h-4 mr-2" />
              Categorias
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cupom
            </Button>
          </div>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total de Cupons" value={computedStats.total} icon={Ticket} />
          <StatCard label="Cupons Ativos" value={computedStats.active} icon={CheckCircle} variant="success" />
          <StatCard label="Cupons Expirados" value={computedStats.expired} icon={Clock} variant="warning" />
          <StatCard label="Total de Cliques" value={computedStats.totalClicks} icon={MousePointerClick} variant="info" />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar cupons..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => setFilters({ ...filters, category: value === 'all' ? undefined : value })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, status: value as any })}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lista de Cupons ({coupons.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Oferta</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cliques</TableHead>
                    <TableHead className="w-[50px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 8 }).map((_, i) => (
                          <TableCell key={i}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : coupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Ticket className="h-8 w-8 text-muted-foreground/50" />
                          <p className="text-muted-foreground text-sm">Nenhum cupom encontrado</p>
                          <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            Criar primeiro cupom
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img src={coupon.partnerLogo} alt={coupon.partnerName} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-medium text-sm">{coupon.partnerName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate text-sm">{coupon.offerTitle}</div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-xs font-mono">{coupon.code}</code>
                        </TableCell>
                        <TableCell>
                          {coupon.category ? (
                            <Badge variant="outline" className="text-xs">{coupon.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {coupon.expirationDate ? (
                            format(new Date(coupon.expirationDate), 'dd/MM/yyyy', { locale: ptBR })
                          ) : (
                            <span className="text-muted-foreground text-xs">Sem expiração</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(coupon)}</TableCell>
                        <TableCell className="text-sm font-medium">{coupon.clickCount}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditCoupon(coupon)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(coupon)}>
                                {coupon.isActive ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />}
                                {coupon.isActive ? 'Desativar' : 'Ativar'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCoupon(coupon.id)}>
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <CreateCouponModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          categories={categories}
          onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
          editingCoupon={editingCoupon}
        />

        <CategoryManagement
          open={isCategorySheetOpen}
          onOpenChange={setIsCategorySheetOpen}
          categories={categories}
          onAdd={addCategory}
          onUpdate={updateCategory}
          onToggle={toggleCategory}
          onDelete={deleteCategory}
          getCouponsCount={getCouponsCountByCategory}
        />
      </div>
    </Layout>
  );
}
