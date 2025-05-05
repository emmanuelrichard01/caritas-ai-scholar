
import { useState, useEffect } from "react";
import { CircleCheck } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivityList } from "@/components/dashboard/RecentActivity";

interface ActivityData {
  category: string;
  count: number;
  color: string;
}

interface RecentActivity {
  id: string;
  title: string;
  created_at: string;
  category: string;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch chat history for statistics
        const { data: historyData, error: historyError } = await supabase
          .from('chat_history')
          .select('category')
          .eq('user_id', user.id);
          
        if (historyError) throw historyError;
        
        // Fetch recent activity
        const { data: recentData, error: recentError } = await supabase
          .from('chat_history')
          .select('id, title, created_at, category')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (recentError) throw recentError;
        
        // Process activity data for chart
        const activityCounts: Record<string, number> = {};
        historyData?.forEach(item => {
          activityCounts[item.category] = (activityCounts[item.category] || 0) + 1;
        });
        
        const chartColors: Record<string, string> = {
          'course-tutor': '#4f46e5',
          'research': '#16a34a',
          'study-planner': '#ea580c',
          'default': '#8b5cf6',
        };
        
        const processedData = Object.entries(activityCounts).map(([category, count]) => ({
          category: formatCategory(category),
          count,
          color: chartColors[category] || '#6b7280'
        }));
        
        setActivityData(processedData);
        setRecentActivities(recentData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  const formatCategory = (category: string): string => {
    switch (category) {
      case 'course-tutor': return 'Course Tutor';
      case 'research': return 'Research';
      case 'study-planner': return 'Study Planner';
      case 'default': return 'Chat';
      default: return category;
    }
  };
  
  return (
    <PageLayout
      title="Dashboard"
      subtitle="Track your learning progress and activities"
      icon={<CircleCheck className="h-6 w-6" />}
    >
      <div className="space-y-6">
        {/* Welcome Card */}
        <WelcomeCard profile={profile} userEmail={user?.email} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Activity Stats */}
          <ActivityChart activityData={activityData} loading={loading} />
          
          {/* Quick Actions */}
          <QuickActions />
        </div>
        
        {/* Recent Activity */}
        <RecentActivityList recentActivities={recentActivities} loading={loading} />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
