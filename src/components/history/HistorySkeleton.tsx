import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const HistorySkeleton = () => {
  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="group relative overflow-hidden transition-all duration-200 border-0 bg-card/80 backdrop-blur-sm lg:border lg:bg-card">
          <div className="p-4 sm:p-5 lg:p-6">
            {/* Header with title and actions */}
            <div className="flex items-start justify-between gap-4 lg:gap-6 mb-3 lg:mb-4">
              <Skeleton className="h-5 sm:h-6 lg:h-7 w-3/4" />
              <div className="flex items-center gap-2 flex-shrink-0">
                <Skeleton className="h-8 w-8 lg:h-9 lg:w-9 rounded-md" />
                <Skeleton className="h-8 w-8 lg:h-9 lg:w-9 rounded-md" />
              </div>
            </div>

            {/* Meta information */}
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 lg:gap-4 mb-4 lg:mb-5">
              <Skeleton className="h-4 w-32 sm:w-40" />
              <Skeleton className="h-6 w-20 lg:w-24 rounded-full" />
            </div>
            
            {/* Content Preview */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};