import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function useBunnyLibraryId() {
  const { data: dbLibraryId } = useQuery({
    queryKey: ['bunny-library-id'],
    queryFn: async () => {
      const { data } = await supabase
        .from('home_config')
        .select('bunny_library_id')
        .limit(1)
        .maybeSingle();
      return (data as any)?.bunny_library_id || '';
    },
    staleTime: 5 * 60 * 1000,
  });
  return localStorage.getItem('bunny_library_id') || dbLibraryId || '';
}

interface VideoPlayerModalProps {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export default function VideoPlayerModal({ open, onClose, videoUrl, title }: VideoPlayerModalProps) {
  const libraryId = useBunnyLibraryId();

  // Detect if it's a Bunny GUID (UUID format)
  const isBunnyGuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(videoUrl);

  const embedUrl = isBunnyGuid && libraryId
    ? `https://iframe.mediadelivery.net/embed/${libraryId}/${videoUrl}?autoplay=true&preload=true`
    : videoUrl;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-base">{title || 'Vídeo da Análise'}</DialogTitle>
        </DialogHeader>
        <div className="p-4 pt-2">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
