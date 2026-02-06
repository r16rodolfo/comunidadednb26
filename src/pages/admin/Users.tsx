import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, UserPlus, MoreHorizontal, Edit, Trash2, Eye, Users as UsersIcon, Activity, Crown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StatCard } from '@/components/shared/StatCard';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { mockAdminUsers } from '@/data/mock-admin';

const getRoleVariant = (role: string) => {
  switch (role) {
    case 'Premium': return 'default' as const;
    case 'Gratuito': return 'outline' as const;
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
  const stats = {
    total: mockAdminUsers.length,
    active: mockAdminUsers.filter(u => u.status === 'Ativo').length,
    premium: mockAdminUsers.filter(u => u.role === 'Premium').length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <AdminPageHeader icon={UsersIcon} title="Gestão de Usuários" description="Gerencie todos os usuários da plataforma">
          <Button><UserPlus className="h-4 w-4 mr-2" />Novo Usuário</Button>
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
                <Input placeholder="Buscar usuários..." className="pl-10" />
              </div>
              <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filtros</Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lista de Usuários ({mockAdminUsers.length})</CardTitle>
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
                  {mockAdminUsers.map((user) => (
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
                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem>
                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
