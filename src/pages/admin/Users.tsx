import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Users as UsersIcon, Activity, Crown, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { StatCard } from '@/components/shared/StatCard';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RealUser {
  id: string;
  name: string;
  role: string;
  createdAt: string;
}

const getRoleVariant = (role: string) => {
  switch (role) {
    case 'premium': return 'default' as const;
    case 'free': return 'outline' as const;
    case 'admin': return 'destructive' as const;
    case 'gestor': return 'secondary' as const;
    default: return 'secondary' as const;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'premium': return 'Premium';
    case 'free': return 'Gratuito';
    case 'admin': return 'Administrador';
    case 'gestor': return 'Gestor';
    default: return role;
  }
};

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingUser, setViewingUser] = useState<RealUser | null>(null);
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = (profiles || []).map(p => p.user_id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));

      return (profiles || []).map(p => ({
        id: p.user_id,
        name: p.name || 'Sem nome',
        role: roleMap.get(p.user_id) || 'free',
        createdAt: p.created_at,
      }));
    },
  });

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    premium: users.filter((u) => u.role === 'premium').length,
    admin: users.filter((u) => u.role === 'admin' || u.role === 'gestor').length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <AdminPageHeader icon={UsersIcon} title="Gestão de Usuários" description="Visualize todos os usuários da plataforma" />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Total de Usuários" value={stats.total} icon={UsersIcon} />
          <StatCard label="Usuários Premium" value={stats.premium} icon={Crown} variant="success" />
          <StatCard label="Administradores" value={stats.admin} icon={Activity} variant="info" />
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="w-[50px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell><Badge variant={getRoleVariant(user.role)}>{getRoleLabel(user.role)}</Badge></TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</TableCell>
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                    <span className="text-muted-foreground">Tipo:</span>
                    <span><Badge variant={getRoleVariant(viewingUser.role)}>{getRoleLabel(viewingUser.role)}</Badge></span>
                    <span className="text-muted-foreground">Cadastro:</span>
                    <span className="font-medium">{new Date(viewingUser.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
