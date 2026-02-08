import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, ArrowLeft, MapPin, CalendarDays, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  PlannerUserSummary,
  PlannerTransaction,
  mockPlannerTransactions,
} from "@/data/mock-planner-admin";

interface UserPlannerListProps {
  users: PlannerUserSummary[];
}

export function UserPlannerList({ users }: UserPlannerListProps) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<PlannerUserSummary | null>(null);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const userTransactions = useMemo(() => {
    if (!selectedUser) return [];
    return mockPlannerTransactions
      .filter((t) => t.userId === selectedUser.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedUser]);

  const formatBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const formatCurrency = (v: number, code: string) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: code }).format(v);

  const formatRate = (r: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 4 }).format(r);

  const getProgressColor = (pct: number) => {
    if (pct >= 100) return "text-success";
    if (pct >= 60) return "text-primary";
    if (pct >= 30) return "text-warning";
    return "text-destructive";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Usuários com Planner Ativo</CardTitle>
              <CardDescription>
                Busque por nome ou e-mail para ver detalhes individuais
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-center">Moeda</TableHead>
                  <TableHead className="text-right">Meta</TableHead>
                  <TableHead className="text-center">Progresso</TableHead>
                  <TableHead className="text-right">Compras</TableHead>
                  <TableHead className="text-right">Taxa Média</TableHead>
                  <TableHead className="text-right">Total (R$)</TableHead>
                  <TableHead>Viagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedUser(user)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{user.currency}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(user.targetAmount, user.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={user.progressPercentage} className="h-2 w-20" />
                          <span className={`text-xs font-semibold ${getProgressColor(user.progressPercentage)}`}>
                            {user.progressPercentage.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{user.totalTransactions}</TableCell>
                      <TableCell className="text-right">{formatRate(user.averageRate)}</TableCell>
                      <TableCell className="text-right font-medium">{formatBRL(user.totalPaidBRL)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {format(new Date(user.tripDate), "dd/MM/yy", { locale: ptBR })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Drill-Down Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedUser(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  Planner de {selectedUser.name}
                </DialogTitle>
                <DialogDescription>{selectedUser.email}</DialogDescription>
              </DialogHeader>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <SummaryMini label="Meta" value={formatCurrency(selectedUser.targetAmount, selectedUser.currency)} />
                <SummaryMini label="Comprado" value={formatCurrency(selectedUser.totalPurchased, selectedUser.currency)} />
                <SummaryMini label="Taxa Média" value={formatRate(selectedUser.averageRate)} />
                <SummaryMini label="Total Pago" value={formatBRL(selectedUser.totalPaidBRL)} />
              </div>

              {/* Progress */}
              <div className="flex items-center gap-3 mt-2">
                <Progress value={selectedUser.progressPercentage} className="h-3 flex-1" />
                <span className={`text-sm font-bold ${getProgressColor(selectedUser.progressPercentage)}`}>
                  {selectedUser.progressPercentage.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Viagem: {format(new Date(selectedUser.tripDate), "dd/MM/yyyy", { locale: ptBR })}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Última compra: {format(new Date(selectedUser.lastPurchaseDate), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>

              {/* Transaction Table */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Histórico de Transações ({userTransactions.length})</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Taxa</TableHead>
                        <TableHead className="text-right">Total (R$)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userTransactions.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-sm">
                            {format(new Date(t.date), "dd/MM/yy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{t.location}</span>
                              {!t.normalizedLocation && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 text-warning border-warning/30">
                                  Não mapeado
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatCurrency(t.amount, t.currency)}
                          </TableCell>
                          <TableCell className="text-right text-sm">{formatRate(t.rate)}</TableCell>
                          <TableCell className="text-right text-sm font-medium">{formatBRL(t.totalPaid)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className="text-sm font-bold mt-0.5">{value}</p>
    </div>
  );
}
