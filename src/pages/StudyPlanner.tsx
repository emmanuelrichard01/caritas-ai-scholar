
import { Calendar } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { StudyPlanSetup } from "@/components/studyplanner/StudyPlanSetup";
import { StudyPlanDisplay } from "@/components/studyplanner/StudyPlanDisplay";
import { useStudyPlan } from "@/hooks/useStudyPlan";

const StudyPlanner = () => {
  const {
    subjects,
    preferences,
    generatedPlan,
    isGenerating,
    analytics,
    addSubject,
    updateSubject,
    removeSubject,
    updatePreferences,
    generateOptimalPlan,
    toggleTaskCompletion
  } = useStudyPlan();

  return (
    <PageLayout
      title="AI Study Planner"
      subtitle="Create intelligent, personalized study schedules that adapt to your learning patterns and goals"
      icon={<Calendar className="h-6 w-6" />}
    >
      <div className="space-y-12">
        <StudyPlanSetup
          subjects={subjects}
          preferences={preferences}
          onAddSubject={addSubject}
          onUpdateSubject={updateSubject}
          onRemoveSubject={removeSubject}
          onUpdatePreferences={updatePreferences}
          onGenerate={generateOptimalPlan}
          isGenerating={isGenerating}
        />
        
        {generatedPlan.length > 0 && (
          <StudyPlanDisplay
            sessions={generatedPlan}
            onToggleTask={toggleTaskCompletion}
            analytics={analytics}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default StudyPlanner;
