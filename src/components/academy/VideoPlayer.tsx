import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, PlayCircle, Lock } from "lucide-react";
import { Lesson } from "@/types/academy";
import { bunnyStreamConfig } from "@/data/mock-academy";

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
    const libraryId = bunnyStreamConfig.library_id;
    if (!libraryId || !videoId) return null;
    return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
  };

  if (!lesson) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <PlayCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Selecione uma aula</h3>
          <p className="text-muted-foreground">
            Escolha uma aula na navegação lateral para começar a assistir
          </p>
        </div>
      </div>
    );
  }

  const embedUrl = getBunnyEmbedUrl(lesson.bunny_video_id);
  const hasAccess = canWatch(lesson);

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Video Container */}
      <div className="bg-black flex-1 flex items-center justify-center min-h-[400px]">
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
          <div className="w-full h-full flex items-center justify-center text-white bg-muted/10 min-h-[400px]">
              <div className="text-center">
                <PlayCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Vídeo não configurado</p>
                <p className="text-sm opacity-75 mt-1">
                  O ID do vídeo do Bunny.net ainda não foi adicionado a esta aula.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="text-center text-white">
            <div className="bg-black/50 p-8 rounded-lg">
              <Lock className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Aula Premium</h3>
              <p className="text-white/80">
                Esta aula está disponível apenas para assinantes premium
              </p>
              <Button className="mt-4" variant="secondary">
                Fazer Upgrade
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Info */}
      <Card className="m-6 mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl">{lesson.title}</CardTitle>
                {lesson.is_completed && (
                  <Badge variant="secondary" className="bg-accent/20 text-accent">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Concluído
                  </Badge>
                )}
                {lesson.is_free ? (
                  <Badge variant="outline">Gratuito</Badge>
                ) : (
                  <Badge variant="secondary">Premium</Badge>
                )}
              </div>
              {lesson.description && (
                <p className="text-muted-foreground">{lesson.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-4">
              <Clock className="h-4 w-4" />
              {formatDuration(lesson.duration)}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className="border-t bg-card/50 p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-3">
            {!lesson.is_completed && hasAccess && (
              <Button
                onClick={onMarkCompleted}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Marcar como Concluído
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={onNext}
            disabled={!hasNext}
            className="flex items-center gap-2"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
