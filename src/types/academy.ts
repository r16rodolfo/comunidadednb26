export interface Lesson {
  id: string;
  title: string;
  description?: string;
  module: string;
  order: number;
  duration: number; // em segundos
  video_id: string; // ID do vídeo na Panda Video
  is_completed: boolean;
  is_free?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  total_lessons: number;
  completed_lessons: number;
  progress: number; // 0-100
}

export interface PandaVideoConfig {
  video_id: string;
  autoplay?: boolean;
  controls?: boolean;
  width?: string;
  height?: string;
}