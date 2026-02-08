import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Building2, Smartphone } from "lucide-react";
import { LocationAggregate } from "@/data/mock-planner-admin";

interface LocationRankingCardProps {
  locations: LocationAggregate[];
}

export function LocationRankingCard({ locations }: LocationRankingCardProps) {
  const formatBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const formatRate = (r: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 4 }).format(r);

  const getCategoryIcon = (cat: string | null) => {
    if (cat === "Banco") return Building2;
    if (cat === "Casa de Câmbio") return MapPin;
    return Smartphone;
  };

  const sortedLocations = [...locations].sort((a, b) => b.transactionCount - a.transactionCount);
  const maxTransactions = sortedLocations[0]?.transactionCount || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Ranking de Locais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Local</TableHead>
                <TableHead className="text-center">Transações</TableHead>
                <TableHead className="text-center">Usuários</TableHead>
                <TableHead className="text-right">Taxa Média</TableHead>
                <TableHead className="text-right">Volume (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLocations.map((loc, index) => {
                const Icon = getCategoryIcon(loc.category);
                const barWidth = (loc.transactionCount / maxTransactions) * 100;
                return (
                  <TableRow key={loc.name}>
                    <TableCell className="font-bold text-muted-foreground w-8">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{loc.name}</p>
                          {loc.category && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 mt-0.5">
                              {loc.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-6 text-center">{loc.transactionCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">{loc.userCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">{formatRate(loc.averageRate)}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatBRL(loc.totalBRL)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
