import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  Check, 
  X, 
  Users, 
  DollarSign, 
  BookOpen, 
  ShoppingBag,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
  icon: 'users' | 'dollar' | 'book' | 'shopping' | 'alert' | 'info' | 'check';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'Novo usuário registrado',
    message: 'João Silva se inscreveu na plataforma',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    icon: 'users',
    action: { label: 'Ver perfil', href: '/manager/users' }
  },
  {
    id: '2',
    type: 'success',
    title: 'Pagamento recebido',
    message: 'Maria Santos renovou assinatura Premium',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false,
    icon: 'dollar',
    action: { label: 'Ver detalhes', href: '/manager/analytics' }
  },
  {
    id: '3',
    type: 'warning',
    title: 'Curso com baixo engajamento',
    message: 'Estratégias Avançadas com apenas 45% de conclusão',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: true,
    icon: 'book',
    action: { label: 'Analisar curso', href: '/manager/content' }
  },
  {
    id: '4',
    type: 'info',
    title: 'Produto destacado',
    message: 'Cartão Pré-pago teve 50+ cliques hoje',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
    icon: 'shopping',
    action: { label: 'Ver analytics', href: '/manager/analytics' }
  }
];

const getNotificationIcon = (icon: Notification['icon']) => {
  const iconProps = { className: "h-4 w-4" };
  
  switch (icon) {
    case 'users': return <Users {...iconProps} />;
    case 'dollar': return <DollarSign {...iconProps} />;
    case 'book': return <BookOpen {...iconProps} />;
    case 'shopping': return <ShoppingBag {...iconProps} />;
    case 'alert': return <AlertTriangle {...iconProps} />;
    case 'info': return <Info {...iconProps} />;
    case 'check': return <CheckCircle {...iconProps} />;
    default: return <Bell {...iconProps} />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'success': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'error': return 'text-red-600';
    default: return 'text-blue-600';
  }
};

const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Agora mesmo';
  if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h atrás`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d atrás`;
};

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new notifications (10% chance every 30 seconds)
      if (Math.random() < 0.1) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'info',
          title: 'Nova atividade',
          message: 'Usuário visualizou uma aula',
          timestamp: new Date(),
          read: false,
          icon: 'book'
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        
        toast({
          title: newNotification.title,
          description: newNotification.message,
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [toast]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem 
              key={notification.id} 
              className="p-0 focus:bg-transparent"
              onSelect={(e) => e.preventDefault()}
            >
              <Card className={`w-full border-0 shadow-none ${!notification.read ? 'bg-muted/30' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.icon)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1"
                            onClick={() => removeNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        
                        {notification.action && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              // Here you would navigate to the action href
                              console.log('Navigate to:', notification.action?.href);
                              setIsOpen(false);
                            }}
                          >
                            {notification.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}