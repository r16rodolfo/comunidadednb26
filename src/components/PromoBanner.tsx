import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, ImageIcon, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import heroImage from "@/assets/dnb-hero.jpg";

const BANNER_STORAGE_KEY = "dnb_banner_image";

export default function PromoBanner() {
  const { user, hasRole } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const isManager = hasRole(UserRole.MANAGER) || hasRole(UserRole.ADMIN);

  useEffect(() => {
    const stored = localStorage.getItem(BANNER_STORAGE_KEY);
    if (stored) setBannerUrl(stored);
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // Compress by drawing to canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 1920;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.8);
        localStorage.setItem(BANNER_STORAGE_KEY, compressed);
        setBannerUrl(compressed);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBanner = () => {
    localStorage.removeItem(BANNER_STORAGE_KEY);
    setBannerUrl(null);
  };

  const displayImage = bannerUrl || heroImage;

  return (
    <Card className="relative overflow-hidden border-0 shadow-glow rounded-2xl group">
      {/* Banner Image */}
      <div className="relative w-full aspect-[21/7] md:aspect-[21/6]">
        <img
          src={displayImage}
          alt="Banner da Comunidade DNB"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />

        {/* Badge no topo */}
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-foreground border-border/50 text-xs">
            <Sparkles className="h-3 w-3 mr-1 text-accent" />
            Comunidade DNB
          </Badge>
        </div>

        {/* Upload Controls - Only for managers/admins */}
        {isManager && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              variant="secondary"
              size="sm"
              className="bg-background/80 backdrop-blur-sm hover:bg-background/95 text-foreground border-border/50 text-xs gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              {bannerUrl ? <ImageIcon className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
              {bannerUrl ? "Trocar imagem" : "Upload banner"}
            </Button>
            {bannerUrl && (
              <Button
                variant="secondary"
                size="sm"
                className="bg-background/80 backdrop-blur-sm hover:bg-destructive/90 hover:text-destructive-foreground text-foreground border-border/50 px-2"
                onClick={handleRemoveBanner}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
