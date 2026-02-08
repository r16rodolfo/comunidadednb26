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
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">{label}</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight truncate">{value}</p>
          </div>
          <div className="rounded-xl bg-muted/60 p-2 sm:p-2.5 flex-shrink-0">
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
