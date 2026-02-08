export interface Lesson {
  id: string;
  title: string;
  description?: string;
  module_id: string;
  order: number;
  duration: number; // em segundos
  bunny_video_id: string; // ID do vídeo no Bunny.net Stream
  is_completed: boolean;
  is_free: boolean; // controle de acesso: true = gratuito, false = premium
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
  is_published: boolean;
}

// Configuração global do Bunny.net Stream (uma por conta)
export interface BunnyStreamConfig {
  library_id: string;
  token_auth_enabled?: boolean;
}

// Tipo para o admin gerenciar cursos
export interface AdminCourseForm {
  title: string;
  description: string;
  is_published: boolean;
}

export interface AdminLessonForm {
  title: string;
  description: string;
  bunny_video_id: string;
  duration: string;
  is_free: boolean;
}
