import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, User, ArrowRight } from "lucide-react";

const academyContent = [
  {
    title: "Fundamentos do Câmbio",
    description: "Aprenda os conceitos básicos do mercado de câmbio e como as cotações são formadas",
    category: "Iniciante",
    readTime: "5 min",
    author: "Equipe DNB",
    tag: "Essencial"
  },
  {
    title: "Melhor Momento para Comprar",
    description: "Estratégias para identificar oportunidades no mercado e otimizar suas compras",
    category: "Intermediário",
    readTime: "8 min",
    author: "Equipe DNB",
    tag: "Popular"
  },
  {
    title: "Planejamento Financeiro para Viagens",
    description: "Como calcular quanto você precisa e como se preparar financeiramente",
    category: "Iniciante",
    readTime: "10 min",
    author: "Equipe DNB",
    tag: "Novo"
  },
  {
    title: "Tipos de Moeda e Documentação",
    description: "Entenda as diferenças entre papel-moeda, cartão pré-pago e outras opções",
    category: "Iniciante",
    readTime: "6 min",
    author: "Equipe DNB",
    tag: "Guia"
  }
];

export default function Academy() {
  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            DNB Academy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aprenda sobre câmbio, viagens e finanças com conteúdo de qualidade criado por especialistas
          </p>
        </div>

        {/* Featured Article */}
        <Card className="bg-gradient-subtle border-border/50 shadow-card">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-accent/20 text-accent">
                Artigo em Destaque
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Guia Completo: Como Planejar suas Compras de Câmbio
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Um guia completo para iniciantes e intermediários sobre como otimizar suas 
              compras de moeda estrangeira, desde o planejamento até a execução.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  15 min de leitura
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Equipe DNB
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Articles Grid */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Todos os Artigos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {academyContent.map((article, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        article.tag === 'Novo' ? 'bg-accent/20 text-accent' :
                        article.tag === 'Popular' ? 'bg-primary/20 text-primary' :
                        'bg-muted'
                      }`}
                    >
                      {article.tag}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {article.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {article.author}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-primary text-white">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold mb-3">
              Quer mais conteúdo exclusivo?
            </h3>
            <p className="text-white/90 mb-6 max-w-md mx-auto">
              Cadastre-se para receber nossos artigos mais recentes diretamente no seu email
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Seu melhor email"
                className="flex-1 px-4 py-2 rounded-lg text-foreground"
              />
              <button className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors">
                Inscrever-se
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}