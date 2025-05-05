
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, BarChart2, CalendarIcon } from "lucide-react";
import { UserProfile } from "@/types/auth";

interface WelcomeCardProps {
  profile: UserProfile | null;
  userEmail?: string | null;
}

export const WelcomeCard = ({ profile, userEmail }: WelcomeCardProps) => {
  const displayName = profile?.full_name || userEmail?.split('@')[0] || 'Student';
  
  return (
    <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <h2 className="text-2xl font-bold">
        Welcome back, {displayName}
      </h2>
      <p className="mt-2 opacity-90">
        Track your learning progress and access study tools from your personal dashboard.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="secondary" asChild>
          <Link to="/course-tutor">
            <BookOpen className="mr-2 h-4 w-4" />
            Course Tutor
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/research">
            <BarChart2 className="mr-2 h-4 w-4" />
            Research
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/study-planner">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Study Planner
          </Link>
        </Button>
      </div>
    </Card>
  );
};
