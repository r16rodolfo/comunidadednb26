import { Course, BunnyStreamConfig } from '@/types/academy';

// Configuração global do Bunny.net Stream
// Lê o Library ID salvo pelo admin no painel (localStorage por enquanto)
export const getBunnyStreamConfig = (): BunnyStreamConfig => ({
  library_id: localStorage.getItem('bunny_library_id') || '',
  token_auth_enabled: false,
});

// Alias estático para compatibilidade (lido no momento do import)
export const bunnyStreamConfig: BunnyStreamConfig = getBunnyStreamConfig();

export const mockCourse: Course = {
  id: '1',
  title: 'Fundamentos do Câmbio',
  description: 'Curso completo sobre mercado de câmbio para viajantes',
  total_lessons: 6,
  completed_lessons: 3,
  progress: 50,
  is_published: true,
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
          description: 'Entenda os conceitos fundamentais do mercado de câmbio e como ele afeta o dia a dia dos viajantes.',
          module_id: 'mod1',
          order: 1,
          duration: 480,
          bunny_video_id: '',
          is_completed: true,
          is_free: true,
        },
        {
          id: 'lesson2',
          title: 'Como funciona o mercado',
          description: 'Fatores que influenciam as cotações de moedas estrangeiras e como acompanhar as variações.',
          module_id: 'mod1',
          order: 2,
          duration: 600,
          bunny_video_id: '',
          is_completed: true,
          is_free: true,
        },
        {
          id: 'lesson3',
          title: 'Tipos de moeda',
          description: 'Diferenças entre papel-moeda, cartão pré-pago e transferências internacionais.',
          module_id: 'mod1',
          order: 3,
          duration: 720,
          bunny_video_id: '',
          is_completed: true,
          is_free: false,
        },
        {
          id: 'lesson4',
          title: 'Documentação necessária',
          description: 'O que você precisa para comprar moeda estrangeira de forma legal e segura.',
          module_id: 'mod1',
          order: 4,
          duration: 540,
          bunny_video_id: '',
          is_completed: false,
          is_free: false,
        },
      ],
    },
    {
      id: 'mod2',
      title: 'Estratégias de Compra',
      description: 'Como otimizar suas compras de moeda estrangeira',
      order: 2,
      lessons: [
        {
          id: 'lesson5',
          title: 'Quando comprar moeda',
          description: 'Identificando o melhor momento para comprar moeda e como usar indicadores a seu favor.',
          module_id: 'mod2',
          order: 1,
          duration: 900,
          bunny_video_id: '',
          is_completed: false,
          is_free: false,
        },
        {
          id: 'lesson6',
          title: 'Planejamento de compras',
          description: 'Estratégias para comprar ao longo do tempo e reduzir o impacto da volatilidade.',
          module_id: 'mod2',
          order: 2,
          duration: 780,
          bunny_video_id: '',
          is_completed: false,
          is_free: false,
        },
      ],
    },
  ],
};

// Lista de cursos para o admin (usa o mesmo tipo Course)
export const mockAdminCourses: Course[] = [
  mockCourse,
  {
    id: '2',
    title: 'Estratégias Avançadas de Câmbio',
    description: 'Técnicas avançadas para otimizar suas operações de câmbio',
    total_lessons: 4,
    completed_lessons: 0,
    progress: 0,
    is_published: false,
    modules: [
      {
        id: 'mod3',
        title: 'Análise de Mercado',
        description: 'Ferramentas e técnicas para analisar o mercado',
        order: 1,
        lessons: [
          {
            id: 'lesson7',
            title: 'Leitura de gráficos',
            description: 'Como interpretar gráficos de cotação e identificar tendências.',
            module_id: 'mod3',
            order: 1,
            duration: 840,
            bunny_video_id: '',
            is_completed: false,
            is_free: true,
          },
          {
            id: 'lesson8',
            title: 'Indicadores econômicos',
            description: 'Principais indicadores que impactam o câmbio e como acompanhá-los.',
            module_id: 'mod3',
            order: 2,
            duration: 960,
            bunny_video_id: '',
            is_completed: false,
            is_free: false,
          },
        ],
      },
      {
        id: 'mod4',
        title: 'Operações Avançadas',
        description: 'Técnicas para maximizar seus ganhos',
        order: 2,
        lessons: [
          {
            id: 'lesson9',
            title: 'Arbitragem de câmbio',
            description: 'Como aproveitar diferenças de preço entre casas de câmbio.',
            module_id: 'mod4',
            order: 1,
            duration: 720,
            bunny_video_id: '',
            is_completed: false,
            is_free: false,
          },
          {
            id: 'lesson10',
            title: 'Hedge cambial',
            description: 'Estratégias de proteção contra variações desfavoráveis.',
            module_id: 'mod4',
            order: 2,
            duration: 660,
            bunny_video_id: '',
            is_completed: false,
            is_free: false,
          },
        ],
      },
    ],
  },
];
