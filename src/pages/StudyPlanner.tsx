
import { Calendar } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { StudyPlanSetup } from "@/components/studyplanner/StudyPlanSetup";
import { StudyPlanDisplay } from "@/components/studyplanner/StudyPlanDisplay";
import { SavedPlansManager } from "@/components/studyplanner/SavedPlansManager";
import { useStudyPlan } from "@/hooks/useStudyPlan";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudyPlanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    currentPlan,
    savedPlans,
    isGenerating,
    isLoading,
    createNewPlan,
    savePlan,
    loadPlan,
    deletePlan,
    addSubject,
    updateSubject,
    removeSubject,
    updatePreferences,
    generateOptimalPlan,
    toggleTaskCompletion
  } = useStudyPlan();

  if (!user) {
    return (
      <PageLayout
        title="AI Study Planner"
        subtitle="Create intelligent, personalized study schedules"
        icon={<Calendar className="h-6 w-6" />}
      >
        <Card className="p-8 text-center max-w-md mx-auto">
          <LogIn className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 dark:text-white">Sign In Required</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Please sign in to create and save your personalized study plans.
          </p>
          <Button onClick={() => navigate('/auth')} className="w-full">
            Sign In to Continue
          </Button>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="AI Study Planner"
      subtitle="Create intelligent, personalized study schedules that adapt to your learning patterns"
      icon={<Calendar className="h-6 w-6" />}
    >
      <div className="space-y-8">
        {/* Saved Plans Manager */}
        <SavedPlansManager
          currentPlan={currentPlan}
          savedPlans={savedPlans}
          onCreateNew={createNewPlan}
          onSavePlan={savePlan}
          onLoadPlan={loadPlan}
          onDeletePlan={deletePlan}
          isLoading={isLoading}
        />

        {/* Study Plan Setup */}
        {currentPlan && (
          <StudyPlanSetup
            subjects={currentPlan.subjects}
            preferences={currentPlan.preferences}
            onAddSubject={addSubject}
            onUpdateSubject={updateSubject}
            onRemoveSubject={removeSubject}
            onUpdatePreferences={updatePreferences}
            onGenerate={generateOptimalPlan}
            isGenerating={isGenerating}
          />
        )}
        
        {/* Study Plan Display */}
        {currentPlan && currentPlan.sessions.length > 0 && (
          <StudyPlanDisplay
            sessions={currentPlan.sessions}
            onToggleTask={toggleTaskCompletion}
            analytics={currentPlan.analytics}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default StudyPlanner;
