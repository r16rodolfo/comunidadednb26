import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { CreditCard, AlertTriangle, UserMinus, Users, Loader2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

interface SubscriberRow {
  id: string;
  email: string;
  subscribed: boolean;
  current_plan_slug: string | null;
  subscription_end: string | null;
  cancel_at_period_end: boolean;
  pending_downgrade_to: string | null;
  pending_downgrade_date: string | null;
  stripe_subscription_id: string | null;
  updated_at: string;
  user_id: string;
  profile_name?: string;
}

type BillingStatus = 'active' | 'grace' | 'downgraded' | 'cancelling';

function getStatus(sub: SubscriberRow): BillingStatus {
  if (!sub.subscribed && sub.current_plan_slug) return 'downgraded';
  if (sub.cancel_at_period_end) return 'cancelling';
  if (sub.subscription_end) {
    const end = new Date(sub.subscription_end);
    if (end < new Date()) return 'grace';
  }
  if (sub.subscribed) return 'active';
  return 'downgraded';
}

const STATUS_CONFIG: Record<BillingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Ativo', variant: 'default' },
  grace: { label: 'Em Carência', variant: 'secondary' },
  cancelling: { label: 'Cancelando', variant: 'outline' },
  downgraded: { label: 'Downgrade', variant: 'destructive' },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function getPlanLabel(slug: string | null) {
  if (!slug) return 'Gratuito';
  const map: Record<string, string> = {
    mensal: 'Mensal',
    trimestral: 'Trimestral',
    semestral: 'Semestral',
    anual: 'Anual',
  };
  return map[slug] || slug;
}

function getGateway(sub: SubscriberRow) {
  return sub.stripe_subscription_id ? 'Stripe' : '—';
}

export function BillingTab() {
  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['admin-billing-subscribers'],
    queryFn: async () => {
      const { data: subs, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!subs || subs.length === 0) return [];

      const userIds = subs.map(s => s.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      const nameMap = new Map((profiles || []).map(p => [p.user_id, p.name]));

      return subs.map(s => ({
        ...s,
        profile_name: nameMap.get(s.user_id) || 'Sem nome',
      })) as SubscriberRow[];
    },
  });

  const stats = {
    active: subscribers.filter(s => getStatus(s) === 'active').length,
    grace: subscribers.filter(s => getStatus(s) === 'grace').length,
    cancelling: subscribers.filter(s => getStatus(s) === 'cancelling').length,
    downgraded: subscribers.filter(s => getStatus(s) === 'downgraded').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assinantes Ativos" value={stats.active} icon={CreditCard} variant="success" />
        <StatCard label="Em Carência" value={stats.grace} icon={Clock} variant="warning" />
        <StatCard label="Cancelando" value={stats.cancelling} icon={AlertTriangle} variant="info" />
        <StatCard label="Downgrades" value={stats.downgraded} icon={UserMinus} />
      </div>

      {/* Subscriber Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Todos os Assinantes</CardTitle>
            <Badge variant="outline" className="ml-auto text-xs">{subscribers.length} total</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {subscribers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum assinante encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Atualizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((sub) => {
                  const status = getStatus(sub);
                  const cfg = STATUS_CONFIG[status];
                  return (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[160px]">{sub.profile_name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[160px]">{sub.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{getPlanLabel(sub.current_plan_slug)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{getGateway(sub)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(sub.subscription_end)}</TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{formatDate(sub.updated_at)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
