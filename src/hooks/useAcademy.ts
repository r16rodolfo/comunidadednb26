import { useState, useEffect } from 'react';
import { Course, Lesson, Module } from '@/types/academy';

// Mock data - será substituído por dados reais da API
const mockCourse: Course = {
  id: '1',
  title: 'Fundamentos do Câmbio',
  description: 'Curso completo sobre mercado de câmbio para viajantes',
  total_lessons: 12,
  completed_lessons: 3,
  progress: 25,
  modules: [
    {
      id: 'mod1',
      title: 'Introdução ao Câmbio',
      description: 'Conceitos básicos do mercado de câmbio',
      order: 1,
      lessons: [
        {
          id: 'lesson1',
          title: 'O que é câmbio?',
          description: 'Entenda os conceitos fundamentais',
          module: 'mod1',
          order: 1,
          duration: 480, // 8 minutos
          video_id: 'video1',
          is_completed: true,
          is_free: true
        },
        {
          id: 'lesson2',
          title: 'Como funciona o mercado',
          description: 'Fatores que influenciam as cotações',
          module: 'mod1',
          order: 2,
          duration: 600, // 10 minutos
          video_id: 'video2',
          is_completed: true
        },
        {
          id: 'lesson3',
          title: 'Tipos de moeda',
          description: 'Papel-moeda vs cartão pré-pago',
          module: 'mod1',
          order: 3,
          duration: 720, // 12 minutos
          video_id: 'video3',
          is_completed: true
        },
        {
          id: 'lesson4',
          title: 'Documentação necessária',
          description: 'O que você precisa para comprar moeda',
          module: 'mod1',
          order: 4,
          duration: 540, // 9 minutos
          video_id: 'video4',
          is_completed: false
        }
      ]
    },
    {
      id: 'mod2',
      title: 'Estratégias de Compra',
      description: 'Como otimizar suas compras de moeda',
      order: 2,
      lessons: [
        {
          id: 'lesson5',
          title: 'Quando comprar moeda',
          description: 'Identificando o melhor momento',
          module: 'mod2',
          order: 1,
          duration: 900, // 15 minutos
          video_id: 'video5',
          is_completed: false
        },
        {
          id: 'lesson6',
          title: 'Planejamento de compras',
          description: 'Estratégias para comprar ao longo do tempo',
          module: 'mod2',
          order: 2,
          duration: 780, // 13 minutos
          video_id: 'video6',
          is_completed: false
        }
      ]
    }
  ]
};

export function useAcademy() {
  const [course, setCourse] = useState<Course>(mockCourse);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Definir primeira aula como atual se não há aula selecionada
    if (!currentLesson && course.modules.length > 0) {
      const firstLesson = course.modules[0]?.lessons[0];
      if (firstLesson) {
        setCurrentLesson(firstLesson);
      }
    }
  }, [course, currentLesson]);

  const markLessonAsCompleted = (lessonId: string) => {
    setCourse(prev => {
      const updatedModules = prev.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson =>
          lesson.id === lessonId
            ? { ...lesson, is_completed: true }
            : lesson
        )
      }));

      // Recalcular progresso
      const allLessons = updatedModules.flatMap(m => m.lessons);
      const completedCount = allLessons.filter(l => l.is_completed).length;
      const progress = Math.round((completedCount / allLessons.length) * 100);

      return {
        ...prev,
        modules: updatedModules,
        completed_lessons: completedCount,
        progress
      };
    });

    // Salvar no localStorage
    const savedProgress = JSON.parse(localStorage.getItem('dnb-academy-progress') || '{}');
    savedProgress[lessonId] = true;
    localStorage.setItem('dnb-academy-progress', JSON.stringify(savedProgress));
  };

  const getNextLesson = () => {
    if (!currentLesson) return null;
    
    for (const module of course.modules) {
      const currentIndex = module.lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex >= 0) {
        // Próxima aula do mesmo módulo
        if (currentIndex < module.lessons.length - 1) {
          return module.lessons[currentIndex + 1];
        }
        // Primeira aula do próximo módulo
        const nextModuleIndex = course.modules.findIndex(m => m.id === module.id) + 1;
        if (nextModuleIndex < course.modules.length) {
          return course.modules[nextModuleIndex].lessons[0];
        }
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
        // Aula anterior do mesmo módulo
        if (currentIndex > 0) {
          return module.lessons[currentIndex - 1];
        }
        // Última aula do módulo anterior
        if (moduleIndex > 0) {
          const prevModule = course.modules[moduleIndex - 1];
          return prevModule.lessons[prevModule.lessons.length - 1];
        }
      }
    }
    return null;
  };

  const filteredLessons = searchTerm ? 
    course.modules.flatMap(module => 
      module.lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) : [];

  // Carregar progresso salvo do localStorage
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

        return {
          ...prev,
          modules: updatedModules,
          completed_lessons: completedCount,
          progress
        };
      });
    }
  }, []);

  return {
    course,
    currentLesson,
    setCurrentLesson,
    searchTerm,
    setSearchTerm,
    markLessonAsCompleted,
    getNextLesson,
    getPreviousLesson,
    filteredLessons
  };
}