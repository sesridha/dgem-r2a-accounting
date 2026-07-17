import { Skeleton } from "@/components/ui/skeleton";

/**
 * LoadingFallback Component
 * Displayed while lazy-loaded routes and components are loading
 */
export default function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-2xl space-y-4 px-4">
        {/* Header skeleton */}
        <Skeleton className="h-8 w-64" />
        
        {/* Content skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        
        {/* Table skeleton */}
        <div className="space-y-2 pt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
