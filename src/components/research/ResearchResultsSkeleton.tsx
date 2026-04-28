import { Skeleton } from "@/components/ui/skeleton";

export const ResearchResultsSkeleton = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="bg-card rounded-xl p-5 border border-border space-y-3">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-9/12" />
        <div className="flex justify-between pt-3 border-t border-border">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-28" />
        </div>
      </div>
    ))}
  </div>
);
