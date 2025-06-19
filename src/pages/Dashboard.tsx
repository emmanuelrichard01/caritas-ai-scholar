
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
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
          .limit(8);
          
        if (recentError) throw recentError;
        
        // Process activity data for chart
        const activityCounts: Record<string, number> = {};
        historyData?.forEach(item => {
          activityCounts[item.category] = (activityCounts[item.category] || 0) + 1;
        });
        
        const chartColors: Record<string, string> = {
          'course-tutor': '#3B82F6',
          'research': '#10B981',
          'study-planner': '#F59E0B',
          'google-ai': '#8B5CF6',
          'default': '#6B7280',
        };
        
        const processedData = Object.entries(activityCounts).map(([category, count]) => ({
          category: formatCategory(category),
          count,
          color: chartColors[category] || chartColors.default
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
      case 'course-tutor': return 'Course Assistant';
      case 'research': return 'Research';
      case 'study-planner': return 'Study Planner';
      case 'google-ai': return 'AI Chat';
      case 'default': return 'General';
      default: return category;
    }
  };
  
  return (
    <PageLayout
      title="Dashboard"
      subtitle="Your personalized learning hub with insights, progress tracking, and quick access to all features"
      icon={<Sparkles className="h-6 w-6" />}
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <WelcomeCard profile={profile} userEmail={user?.email} />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Chart */}
          <div className="lg:col-span-1">
            <ActivityChart activityData={activityData} loading={loading} />
          </div>
          
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
        </div>
        
        {/* Recent Activity */}
        <RecentActivityList recentActivities={recentActivities} loading={loading} />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
