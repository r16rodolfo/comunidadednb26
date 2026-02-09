import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Props {
  data: { location: string; count: number; volume: number }[];
}

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function PlannerTopLocations({ data }: Props) {
  const maxCount = data.length > 0 ? data[0].count : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4 text-primary" />
          Top Estabelecimentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum registro encontrado.</p>
        ) : (
          <div className="space-y-3">
            {data.map((loc, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate max-w-[60%]">{loc.location}</span>
                  <span className="text-muted-foreground text-xs">
                    {loc.count} compra{loc.count !== 1 ? 's' : ''} · {formatBRL(loc.volume)}
                  </span>
                </div>
                <Progress value={(loc.count / maxCount) * 100} className="h-1.5" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
