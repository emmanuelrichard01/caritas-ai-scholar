
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

interface ActivityData {
  category: string;
  count: number;
  color: string;
}

interface ActivityChartProps {
  activityData: ActivityData[];
  loading: boolean;
}

export const ActivityChart = ({ activityData, loading }: ActivityChartProps) => {
  return (
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
  );
};
