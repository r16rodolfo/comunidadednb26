import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, UserPlus, MoreHorizontal, Edit, Trash2, Eye, Users as UsersIcon, Activity, Crown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { StatCard } from '@/components/shared/StatCard';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { UserModal, AdminUser, UserFormData } from '@/components/admin/UserModal';
import { mockAdminUsers as initialUsers } from '@/data/mock-admin';
import { useToast } from '@/hooks/use-toast';

const getRoleVariant = (role: string) => {
  switch (role) {
    case 'Premium': return 'default' as const;
    case 'Gratuito': return 'outline' as const;
    case 'Admin': return 'destructive' as const;
    case 'Gestor': return 'secondary' as const;
    default: return 'secondary' as const;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Ativo': return 'default' as const;
    case 'Inativo': return 'destructive' as const;
    default: return 'secondary' as const;
  }
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'Ativo').length,
    premium: users.filter((u) => u.role === 'Premium').length,
  };

  const handleCreateOrUpdate = (data: UserFormData) => {
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: data.name, email: data.email, role: data.role, subscription: data.subscription, status: data.isActive ? 'Ativo' : 'Inativo' }
            : u
        )
      );
    } else {
      const newUser: AdminUser = {
        id: String(Date.now()),
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.isActive ? 'Ativo' : 'Inativo',
        lastAccess: new Date().toISOString().split('T')[0],
        subscription: data.subscription,
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!deletingUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    toast({ title: 'Usuário excluído', description: `${deletingUser.name} foi removido da plataforma.` });
    setDeletingUser(null);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <AdminPageHeader icon={UsersIcon} title="Gestão de Usuários" description="Gerencie todos os usuários da plataforma">
          <Button onClick={handleOpenCreate}>
            <UserPlus className="h-4 w-4 mr-2" />Novo Usuário
          </Button>
        </AdminPageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total de Usuários" value={stats.total} icon={UsersIcon} />
          <StatCard label="Usuários Ativos" value={stats.active} icon={Activity} variant="success" />
          <StatCard label="Usuários Premium" value={stats.premium} icon={Crown} variant="info" />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filtros</Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lista de Usuários ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Assinatura</TableHead>
                    <TableHead className="w-[50px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge variant={getRoleVariant(user.role)}>{user.role}</Badge></TableCell>
                      <TableCell><Badge variant={getStatusVariant(user.status)}>{user.status}</Badge></TableCell>
                      <TableCell>{user.lastAccess}</TableCell>
                      <TableCell>{user.subscription}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setViewingUser(user)}>
                              <Eye className="mr-2 h-4 w-4" />Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit className="mr-2 h-4 w-4" />Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeletingUser(user)}>
                              <Trash2 className="mr-2 h-4 w-4" />Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        onSubmit={handleCreateOrUpdate}
        editingUser={editingUser}
      />

      {/* View Dialog */}
      <AlertDialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Detalhes do Usuário</AlertDialogTitle>
            <AlertDialogDescription asChild>
              {viewingUser && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium">{viewingUser.name}</span>
                    <span className="text-muted-foreground">E-mail:</span>
                    <span className="font-medium">{viewingUser.email}</span>
                    <span className="text-muted-foreground">Tipo:</span>
                    <span><Badge variant={getRoleVariant(viewingUser.role)}>{viewingUser.role}</Badge></span>
                    <span className="text-muted-foreground">Status:</span>
                    <span><Badge variant={getStatusVariant(viewingUser.status)}>{viewingUser.status}</Badge></span>
                    <span className="text-muted-foreground">Último acesso:</span>
                    <span className="font-medium">{viewingUser.lastAccess}</span>
                    <span className="text-muted-foreground">Assinatura:</span>
                    <span className="font-medium">{viewingUser.subscription}</span>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (viewingUser) { handleEdit(viewingUser); setViewingUser(null); } }}>
              Editar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deletingUser?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
