import { useState, useEffect } from 'react';
import { Course, Lesson } from '@/types/academy';
import { mockCourse } from '@/data/mock-academy';

export function useAcademy() {
  const [course, setCourse] = useState<Course>(mockCourse);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentLesson && course.modules.length > 0) {
      const firstLesson = course.modules[0]?.lessons[0];
      if (firstLesson) setCurrentLesson(firstLesson);
    }
  }, [course, currentLesson]);

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

  const getNextLesson = () => {
    if (!currentLesson) return null;
    for (const module of course.modules) {
      const currentIndex = module.lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex >= 0) {
        if (currentIndex < module.lessons.length - 1) return module.lessons[currentIndex + 1];
        const nextModuleIndex = course.modules.findIndex(m => m.id === module.id) + 1;
        if (nextModuleIndex < course.modules.length) return course.modules[nextModuleIndex].lessons[0];
      }
    }
    return null;
  };

  const getPreviousLesson = () => {
    if (!currentLesson) return null;
    for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
      const module = course.modules[moduleIndex];
      const currentIndex = module.lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex >= 0) {
        if (currentIndex > 0) return module.lessons[currentIndex - 1];
        if (moduleIndex > 0) {
          const prevModule = course.modules[moduleIndex - 1];
          return prevModule.lessons[prevModule.lessons.length - 1];
        }
      }
    }
    return null;
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
