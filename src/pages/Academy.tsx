import { useState } from "react";
import Layout from "@/components/Layout";
import { useAcademy } from "@/hooks/useAcademy";
import { CourseNavigation } from "@/components/academy/CourseNavigation";
import { VideoPlayer } from "@/components/academy/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { List, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";

export default function Academy() {
  const {
    course,
    publishedCourses,
    activeCourseId,
    onCourseChange,
    isLoading,
    currentLesson,
    setCurrentLesson,
    searchTerm,
    setSearchTerm,
    markLessonAsCompleted,
    getNextLesson,
    getPreviousLesson,
    filteredLessons
  } = useAcademy();

  const isMobile = useIsMobile();
  const [navOpen, setNavOpen] = useState(false);
  const { subscription } = useSubscription();
  const { user } = useAuth();
  const isPremiumUser = subscription?.subscribed || user?.role === UserRole.ADMIN || user?.role === UserRole.GESTOR;

  const handleMarkCompleted = () => {
    if (currentLesson && !currentLesson.is_completed) {
      markLessonAsCompleted(currentLesson.id);
    }
  };

  const handleNext = () => {
    const nextLesson = getNextLesson();
    if (nextLesson) setCurrentLesson(nextLesson);
  };

  const handlePrevious = () => {
    const previousLesson = getPreviousLesson();
    if (previousLesson) setCurrentLesson(previousLesson);
  };

  const handleLessonSelect = (lesson: typeof currentLesson) => {
    setCurrentLesson(lesson);
    if (isMobile) setNavOpen(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const courseNav = (
    <CourseNavigation
      course={course}
      currentLesson={currentLesson}
      onLessonSelect={handleLessonSelect}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      filteredLessons={filteredLessons}
      isPremiumUser={isPremiumUser}
      publishedCourses={publishedCourses}
      activeCourseId={activeCourseId}
      onCourseChange={onCourseChange}
    />
  );

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)] bg-background -m-3 sm:-m-4 lg:-m-6">
        {isMobile ? (
          <>
            <div className="flex items-center gap-2 p-3 border-b border-border bg-card/50">
              <Sheet open={navOpen} onOpenChange={setNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <List className="h-4 w-4" />
                    Aulas
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] max-w-sm p-0">
                  {courseNav}
                </SheetContent>
              </Sheet>
              {currentLesson && (
                <p className="text-sm font-medium truncate">{currentLesson.title}</p>
              )}
            </div>
            <div className="flex-1 min-h-0">
              <VideoPlayer
                lesson={currentLesson}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onMarkCompleted={handleMarkCompleted}
                hasNext={!!getNextLesson()}
                hasPrevious={!!getPreviousLesson()}
                isPremiumUser={isPremiumUser}
              />
            </div>
          </>
        ) : (
          <>
            {courseNav}
            <VideoPlayer
              lesson={currentLesson}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onMarkCompleted={handleMarkCompleted}
              hasNext={!!getNextLesson()}
              hasPrevious={!!getPreviousLesson()}
              isPremiumUser={isPremiumUser}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
