
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, BarChart2, CalendarIcon, Settings } from "lucide-react";

export const QuickActions = () => {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/course-tutor">
              <BookOpen className="mr-2 h-4 w-4 text-purple-500" />
              Analyze Course Materials
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/research">
              <BarChart2 className="mr-2 h-4 w-4 text-green-500" />
              Research a Topic
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/study-planner">
              <CalendarIcon className="mr-2 h-4 w-4 text-orange-500" />
              Create Study Plan
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4 text-gray-500" />
              Update Settings
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
