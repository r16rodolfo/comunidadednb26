
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlans, getPlanDisplayName } from '@/hooks/usePlans';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/auth';
import { getRoleFullLabel, getRoleBadgeVariant } from '@/lib/roles';
import { User, Settings, CreditCard, Shield, ExternalLink, Loader2, Phone, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { subscription, isLoading: isSubLoading, isPortalLoading, openCustomerPortal } = useSubscription();
  const { plans } = usePlans();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    cpf: '',
    cellphone: '',
  });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load CPF/cellphone from profiles table
  useEffect(() => {
    if (user?.id) {
      supabase.from('profiles').select('cpf, cellphone').eq('user_id', user.id).maybeSingle().then(({ data }) => {
        if (data) {
          setProfileData(prev => ({ ...prev, cpf: data.cpf || '', cellphone: data.cellphone || '' }));
        }
        setProfileLoaded(true);
      });
    }
  }, [user?.id]);

  const isValidCPF = (cpf: string): boolean => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(digits[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    return remainder === parseInt(digits[10]);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (profileData.cpf && !isValidCPF(profileData.cpf)) {
      toast({ title: 'CPF inválido', description: 'Verifique o número do CPF informado.', variant: 'destructive' });
      return;
    }

    if (profileData.cellphone && profileData.cellphone.replace(/\D/g, '').length < 10) {
      toast({ title: 'Telefone inválido', description: 'Informe um telefone com DDD.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      await updateProfile(profileData);
      toast({ title: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: 'Tente novamente mais tarde',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter no mínimo 6 caracteres',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({ title: 'Senha alterada com sucesso!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Tente novamente mais tarde';
      toast({
        title: 'Erro ao alterar senha',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-full flex items-center justify-center shrink-0">
            <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {getRoleFullLabel(user.role)}
              </Badge>
              {subscription?.subscribed && (
                <Badge variant="secondary">Ativo</Badge>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
              <Shield className="h-4 w-4" />
              <span>Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
              <CreditCard className="h-4 w-4" />
              <span>Assinatura</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
              <Settings className="h-4 w-4" />
              <span>Preferências</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={profileData.cpf}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                          setProfileData(prev => ({ ...prev, cpf: digits }));
                        }}
                        placeholder="00000000000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cellphone">Telefone</Label>
                      <Input
                        id="cellphone"
                        value={profileData.cellphone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                          setProfileData(prev => ({ ...prev, cellphone: digits }));
                        }}
                        placeholder="11999999999"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Gestão da Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : subscription.subscribed ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Plano Atual</p>
                        <p className="text-lg font-semibold">{getPlanDisplayName(subscription.current_plan_slug, plans)}</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={subscription.cancel_at_period_end ? 'secondary' : 'default'}>
                          {subscription.cancel_at_period_end ? 'Cancela ao fim do período' : 'Ativo'}
                        </Badge>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Renovação</p>
                        <p className="text-lg font-semibold">
                          {subscription.subscription_end
                            ? new Date(subscription.subscription_end).toLocaleDateString('pt-BR')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {subscription.pending_downgrade_to && (
                      <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                        Downgrade agendado para <strong>{subscription.pending_downgrade_to}</strong> em{' '}
                        {subscription.pending_downgrade_date
                          ? new Date(subscription.pending_downgrade_date).toLocaleDateString('pt-BR')
                          : ''}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={openCustomerPortal}
                      disabled={isPortalLoading}
                    >
                      {isPortalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                      Gerenciar Assinatura
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Nenhuma assinatura ativa</p>
                    <Button variant="hero" size="lg" onClick={() => navigate('/subscription')}>
                      Assinar Plano Premium
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificações</p>
                      <p className="text-sm text-muted-foreground">Receber notificações por email</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {user.preferences.notifications ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Tema</p>
                      <p className="text-sm text-muted-foreground">Aparência da plataforma</p>
                    </div>
                    <Button variant="outline" size="sm" className="capitalize">
                      {user.preferences.theme}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Idioma</p>
                      <p className="text-sm text-muted-foreground">Idioma da interface</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Português (BR)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
