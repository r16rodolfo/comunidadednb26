
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Eye, ShieldCheck, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authTemplates, subscriptionTemplates, type EmailTemplate } from '@/data/email-templates';

function EmailPreviewCard({ template }: { template: EmailTemplate }) {
  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>
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
            <span className="text-foreground">{template.subject}</span>
          </div>
        </div>

        {/* Email body */}
        <div
          className="bg-[#f8faf8]"
          dangerouslySetInnerHTML={{ __html: template.html }}
        />
      </Card>
    </div>
  );
}

export default function EmailTemplatePreview() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<'auth' | 'subscription'>('subscription');
  const [activeAuthTab, setActiveAuthTab] = useState(authTemplates[0].id);
  const [activeSubTab, setActiveSubTab] = useState(subscriptionTemplates[0].id);

  const currentTemplates = category === 'auth' ? authTemplates : subscriptionTemplates;
  const activeTab = category === 'auth' ? activeAuthTab : activeSubTab;
  const setActiveTab = category === 'auth' ? setActiveAuthTab : setActiveSubTab;

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
              Visualize como ficarão os e-mails da plataforma
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Category Switcher */}
        <div className="flex gap-3 mb-6">
          <Button
            variant={category === 'auth' ? 'default' : 'outline'}
            onClick={() => setCategory('auth')}
            className="gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Autenticação ({authTemplates.length})
          </Button>
          <Button
            variant={category === 'subscription' ? 'default' : 'outline'}
            onClick={() => setCategory('subscription')}
            className="gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Assinaturas ({subscriptionTemplates.length})
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid mb-8 w-full ${
            currentTemplates.length <= 3 
              ? `grid-cols-${currentTemplates.length}` 
              : 'grid-cols-4 sm:grid-cols-7'
          }`}
          style={{
            gridTemplateColumns: `repeat(${Math.min(currentTemplates.length, 7)}, minmax(0, 1fr))`
          }}>
            {currentTemplates.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-1.5 text-xs sm:text-sm px-2">
                <t.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline truncate">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {currentTemplates.map((t) => (
            <TabsContent key={t.id} value={t.id}>
              <EmailPreviewCard template={t} />
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
