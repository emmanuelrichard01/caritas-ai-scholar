
import { Calendar } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { StudyPlanSetup } from "@/components/studyplanner/StudyPlanSetup";
import { StudyPlanDisplay } from "@/components/studyplanner/StudyPlanDisplay";
import { useStudyPlan } from "@/hooks/useStudyPlan";

const StudyPlanner = () => {
  const {
    planData,
    generatedPlan,
    isGenerating,
    updatePlanData,
    generateStudyPlan,
    toggleTaskCompletion
  } = useStudyPlan();

  return (
    <PageLayout
      title="AI Study Planner"
      subtitle="Create a personalized study schedule that adapts to your learning style and goals"
      icon={<Calendar className="h-6 w-6" />}
    >
      <div className="space-y-8">
        <StudyPlanSetup
          planData={planData}
          onUpdatePlanData={updatePlanData}
          onGenerate={generateStudyPlan}
          isGenerating={isGenerating}
        />
        
        {generatedPlan.length > 0 && (
          <StudyPlanDisplay
            sessions={generatedPlan}
            onToggleTask={toggleTaskCompletion}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default StudyPlanner;
