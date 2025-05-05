
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { MessageSquare, FileIcon, BookOpen, CircleCheck, CalendarIcon, BarChart2, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

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
    <PageLayout
      title="Dashboard"
      subtitle="Track your learning progress and activities"
      icon={<CircleCheck className="h-6 w-6" />}
    >
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <h2 className="text-2xl font-bold">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Student'}
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Activity Stats */}
          <Card className="md:col-span-2">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-purple-500" />
                Learning Activity
              </h3>
              
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-pulse text-gray-400">Loading activity data...</div>
                </div>
              ) : activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={activityData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                    <XAxis dataKey="category" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      radius={[4, 4, 0, 0]}
                      fill="#4f46e5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                  <BookOpen className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-gray-500">No activity data yet.</p>
                  <p className="text-sm text-gray-400">Start using the learning tools to see your activity here.</p>
                </div>
              )}
            </div>
          </Card>
          
          {/* Quick Actions */}
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
        </div>
        
        {/* Recent Activity */}
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
      </div>
    </PageLayout>
  );
};

export default Dashboard;
