import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, MoreHorizontal, Eye, Users as UsersIcon, Crown, Loader2, UserPlus, ShieldCheck, Pencil, Trash2, Mail, Phone, CreditCard, Calendar, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EnrichedUser {
  id: string;
  name: string;
  email: string | null;
  cellphone: string | null;
  cpf: string | null;
  avatar_url: string | null;
  role: string;
  effectiveRole: string;
  subscribed: boolean;
  currentPlanSlug: string | null;
  subscriptionEnd: string | null;
  cancelAtPeriodEnd: boolean;
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

function getEffectiveRole(role: string, subscribed?: boolean): string {
  if (subscribed) return 'premium';
  return role;
}

function maskCpf(cpf: string | null): string {
  if (!cpf) return '—';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return '***.***.***-**';
  return `${digits.slice(0, 3)}.***.***.${digits.slice(9, 11)}`;
}

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('all');
  const [viewingUser, setViewingUser] = useState<EnrichedUser | null>(null);
  const [editingUser, setEditingUser] = useState<EnrichedUser | null>(null);
  const [editRole, setEditRole] = useState('free');
  const [deletingUser, setDeletingUser] = useState<EnrichedUser | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'free' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const [profilesRes, rolesRes, subsRes] = await Promise.all([
        supabase.from('profiles').select('user_id, name, cellphone, cpf, avatar_url, created_at').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('subscribers_safe').select('user_id, email, subscribed, current_plan_slug, subscription_end, cancel_at_period_end'),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      const roleMap = new Map((rolesRes.data || []).map(r => [r.user_id, r.role]));
      const subMap = new Map((subsRes.data || []).map(s => [s.user_id!, s]));

      // Email comes from subscribers_safe or profile (cast since column not yet in generated types)

      return (profilesRes.data || []).map(p => {
        const role = roleMap.get(p.user_id) || 'free';
        const sub = subMap.get(p.user_id);
        return {
          id: p.user_id,
          name: p.name || 'Sem nome',
          email: (p as any).email || sub?.email || null,
          cellphone: p.cellphone,
          cpf: p.cpf,
          avatar_url: p.avatar_url,
          role,
          effectiveRole: getEffectiveRole(role, sub?.subscribed ?? false),
          subscribed: sub?.subscribed ?? false,
          currentPlanSlug: sub?.current_plan_slug ?? null,
          subscriptionEnd: sub?.subscription_end ?? null,
          cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
          createdAt: p.created_at,
        } as EnrichedUser;
      });
    },
  });

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = roleFilter === 'all' || u.effectiveRole === roleFilter;
      const matchesSub =
        subFilter === 'all' ||
        (subFilter === 'active' && u.subscribed) ||
        (subFilter === 'inactive' && !u.subscribed);
      return matchesSearch && matchesRole && matchesSub;
    });
  }, [users, searchQuery, roleFilter, subFilter]);

  const stats = {
    total: users.length,
    premium: users.filter(u => u.subscribed || u.effectiveRole === 'premium').length,
    admin: users.filter(u => u.role === 'admin' || u.role === 'gestor').length,
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    if (newUser.password.length < 6) {
      toast({ title: 'A senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', { body: newUser });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: 'Usuário criado com sucesso!' });
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'free' });
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
    } catch (err: any) {
      toast({ title: 'Erro ao criar usuário', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-user', {
        body: { action: 'update_role', user_id: editingUser.id, role: editRole },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: 'Cargo atualizado com sucesso!' });
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar cargo', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-user', {
        body: { action: 'delete_user', user_id: deletingUser.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: 'Usuário excluído com sucesso!' });
      setDeletingUser(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
    } catch (err: any) {
      toast({ title: 'Erro ao excluir usuário', description: err.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const openEditRole = (user: EnrichedUser) => {
    setEditRole(user.role);
    setEditingUser(user);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader icon={UsersIcon} title="Gestão de Usuários" description="Gerencie todos os usuários da plataforma" />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Total de Usuários" value={stats.total} icon={UsersIcon} />
          <StatCard label="Assinantes Ativos" value={stats.premium} icon={Crown} variant="success" />
          <StatCard label="Gestores / Admins" value={stats.admin} icon={ShieldCheck} variant="info" />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou e-mail..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cargos</SelectItem>
                  <SelectItem value="free">Gratuito</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subFilter} onValueChange={setSubFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Assinatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowCreateModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />Adicionar
              </Button>
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
                      <TableHead>Usuário</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Assinatura</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="w-[50px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium truncate max-w-[150px]">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">{user.email || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleVariant(user.effectiveRole)}>{getRoleLabel(user.effectiveRole)}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.subscribed ? (
                            <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">Ativo</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</TableCell>
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
                              <DropdownMenuItem onClick={() => openEditRole(user)}>
                                <Pencil className="mr-2 h-4 w-4" />Editar Cargo
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeletingUser(user)}>
                                <Trash2 className="mr-2 h-4 w-4" />Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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

      {/* View User Detail Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={viewingUser.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">{viewingUser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{viewingUser.name}</p>
                  <Badge variant={getRoleVariant(viewingUser.effectiveRole)}>{getRoleLabel(viewingUser.effectiveRole)}</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">E-mail:</span>
                  <span className="font-medium">{viewingUser.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Telefone:</span>
                  <span className="font-medium">{viewingUser.cellphone || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">CPF:</span>
                  <span className="font-medium">{maskCpf(viewingUser.cpf)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cadastro:</span>
                  <span className="font-medium">{new Date(viewingUser.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-semibold">Assinatura</p>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {viewingUser.subscribed ? (
                      <Badge variant="default" className="bg-success text-success-foreground">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </div>
                  {viewingUser.currentPlanSlug && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plano:</span>
                      <span className="font-medium capitalize">{viewingUser.currentPlanSlug}</span>
                    </div>
                  )}
                  {viewingUser.subscriptionEnd && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validade:</span>
                      <span className="font-medium">{new Date(viewingUser.subscriptionEnd).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {viewingUser.cancelAtPeriodEnd && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cancelamento:</span>
                      <Badge variant="outline" className="text-warning border-warning">Agendado</Badge>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cargo estático:</span>
                <Badge variant={getRoleVariant(viewingUser.role)}>{getRoleLabel(viewingUser.role)}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingUser(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Cargo</DialogTitle>
            <DialogDescription>Altere o cargo de <strong>{editingUser?.name}</strong>.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Novo cargo</Label>
            <Select value={editRole} onValueChange={setEditRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Gratuito</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="gestor">Gestor</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
            <Button onClick={handleUpdateRole} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deletingUser?.name}</strong>? Esta ação é irreversível e removerá todos os dados do usuário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Usuário</DialogTitle>
            <DialogDescription>Crie uma nova conta de usuário na plataforma.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nome *</Label>
              <Input id="create-name" placeholder="Nome completo" value={newUser.name} onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">E-mail *</Label>
              <Input id="create-email" type="email" placeholder="email@exemplo.com" value={newUser.email} onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Senha *</Label>
              <Input id="create-password" type="password" placeholder="Mínimo 6 caracteres" value={newUser.password} onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Tipo de Acesso</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser(prev => ({ ...prev, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratuito</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateUser} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
