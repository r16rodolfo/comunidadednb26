
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, KeyRound, UserPlus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const passwordResetTemplate = `
<div style="background-color: #f8faf8; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); padding: 40px 32px; text-align: center;">
      <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">🔐</span>
      </div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Redefinir Senha</h1>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0;">Comunidade DNB</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 32px;">
      <p style="color: #1a2b1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">
        Olá, <strong>João</strong>! 👋
      </p>
      <p style="color: #4a5a4a; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(26,138,74,0.3);">
          Redefinir Minha Senha
        </a>
      </div>
      
      <!-- Security Notice -->
      <div style="background: #f0faf4; border: 1px solid #d0e8d8; border-radius: 10px; padding: 16px; margin: 24px 0;">
        <p style="color: #1a6a3a; font-size: 13px; line-height: 1.5; margin: 0;">
          ⏰ Este link expira em <strong>1 hora</strong>.<br/>
          🔒 Se você não solicitou esta redefinição, ignore este e-mail com segurança.
        </p>
      </div>
      
      <!-- Alternative Link -->
      <p style="color: #8a9a8a; font-size: 12px; line-height: 1.5; margin: 24px 0 0;">
        Se o botão não funcionar, copie e cole este link no navegador:<br/>
        <span style="color: #1a8a4a; word-break: break-all;">https://comunidadednb.com/reset?token=abc123xyz</span>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8faf8; padding: 24px 32px; border-top: 1px solid #e8f0e8;">
      <p style="color: #8a9a8a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
        © 2026 Comunidade DNB · Todos os direitos reservados<br/>
        <a href="#" style="color: #1a8a4a; text-decoration: none;">Política de Privacidade</a> · 
        <a href="#" style="color: #1a8a4a; text-decoration: none;">Termos de Uso</a>
      </p>
    </div>
  </div>
</div>
`;

const verificationTemplate = `
<div style="background-color: #f8faf8; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); padding: 40px 32px; text-align: center;">
      <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">✉️</span>
      </div>
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Confirme seu E-mail</h1>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0;">Comunidade DNB</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 32px;">
      <p style="color: #1a2b1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">
        Olá, <strong>Maria</strong>! 🎉
      </p>
      <p style="color: #4a5a4a; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        Bem-vinda à Comunidade DNB! Para ativar sua conta e começar a planejar suas viagens, confirme seu endereço de e-mail:
      </p>
      
      <!-- OTP Code -->
      <div style="text-align: center; margin: 32px 0;">
        <p style="color: #8a9a8a; font-size: 13px; margin: 0 0 12px;">Seu código de verificação:</p>
        <div style="display: inline-block; background: #f0faf4; border: 2px dashed #1a8a4a; border-radius: 12px; padding: 16px 32px;">
          <span style="font-size: 32px; font-weight: 800; color: #1a8a4a; letter-spacing: 8px; font-family: monospace;">847293</span>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 24px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(26,138,74,0.3);">
          Confirmar E-mail
        </a>
      </div>
      
      <div style="background: #f0faf4; border: 1px solid #d0e8d8; border-radius: 10px; padding: 16px; margin: 24px 0;">
        <p style="color: #1a6a3a; font-size: 13px; line-height: 1.5; margin: 0;">
          ⏰ O código expira em <strong>24 horas</strong>.<br/>
          🛡️ Se você não criou esta conta, ignore este e-mail.
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8faf8; padding: 24px 32px; border-top: 1px solid #e8f0e8;">
      <p style="color: #8a9a8a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
        © 2026 Comunidade DNB · Todos os direitos reservados<br/>
        <a href="#" style="color: #1a8a4a; text-decoration: none;">Política de Privacidade</a> · 
        <a href="#" style="color: #1a8a4a; text-decoration: none;">Termos de Uso</a>
      </p>
    </div>
  </div>
</div>
`;

