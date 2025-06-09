
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Calendar, GraduationCap, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Calculate GPA",
      description: "Calculate your current GPA",
      icon: Calculator,
      action: () => navigate("/gpa-calculator"),
      color: "bg-blue-500"
    },
    {
      title: "Plan Study Session",
      description: "Create a personalized study plan",
      icon: Calendar,
      action: () => navigate("/study-planner"),
      color: "bg-green-500"
    },
    {
      title: "Course Assistant",
      description: "Upload materials & generate study aids",
      icon: GraduationCap,
      action: () => navigate("/course-assistant"),
      color: "bg-purple-500"
    },
    {
      title: "Research Assistant",
      description: "Get help with academic research",
      icon: Search,
      action: () => navigate("/research-assistant"),
      color: "bg-teal-500"
    }
  ];

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-xl">Quick Actions</CardTitle>
        <CardDescription>
          Jump into your most common tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02] justify-start"
              onClick={action.action}
            >
              <div className={`p-3 rounded-lg ${action.color} text-white shrink-0`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{action.title}</div>
                <div className="text-xs text-muted-foreground truncate">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
