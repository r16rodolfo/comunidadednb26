import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Course, Module, Lesson } from '@/types/academy';

/** Fetch all published courses (summary only) */
async function fetchPublishedCourses(): Promise<Pick<Course, 'id' | 'title' | 'description' | 'is_published'>[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, description, is_published')
    .eq('is_published', true)
    .order('sort_order');

  if (error) throw error;
  return (data || []).map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    is_published: c.is_published,
  }));
}

/** Fetch a single course with nested modules → lessons from the DB */
async function fetchCourseById(courseId: string): Promise<Course> {
  const { data: course, error: cErr } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('is_published', true)
    .maybeSingle();

  if (cErr) throw cErr;
  if (!course) throw new Error('Curso não encontrado');

  const { data: modules, error: mErr } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order');

  if (mErr) throw mErr;

  const moduleIds = (modules || []).map((m) => m.id);

  let lessons: any[] = [];
  if (moduleIds.length > 0) {
    const { data, error: lErr } = await supabase
      .from('lessons')
      .select('*')
      .in('module_id', moduleIds)
      .order('sort_order');
    if (lErr) throw lErr;
    lessons = data || [];
  }

  const builtModules: Module[] = (modules || []).map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description || '',
    order: m.sort_order,
    lessons: lessons
      .filter((l) => l.module_id === m.id)
      .map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description || '',
        module_id: l.module_id,
        order: l.sort_order,
        duration: l.duration,
        bunny_video_id: l.bunny_video_id,
        is_completed: false,
        is_free: l.is_free,
      })),
  }));

  const allLessons = builtModules.flatMap((m) => m.lessons);

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    is_published: course.is_published,
    modules: builtModules,
    total_lessons: allLessons.length,
    completed_lessons: 0,
    progress: 0,
  };
}

/** Fetch user's completed lesson IDs */
async function fetchUserProgress(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', userId);

  if (error) throw error;
  return new Set((data || []).map((r) => r.lesson_id));
}

export function useAcademy() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all published courses for selector
  const { data: publishedCourses = [], isLoading: isCoursesLoading } = useQuery({
    queryKey: ['academy-published-courses'],
    queryFn: fetchPublishedCourses,
    staleTime: 30 * 1000,
  });

  // Track the selected course ID — defaults to first published course
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const activeCourseId = selectedCourseId || publishedCourses[0]?.id || null;

  const { data: rawCourse, isLoading: isCourseLoading } = useQuery({
    queryKey: ['academy-course', activeCourseId],
    queryFn: () => fetchCourseById(activeCourseId!),
    enabled: !!activeCourseId,
    staleTime: 30 * 1000,
  });

  const { data: progressSet } = useQuery({
    queryKey: ['academy-progress', user?.id],
    queryFn: () => fetchUserProgress(user!.id),
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  // Merge progress into course
  const course: Course | null = useMemo(() => {
    if (!rawCourse) return null;
    const completed = progressSet || new Set<string>();
    const modules = rawCourse.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) => ({
        ...l,
        is_completed: completed.has(l.id),
      })),
    }));
    const allLessons = modules.flatMap((m) => m.lessons);
    const completedCount = allLessons.filter((l) => l.is_completed).length;
    return {
      ...rawCourse,
      modules,
      completed_lessons: completedCount,
      progress: allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0,
    };
  }, [rawCourse, progressSet]);

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset lesson when course changes
  const handleCourseChange = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
    setCurrentLesson(null);
    setSearchTerm('');
  }, []);

  // Auto-select first lesson when course loads
  const effectiveLesson = useMemo(() => {
    if (currentLesson) return currentLesson;
    if (course && course.modules.length > 0) {
      return course.modules[0]?.lessons[0] || null;
    }
    return null;
  }, [currentLesson, course]);

  const markCompletedMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.from('lesson_progress').upsert(
        { user_id: user.id, lesson_id: lessonId, is_completed: true },
        { onConflict: 'user_id,lesson_id' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-progress', user?.id] });
    },
  });

  const markLessonAsCompleted = useCallback(
    (lessonId: string) => markCompletedMutation.mutate(lessonId),
    [markCompletedMutation]
  );

  const getAllLessons = useCallback((): Lesson[] => {
    if (!course) return [];
    return course.modules.flatMap((m) => m.lessons);
  }, [course]);

  const getNextLesson = useCallback(() => {
    const active = effectiveLesson;
    if (!active) return null;
    const all = getAllLessons();
    const idx = all.findIndex((l) => l.id === active.id);
    return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  }, [effectiveLesson, getAllLessons]);

  const getPreviousLesson = useCallback(() => {
    const active = effectiveLesson;
    if (!active) return null;
    const all = getAllLessons();
    const idx = all.findIndex((l) => l.id === active.id);
    return idx > 0 ? all[idx - 1] : null;
  }, [effectiveLesson, getAllLessons]);

  const filteredLessons = useMemo(() => {
    if (!searchTerm || !course) return [];
    return course.modules.flatMap((module) =>
      module.lessons.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, course]);

  const emptyCourse: Course = {
    id: '', title: '', description: '', modules: [],
    total_lessons: 0, completed_lessons: 0, progress: 0, is_published: false,
  };

  return {
    course: course || emptyCourse,
    publishedCourses,
    activeCourseId,
    onCourseChange: handleCourseChange,
    isLoading: isCoursesLoading || isCourseLoading,
    currentLesson: effectiveLesson,
    setCurrentLesson,
    searchTerm,
    setSearchTerm,
    markLessonAsCompleted,
    getNextLesson,
    getPreviousLesson,
    filteredLessons,
  };
}