const welcomeTemplate = `
<div style="background-color: #f8faf8; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a8a4a 0%, #e67e22 100%); padding: 48px 32px; text-align: center;">
      <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">✈️</span>
      </div>
      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">Bem-vindo à<br/>Comunidade DNB!</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 15px; margin: 12px 0 0;">Sua jornada financeira para Disney começa agora 🏰</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 32px;">
      <p style="color: #1a2b1a; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">
        Olá, <strong>Carlos</strong>! 🎊
      </p>
      <p style="color: #4a5a4a; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
        Sua conta foi confirmada com sucesso! Agora você faz parte de uma comunidade exclusiva de viajantes que planejam suas viagens com inteligência financeira.
      </p>
      
      <!-- Features Grid -->
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

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #1a8a4a 0%, #22a85a 100%); color: #ffffff; text-decoration: none; padding: 14px 48px; border-radius: 10px; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(26,138,74,0.3);">
          Acessar Minha Conta
        </a>
      </div>
      
      <!-- Tip -->
      <div style="background: linear-gradient(135deg, #f0faf4, #fef7ec); border-radius: 10px; padding: 16px; margin: 24px 0;">
        <p style="color: #1a4a2a; font-size: 13px; line-height: 1.5; margin: 0;">
          💡 <strong>Dica:</strong> Comece configurando seu Planner para definir suas metas de viagem e acompanhar seus gastos em dólar!
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8faf8; padding: 24px 32px; border-top: 1px solid #e8f0e8;">
      <p style="color: #8a9a8a; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
        © 2026 Comunidade DNB · Todos os direitos reservados<br/>
        <a href="#" style="color: #1a8a4a; text-decoration: none;">Política de Privacidade</a> · 
        <a href="#" style="color: #1a8a4a; text-decoration: none;">Termos de Uso</a>
      </p>
    </div>
  </div>
</div>
`;

const templates = [
  {
    id: 'reset',
    label: 'Reset de Senha',
    icon: KeyRound,
    html: passwordResetTemplate,
    description: 'Enviado quando o usuário solicita redefinição de senha',
  },
  {
    id: 'verify',
    label: 'Verificação de E-mail',
    icon: Mail,
    html: verificationTemplate,
    description: 'Enviado após o cadastro para confirmar o e-mail',
  },
  {
    id: 'welcome',
    label: 'Boas-vindas',
    icon: UserPlus,
    html: welcomeTemplate,
    description: 'Enviado após a confirmação do e-mail como onboarding',
  },
];

export default function EmailTemplatePreview() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reset');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Preview dos Templates de E-mail
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualize como ficarão os e-mails de autenticação da plataforma
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-8 w-full max-w-lg">
            {templates.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-2">
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {templates.map((t) => (
            <TabsContent key={t.id} value={t.id}>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </div>

              {/* Email Preview Frame */}
              <Card className="overflow-hidden border-2 border-border/50">
                {/* Fake email client header */}
                <div className="bg-muted/50 border-b px-4 py-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">De:</span>
                    <span>Comunidade DNB &lt;noreply@comunidadednb.com&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Para:</span>
                    <span>usuario@email.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Assunto:</span>
                    <span className="text-foreground">
                      {t.id === 'reset' && '🔐 Redefinir sua senha — Comunidade DNB'}
                      {t.id === 'verify' && '✉️ Confirme seu e-mail — Comunidade DNB'}
                      {t.id === 'welcome' && '✈️ Bem-vindo à Comunidade DNB!'}
                    </span>
                  </div>
                </div>

                {/* Email body */}
                <div
                  className="bg-[#f8faf8]"
                  dangerouslySetInnerHTML={{ __html: t.html }}
                />
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Info box */}
        <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold text-foreground mb-2">🚀 Próximos passos para implementar</h3>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
            <li>Criar conta gratuita em <strong>resend.com</strong> (100 e-mails/dia grátis)</li>
            <li>Validar domínio em <strong>resend.com/domains</strong></li>
            <li>Gerar API Key em <strong>resend.com/api-keys</strong></li>
            <li>Me enviar a API Key para implementar a edge function</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
