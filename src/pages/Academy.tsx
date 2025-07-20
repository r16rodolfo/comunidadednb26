import Layout from "@/components/Layout";
import { useAcademy } from "@/hooks/useAcademy";
import { CourseNavigation } from "@/components/academy/CourseNavigation";
import { VideoPlayer } from "@/components/academy/VideoPlayer";

export default function Academy() {
  const {
    course,
    currentLesson,
    setCurrentLesson,
    searchTerm,
    setSearchTerm,
    markLessonAsCompleted,
    getNextLesson,
    getPreviousLesson,
    filteredLessons
  } = useAcademy();

  const handleMarkCompleted = () => {
    if (currentLesson && !currentLesson.is_completed) {
      markLessonAsCompleted(currentLesson.id);
    }
  };

  const handleNext = () => {
    const nextLesson = getNextLesson();
    if (nextLesson) {
      setCurrentLesson(nextLesson);
    }
  };

  const handlePrevious = () => {
    const previousLesson = getPreviousLesson();
    if (previousLesson) {
      setCurrentLesson(previousLesson);
    }
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        <CourseNavigation
          course={course}
          currentLesson={currentLesson}
          onLessonSelect={setCurrentLesson}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filteredLessons={filteredLessons}
        />
        
        <VideoPlayer
          lesson={currentLesson}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onMarkCompleted={handleMarkCompleted}
          hasNext={!!getNextLesson()}
          hasPrevious={!!getPreviousLesson()}
        />
      </div>
    </Layout>
  );
}