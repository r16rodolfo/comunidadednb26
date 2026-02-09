import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail } from 'lucide-react';

type EmailType =
  | 'welcome'
  | 'email_verification'
  | 'password_reset'
  | 'password_changed'
  | 'subscription_confirmed'
  | 'upgrade'
  | 'downgrade'
  | 'renewal_receipt'
  | 'expiration_warning'
  | 'subscription_cancelled';

interface EmailData {
  name?: string;
  link?: string;
  plan?: string;
  previousPlan?: string;
  newPlan?: string;
  amount?: string;
  nextBillingDate?: string;
  expirationDate?: string;
  period?: string;
}

const BRAND = {
  name: 'DnB Academy',
  color: '#6366f1',
  colorLight: '#e0e7ff',
};

const TEMPLATE_OPTIONS: { value: EmailType; label: string }[] = [
  { value: 'welcome', label: '🎉 Boas-vindas' },
  { value: 'email_verification', label: '✉️ Verificação de E-mail' },
  { value: 'password_reset', label: '🔑 Redefinição de Senha' },
  { value: 'password_changed', label: '🔒 Senha Alterada' },
  { value: 'subscription_confirmed', label: '✅ Assinatura Confirmada' },
  { value: 'upgrade', label: '🚀 Upgrade de Plano' },
  { value: 'downgrade', label: '⬇️ Downgrade de Plano' },
  { value: 'renewal_receipt', label: '🧾 Recibo de Renovação' },
  { value: 'expiration_warning', label: '⚠️ Alerta de Expiração' },
  { value: 'subscription_cancelled', label: '❌ Assinatura Cancelada' },
];

// Mirror the backend template logic for client-side preview
function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
<tr><td align="center">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
<tr><td style="background:${BRAND.color};padding:28px 32px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${BRAND.name}</h1>
</td></tr>
<tr><td style="padding:32px;">${body}</td></tr>
<tr><td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;text-align:center;">
<p style="margin:0;font-size:12px;color:#a1a1aa;">© ${new Date().getFullYear()} ${BRAND.name}. Todos os direitos reservados.</p>
</td></tr>
</table>
</td></tr></table></body></html>`;
}

function btn(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
<tr><td align="center" style="background:${BRAND.color};border-radius:8px;">
<a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">${label}</a>
</td></tr></table>`;
}

function greeting(name?: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;color:#18181b;">Olá${name ? ` <strong>${name}</strong>` : ''},</p>`;
}

const SAMPLE_DATA: EmailData = {
  name: 'Maria Silva',
  link: '#',
  plan: 'Premium Anual',
  previousPlan: 'Premium Mensal',
  newPlan: 'Premium Anual',
  amount: '297,00',
  nextBillingDate: '09/02/2027',
  expirationDate: '12/02/2026',
  period: 'Fev/2026 — Fev/2027',
};

