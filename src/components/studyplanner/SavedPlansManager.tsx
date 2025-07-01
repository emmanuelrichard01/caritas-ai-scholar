
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Calendar, Clock, BookOpen, Play, Save, Plus } from "lucide-react";
import { StudyPlan } from "@/hooks/useStudyPlan";
import { toast } from "sonner";

interface SavedPlansManagerProps {
  currentPlan: StudyPlan | null;
  savedPlans: StudyPlan[];
  onCreateNew: () => void;
  onSavePlan: (plan: StudyPlan, makeActive?: boolean) => Promise<void>;
  onLoadPlan: (plan: StudyPlan) => void;
  onDeletePlan: (planId: string) => Promise<void>;
  isLoading: boolean;
}

export const SavedPlansManager = ({
  currentPlan,
  savedPlans,
  onCreateNew,
  onSavePlan,
  onLoadPlan,
  onDeletePlan,
  isLoading
}: SavedPlansManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");

  const handleSavePlan = async (makeActive = false) => {
    if (!currentPlan) return;

    const planToSave = {
      ...currentPlan,
      title: planTitle || currentPlan.title,
      description: planDescription || currentPlan.description
    };

    await onSavePlan(planToSave, makeActive);
    setPlanTitle("");
    setPlanDescription("");
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold dark:text-white">Study Plans</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={onCreateNew}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
          
          {currentPlan && currentPlan.subjects.length > 0 && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1 sm:flex-none">
                  <Save className="h-4 w-4 mr-2" />
                  Save Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Save Study Plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Plan Title</label>
                    <Input
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                      placeholder={currentPlan?.title || "My Study Plan"}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                    <Input
                      value={planDescription}
                      onChange={(e) => setPlanDescription(e.target.value)}
                      placeholder="Brief description of this study plan"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSavePlan(false)}
                      variant="outline"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Save Draft
                    </Button>
                    <Button
                      onClick={() => handleSavePlan(true)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Save & Activate
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {savedPlans.length === 0 ? (
        <Card className="p-6 text-center border-dashed">
          <BookOpen className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">No saved study plans yet</p>
          <Button onClick={onCreateNew} variant="outline">
            Create Your First Plan
          </Button>
        </Card>
      ) : (
        <ScrollArea className="h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
            {savedPlans.map((plan) => (
              <Card key={plan.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate dark:text-white">
                        {plan.title}
                      </h4>
                      {plan.isActive && (
                        <Badge variant="default" className="text-xs px-2 py-0">
                          Active
                        </Badge>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {plan.description}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => onDeletePlan(plan.id!)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {plan.subjects.length} subjects
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {plan.sessions.length} sessions
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <Clock className="h-3 w-3" />
                    Updated {formatDate(plan.updatedAt!)}
                  </div>
                </div>

                <Button
                  onClick={() => onLoadPlan(plan)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Play className="h-3 w-3 mr-2" />
                  Load Plan
                </Button>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
