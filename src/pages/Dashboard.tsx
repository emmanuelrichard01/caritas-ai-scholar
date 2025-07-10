
import { useState, useEffect, useCallback, useMemo } from "react";
import { Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivityList } from "@/components/dashboard/RecentActivity";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Memoized chart colors for better performance
  const chartColors = useMemo(() => ({
    'course-tutor': 'hsl(var(--primary))',
    'research': 'hsl(var(--success))',
    'study-planner': 'hsl(var(--warning))',
    'google-ai': 'hsl(var(--info))',
    'default': 'hsl(var(--muted-foreground))',
  }), []);
  
  // Optimized streak calculation with better performance
  const calculateStreakOptimized = useCallback((activities: any[]) => {
    if (!activities.length) return 0;
    
    // Create a Set of dates for O(1) lookup
    const activityDates = new Set(
      activities.map(activity => {
        const date = new Date(activity.created_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Check if user has activity today or yesterday (allow for current day)
    const hasActivityToday = activityDates.has(currentDate.getTime());
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const hasActivityYesterday = activityDates.has(yesterday.getTime());
    
    // Start from today if there's activity, otherwise yesterday
    if (!hasActivityToday && !hasActivityYesterday) {
      return 0;
    }
    
    // If no activity today, start from yesterday
    if (!hasActivityToday) {
      currentDate = yesterday;
    }
    
    // Count consecutive days
    for (let i = 0; i < 365; i++) { // Limit to 1 year for performance
      if (activityDates.has(currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }, []);
  
  // Helper function for category formatting
  const formatCategory = useCallback((category: string): string => {
    switch (category) {
      case 'course-tutor': return 'Course Assistant';
      case 'research': return 'Research';
      case 'study-planner': return 'Study Planner';
      case 'google-ai': return 'AI Chat';
      case 'default': return 'General';
      default: return category;
    }
  }, []);
  
  // Optimized data fetching with better error handling
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Use Promise.allSettled for better error handling
      const [historyResult, recentResult, plansResult] = await Promise.allSettled([
        supabase
          .from('chat_history')
          .select('category, created_at, title')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('chat_history')
          .select('id, title, created_at, category')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(8), // Increased limit for better UX
        supabase
          .from('study_plans')
          .select('sessions, analytics, created_at')
          .eq('user_id', user.id)
      ]);
      
      // Handle potential errors
      let historyData: any[] = [];
      let recentData: any[] = [];
      let plansData: any[] = [];
      
      if (historyResult.status === 'fulfilled' && !historyResult.value.error) {
        historyData = historyResult.value.data || [];
      } else if (historyResult.status === 'rejected') {
        console.warn('Failed to fetch history data:', historyResult.reason);
      }
      
      if (recentResult.status === 'fulfilled' && !recentResult.value.error) {
        recentData = recentResult.value.data || [];
      } else if (recentResult.status === 'rejected') {
        console.warn('Failed to fetch recent data:', recentResult.reason);
      }
      
      if (plansResult.status === 'fulfilled' && !plansResult.value.error) {
        plansData = plansResult.value.data || [];
      } else if (plansResult.status === 'rejected') {
        console.warn('Failed to fetch plans data:', plansResult.reason);
      }
        
      // Process activity data for chart with better categorization
      const activityCounts: Record<string, number> = {};
      historyData.forEach(item => {
        const category = item.category || 'default';
        activityCounts[category] = (activityCounts[category] || 0) + 1;
      });
      
      const processedData = Object.entries(activityCounts)
        .map(([category, count]) => ({
          category: formatCategory(category),
          count,
          color: chartColors[category as keyof typeof chartColors] || chartColors.default
        }))
        .sort((a, b) => b.count - a.count); // Sort by frequency
        
      // Enhanced stats calculation with better algorithms
      const totalInteractions = historyData.length;
      let studyHours = Math.round(totalInteractions * 0.75); // More realistic calculation
      let completedTasks = Math.floor(totalInteractions * 0.4);
      
      // Enhanced study plan statistics
      if (plansData.length > 0) {
        const allSessions = plansData.flatMap(plan => 
          Array.isArray(plan.sessions) ? plan.sessions : []
        );
        
        const planTasks = allSessions.flatMap(session => 
          Array.isArray(session?.tasks) ? session.tasks : []
        );
        
        const planCompletedTasks = planTasks.filter(task => task?.completed).length;
        const planHours = planTasks.reduce((sum, task) => 
          sum + (typeof task?.duration === 'number' ? task.duration : 0), 0
        ) / 60;
        
        studyHours += Math.floor(planHours);
        completedTasks += planCompletedTasks;
      }
      
      const streak = calculateStreakOptimized(historyData);
      
      setActivityData(processedData);
      setRecentActivities(recentData);
      setStats({
        totalInteractions,
        studyHours,
        completedTasks,
        streak
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [user, chartColors, calculateStreakOptimized, formatCategory]);
  
  // Optimized real-time updates with debouncing
  useEffect(() => {
    fetchUserData();
    
    // Debounce real-time updates to prevent excessive API calls
    let timeoutId: NodeJS.Timeout;
    
    const debouncedRefresh = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setRefreshKey(prev => prev + 1);
        fetchUserData();
      }, 1000);
    };
    
    // Set up real-time subscription for updates
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_history', filter: `user_id=eq.${user?.id}` },
        debouncedRefresh
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'study_plans', filter: `user_id=eq.${user?.id}` },
        debouncedRefresh
      )
      .subscribe();
    
    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [user, fetchUserData]);
  // Manual refresh function
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    fetchUserData();
    toast.success('Dashboard refreshed');
  }, [fetchUserData]);
  
  // Loading skeleton component
  const DashboardSkeleton = () => (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        <Skeleton className="xl:col-span-8 h-96 rounded-lg" />
        <Skeleton className="xl:col-span-4 h-96 rounded-lg" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
  
  // Show loading skeleton for better UX
  if (loading && !activityData.length) {
    return (
      <PageLayout
        title="Dashboard"
        subtitle="Your personalized learning hub with insights and progress tracking"
        icon={<Sparkles className="h-6 w-6" />}
      >
        <DashboardSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Your personalized learning hub with insights and progress tracking"
      icon={<Sparkles className="h-6 w-6" />}
    >
      <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
          >
            <TrendingUp className="h-4 w-4" />
            Refresh
          </button>
        </div>
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <button 
                onClick={handleRefresh}
                className="ml-2 underline hover:no-underline"
              >
                Try again
              </button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Welcome Section - Enhanced with better loading state */}
        <div className="w-full max-w-full">
          <WelcomeCard 
            profile={profile} 
            userEmail={user?.email} 
            stats={stats}
            loading={loading}
          />
        </div>
        
        {/* Main Content Grid - Improved responsive layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 w-full max-w-full">
          {/* Quick Actions - Enhanced with better performance */}
          <div className="xl:col-span-8 order-1 w-full max-w-full min-w-0">
            <QuickActions loading={loading} />
          </div>
          
          {/* Activity Chart - Enhanced with better data visualization */}
          <div className="xl:col-span-4 order-2 w-full max-w-full min-w-0">
            <ActivityChart 
              activityData={activityData} 
              loading={loading}
              refreshKey={refreshKey}
            />
          </div>
        </div>
        
        {/* Recent Activity - Enhanced with better performance */}
        <div className="w-full max-w-full order-3">
          <RecentActivityList 
            recentActivities={recentActivities} 
            loading={loading}
            onRefresh={handleRefresh}
          />
        </div>
        
        {/* Performance Metrics - New addition for better UX insights */}
        {!loading && stats.totalInteractions > 0 && (
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Learning Progress:</span>
              <span>
                {stats.totalInteractions > 10 ? 'Great momentum!' : 
                 stats.totalInteractions > 5 ? 'Good progress!' : 
                 'Just getting started!'}
              </span>
              <span className="ml-auto text-xs">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default Dashboard;
