import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { TrendingUp, Users, DollarSign, Eye, MousePointer, BookOpen, QrCode, CreditCard, ArrowUpRight, ArrowDownRight, AlertCircle, RotateCcw, Play, GraduationCap, Clock, Target } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { Progress } from '@/components/ui/progress';
import {
  monthlyRevenue, userActivity, subscriptionTypes,
  monthlyRevenueByGateway, paymentMethodDistribution, paymentStats,
  recentPayments, revenueByPlan, coursePerformance, lessonPerformance,
} from '@/data/mock-admin';

export default function Analytics() {
  return (
    <Layout>
      <div className="space-y-6">
        <AdminPageHeader icon={TrendingUp} title="Analytics e Relatórios" description="Acompanhe o desempenho da plataforma" />

        {/* Key Metrics */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard label="Receita Mensal" value="R$ 28.900" icon={DollarSign} variant="success" />
          <StatCard label="Usuários Ativos" value="1.245" icon={Users} variant="info" />
          <StatCard label="Taxa de Conversão" value="3.6%" icon={MousePointer} variant="warning" />
          <StatCard label="Visualizações" value="45.680" icon={Eye} />
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">Usuários</TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm">Conteúdo</TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs sm:text-sm">Receita</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Receita Mensal</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Receita']} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Distribuição de Usuários</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={subscriptionTypes} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                        {subscriptionTypes.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Porcentagem']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {subscriptionTypes.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm">{entry.name}: {entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Atividade Semanal</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="logins" fill="hsl(var(--primary))" name="Logins" />
                      <Bar dataKey="newUsers" fill="hsl(var(--accent))" name="Novos Usuários" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Crescimento de Usuários</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={3} name="Usuários" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {/* Content KPIs */}
            {(() => {
              const publishedCourses = coursePerformance.filter(c => c.publishedLessons > 0);
              const totalViews = coursePerformance.reduce((sum, c) => sum + c.totalViews, 0);
              const totalCompletions = coursePerformance.reduce((sum, c) => sum + c.completions, 0);
              const avgCPS = publishedCourses.length > 0
                ? Math.round(publishedCourses.reduce((sum, c) => sum + c.cps, 0) / publishedCourses.length)
                : 0;
              return (
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Cursos Publicados" value={`${publishedCourses.length} / ${coursePerformance.length}`} icon={BookOpen} />
                  <StatCard label="Visualizações Totais" value={totalViews.toLocaleString('pt-BR')} icon={Eye} variant="info" />
                  <StatCard label="Conclusões" value={totalCompletions.toLocaleString('pt-BR')} icon={GraduationCap} variant="success" />
                  <StatCard label="CPS Médio" value={`${avgCPS}/100`} icon={Target} variant={avgCPS >= 70 ? 'success' : avgCPS >= 50 ? 'warning' : 'info'} />
                </div>
              );
            })()}

            {/* Course Performance Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {coursePerformance.map((course) => (
                <Card key={course.courseId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{course.courseName}</CardTitle>
                      {course.publishedLessons > 0 ? (
                        <Badge variant="default" className="bg-success/10 text-success border-success/20">Publicado</Badge>
                      ) : (
                        <Badge variant="secondary">Rascunho</Badge>
                      )}
                    </div>
                    <CardDescription>{course.totalLessons} aulas • {course.publishedLessons} publicadas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.publishedLessons > 0 ? (
                      <>
                        {/* CPS Score */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium flex items-center gap-1.5">
                              <Target className="h-3.5 w-3.5 text-primary" />
                              Content Performance Score
                            </span>
                            <span className="font-bold">{course.cps}/100</span>
                          </div>
                          <Progress value={course.cps} className="h-2" />
                          <p className="text-[11px] text-muted-foreground">
                            Engajamento ({(course.engagementRate).toFixed(0)}%) × 0.35 + Watchtime ({course.avgWatchTime}%) × 0.30 + Retenção ({course.retentionRate}%) × 0.20 + Conclusão × 0.15
                          </p>
                        </div>

                        {/* Metrics grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border p-3 text-center">
                            <Eye className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                            <p className="text-lg font-bold">{course.totalViews.toLocaleString('pt-BR')}</p>
                            <p className="text-[11px] text-muted-foreground">{course.uniqueViewers} alunos únicos</p>
                          </div>
                          <div className="rounded-lg border p-3 text-center">
                            <GraduationCap className="h-4 w-4 mx-auto text-success mb-1" />
                            <p className="text-lg font-bold">{course.completions}</p>
                            <p className="text-[11px] text-muted-foreground">{course.engagementRate.toFixed(1)}% engajamento</p>
                          </div>
                          <div className="rounded-lg border p-3 text-center">
                            <Clock className="h-4 w-4 mx-auto text-info mb-1" />
                            <p className="text-lg font-bold">{course.avgWatchTime}%</p>
                            <p className="text-[11px] text-muted-foreground">Tempo médio assistido</p>
                          </div>
                          <div className="rounded-lg border p-3 text-center">
                            <Play className="h-4 w-4 mx-auto text-warning mb-1" />
                            <p className="text-lg font-bold">{course.retentionRate}%</p>
                            <p className="text-[11px] text-muted-foreground">Retenção entre módulos</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">Curso não publicado — sem dados de performance</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Lesson-level breakdown */}
            {lessonPerformance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance por Aula</CardTitle>
                  <CardDescription>Detalhamento individual vinculado aos cursos cadastrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Aula</TableHead>
                          <TableHead>Módulo</TableHead>
                          <TableHead className="text-right">Views</TableHead>
                          <TableHead className="text-right">Conclusões</TableHead>
                          <TableHead className="text-right">Watchtime</TableHead>
                          <TableHead className="text-right">Drop-off</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lessonPerformance.map((lesson) => (
                          <TableRow key={lesson.lessonId}>
                            <TableCell className="font-medium text-sm">{lesson.lessonTitle}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{lesson.moduleName}</TableCell>
                            <TableCell className="text-right text-sm">{lesson.views.toLocaleString('pt-BR')}</TableCell>
                            <TableCell className="text-right text-sm">{lesson.completions.toLocaleString('pt-BR')}</TableCell>
                            <TableCell className="text-right text-sm">
                              <span className={lesson.avgWatchTime >= 80 ? 'text-success' : lesson.avgWatchTime >= 60 ? 'text-warning' : 'text-destructive'}>
                                {lesson.avgWatchTime}%
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              <span className={lesson.dropOffRate <= 15 ? 'text-success' : lesson.dropOffRate <= 25 ? 'text-warning' : 'text-destructive'}>
                                {lesson.dropOffRate}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            {/* Revenue Stats */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total de Pagamentos"
                value={paymentStats.totalPayments.toLocaleString('pt-BR')}
                icon={DollarSign}
              />
              <StatCard
                label="Pagamentos via PIX"
                value={paymentStats.pixPayments.toLocaleString('pt-BR')}
                icon={QrCode}
                variant="success"
              />
              <StatCard
                label="Pagamentos via Cartão"
                value={paymentStats.cardPayments.toLocaleString('pt-BR')}
                icon={CreditCard}
                variant="info"
              />
              <StatCard
                label="Falhas / Reembolsos"
                value={`${paymentStats.failedPayments} / ${paymentStats.refunds}`}
                icon={AlertCircle}
                variant="warning"
              />
            </div>

            {/* Revenue charts */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Revenue by gateway over time */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Receita por Método de Pagamento</CardTitle>
                  <CardDescription>Evolução mensal PIX vs Cartão de Crédito</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyRevenueByGateway}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number) => [`R$ ${(value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                        labelFormatter={(label) => `Mês: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="pix" name="PIX" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cartao" name="Cartão" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payment method distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribuição por Gateway</CardTitle>
                  <CardDescription>Proporção entre PIX e Cartão de Crédito</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={paymentMethodDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        dataKey="value"
                        paddingAngle={4}
                      >
                        {paymentMethodDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Proporção']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2">
                    {paymentMethodDistribution.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm font-medium">{entry.name}</span>
                        <span className="text-sm text-muted-foreground">{entry.value}%</span>
                      </div>
                    ))}
                  </div>
                  {/* Revenue summary */}
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-success mb-1">
                        <QrCode className="h-4 w-4" />
                        <span className="text-xs font-medium">PIX</span>
                      </div>
                      <p className="text-lg font-bold">R$ {(paymentStats.pixRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-muted-foreground">Ticket médio: R$ {paymentStats.avgTicketPix.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-primary mb-1">
                        <CreditCard className="h-4 w-4" />
                        <span className="text-xs font-medium">Cartão</span>
                      </div>
                      <p className="text-lg font-bold">R$ {(paymentStats.cardRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-muted-foreground">Ticket médio: R$ {paymentStats.avgTicketCard.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue by plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Receita por Plano</CardTitle>
                <CardDescription>Distribuição de pagamentos por plano de assinatura</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revenueByPlan.map((plan) => (
                    <div key={plan.name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg border">
                      <div className="min-w-[90px]">
                        <p className="font-semibold text-sm">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {(plan.totalRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex-1">
                        <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                          <div
                            className="h-full rounded-l-full"
                            style={{ width: `${plan.pix}%`, backgroundColor: 'hsl(var(--success))' }}
                          />
                          <div
                            className="h-full rounded-r-full"
                            style={{ width: `${plan.cartao}%`, backgroundColor: 'hsl(var(--primary))' }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs sm:min-w-[120px]">
                        <span className="flex items-center gap-1">
                          <QrCode className="h-3 w-3 text-success" />
                          {plan.pix}%
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3 text-primary" />
                          {plan.cartao}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pagamentos Recentes</CardTitle>
                <CardDescription>Últimas transações processadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium text-sm">{payment.user}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {payment.method === 'pix' ? (
                                <QrCode className="h-3.5 w-3.5 text-success" />
                              ) : (
                                <CreditCard className="h-3.5 w-3.5 text-primary" />
                              )}
                              <span className="text-sm">{payment.method === 'pix' ? 'PIX' : 'Cartão'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{payment.plan}</TableCell>
                          <TableCell className="text-sm font-medium">
                            R$ {(payment.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            {payment.status === 'paid' && (
                              <Badge variant="default" className="bg-success/10 text-success border-success/20">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                Pago
                              </Badge>
                            )}
                            {payment.status === 'failed' && (
                              <Badge variant="destructive">
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                                Falhou
                              </Badge>
                            )}
                            {payment.status === 'refunded' && (
                              <Badge variant="secondary">
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Reembolsado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(payment.date).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
