
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

interface DashboardStats {
  totalInteractions: number;
  studyHours: number;
  completedTasks: number;
  streak: number;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalInteractions: 0,
    studyHours: 0,
    completedTasks: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch chat history for statistics
        const { data: historyData, error: historyError } = await supabase
          .from('chat_history')
          .select('category, created_at')
          .eq('user_id', user.id);
          
        if (historyError) throw historyError;
        
        // Fetch recent activity
        const { data: recentData, error: recentError } = await supabase
          .from('chat_history')
          .select('id, title, created_at, category')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6);
          
        if (recentError) throw recentError;
        
        // Fetch study plans data
        const { data: plansData, error: plansError } = await supabase
          .from('study_plans')
          .select('sessions, analytics')
          .eq('user_id', user.id);
          
        if (plansError && plansError.code !== 'PGRST116') throw plansError;
        
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
        
        // Calculate enhanced stats
        const totalInteractions = historyData?.length || 0;
        let studyHours = Math.floor(totalInteractions * 0.5);
        let completedTasks = Math.floor(totalInteractions * 0.3);
        
        // Add study plan statistics
        if (plansData?.length > 0) {
          const planTasks = plansData.flatMap(plan => 
            (plan.sessions as any[])?.flatMap(session => session.tasks || []) || []
          );
          const planCompletedTasks = planTasks.filter(task => task.completed).length;
          const planHours = planTasks.reduce((sum, task) => sum + (task.duration || 0), 0) / 60;
          
          studyHours += Math.floor(planHours);
          completedTasks += planCompletedTasks;
        }
        
        const streak = calculateStreak(historyData || []);
        
        setActivityData(processedData);
        setRecentActivities(recentData || []);
        setStats({
          totalInteractions,
          studyHours,
          completedTasks,
          streak
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Set up real-time subscription for updates
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_history' },
        () => {
          fetchUserData();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'study_plans' },
        () => {
          fetchUserData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
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
  
  const calculateStreak = (activities: any[]) => {
    if (!activities.length) return 0;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const hasActivityToday = activities.some(activity => {
      const activityDate = new Date(activity.created_at);
      return activityDate.toDateString() === today.toDateString();
    });
    
    const hasActivityYesterday = activities.some(activity => {
      const activityDate = new Date(activity.created_at);
      return activityDate.toDateString() === yesterday.toDateString();
    });
    
    // Calculate actual streak
    let streak = 0;
    const sortedActivities = activities
      .map(a => new Date(a.created_at))
      .sort((a, b) => b.getTime() - a.getTime());
    
    if (sortedActivities.length === 0) return 0;
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const hasActivity = sortedActivities.some(date => {
        const activityDate = new Date(date);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === currentDate.getTime();
      });
      
      if (hasActivity) {
        streak++;
      } else if (i > 0) { // Allow for today to not have activity yet
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return hasActivityToday || hasActivityYesterday ? Math.max(streak, 1) : 0;
  };
  
  return (
    <PageLayout
      title="Dashboard"
      subtitle="Your personalized learning hub with insights and progress tracking"
      icon={<Sparkles className="h-6 w-6" />}
    >
      <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Welcome Section - Full width on mobile */}
        <div className="w-full max-w-full">
          <WelcomeCard profile={profile} userEmail={user?.email} stats={stats} />
        </div>
        
        {/* Main Content Grid - Mobile First Responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 w-full max-w-full">
          {/* Quick Actions - Full width on mobile, spans 8 cols on desktop */}
          <div className="xl:col-span-8 order-1 w-full max-w-full min-w-0">
            <QuickActions />
          </div>
          
          {/* Activity Chart - Full width on mobile, spans 4 cols on desktop */}
          <div className="xl:col-span-4 order-2 w-full max-w-full min-w-0">
            <ActivityChart activityData={activityData} loading={loading} />
          </div>
        </div>
        
        {/* Recent Activity - Full width */}
        <div className="w-full max-w-full order-3">
          <RecentActivityList recentActivities={recentActivities} loading={loading} />
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
