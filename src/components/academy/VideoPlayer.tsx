import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, PlayCircle, Lock } from "lucide-react";
import { Lesson } from "@/types/academy";
// Bunny library ID is read from localStorage (set by admin in platform settings)
const getBunnyLibraryId = () => localStorage.getItem('bunny_library_id') || '';

interface VideoPlayerProps {
  lesson: Lesson | null;
  onPrevious: () => void;
  onNext: () => void;
  onMarkCompleted: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  isPremiumUser?: boolean;
}

export function VideoPlayer({
  lesson,
  onPrevious,
  onNext,
  onMarkCompleted,
  hasNext,
  hasPrevious,
  isPremiumUser = false
}: VideoPlayerProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const canWatch = (l: Lesson) => l.is_free || isPremiumUser;

  const getBunnyEmbedUrl = (videoId: string) => {
    const libraryId = getBunnyLibraryId();
    if (!libraryId || !videoId) return null;
    return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
  };

  if (!lesson) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20 p-4">
        <div className="text-center">
          <PlayCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Selecione uma aula</h3>
          <p className="text-sm text-muted-foreground">
            Escolha uma aula na navegação para começar
          </p>
        </div>
      </div>
    );
  }

  const embedUrl = getBunnyEmbedUrl(lesson.bunny_video_id);
  const hasAccess = canWatch(lesson);

  return (
    <div className="flex-1 flex flex-col bg-background min-h-0 overflow-y-auto">
      {/* Video Container */}
      <div className="bg-black flex items-center justify-center">
        {hasAccess ? (
          embedUrl ? (
            <div style={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
              <iframe
                src={embedUrl}
                loading="lazy"
                style={{
                  border: 'none',
                  position: 'absolute',
                  top: 0,
                  height: '100%',
                  width: '100%',
                }}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="w-full flex items-center justify-center text-white bg-muted/10 aspect-video">
              <div className="text-center p-4">
                <PlayCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                <p className="text-base sm:text-lg font-medium">Vídeo não configurado</p>
                <p className="text-xs sm:text-sm opacity-75 mt-1">
                  O ID do vídeo do Bunny.net ainda não foi adicionado.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="text-center text-white aspect-video w-full flex items-center justify-center">
            <div className="bg-black/50 p-6 sm:p-8 rounded-lg">
              <Lock className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-primary" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Aula Premium</h3>
              <p className="text-white/80 text-sm">
                Disponível apenas para assinantes premium
              </p>
              <Button className="mt-4" variant="secondary" size="sm">
                Fazer Upgrade
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Info */}
      <Card className="mx-3 sm:mx-6 mt-3 sm:mt-6 mb-2 sm:mb-4">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <CardTitle className="text-base sm:text-xl">{lesson.title}</CardTitle>
                {lesson.is_completed && (
                  <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Concluído
                  </Badge>
                )}
                {lesson.is_free ? (
                  <Badge variant="outline" className="text-xs">Gratuito</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Premium</Badge>
                )}
              </div>
              {lesson.description && (
                <p className="text-sm text-muted-foreground">{lesson.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
              <Clock className="h-4 w-4" />
              {formatDuration(lesson.duration)}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className="border-t bg-card/50 p-3 sm:p-6 mt-auto">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>

          <div className="flex items-center gap-2">
            {!lesson.is_completed && hasAccess && (
              <Button
                onClick={onMarkCompleted}
                size="sm"
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Marcar como Concluído</span>
                <span className="sm:hidden">Concluir</span>
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!hasNext}
            className="gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
