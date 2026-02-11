import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { CreateCouponData, CouponCategory, Coupon } from "@/types/coupons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const createCouponSchema = z.object({
  partnerName: z.string().min(1, "Nome do parceiro é obrigatório"),
  partnerLogo: z.string().min(1, "Logo do parceiro é obrigatório"),
  categoryId: z.string().optional(),
  offerTitle: z.string().min(1, "Título da oferta é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  code: z.string().min(1, "Código do cupom é obrigatório"),
  destinationUrl: z.string().url("URL inválida"),
  expirationDate: z.string().optional(),
  isActive: z.boolean(),
  isPremiumOnly: z.boolean().optional(),
});

const cropAndResize = (file: File, size: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
        'image/webp',
        0.85
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CouponCategory[];
  onSubmit: (data: CreateCouponData) => Promise<void>;
  editingCoupon?: Coupon | null;
}

export const CreateCouponModal = ({ 
  isOpen, 
  onClose, 
  categories, 
  onSubmit, 
  editingCoupon 
}: CreateCouponModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const { toast } = useToast();

  const defaultValues: CreateCouponData = {
    partnerName: "",
    partnerLogo: "",
    categoryId: "",
    offerTitle: "",
    description: "",
    code: "",
    destinationUrl: "",
    expirationDate: undefined,
    isActive: true,
    isPremiumOnly: false,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<CreateCouponData>({
    resolver: zodResolver(createCouponSchema),
    defaultValues,
  });

  // Reset form when editing coupon changes
  useEffect(() => {
    if (editingCoupon) {
      reset({
        partnerName: editingCoupon.partnerName,
        partnerLogo: editingCoupon.partnerLogo,
        categoryId: editingCoupon.categoryId || "",
        offerTitle: editingCoupon.offerTitle,
        description: editingCoupon.description,
        code: editingCoupon.code,
        destinationUrl: editingCoupon.destinationUrl,
        expirationDate: editingCoupon.expirationDate,
        isActive: editingCoupon.isActive,
        isPremiumOnly: editingCoupon.isPremiumOnly ?? false,
      });
      setLogoPreview(editingCoupon.partnerLogo);
    } else {
      reset(defaultValues);
      setLogoPreview("");
    }
  }, [editingCoupon, reset]);

  const watchedFields = watch();

  const selectedDate = watchedFields.expirationDate 
    ? new Date(watchedFields.expirationDate) 
    : undefined;

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const blob = await cropAndResize(file, 200);
      const path = `coupon-logos/${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.webp`;
      
      const { error: uploadError } = await supabase.storage
        .from('platform-assets')
        .upload(path, blob, { contentType: 'image/webp', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('platform-assets')
        .getPublicUrl(path);

      setLogoPreview(urlData.publicUrl);
      setValue("partnerLogo", urlData.publicUrl);
      
      toast({
        title: "Logo carregado com sucesso!",
        description: "O logo do parceiro foi carregado e redimensionado para 200×200px.",
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o logo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input so the same file can be re-selected
      e.target.value = '';
    }
  };

  const onSubmitForm = async (data: CreateCouponData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast({
        title: editingCoupon ? "Cupom atualizado!" : "Cupom criado!",
        description: editingCoupon 
          ? "O cupom foi atualizado com sucesso." 
          : "O novo cupom foi criado com sucesso.",
      });
      reset(defaultValues);
      setLogoPreview("");
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cupom. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    const hasData = watchedFields.partnerName || watchedFields.offerTitle || watchedFields.code;
    if (hasData && !editingCoupon) {
      if (!confirm('Tem certeza que deseja sair? Os dados preenchidos serão perdidos.')) return;
    }
    reset(defaultValues);
    setLogoPreview("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editingCoupon ? 'Editar Cupom' : 'Criar Novo Cupom'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Partner Name */}
            <div className="space-y-2">
              <Label htmlFor="partnerName">Nome do Parceiro *</Label>
              <Input
                id="partnerName"
                {...register("partnerName")}
                placeholder="Ex: Amazon, Nike, etc."
              />
              {errors.partnerName && (
                <p className="text-sm text-destructive">{errors.partnerName.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria</Label>
              <Select
                value={watchedFields.categoryId || "none"}
                onValueChange={(value) => setValue("categoryId", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.filter(cat => cat.isActive).map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Partner Logo */}
          <div className="space-y-2">
            <Label htmlFor="partnerLogo">Logo do Parceiro * <span className="text-xs text-muted-foreground">(será redimensionado para 200×200px)</span></Label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <Label htmlFor="logoUpload" className={cn("cursor-pointer", isUploading && "pointer-events-none opacity-50")}>
                  <div className="flex items-center gap-2 p-3 border border-dashed border-border rounded-lg hover:bg-muted/50 transition-colors">
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {isUploading ? 'Enviando...' : 'Clique para fazer upload do logo'}
                    </span>
                  </div>
                  <input
                    id="logoUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </Label>
              </div>
            </div>
            {errors.partnerLogo && (
              <p className="text-sm text-destructive">{errors.partnerLogo.message}</p>
            )}
          </div>

          {/* Offer Title */}
          <div className="space-y-2">
            <Label htmlFor="offerTitle">Título da Oferta *</Label>
            <Input
              id="offerTitle"
              {...register("offerTitle")}
              placeholder="Ex: 10% de desconto em eletrônicos"
            />
            {errors.offerTitle && (
              <p className="text-sm text-destructive">{errors.offerTitle.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição / Regras de Uso *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva as regras e condições do cupom..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coupon Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Código do Cupom *</Label>
              <Input
                id="code"
                {...register("code")}
                placeholder="Ex: TECH10"
                className="font-mono"
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>

            {/* Destination URL */}
            <div className="space-y-2">
              <Label htmlFor="destinationUrl">Link de Destino *</Label>
              <Input
                id="destinationUrl"
                {...register("destinationUrl")}
                placeholder="https://example.com"
                type="url"
              />
              {errors.destinationUrl && (
                <p className="text-sm text-destructive">{errors.destinationUrl.message}</p>
              )}
            </div>
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expirationDate">Data de Validade (Opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecionar data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setValue("expirationDate", date ? format(date, 'yyyy-MM-dd') : undefined)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={watchedFields.isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
              <Label htmlFor="isActive">Cupom ativo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPremiumOnly"
                checked={watchedFields.isPremiumOnly ?? false}
                onCheckedChange={(checked) => setValue("isPremiumOnly", checked)}
              />
              <Label htmlFor="isPremiumOnly">Exclusivo Premium</Label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? 'Salvando...' : editingCoupon ? 'Atualizar' : 'Criar Cupom'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
