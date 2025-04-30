
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { StudyPlanForm } from "@/components/studyplanner/StudyPlanForm";
import { StudyTips } from "@/components/studyplanner/StudyTips";
import { StudyPlanDisplay } from "@/components/studyplanner/StudyPlanDisplay";

const StudyPlanner = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  
  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPlan(true);
      toast.success("Study plan generated successfully");
    }, 2000);
  };

  return (
    <PageLayout
      title="Personalized Study Planner"
      subtitle="Create a customized study schedule based on your needs"
      icon={<Calendar className="h-6 w-6" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6 dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-lg font-medium mb-4 dark:text-white">Create Your Study Plan</h2>
            <StudyPlanForm onGenerate={handleGeneratePlan} isGenerating={isGenerating} />
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-xl p-6 shadow-sm border h-full dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-lg font-medium mb-4 dark:text-white">Tips for Effective Study</h2>
            <StudyTips />
          </div>
        </div>
      </div>
      
      <StudyPlanDisplay visible={showPlan} />
    </PageLayout>
  );
};

export default StudyPlanner;
