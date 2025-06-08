
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Calendar, Book, Brain, Search, Upload } from "lucide-react";
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
      title: "Upload Materials",
      description: "Add new course materials",
      icon: Upload,
      action: () => navigate("/course-tutor"),
      color: "bg-purple-500"
    },
    {
      title: "Generate Study Tools",
      description: "Create flashcards and quizzes",
      icon: Brain,
      action: () => navigate("/study-tools"),
      color: "bg-orange-500"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all"
              onClick={action.action}
            >
              <div className={`p-2 rounded-full ${action.color} text-white`}>
                <action.icon className="h-5 w-5" />
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
