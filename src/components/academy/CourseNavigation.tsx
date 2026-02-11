import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle2, PlayCircle, Lock } from "lucide-react";
import { Course, Lesson } from "@/types/academy";
import { cn } from "@/lib/utils";

interface CourseSummary {
  id: string;
  title: string;
}

interface CourseNavigationProps {
  course: Course;
  currentLesson: Lesson | null;
  onLessonSelect: (lesson: Lesson) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filteredLessons: Lesson[];
  isPremiumUser?: boolean;
  publishedCourses?: CourseSummary[];
  activeCourseId?: string | null;
  onCourseChange?: (courseId: string) => void;
}

export function CourseNavigation({
  course,
  currentLesson,
  onLessonSelect,
  searchTerm,
  onSearchChange,
  filteredLessons,
  isPremiumUser = false,
  publishedCourses = [],
  activeCourseId,
  onCourseChange,
}: CourseNavigationProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const renderLessonsList = (lessons: Lesson[], moduleTitle?: string) => (
    <div className="space-y-1">
      {lessons.map((lesson) => {
        const hasAccess = lesson.is_free || isPremiumUser;
        return (
          <Button
            key={lesson.id}
            variant="ghost"
            className={cn(
              "w-full justify-start p-3 h-auto text-left hover:bg-muted/50",
              currentLesson?.id === lesson.id && "bg-primary/10 border-l-2 border-l-primary"
            )}
            onClick={() => onLessonSelect(lesson)}
          >
            <div className="flex items-start gap-3 w-full">
              <div className="flex-shrink-0 mt-0.5">
                {lesson.is_completed ? (
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                ) : hasAccess ? (
                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm leading-tight line-clamp-2">
                  {lesson.title}
                </span>
                {!lesson.is_free && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-1 w-fit">
                    Premium
                  </Badge>
                )}
                {moduleTitle && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {moduleTitle}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDuration(lesson.duration)}
                </div>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );

  const showCourseSelector = publishedCourses.length > 1 && onCourseChange;

  return (
    <div className="w-full lg:w-80 border-r bg-card/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b">
        {showCourseSelector ? (
          <div className="mb-3">
            <Select value={activeCourseId || ''} onValueChange={onCourseChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um curso" />
              </SelectTrigger>
              <SelectContent>
                {publishedCourses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <h2 className="font-bold text-base lg:text-lg mb-2">{course.title}</h2>
        )}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Aulas concluídas</span>
            <span className="font-medium">
              {course.completed_lessons}/{course.total_lessons}
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 lg:p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar aulas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lessons List */}
      <div className="flex-1 overflow-y-auto">
        {searchTerm ? (
          <div className="p-3 lg:p-4">
            <h3 className="font-medium text-sm mb-4 text-muted-foreground">
              Resultados da busca ({filteredLessons.length})
            </h3>
            {filteredLessons.length > 0 ? (
              renderLessonsList(filteredLessons, "Resultado")
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhuma aula encontrada</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 lg:p-4 space-y-6">
            {course.modules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PlayCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhuma aula disponível</p>
              </div>
            ) : (
              course.modules.map((module) => (
                <div key={module.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-medium text-sm">{module.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {module.lessons.length} aulas
                    </Badge>
                  </div>
                  {renderLessonsList(module.lessons)}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
