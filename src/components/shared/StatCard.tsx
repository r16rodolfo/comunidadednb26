import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export function StatCard({ label, value, icon: Icon, variant = 'default' }: StatCardProps) {
  const iconClass = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
  }[variant];

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div className="rounded-xl bg-muted/60 p-2.5">
            <Icon className={`h-6 w-6 ${iconClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
