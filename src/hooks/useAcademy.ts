import { useState, useEffect } from 'react';
import { Course, Lesson } from '@/types/academy';
import { mockCourse } from '@/data/mock-academy';

export function useAcademy() {
  const [course, setCourse] = useState<Course>(mockCourse);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-seleciona a primeira aula ao carregar
  useEffect(() => {
    if (!currentLesson && course.modules.length > 0) {
      const firstLesson = course.modules[0]?.lessons[0];
      if (firstLesson) setCurrentLesson(firstLesson);
    }
  }, []);

  const markLessonAsCompleted = (lessonId: string) => {
    setCourse(prev => {
      const updatedModules = prev.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson =>
          lesson.id === lessonId ? { ...lesson, is_completed: true } : lesson
        )
      }));
      const allLessons = updatedModules.flatMap(m => m.lessons);
      const completedCount = allLessons.filter(l => l.is_completed).length;
      const progress = Math.round((completedCount / allLessons.length) * 100);
      return { ...prev, modules: updatedModules, completed_lessons: completedCount, progress };
    });

    const savedProgress = JSON.parse(localStorage.getItem('dnb-academy-progress') || '{}');
    savedProgress[lessonId] = true;
    localStorage.setItem('dnb-academy-progress', JSON.stringify(savedProgress));
  };

  const getAllLessons = (): Lesson[] => {
    return course.modules.flatMap(m => m.lessons);
  };

  const getNextLesson = () => {
    if (!currentLesson) return null;
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    return currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;
  };

  const getPreviousLesson = () => {
    if (!currentLesson) return null;
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const filteredLessons = searchTerm
    ? course.modules.flatMap(module =>
        module.lessons.filter(lesson =>
          lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : [];

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem('dnb-academy-progress') || '{}');
    if (Object.keys(savedProgress).length > 0) {
      setCourse(prev => {
        const updatedModules = prev.modules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => ({
            ...lesson,
            is_completed: savedProgress[lesson.id] || lesson.is_completed
          }))
        }));
        const allLessons = updatedModules.flatMap(m => m.lessons);
        const completedCount = allLessons.filter(l => l.is_completed).length;
        const progress = Math.round((completedCount / allLessons.length) * 100);
        return { ...prev, modules: updatedModules, completed_lessons: completedCount, progress };
      });
    }
  }, []);

  return {
    course, currentLesson, setCurrentLesson,
    searchTerm, setSearchTerm,
    markLessonAsCompleted, getNextLesson, getPreviousLesson, filteredLessons
  };
}