function getPreviewHtml(type: EmailType): string {
  const d = SAMPLE_DATA;
  const g = greeting(d.name);

  const templates: Record<EmailType, { title: string; body: string }> = {
    email_verification: {
      title: 'Verificação de E-mail',
      body: `${g}<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">Obrigado por se cadastrar! Para ativar sua conta, clique no botão abaixo:</p>${btn('Confirmar e-mail', '#')}<p style="margin:0;font-size:13px;color:#71717a;">Se você não criou uma conta, pode ignorar este e-mail. O link expira em 24 horas.</p>`,
    },
    welcome: {
      title: 'Boas-vindas',
      body: `${g}<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">Estamos felizes em ter você conosco! Sua conta foi ativada com sucesso.</p><ul style="margin:0 0 16px;padding:0 0 0 20px;font-size:15px;color:#3f3f46;line-height:1.8;"><li>📊 Análises diárias do mercado de câmbio</li><li>🎓 Aulas gratuitas na Academy</li><li>💰 Planejar compras de moeda</li><li>🏷️ Cupons exclusivos</li></ul>${btn('Acessar a plataforma', '#')}`,
    },
    password_reset: {
      title: 'Redefinição de Senha',
      body: `${g}<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">Recebemos uma solicitação para redefinir a senha da sua conta.</p>${btn('Redefinir senha', '#')}<p style="margin:0;font-size:13px;color:#71717a;">O link expira em 1 hora.</p>`,
    },
    password_changed: {
      title: 'Senha Alterada',
      body: `${g}<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">Sua senha foi alterada com sucesso. Se você não realizou esta alteração, entre em contato conosco imediatamente.</p>`,
    },
    subscription_confirmed: {
      title: 'Assinatura Confirmada',
      body: `${g}<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">Sua assinatura do plano <strong>${d.plan}</strong> foi confirmada!</p><table role="presentation" width="100%" style="margin:16px 0;background:${BRAND.colorLight};border-radius:8px;"><tr><td style="padding:16px;"><p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Plano:</strong> ${d.plan}</p><p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Valor:</strong> R$ ${d.amount}</p><p style="margin:0;font-size:14px;color:#3f3f46;"><strong>Próxima cobrança:</strong> ${d.nextBillingDate}</p></td></tr></table>${btn('Acessar minha conta', '#')}`,
    },
    upgrade: {
      title: 'Upgrade de Plano',
      body: `${g}<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">Seu plano foi atualizado com sucesso!</p><table role="presentation" width="100%" style="margin:16px 0;background:${BRAND.colorLight};border-radius:8px;"><tr><td style="padding:16px;"><p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Anterior:</strong> ${d.previousPlan}</p><p style="margin:0;font-size:14px;color:#3f3f46;"><strong>Novo:</strong> ${d.newPlan}</p></td></tr></table>${btn('Acessar minha conta', '#')}`,
    },
    downgrade: {
      title: 'Downgrade de Plano',
      body: `${g}<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">Informamos que seu plano foi alterado:</p><table role="presentation" width="100%" style="margin:16px 0;background:#fef3c7;border-radius:8px;"><tr><td style="padding:16px;"><p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Anterior:</strong> ${d.previousPlan}</p><p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Novo:</strong> Gratuito</p><p style="margin:0;font-size:14px;color:#3f3f46;"><strong>Efetivo em:</strong> ${d.expirationDate}</p></td></tr></table>${btn('Ver planos disponíveis', '#')}`,
    },
    renewal_receipt: {
      title: 'Recibo de Pagamento',
      body: `${g}<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">Seu pagamento foi processado com sucesso.</p><table role="presentation" width="100%" style="margin:16px 0;background:${BRAND.colorLight};border-radius:8px;"><tr><td style="padding:16px;"><p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Plano:</strong> ${d.plan}</p><p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Valor:</strong> R$ ${d.amount}</p><p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Período:</strong> ${d.period}</p><p style="margin:0;font-size:14px;color:#3f3f46;"><strong>Próxima cobrança:</strong> ${d.nextBillingDate}</p></td></tr></table>`,
    },
    expiration_warning: {
      title: 'Alerta de Expiração',
      body: `${g}<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">Sua assinatura do plano <strong>${d.plan}</strong> expira em <strong>${d.expirationDate}</strong>.</p><ul style="margin:0 0 16px;padding:0 0 0 20px;font-size:15px;color:#3f3f46;line-height:1.8;"><li>Análises completas do mercado</li><li>Aulas premium na Academy</li><li>Planejador financeiro avançado</li></ul>${btn('Renovar agora', '#')}`,
    },
    subscription_cancelled: {
      title: 'Assinatura Encerrada',
      body: `${g}<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">Sua assinatura do plano <strong>${d.previousPlan}</strong> foi encerrada.</p><p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">Você ainda terá acesso até <strong>${d.expirationDate}</strong>.</p>${btn('Reativar assinatura', '#')}`,
    },
  };

  const t = templates[type];
  return layout(t.title, t.body);
}

export function EmailTemplatesTab() {
  const [selected, setSelected] = useState<EmailType>('welcome');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Preview de Templates de E-mail
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-xs">
          <Select value={selected} onValueChange={(v) => setSelected(v as EmailType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
          <iframe
            title="Email Preview"
            srcDoc={getPreviewHtml(selected)}
            className="w-full border-0"
            style={{ height: 600 }}
            sandbox=""
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Este é um preview com dados fictícios. Os e-mails reais são enviados automaticamente pelo sistema nos eventos correspondentes.
        </p>
      </CardContent>
    </Card>
  );
}
