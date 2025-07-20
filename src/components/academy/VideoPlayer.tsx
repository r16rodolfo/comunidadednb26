import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { Lesson } from "@/types/academy";
import { useEffect } from "react";

interface VideoPlayerProps {
  lesson: Lesson | null;
  onPrevious: () => void;
  onNext: () => void;
  onMarkCompleted: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function VideoPlayer({
  lesson,
  onPrevious,
  onNext,
  onMarkCompleted,
  hasNext,
  hasPrevious
}: VideoPlayerProps) {
  useEffect(() => {
    if (lesson?.video_id) {
      // Carregar o script da Panda Video dinamicamente
      const script = document.createElement('script');
      script.src = 'https://player.pandavideo.com.br/api.v2.js';
      script.async = true;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [lesson?.video_id]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Video Container */}
      <div className="bg-black flex-1 flex items-center justify-center min-h-[400px]">
        {lesson.is_free || lesson.is_completed ? (
          <div
            id={`panda-player-${lesson.video_id}`}
            style={{ width: '100%', height: '100%', minHeight: '400px' }}
          >
            {/* Placeholder para o player da Panda Video */}
            <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
              <div className="text-center">
                <PlayCircle className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg">Player da Panda Video</p>
                <p className="text-sm opacity-75">Video ID: {lesson.video_id}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-white">
            <div className="bg-black/50 p-8 rounded-lg">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Aula Premium</h3>
              <p className="text-white/80">
                Esta aula está disponível apenas para membros premium
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
                {lesson.is_free && (
                  <Badge variant="outline">Gratuito</Badge>
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
            {!lesson.is_completed && (lesson.is_free || lesson.is_completed) && (
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