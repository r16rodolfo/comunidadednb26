import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BannerItem } from "@/types/admin";
import heroImage from "@/assets/dnb-hero.jpg";

interface PromoBannerProps {
  banners: BannerItem[];
}

export default function PromoBanner({ banners }: PromoBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use banners from config, or fallback to default hero
  const displayBanners: BannerItem[] = banners.length > 0
    ? banners
    : [{ id: 'default', imageUrl: heroImage, redirectUrl: '', alt: 'Banner da Comunidade DNB', order: 0 }];

  const hasMultiple = displayBanners.length > 1;

  // Auto-rotate every 5s
  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [hasMultiple, displayBanners.length]);

  const goTo = useCallback((idx: number) => setCurrentIndex(idx), []);
  const goPrev = useCallback(() => setCurrentIndex(prev => (prev - 1 + displayBanners.length) % displayBanners.length), [displayBanners.length]);
  const goNext = useCallback(() => setCurrentIndex(prev => (prev + 1) % displayBanners.length), [displayBanners.length]);

  const current = displayBanners[currentIndex] || displayBanners[0];

  const handleBannerClick = () => {
    if (!current.redirectUrl) return;
    if (current.redirectUrl.startsWith('http')) {
      window.open(current.redirectUrl, '_blank', 'noopener');
    } else {
      window.location.href = current.redirectUrl;
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-glow rounded-2xl group">
      {/* Banner Image */}
      <div
        className={`relative w-full aspect-[16/9] sm:aspect-[21/7] md:aspect-[21/6] ${current.redirectUrl ? 'cursor-pointer' : ''}`}
        onClick={handleBannerClick}
      >
        <img
          src={current.imageUrl}
          alt={current.alt}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />

        {/* Badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-foreground border-border/50 text-xs">
            <Sparkles className="h-3 w-3 mr-1 text-accent" />
            Comunidade DNB
          </Badge>
        </div>

        {/* Navigation arrows */}
        {hasMultiple && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/60 backdrop-blur-sm hover:bg-background/80 h-8 w-8 p-0 rounded-full"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/60 backdrop-blur-sm hover:bg-background/80 h-8 w-8 p-0 rounded-full"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Dots */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {displayBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); goTo(idx); }}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/75'}`}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
