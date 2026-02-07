import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Check, X, Tag } from 'lucide-react';
import { CouponCategory } from '@/types/coupons';
import { useToast } from '@/hooks/use-toast';

interface CategoryManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CouponCategory[];
  onAdd: (name: string) => CouponCategory | null;
  onUpdate: (id: string, name: string) => boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  getCouponsCount: (categoryName: string) => number;
}

export function CategoryManagement({
  open,
  onOpenChange,
  categories,
  onAdd,
  onUpdate,
  onToggle,
  onDelete,
  getCouponsCount,
}: CategoryManagementProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const { toast } = useToast();

  const handleAdd = () => {
    if (!newCategoryName.trim()) {
      toast({ title: 'Digite um nome para a categoria', variant: 'destructive' });
      return;
    }
    const result = onAdd(newCategoryName);
    if (result) {
      setNewCategoryName('');
      toast({ title: 'Categoria criada com sucesso!' });
    } else {
      toast({ title: 'Categoria já existe ou nome inválido', variant: 'destructive' });
    }
  };

  const handleStartEdit = (category: CouponCategory) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const success = onUpdate(editingId, editingName);
    if (success) {
      setEditingId(null);
      setEditingName('');
      toast({ title: 'Categoria atualizada!' });
    } else {
      toast({ title: 'Nome duplicado ou inválido', variant: 'destructive' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    toast({ title: 'Categoria excluída com sucesso!' });
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const activeCount = categories.filter(c => c.isActive).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Gerenciar Categorias
          </SheetTitle>
          <SheetDescription>
            {categories.length} categorias • {activeCount} ativas
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 mt-4 overflow-hidden">
          {/* Add new category */}
          <div className="flex gap-2">
            <Input
              placeholder="Nova categoria..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleAdd)}
              className="flex-1"
              maxLength={40}
            />
            <Button size="sm" onClick={handleAdd} disabled={!newCategoryName.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>

          <Separator />

          {/* Category list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma categoria criada</p>
              </div>
            ) : (
              categories.map((category) => {
                const couponCount = getCouponsCount(category.name);
                const isEditing = editingId === category.id;

                return (
                  <div
                    key={category.id}
                    className={`group flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      category.isActive ? 'bg-card hover:bg-accent/50' : 'bg-muted/30 opacity-70'
                    }`}
                  >
                    {isEditing ? (
                      /* Editing mode */
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, handleSaveEdit)}
                          className="h-8 text-sm flex-1"
                          maxLength={40}
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveEdit}>
                          <Check className="h-3.5 w-3.5 text-success" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelEdit}>
                          <X className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      /* Display mode */
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{category.name}</p>
                            {couponCount > 0 && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {couponCount} {couponCount === 1 ? 'cupom' : 'cupons'}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Switch
                            checked={category.isActive}
                            onCheckedChange={() => onToggle(category.id)}
                            className="scale-75"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleStartEdit(category)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir "{category.name}"?
                                  {couponCount > 0 && (
                                    <span className="block mt-2 font-medium text-foreground">
                                      ⚠️ {couponCount} {couponCount === 1 ? 'cupom ficará' : 'cupons ficarão'} sem categoria.
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(category.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer hint */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Categorias inativas não aparecem ao criar cupons. Excluir uma categoria remove a associação dos cupons existentes.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
