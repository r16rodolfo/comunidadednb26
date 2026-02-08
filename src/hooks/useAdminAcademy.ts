import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Course, Module, Lesson } from '@/types/academy';

/** Fetch all courses with nested modules & lessons (admin view) */
async function fetchAllCourses(): Promise<Course[]> {
  const { data: courses, error: cErr } = await supabase
    .from('courses')
    .select('*')
    .order('sort_order');

  if (cErr) throw cErr;
  if (!courses || courses.length === 0) return [];

  const courseIds = courses.map((c) => c.id);

  const { data: modules, error: mErr } = await supabase
    .from('modules')
    .select('*')
    .in('course_id', courseIds)
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

  return courses.map((c) => {
    const courseModules: Module[] = (modules || [])
      .filter((m) => m.course_id === c.id)
      .map((m) => ({
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

    const allLessons = courseModules.flatMap((m) => m.lessons);

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      is_published: c.is_published,
      modules: courseModules,
      total_lessons: allLessons.length,
      completed_lessons: 0,
      progress: 0,
    };
  });
}

interface CreateCourseInput {
  title: string;
  description: string;
  is_published: boolean;
  modules: {
    title: string;
    description: string;
    lessons: {
      title: string;
      description: string;
      bunny_video_id: string;
      duration: number;
      is_free: boolean;
    }[];
  }[];
}

async function createCourse(input: CreateCourseInput) {
  // Get max sort_order
  const { data: existing } = await supabase
    .from('courses')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data: course, error: cErr } = await supabase
    .from('courses')
    .insert({
      title: input.title,
      description: input.description,
      is_published: input.is_published,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (cErr) throw cErr;

  for (let mi = 0; mi < input.modules.length; mi++) {
    const mod = input.modules[mi];
    const { data: dbModule, error: mErr } = await supabase
      .from('modules')
      .insert({
        course_id: course.id,
        title: mod.title,
        description: mod.description,
        sort_order: mi + 1,
      })
      .select()
      .single();

    if (mErr) throw mErr;

    if (mod.lessons.length > 0) {
      const lessonRows = mod.lessons.map((l, li) => ({
        module_id: dbModule.id,
        title: l.title,
        description: l.description,
        bunny_video_id: l.bunny_video_id,
        duration: l.duration,
        sort_order: li + 1,
        is_free: l.is_free,
      }));
      const { error: lErr } = await supabase.from('lessons').insert(lessonRows);
      if (lErr) throw lErr;
    }
  }

  return course;
}

async function deleteCourse(courseId: string) {
  const { error } = await supabase.from('courses').delete().eq('id', courseId);
  if (error) throw error;
}

async function togglePublish(courseId: string, isPublished: boolean) {
  const { error } = await supabase
    .from('courses')
    .update({ is_published: isPublished })
    .eq('id', courseId);
  if (error) throw error;
}

export function useAdminAcademy() {
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-academy-courses'],
    queryFn: fetchAllCourses,
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-academy-courses'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-academy-courses'] }),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) => togglePublish(id, publish),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-academy-courses'] }),
  });

  return {
    courses,
    isLoading,
    createCourse: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteCourse: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    togglePublish: togglePublishMutation.mutateAsync,
  };
}
