/**
 * Centralised email templates for all transactional emails.
 * Each function returns { subject, html } ready for Resend.
 */

const BRAND = {
  name: 'Dólar na Bagagem',
  from: 'Dólar na Bagagem <comunidade@dolarnabagagem.com.br>',
  color: '#6366f1',
  colorLight: '#e0e7ff',
  logo: '', // Will be updated with a real URL later
};

export { BRAND };

// ─── Layout wrapper ─────────────────────────────────────────────────────────

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
<tr><td align="center">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
<!-- Header -->
<tr>
<td style="background:${BRAND.color};padding:28px 32px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${BRAND.name}</h1>
</td>
</tr>
<!-- Body -->
<tr>
<td style="padding:32px;">
${body}
</td>
</tr>
<!-- Footer -->
<tr>
<td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;text-align:center;">
<p style="margin:0;font-size:12px;color:#a1a1aa;">
  © ${new Date().getFullYear()} ${BRAND.name}. Todos os direitos reservados.
</p>
<p style="margin:8px 0 0;font-size:12px;color:#a1a1aa;">
  Você recebeu este e-mail porque possui uma conta na plataforma.
</p>
</td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function btn(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
<tr><td align="center" style="background:${BRAND.color};border-radius:8px;">
<a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">${label}</a>
</td></tr></table>`;
}

function greeting(name?: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;color:#18181b;">Olá${name ? ` <strong>${name}</strong>` : ''},</p>`;
}

// ─── Template Types ──────────────────────────────────────────────────────────

export type EmailType =
  | 'welcome'
  | 'email_verification'
  | 'password_reset'
  | 'subscription_confirmed'
  | 'upgrade'
  | 'downgrade'
  | 'renewal_receipt'
  | 'expiration_warning'
  | 'subscription_cancelled'
  | 'password_changed';

export interface EmailData {
  name?: string;
  email?: string;
  link?: string;
  plan?: string;
  previousPlan?: string;
  newPlan?: string;
  amount?: string;
  nextBillingDate?: string;
  expirationDate?: string;
  period?: string;
}

export interface EmailResult {
  subject: string;
  html: string;
}

// ─── Templates ───────────────────────────────────────────────────────────────

