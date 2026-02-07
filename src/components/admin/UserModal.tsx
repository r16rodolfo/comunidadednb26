import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const userSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail deve ter no máximo 255 caracteres"),
  role: z.string().min(1, "Tipo é obrigatório"),
  subscription: z.string().min(1, "Assinatura é obrigatória"),
  isActive: z.boolean(),
});

export type UserFormData = z.infer<typeof userSchema>;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastAccess: string;
  subscription: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  editingUser?: AdminUser | null;
}

export const UserModal = ({ isOpen, onClose, onSubmit, editingUser }: UserModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Gratuito",
      subscription: "Gratuito",
      isActive: true,
    },
  });

  useEffect(() => {
    if (editingUser) {
      reset({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        subscription: editingUser.subscription,
        isActive: editingUser.status === "Ativo",
      });
    } else {
      reset({
        name: "",
        email: "",
        role: "Gratuito",
        subscription: "Gratuito",
        isActive: true,
      });
    }
  }, [editingUser, reset]);

  const watchedRole = watch("role");
  const watchedActive = watch("isActive");

  const onSubmitForm = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      onSubmit(data);
      toast({
        title: editingUser ? "Usuário atualizado!" : "Usuário criado!",
        description: editingUser
          ? `${data.name} foi atualizado com sucesso.`
          : `${data.name} foi adicionado à plataforma.`,
      });
      handleClose();
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {editingUser
              ? "Atualize as informações do usuário abaixo."
              : "Preencha os dados para criar um novo usuário na plataforma."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo *</Label>
            <Input id="name" {...register("name")} placeholder="Ex: João Silva" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" type="email" {...register("email")} placeholder="joao@email.com" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Role */}
            <div className="space-y-2">
              <Label>Tipo de usuário *</Label>
              <Select value={watchedRole} onValueChange={(value) => setValue("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gratuito">Gratuito</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Gestor">Gestor</SelectItem>
                  <SelectItem value="Admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>

            {/* Subscription */}
            <div className="space-y-2">
              <Label>Plano de assinatura *</Label>
              <Select
                value={watch("subscription")}
                onValueChange={(value) => setValue("subscription", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gratuito">Gratuito</SelectItem>
                  <SelectItem value="Premium Mensal">Premium Mensal</SelectItem>
                  <SelectItem value="Premium Anual">Premium Anual</SelectItem>
                </SelectContent>
              </Select>
              {errors.subscription && (
                <p className="text-sm text-destructive">{errors.subscription.message}</p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watchedActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
            <Label htmlFor="isActive">Usuário ativo</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : editingUser ? "Atualizar" : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
