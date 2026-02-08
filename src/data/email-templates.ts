import { KeyRound, Mail, UserPlus, CreditCard, ArrowUpCircle, ArrowDownCircle, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';

// ========== AUTH TEMPLATES ==========

const passwordResetTemplate = `
<div style="background-color: #f8faf8; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); padding: 40px 32px; text-align: center;">
      <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">🔐</span>
      </div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Redefinir Senha</h1>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0;">Comunidade DNB</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #1a2b1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">Olá, <strong>João</strong>! 👋</p>
      <p style="color: #4a5a4a; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(26,138,74,0.3);">Redefinir Minha Senha</a>
      </div>
      <div style="background: #f0faf4; border: 1px solid #d0e8d8; border-radius: 10px; padding: 16px; margin: 24px 0;">
        <p style="color: #1a6a3a; font-size: 13px; line-height: 1.5; margin: 0;">⏰ Este link expira em <strong>1 hora</strong>.<br/>🔒 Se você não solicitou esta redefinição, ignore este e-mail com segurança.</p>
      </div>
      <p style="color: #8a9a8a; font-size: 12px; line-height: 1.5; margin: 24px 0 0;">Se o botão não funcionar, copie e cole este link no navegador:<br/><span style="color: #1a8a4a; word-break: break-all;">https://comunidadednb.com/reset?token=abc123xyz</span></p>
    </div>
    <div style="background: #f8faf8; padding: 24px 32px; border-top: 1px solid #e8f0e8;">
      <p style="color: #8a9a8a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">© 2026 Comunidade DNB · Todos os direitos reservados<br/><a href="#" style="color: #1a8a4a; text-decoration: none;">Política de Privacidade</a> · <a href="#" style="color: #1a8a4a; text-decoration: none;">Termos de Uso</a></p>
    </div>
  </div>
</div>
`;

const verificationTemplate = `
<div style="background-color: #f8faf8; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); padding: 40px 32px; text-align: center;">
      <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">✉️</span>
      </div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Confirme seu E-mail</h1>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0;">Comunidade DNB</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #1a2b1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">Olá, <strong>Maria</strong>! 🎉</p>
      <p style="color: #4a5a4a; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Bem-vinda à Comunidade DNB! Para ativar sua conta e começar a planejar suas viagens, clique no botão abaixo para confirmar seu e-mail:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(26,138,74,0.3);">Confirmar Meu E-mail</a>
      </div>
      <div style="background: #f0faf4; border: 1px solid #d0e8d8; border-radius: 10px; padding: 16px; margin: 24px 0;">
        <p style="color: #1a6a3a; font-size: 13px; line-height: 1.5; margin: 0;">⏰ Este link expira em <strong>24 horas</strong>.<br/>🛡️ Se você não criou esta conta, ignore este e-mail.</p>
      </div>
      <p style="color: #8a9a8a; font-size: 12px; line-height: 1.5; margin: 24px 0 0;">Se o botão não funcionar, copie e cole este link no navegador:<br/><span style="color: #1a8a4a; word-break: break-all;">https://comunidadednb.com/auth/verify?token=abc123xyz</span></p>
    </div>
    <div style="background: #f8faf8; padding: 24px 32px; border-top: 1px solid #e8f0e8;">
      <p style="color: #8a9a8a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">© 2026 Comunidade DNB · Todos os direitos reservados<br/><a href="#" style="color: #1a8a4a; text-decoration: none;">Política de Privacidade</a> · <a href="#" style="color: #1a8a4a; text-decoration: none;">Termos de Uso</a></p>
    </div>
  </div>
</div>
`;

const welcomeTemplate = `
<div style="background-color: #f8faf8; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #1a8a4a 0%, #e67e22 100%); padding: 48px 32px; text-align: center;">
      <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">✈️</span>
      </div>
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">Bem-vindo à<br/>Comunidade DNB!</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 15px; margin: 12px 0 0;">Sua jornada financeira para Disney começa agora 🏰</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #1a2b1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">Olá, <strong>Carlos</strong>! 🎊</p>
      <p style="color: #4a5a4a; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">Sua conta foi confirmada com sucesso! Agora você faz parte de uma comunidade exclusiva de viajantes que planejam suas viagens com inteligência financeira.</p>
      <div style="margin: 0 0 28px;">
        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
          <div style="flex: 1; background: #f0faf4; border-radius: 12px; padding: 20px; text-align: center;">
            <span style="font-size: 24px; display: block; margin-bottom: 8px;">📊</span>
            <p style="color: #1a6a3a; font-size: 13px; font-weight: 600; margin: 0;">Planner</p>
            <p style="color: #6a8a6a; font-size: 11px; margin: 4px 0 0;">Planeje seus gastos</p>
          </div>
          <div style="flex: 1; background: #fef7ec; border-radius: 12px; padding: 20px; text-align: center;">
            <span style="font-size: 24px; display: block; margin-bottom: 8px;">🎓</span>
            <p style="color: #c06800; font-size: 13px; font-weight: 600; margin: 0;">Academy</p>
            <p style="color: #a08060; font-size: 11px; margin: 4px 0 0;">Cursos exclusivos</p>
          </div>
          <div style="flex: 1; background: #f0f4fa; border-radius: 12px; padding: 20px; text-align: center;">
            <span style="font-size: 24px; display: block; margin-bottom: 8px;">🎟️</span>
            <p style="color: #2a5a9a; font-size: 13px; font-weight: 600; margin: 0;">Cupons</p>
            <p style="color: #6080a0; font-size: 11px; margin: 4px 0 0;">Descontos exclusivos</p>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); color: #ffffff; text-decoration: none; padding: 14px 48px; border-radius: 10px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(26,138,74,0.3);">Acessar Minha Conta</a>
      </div>
      <div style="background: linear-gradient(135deg, #f0faf4, #fef7ec); border-radius: 10px; padding: 16px; margin: 24px 0;">
        <p style="color: #1a4a2a; font-size: 13px; line-height: 1.5; margin: 0;">💡 <strong>Dica:</strong> Comece configurando seu Planner para definir suas metas de viagem e acompanhar seus gastos em dólar!</p>
      </div>
    </div>
    <div style="background: #f8faf8; padding: 24px 32px; border-top: 1px solid #e8f0e8;">
      <p style="color: #8a9a8a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">© 2026 Comunidade DNB · Todos os direitos reservados<br/><a href="#" style="color: #1a8a4a; text-decoration: none;">Política de Privacidade</a> · <a href="#" style="color: #1a8a4a; text-decoration: none;">Termos de Uso</a></p>
    </div>
  </div>
</div>
`;

// ========== SUBSCRIPTION TEMPLATES ==========

const subscriptionConfirmTemplate = `
<div style="background-color: #f8faf8; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #1a8a4a 0%, #0d6b30 100%); padding: 48px 32px; text-align: center;">
      <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">🎉</span>
      </div>
      <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0;">Assinatura Confirmada!</h1>
      <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 10px 0 0;">Bem-vindo ao Premium da Comunidade DNB</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #1a2b1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">Olá, <strong>João</strong>! 🚀</p>
      <p style="color: #4a5a4a; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Sua assinatura foi ativada com sucesso! Agora você tem acesso completo a todos os recursos Premium da plataforma.</p>
      
      <!-- Plan Details -->
      <div style="background: #f0faf4; border: 1px solid #d0e8d8; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
        <p style="color: #1a6a3a; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Detalhes do Plano</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="color: #4a5a4a; font-size: 14px; padding: 6px 0;">Plano</td><td style="color: #1a2b1a; font-size: 14px; font-weight: 600; text-align: right; padding: 6px 0;">Premium Trimestral</td></tr>
          <tr><td style="color: #4a5a4a; font-size: 14px; padding: 6px 0;">Valor</td><td style="color: #1a2b1a; font-size: 14px; font-weight: 600; text-align: right; padding: 6px 0;">R$ 60,00 / 3 meses</td></tr>
          <tr><td style="color: #4a5a4a; font-size: 14px; padding: 6px 0;">Início</td><td style="color: #1a2b1a; font-size: 14px; font-weight: 600; text-align: right; padding: 6px 0;">08/02/2026</td></tr>
          <tr><td style="color: #4a5a4a; font-size: 14px; padding: 6px 0;">Próxima cobrança</td><td style="color: #1a2b1a; font-size: 14px; font-weight: 600; text-align: right; padding: 6px 0;">08/05/2026</td></tr>
        </table>
      </div>

      <!-- Unlocked Features -->
      <p style="color: #1a2b1a; font-size: 14px; font-weight: 600; margin: 0 0 12px;">✨ O que você desbloqueou:</p>
      <div style="margin: 0 0 24px;">
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="color: #1a8a4a; font-size: 16px;">✓</span>
          <span style="color: #4a5a4a; font-size: 14px;">Planner financeiro completo com metas</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="color: #1a8a4a; font-size: 16px;">✓</span>
          <span style="color: #4a5a4a; font-size: 14px;">Academy com todos os cursos exclusivos</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="color: #1a8a4a; font-size: 16px;">✓</span>
          <span style="color: #4a5a4a; font-size: 14px;">Cupons e descontos exclusivos para viagem</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0;">
          <span style="color: #1a8a4a; font-size: 16px;">✓</span>
          <span style="color: #4a5a4a; font-size: 14px;">Análises DNB com recomendações personalizadas</span>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); color: #ffffff; text-decoration: none; padding: 14px 48px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(26,138,74,0.3);">Explorar Recursos Premium</a>
      </div>
    </div>
    <div style="background: #f8faf8; padding: 24px 32px; border-top: 1px solid #e8f0e8;">
      <p style="color: #8a9a8a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">© 2026 Comunidade DNB · Todos os direitos reservados<br/><a href="#" style="color: #1a8a4a; text-decoration: none;">Gerenciar Assinatura</a> · <a href="#" style="color: #1a8a4a; text-decoration: none;">Suporte</a></p>
    </div>
  </div>
</div>
`;

const upgradeTemplate = `
<div style="background-color: #f8faf8; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #1a8a4a 0%, #e67e22 100%); padding: 48px 32px; text-align: center;">
      <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">⬆️</span>
      </div>
      <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0;">Upgrade Realizado!</h1>
      <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 10px 0 0;">Seu plano foi atualizado com sucesso</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #1a2b1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">Olá, <strong>Ana</strong>! 🎊</p>
      <p style="color: #4a5a4a; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Parabéns pelo upgrade! Seu plano foi atualizado e os novos benefícios já estão disponíveis na sua conta.</p>

      <!-- Plan Change -->
      <div style="display: flex; align-items: center; gap: 12px; margin: 0 0 24px;">
        <div style="flex: 1; background: #f8f8f8; border-radius: 10px; padding: 16px; text-align: center;">
          <p style="color: #8a9a8a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px;">Plano anterior</p>
          <p style="color: #6a7a6a; font-size: 16px; font-weight: 700; margin: 0;">Mensal</p>
          <p style="color: #8a9a8a; font-size: 13px; margin: 4px 0 0;">R$ 30/mês</p>
        </div>
        <div style="font-size: 24px; color: #e67e22;">→</div>
        <div style="flex: 1; background: linear-gradient(135deg, #f0faf4, #e8f5ec); border: 2px solid #1a8a4a; border-radius: 10px; padding: 16px; text-align: center;">
          <p style="color: #1a8a4a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px;">Novo plano</p>
          <p style="color: #1a6a3a; font-size: 16px; font-weight: 700; margin: 0;">Anual</p>
          <p style="color: #1a8a4a; font-size: 13px; margin: 4px 0 0;">R$ 185/ano</p>
        </div>
      </div>

      <div style="background: #fef7ec; border: 1px solid #f5d6a0; border-radius: 10px; padding: 16px; margin: 0 0 24px;">
        <p style="color: #8a5a00; font-size: 13px; line-height: 1.5; margin: 0;">
          💰 <strong>Economia:</strong> Você economiza <strong>R$ 175,00 por ano</strong> comparado ao plano mensal! Isso dá quase 6 meses grátis.
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); color: #ffffff; text-decoration: none; padding: 14px 48px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(26,138,74,0.3);">Ver Minha Assinatura</a>
      </div>
    </div>
    <div style="background: #f8faf8; padding: 24px 32px; border-top: 1px solid #e8f0e8;">
      <p style="color: #8a9a8a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">© 2026 Comunidade DNB · Todos os direitos reservados<br/><a href="#" style="color: #1a8a4a; text-decoration: none;">Gerenciar Assinatura</a> · <a href="#" style="color: #1a8a4a; text-decoration: none;">Suporte</a></p>
    </div>
  </div>
</div>
`;

const downgradeTemplate = `
<div style="background-color: #f8faf8; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #5a6a7a 0%, #7a8a9a 100%); padding: 40px 32px; text-align: center;">
      <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">⬇️</span>
      </div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Plano Alterado</h1>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0;">Comunidade DNB</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #1a2b1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">Olá, <strong>Pedro</strong>! 👋</p>
      <p style="color: #4a5a4a; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Seu plano foi alterado conforme solicitado. A mudança entrará em vigor ao final do período atual já pago.</p>

      <!-- Plan Change -->
      <div style="display: flex; align-items: center; gap: 12px; margin: 0 0 24px;">
        <div style="flex: 1; background: #f8f8f8; border-radius: 10px; padding: 16px; text-align: center; opacity: 0.7;">
          <p style="color: #8a9a8a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px;">Plano atual</p>
          <p style="color: #6a7a6a; font-size: 16px; font-weight: 700; margin: 0;">Anual</p>
          <p style="color: #8a9a8a; font-size: 13px; margin: 4px 0 0;">R$ 185/ano</p>
        </div>
        <div style="font-size: 24px; color: #8a9a8a;">→</div>
        <div style="flex: 1; background: #f8f8f8; border: 1px solid #d0d0d0; border-radius: 10px; padding: 16px; text-align: center;">
          <p style="color: #6a7a6a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px;">Novo plano</p>
          <p style="color: #4a5a4a; font-size: 16px; font-weight: 700; margin: 0;">Mensal</p>
          <p style="color: #6a7a6a; font-size: 13px; margin: 4px 0 0;">R$ 30/mês</p>
        </div>
      </div>

      <div style="background: #fff8f0; border: 1px solid #f5d6a0; border-radius: 10px; padding: 16px; margin: 0 0 24px;">
        <p style="color: #8a5a00; font-size: 13px; line-height: 1.5; margin: 0;">
          📅 <strong>Importante:</strong> Você mantém acesso ao plano Anual até <strong>08/02/2027</strong>. Após essa data, seu plano será alterado para Mensal.
        </p>
      </div>

      <div style="background: #f0faf4; border: 1px solid #d0e8d8; border-radius: 10px; padding: 16px; margin: 0 0 24px;">
        <p style="color: #1a6a3a; font-size: 13px; line-height: 1.5; margin: 0;">
          💡 <strong>Mudou de ideia?</strong> Acesse a página de <a href="#" style="color: #1a8a4a; text-decoration: underline;">Assinatura</a> e clique em "Manter Plano Atual" para cancelar o downgrade antes da data de transição.
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(26,138,74,0.3);">Gerenciar Assinatura</a>
      </div>
    </div>
    <div style="background: #f8faf8; padding: 24px 32px; border-top: 1px solid #e8f0e8;">
      <p style="color: #8a9a8a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">© 2026 Comunidade DNB · Todos os direitos reservados<br/><a href="#" style="color: #1a8a4a; text-decoration: none;">Política de Privacidade</a> · <a href="#" style="color: #1a8a4a; text-decoration: none;">Suporte</a></p>
    </div>
  </div>
</div>
`;

const renewalReminderTemplate = `
<div style="background-color: #f8faf8; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #2a7abf 0%, #3a9ae0 100%); padding: 40px 32px; text-align: center;">
      <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">🔄</span>
      </div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Renovação Próxima</h1>
      <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0;">Comunidade DNB Premium</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #1a2b1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">Olá, <strong>Lucas</strong>! 👋</p>
      <p style="color: #4a5a4a; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Este é um lembrete de que sua assinatura será renovada em breve. Nenhuma ação é necessária se você deseja continuar aproveitando os benefícios Premium.</p>

      <div style="background: #eef5fc; border: 1px solid #c0d8f0; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
        <p style="color: #2a5a8a; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Detalhes da Renovação</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="color: #4a6a8a; font-size: 14px; padding: 6px 0;">Plano</td><td style="color: #1a3a5a; font-size: 14px; font-weight: 600; text-align: right;">Premium Trimestral</td></tr>
          <tr><td style="color: #4a6a8a; font-size: 14px; padding: 6px 0;">Valor</td><td style="color: #1a3a5a; font-size: 14px; font-weight: 600; text-align: right;">R$ 60,00</td></tr>
          <tr><td style="color: #4a6a8a; font-size: 14px; padding: 6px 0;">Data de renovação</td><td style="color: #1a3a5a; font-size: 14px; font-weight: 600; text-align: right;">15/02/2026</td></tr>
          <tr><td style="color: #4a6a8a; font-size: 14px; padding: 6px 0;">Método de pagamento</td><td style="color: #1a3a5a; font-size: 14px; font-weight: 600; text-align: right;">•••• 4242</td></tr>
        </table>
      </div>

      <div style="background: #f0faf4; border: 1px solid #d0e8d8; border-radius: 10px; padding: 16px; margin: 0 0 24px;">
        <p style="color: #1a6a3a; font-size: 13px; line-height: 1.5; margin: 0;">
          ✅ Sua assinatura será renovada automaticamente. Se precisar atualizar o método de pagamento, faça isso antes da data de renovação.
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(26,138,74,0.3);">Gerenciar Assinatura</a>
      </div>
    </div>
    <div style="background: #f8faf8; padding: 24px 32px; border-top: 1px solid #e8f0e8;">
      <p style="color: #8a9a8a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">© 2026 Comunidade DNB · Todos os direitos reservados<br/><a href="#" style="color: #1a8a4a; text-decoration: none;">Gerenciar Assinatura</a> · <a href="#" style="color: #1a8a4a; text-decoration: none;">Suporte</a></p>
    </div>
  </div>
</div>
`;

const renewedTemplate = `
<div style="background-color: #f8faf8; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); padding: 40px 32px; text-align: center;">
      <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">✅</span>
      </div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Plano Renovado!</h1>
      <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0;">Pagamento processado com sucesso</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #1a2b1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">Olá, <strong>Fernanda</strong>! 🎉</p>
      <p style="color: #4a5a4a; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Ótima notícia! Sua assinatura Premium foi renovada com sucesso. Você continua com acesso total a todos os recursos da plataforma.</p>

      <div style="background: #f0faf4; border: 1px solid #d0e8d8; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
        <p style="color: #1a6a3a; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Recibo de Pagamento</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="color: #4a5a4a; font-size: 14px; padding: 6px 0;">Plano</td><td style="color: #1a2b1a; font-size: 14px; font-weight: 600; text-align: right;">Premium Semestral</td></tr>
          <tr><td style="color: #4a5a4a; font-size: 14px; padding: 6px 0;">Valor cobrado</td><td style="color: #1a2b1a; font-size: 14px; font-weight: 600; text-align: right;">R$ 105,00</td></tr>
          <tr><td style="color: #4a5a4a; font-size: 14px; padding: 6px 0;">Data do pagamento</td><td style="color: #1a2b1a; font-size: 14px; font-weight: 600; text-align: right;">08/02/2026</td></tr>
          <tr style="border-top: 1px dashed #d0e8d8;"><td style="color: #4a5a4a; font-size: 14px; padding: 10px 0 6px;">Próxima renovação</td><td style="color: #1a8a4a; font-size: 14px; font-weight: 700; text-align: right; padding: 10px 0 6px;">08/08/2026</td></tr>
        </table>
      </div>

      <div style="background: linear-gradient(135deg, #f0faf4, #fef7ec); border-radius: 10px; padding: 16px; margin: 0 0 24px;">
        <p style="color: #1a4a2a; font-size: 13px; line-height: 1.5; margin: 0;">🏰 <strong>Continue planejando!</strong> Acompanhe seu progresso no Planner e aproveite os novos conteúdos da Academy.</p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); color: #ffffff; text-decoration: none; padding: 14px 48px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(26,138,74,0.3);">Acessar Plataforma</a>
      </div>
    </div>
    <div style="background: #f8faf8; padding: 24px 32px; border-top: 1px solid #e8f0e8;">
      <p style="color: #8a9a8a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">© 2026 Comunidade DNB · Todos os direitos reservados<br/><a href="#" style="color: #1a8a4a; text-decoration: none;">Ver Fatura</a> · <a href="#" style="color: #1a8a4a; text-decoration: none;">Suporte</a></p>
    </div>
  </div>
</div>
`;

const expiringTemplate = `
<div style="background-color: #f8faf8; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); padding: 40px 32px; text-align: center;">
      <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">⏳</span>
      </div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Plano Expirando!</h1>
      <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0;">Ação necessária em 3 dias</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #1a2b1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">Olá, <strong>Roberto</strong>! 👋</p>
      <p style="color: #4a5a4a; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Seu plano Premium está prestes a expirar. Atualize seu método de pagamento para continuar aproveitando todos os recursos exclusivos.</p>

      <!-- Urgency Banner -->
      <div style="background: linear-gradient(135deg, #fff0e0, #ffe8d0); border: 2px solid #e67e22; border-radius: 12px; padding: 20px; margin: 0 0 24px; text-align: center;">
        <p style="color: #c06800; font-size: 32px; font-weight: 800; margin: 0;">3 dias</p>
        <p style="color: #a05800; font-size: 14px; margin: 4px 0 0;">para seu plano expirar</p>
      </div>

      <!-- What you'll lose -->
      <p style="color: #1a2b1a; font-size: 14px; font-weight: 600; margin: 0 0 12px;">⚠️ O que você perderá:</p>
      <div style="margin: 0 0 24px;">
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="color: #e74c3c; font-size: 14px;">✗</span>
          <span style="color: #6a7a6a; font-size: 14px;">Planner financeiro com metas e relatórios</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="color: #e74c3c; font-size: 14px;">✗</span>
          <span style="color: #6a7a6a; font-size: 14px;">Cursos exclusivos da Academy</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <span style="color: #e74c3c; font-size: 14px;">✗</span>
          <span style="color: #6a7a6a; font-size: 14px;">Cupons e descontos Premium</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0;">
          <span style="color: #e74c3c; font-size: 14px;">✗</span>
          <span style="color: #6a7a6a; font-size: 14px;">Análises DNB personalizadas</span>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 10px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 12px rgba(230,126,34,0.4);">Renovar Agora</a>
      </div>

      <div style="background: #f0faf4; border: 1px solid #d0e8d8; border-radius: 10px; padding: 16px; margin: 0 0 0;">
        <p style="color: #1a6a3a; font-size: 13px; line-height: 1.5; margin: 0;">💡 <strong>Dica:</strong> Considere o plano Anual para economizar até R$ 175/ano!</p>
      </div>
    </div>
    <div style="background: #f8faf8; padding: 24px 32px; border-top: 1px solid #e8f0e8;">
      <p style="color: #8a9a8a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">© 2026 Comunidade DNB · Todos os direitos reservados<br/><a href="#" style="color: #1a8a4a; text-decoration: none;">Gerenciar Assinatura</a> · <a href="#" style="color: #1a8a4a; text-decoration: none;">Suporte</a></p>
    </div>
  </div>
</div>
`;

const cancellationTemplate = `
<div style="background-color: #f8faf8; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    <div style="background: linear-gradient(135deg, #6a7a8a 0%, #8a9aaa 100%); padding: 40px 32px; text-align: center;">
      <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">😢</span>
      </div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Assinatura Cancelada</h1>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0;">Sentiremos sua falta</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #1a2b1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">Olá, <strong>Marina</strong>! 👋</p>
      <p style="color: #4a5a4a; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Confirmamos o cancelamento da sua assinatura Premium. Lamentamos vê-la partir, mas sua conta continua ativa com o plano gratuito.</p>

      <div style="background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
        <p style="color: #6a7a6a; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">Detalhes do Cancelamento</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="color: #6a7a6a; font-size: 14px; padding: 6px 0;">Plano cancelado</td><td style="color: #4a5a4a; font-size: 14px; font-weight: 600; text-align: right;">Premium Mensal</td></tr>
          <tr><td style="color: #6a7a6a; font-size: 14px; padding: 6px 0;">Acesso até</td><td style="color: #e67e22; font-size: 14px; font-weight: 600; text-align: right;">08/03/2026</td></tr>
          <tr><td style="color: #6a7a6a; font-size: 14px; padding: 6px 0;">Após esta data</td><td style="color: #4a5a4a; font-size: 14px; font-weight: 600; text-align: right;">Plano Gratuito</td></tr>
        </table>
      </div>

      <div style="background: #f0faf4; border: 1px solid #d0e8d8; border-radius: 10px; padding: 16px; margin: 0 0 24px;">
        <p style="color: #1a6a3a; font-size: 13px; line-height: 1.5; margin: 0;">
          🔄 <strong>Mudou de ideia?</strong> Acesse a página de <a href="#" style="color: #1a8a4a; text-decoration: underline;">Assinatura</a> e clique em "Reativar Assinatura" antes que o período acabe. Todos os seus dados e progresso no Planner serão mantidos.
        </p>
      </div>

      <p style="color: #4a5a4a; font-size: 14px; font-weight: 600; margin: 0 0 12px;">O que você ainda terá no plano gratuito:</p>
      <div style="margin: 0 0 24px;">
        <div style="display: flex; align-items: center; gap: 8px; padding: 6px 0;">
          <span style="color: #1a8a4a; font-size: 14px;">✓</span>
          <span style="color: #4a5a4a; font-size: 14px;">Acesso básico à comunidade</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; padding: 6px 0;">
          <span style="color: #1a8a4a; font-size: 14px;">✓</span>
          <span style="color: #4a5a4a; font-size: 14px;">Conteúdos gratuitos da Academy</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; padding: 6px 0;">
          <span style="color: #1a8a4a; font-size: 14px;">✓</span>
          <span style="color: #4a5a4a; font-size: 14px;">Análises DNB básicas</span>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); color: #ffffff; text-decoration: none; padding: 14px 48px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(26,138,74,0.3);">Reativar Assinatura</a>
      </div>

      <!-- Feedback -->
      <div style="background: #f8f8fa; border-radius: 10px; padding: 16px; margin: 0;">
        <p style="color: #6a7a8a; font-size: 13px; line-height: 1.5; margin: 0; text-align: center;">
          📝 Sua opinião importa! <a href="#" style="color: #1a8a4a; text-decoration: underline;">Conte-nos o motivo</a> do cancelamento para melhorarmos a plataforma.
        </p>
      </div>
    </div>
    <div style="background: #f8faf8; padding: 24px 32px; border-top: 1px solid #e8f0e8;">
      <p style="color: #8a9a8a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">© 2026 Comunidade DNB · Todos os direitos reservados<br/><a href="#" style="color: #1a8a4a; text-decoration: none;">Política de Privacidade</a> · <a href="#" style="color: #1a8a4a; text-decoration: none;">Suporte</a></p>
    </div>
  </div>
</div>
`;

// ========== TEMPLATE DEFINITIONS ==========

export interface EmailTemplate {
  id: string;
  label: string;
  icon: any;
  html: string;
  description: string;
  subject: string;
  category: 'auth' | 'subscription';
}

export const authTemplates: EmailTemplate[] = [
  {
    id: 'reset',
    label: 'Reset de Senha',
    icon: KeyRound,
    html: passwordResetTemplate,
    description: 'Enviado quando o usuário solicita redefinição de senha',
    subject: '🔐 Redefinir sua senha — Comunidade DNB',
    category: 'auth',
  },
  {
    id: 'verify',
    label: 'Verificação',
    icon: Mail,
    html: verificationTemplate,
    description: 'Enviado após o cadastro com link para confirmar o e-mail (magic link)',
    subject: '✉️ Confirme seu e-mail — Comunidade DNB',
    category: 'auth',
  },
  {
    id: 'welcome',
    label: 'Boas-vindas',
    icon: UserPlus,
    html: welcomeTemplate,
    description: 'Enviado após a confirmação do e-mail como onboarding',
    subject: '✈️ Bem-vindo à Comunidade DNB!',
    category: 'auth',
  },
];

export const subscriptionTemplates: EmailTemplate[] = [
  {
    id: 'sub-confirm',
    label: 'Assinatura',
    icon: CreditCard,
    html: subscriptionConfirmTemplate,
    description: 'Enviado quando o usuário assina um plano Premium',
    subject: '🎉 Assinatura Premium confirmada — Comunidade DNB',
    category: 'subscription',
  },
  {
    id: 'sub-upgrade',
    label: 'Upgrade',
    icon: ArrowUpCircle,
    html: upgradeTemplate,
    description: 'Enviado quando o usuário faz upgrade de plano',
    subject: '⬆️ Upgrade realizado — Comunidade DNB',
    category: 'subscription',
  },
  {
    id: 'sub-downgrade',
    label: 'Downgrade',
    icon: ArrowDownCircle,
    html: downgradeTemplate,
    description: 'Enviado quando o usuário faz downgrade de plano. Inclui link para cancelar o downgrade na plataforma.',
    subject: '📋 Plano alterado — Comunidade DNB',
    category: 'subscription',
  },
  {
    id: 'sub-renewal',
    label: 'Renovação',
    icon: RefreshCw,
    html: renewalReminderTemplate,
    description: 'Lembrete enviado antes da renovação automática',
    subject: '🔄 Sua renovação está próxima — Comunidade DNB',
    category: 'subscription',
  },
  {
    id: 'sub-renewed',
    label: 'Renovado',
    icon: CheckCircle,
    html: renewedTemplate,
    description: 'Confirmação de renovação bem-sucedida com recibo',
    subject: '✅ Plano renovado com sucesso — Comunidade DNB',
    category: 'subscription',
  },
  {
    id: 'sub-expiring',
    label: 'Expirando',
    icon: Clock,
    html: expiringTemplate,
    description: 'Alerta quando o plano está prestes a expirar (problema de pagamento)',
    subject: '⏳ Seu plano expira em 3 dias — Comunidade DNB',
    category: 'subscription',
  },
  {
    id: 'sub-cancel',
    label: 'Cancelamento',
    icon: XCircle,
    html: cancellationTemplate,
    description: 'Confirmação de cancelamento com link para reativar na plataforma',
    subject: '😢 Assinatura cancelada — Comunidade DNB',
    category: 'subscription',
  },
];

export const allTemplates = [...authTemplates, ...subscriptionTemplates];