export function getEmailTemplate(type: EmailType, data: EmailData): EmailResult {
  switch (type) {
    case 'email_verification':
      return emailVerification(data);
    case 'welcome':
      return welcome(data);
    case 'password_reset':
      return passwordReset(data);
    case 'password_changed':
      return passwordChanged(data);
    case 'subscription_confirmed':
      return subscriptionConfirmed(data);
    case 'upgrade':
      return upgrade(data);
    case 'downgrade':
      return downgrade(data);
    case 'renewal_receipt':
      return renewalReceipt(data);
    case 'expiration_warning':
      return expirationWarning(data);
    case 'subscription_cancelled':
      return subscriptionCancelled(data);
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

// ─── 1. Verificação de E-mail ────────────────────────────────────────────────

function emailVerification(data: EmailData): EmailResult {
  return {
    subject: 'Confirme seu e-mail — ' + BRAND.name,
    html: layout('Verificação de E-mail', `
      ${greeting(data.name)}
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Obrigado por se cadastrar! Para ativar sua conta, clique no botão abaixo:
      </p>
      ${btn('Confirmar e-mail', data.link || '#')}
      <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
        Se você não criou uma conta, pode ignorar este e-mail com segurança.
        O link expira em 24 horas.
      </p>
    `),
  };
}

// ─── 2. Boas-vindas ─────────────────────────────────────────────────────────

function welcome(data: EmailData): EmailResult {
  return {
    subject: `Bem-vindo(a) à ${BRAND.name}! 🎉`,
    html: layout('Boas-vindas', `
      ${greeting(data.name)}
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Estamos felizes em ter você conosco! Sua conta foi ativada com sucesso.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Aqui está o que você pode fazer agora:
      </p>
      <ul style="margin:0 0 16px;padding:0 0 0 20px;font-size:15px;color:#3f3f46;line-height:1.8;">
        <li>📊 Acompanhar análises diárias do mercado de câmbio</li>
        <li>🎓 Acessar aulas gratuitas na Academy</li>
        <li>💰 Planejar suas compras de moeda estrangeira</li>
        <li>🏷️ Aproveitar cupons exclusivos de parceiros</li>
      </ul>
      ${btn('Acessar a plataforma', data.link || '#')}
    `),
  };
}

// ─── 3. Recuperação de Senha ────────────────────────────────────────────────

function passwordReset(data: EmailData): EmailResult {
  return {
    subject: 'Redefinição de senha — ' + BRAND.name,
    html: layout('Redefinição de Senha', `
      ${greeting(data.name)}
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
      </p>
      ${btn('Redefinir senha', data.link || '#')}
      <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
        Se você não solicitou a redefinição, ignore este e-mail. O link expira em 1 hora.
      </p>
    `),
  };
}

// ─── 4. Senha Alterada ──────────────────────────────────────────────────────

function passwordChanged(data: EmailData): EmailResult {
  return {
    subject: 'Senha alterada com sucesso — ' + BRAND.name,
    html: layout('Senha Alterada', `
      ${greeting(data.name)}
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Sua senha foi alterada com sucesso. Se você não realizou esta alteração, entre em contato conosco imediatamente.
      </p>
    `),
  };
}

// ─── 5. Assinatura Confirmada ───────────────────────────────────────────────

function subscriptionConfirmed(data: EmailData): EmailResult {
  return {
    subject: `Assinatura confirmada! 🎉 — ${BRAND.name}`,
    html: layout('Assinatura Confirmada', `
      ${greeting(data.name)}
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Sua assinatura do plano <strong>${data.plan || 'Premium'}</strong> foi confirmada com sucesso!
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:${BRAND.colorLight};border-radius:8px;padding:16px;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Plano:</strong> ${data.plan || 'Premium'}</p>
        ${data.amount ? `<p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Valor:</strong> R$ ${data.amount}</p>` : ''}
        ${data.nextBillingDate ? `<p style="margin:0;font-size:14px;color:#3f3f46;"><strong>Próxima cobrança:</strong> ${data.nextBillingDate}</p>` : ''}
      </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Agora você tem acesso completo a todos os recursos premium. Aproveite!
      </p>
      ${btn('Acessar minha conta', data.link || '#')}
    `),
  };
}

// ─── 6. Upgrade ─────────────────────────────────────────────────────────────

function upgrade(data: EmailData): EmailResult {
  return {
    subject: `Upgrade realizado! 🚀 — ${BRAND.name}`,
    html: layout('Upgrade de Plano', `
      ${greeting(data.name)}
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Seu plano foi atualizado com sucesso!
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:${BRAND.colorLight};border-radius:8px;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Plano anterior:</strong> ${data.previousPlan || '—'}</p>
        <p style="margin:0;font-size:14px;color:#3f3f46;"><strong>Novo plano:</strong> ${data.newPlan || '—'}</p>
      </td></tr>
      </table>
      ${btn('Acessar minha conta', data.link || '#')}
    `),
  };
}

// ─── 7. Downgrade ───────────────────────────────────────────────────────────

function downgrade(data: EmailData): EmailResult {
  return {
    subject: `Alteração de plano — ${BRAND.name}`,
    html: layout('Downgrade de Plano', `
      ${greeting(data.name)}
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Informamos que seu plano foi alterado:
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#fef3c7;border-radius:8px;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Plano anterior:</strong> ${data.previousPlan || '—'}</p>
        <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Novo plano:</strong> ${data.newPlan || 'Gratuito'}</p>
        ${data.expirationDate ? `<p style="margin:0;font-size:14px;color:#3f3f46;"><strong>Efetivo a partir de:</strong> ${data.expirationDate}</p>` : ''}
      </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Você pode reativar ou alterar seu plano a qualquer momento.
      </p>
      ${btn('Ver planos disponíveis', data.link || '#')}
    `),
  };
}

// ─── 8. Recibo de Renovação ─────────────────────────────────────────────────

function renewalReceipt(data: EmailData): EmailResult {
  return {
    subject: `Recibo de pagamento — ${BRAND.name}`,
    html: layout('Recibo de Pagamento', `
      ${greeting(data.name)}
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Seu pagamento foi processado com sucesso. Aqui está o resumo:
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:${BRAND.colorLight};border-radius:8px;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Plano:</strong> ${data.plan || 'Premium'}</p>
        ${data.amount ? `<p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Valor:</strong> R$ ${data.amount}</p>` : ''}
        ${data.period ? `<p style="margin:0 0 8px;font-size:14px;color:#3f3f46;"><strong>Período:</strong> ${data.period}</p>` : ''}
        ${data.nextBillingDate ? `<p style="margin:0;font-size:14px;color:#3f3f46;"><strong>Próxima cobrança:</strong> ${data.nextBillingDate}</p>` : ''}
      </td></tr>
      </table>
      <p style="margin:0;font-size:13px;color:#71717a;">
        Este é um recibo automático. Nenhuma ação é necessária.
      </p>
    `),
  };
}

// ─── 9. Alerta de Expiração ─────────────────────────────────────────────────

function expirationWarning(data: EmailData): EmailResult {
  return {
    subject: `⚠️ Sua assinatura expira em breve — ${BRAND.name}`,
    html: layout('Alerta de Expiração', `
      ${greeting(data.name)}
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Sua assinatura do plano <strong>${data.plan || 'Premium'}</strong> expira em <strong>${data.expirationDate || 'breve'}</strong>.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Após a expiração, você perderá acesso aos recursos premium, incluindo:
      </p>
      <ul style="margin:0 0 16px;padding:0 0 0 20px;font-size:15px;color:#3f3f46;line-height:1.8;">
        <li>Análises completas do mercado</li>
        <li>Aulas premium na Academy</li>
        <li>Planejador financeiro avançado</li>
      </ul>
      ${btn('Renovar agora', data.link || '#')}
      <p style="margin:16px 0 0;font-size:13px;color:#71717a;">
        Se você já renovou, por favor ignore este e-mail.
      </p>
    `),
  };
}

// ─── 10. Assinatura Cancelada ───────────────────────────────────────────────

function subscriptionCancelled(data: EmailData): EmailResult {
  return {
    subject: `Assinatura encerrada — ${BRAND.name}`,
    html: layout('Assinatura Encerrada', `
      ${greeting(data.name)}
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Sua assinatura do plano <strong>${data.previousPlan || 'Premium'}</strong> foi encerrada.
      </p>
      ${data.expirationDate ? `<p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">Você ainda terá acesso até <strong>${data.expirationDate}</strong>.</p>` : ''}
      <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
        Sentiremos sua falta! Você pode reativar sua assinatura a qualquer momento para recuperar o acesso completo.
      </p>
      ${btn('Reativar assinatura', data.link || '#')}
    `),
  };
}
