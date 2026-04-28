import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface ActivityData {
  category: string;
  count: number;
  color: string;
}

interface ActivityChartProps {
  activityData: ActivityData[];
  loading: boolean;
  refreshKey?: number;
}

export const ActivityChart = ({ activityData, loading }: ActivityChartProps) => {
  return (
    <Card className="p-6 sm:p-7 h-full bg-card shadow-3d border-border/40 rounded-3xl animate-fade-in-up">
      <div className="mb-6">
        <h3 className="text-base font-bold tracking-tight text-foreground">Learning Activity</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Distribution by category</p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="h-2 w-24 bg-muted rounded-full animate-pulse" />
        </div>
      ) : activityData.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={activityData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                fontSize: "12px",
                boxShadow: "0 8px 24px -4px hsl(var(--foreground) / 0.12)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {activityData.map((entry, i) => (
                <Cell key={i} fill={entry.color || "hsl(var(--foreground))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No activity yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start using tools to see insights</p>
        </div>
      )}
    </Card>
  );
};
