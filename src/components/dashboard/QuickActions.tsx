
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Calendar, GraduationCap, Search, Brain } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Jump into your most common tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
              onClick={action.action}
            >
              <div className={`p-3 rounded-full ${action.color} text-white`}>
                <action.icon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
