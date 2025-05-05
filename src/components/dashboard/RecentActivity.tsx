
import { Card } from "@/components/ui/card";
import { BookOpen, BarChart2, CalendarIcon, MessageSquare } from "lucide-react";

interface RecentActivity {
  id: string;
  title: string;
  created_at: string;
  category: string;
}

interface RecentActivityProps {
  recentActivities: RecentActivity[];
  loading: boolean;
}

export const RecentActivityList = ({ recentActivities, loading }: RecentActivityProps) => {
  const formatCategory = (category: string): string => {
    switch (category) {
      case 'course-tutor': return 'Course Tutor';
      case 'research': return 'Research';
      case 'study-planner': return 'Study Planner';
      case 'default': return 'Chat';
      default: return category;
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'course-tutor': return <BookOpen className="h-4 w-4" />;
      case 'research': return <BarChart2 className="h-4 w-4" />;
      case 'study-planner': return <CalendarIcon className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        
        {loading ? (
          <div className="h-20 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading recent activity...</div>
          </div>
        ) : recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-md border dark:border-slate-700">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                  {getCategoryIcon(activity.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{activity.title}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{formatCategory(activity.category)}</span>
                    <span>•</span>
                    <span>{formatDate(activity.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p>No recent activity found.</p>
            <p className="text-sm text-gray-400 mt-1">
              Your recent interactions will appear here.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
