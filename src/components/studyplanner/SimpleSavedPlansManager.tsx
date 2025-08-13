import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, BookOpen, Play, Save, Plus, Calendar } from "lucide-react";
import { StudyPlan } from "@/hooks/useStudyPlan";

interface SimpleSavedPlansManagerProps {
  currentPlan: StudyPlan | null;
  savedPlans: StudyPlan[];
  onCreateNew: () => void;
  onSavePlan: (plan: StudyPlan, makeActive?: boolean) => Promise<void>;
  onLoadPlan: (plan: StudyPlan) => void;
  onDeletePlan: (planId: string) => Promise<void>;
  isLoading: boolean;
}

export const SimpleSavedPlansManager = ({
  currentPlan,
  savedPlans,
  onCreateNew,
  onSavePlan,
  onLoadPlan,
  onDeletePlan,
  isLoading
}: SimpleSavedPlansManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [planTitle, setPlanTitle] = useState("");

  const handleSavePlan = async (makeActive = true) => {
    if (!currentPlan) return;

    const planToSave = {
      ...currentPlan,
      title: planTitle || `Study Plan ${new Date().toLocaleDateString()}`
    };

    await onSavePlan(planToSave, makeActive);
    setPlanTitle("");
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const canSave = currentPlan && currentPlan.subjects.length > 0;

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex gap-3 items-center justify-between">
        <h2 className="text-xl font-semibold">My Study Plans</h2>
        <div className="flex gap-2">
          <Button
            onClick={onCreateNew}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
          
          {canSave && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
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
                    <label className="text-sm font-medium mb-2 block">Plan Name</label>
                    <Input
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                      placeholder={`Study Plan ${new Date().toLocaleDateString()}`}
                    />
                  </div>
                  <Button
                    onClick={() => handleSavePlan(true)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Save Plan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Saved Plans */}
      {savedPlans.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-2">No saved plans yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first study plan to get started
          </p>
          <Button onClick={onCreateNew} variant="outline">
            Create Your First Plan
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedPlans.slice(0, 6).map((plan) => (
            <Card key={plan.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">
                      {plan.title}
                    </h4>
                    {plan.isActive && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {plan.subjects.length} subjects
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(plan.updatedAt!)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => onDeletePlan(plan.id!)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
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
      )}
      
      {savedPlans.length > 6 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing 6 of {savedPlans.length} plans
        </p>
      )}
    </div>
  );
};