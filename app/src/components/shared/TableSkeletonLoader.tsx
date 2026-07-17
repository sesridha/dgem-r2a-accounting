"use client";

import { Skeleton } from "@/components/ui/skeleton";

export interface TableSkeletonLoaderProps {
  /** Number of columns to render in the skeleton table */
  columns?: number;
  /** Number of rows to render */
  rows?: number;
  /** Whether to show a header row with different styling */
  showHeader?: boolean;
  /** Whether to show a search/filter bar skeleton above the table */
  showToolbar?: boolean;
  /** Optional title skeleton above the table */
  showTitle?: boolean;
  /** Custom class name for the container */
  className?: string;
}

/**
 * TableSkeletonLoader - A reusable animated skeleton loader for table views.
 * Provides a realistic table loading placeholder with configurable rows, columns,
 * toolbar, and header sections.
 *
 * Usage:
 *   <TableSkeletonLoader columns={8} rows={10} showToolbar />
 */
export default function TableSkeletonLoader({
  columns = 6,
  rows = 8,
  showHeader = true,
  showToolbar = true,
  showTitle = false,
  className = "",
}: TableSkeletonLoaderProps) {
  return (
    <div className={`w-full animate-in fade-in duration-300 ${className}`}>
      {/* Title skeleton */}
      {showTitle && (
        <div className="mb-4">
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-4 w-72 opacity-70" />
        </div>
      )}

      {/* Toolbar skeleton (search / filter bar) */}
      {showToolbar && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-56 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      )}

      {/* Table skeleton */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        {/* Header row */}
        {showHeader && (
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton
                key={`header-${i}`}
                className="h-4 flex-1 max-w-[140px]"
                style={{ opacity: 1 - i * 0.05 }}
              />
            ))}
          </div>
        )}

        {/* Data rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={`row-${rowIdx}`}
            className={`flex items-center gap-2 px-4 py-3 ${
              rowIdx < rows - 1 ? "border-b border-slate-100" : ""
            }`}
          >
            {Array.from({ length: columns }).map((_, colIdx) => {
              // Vary widths for realistic appearance
              const widthClasses = [
                "w-16",
                "w-24",
                "w-20",
                "w-28",
                "w-20",
                "w-32",
                "w-24",
                "w-20",
              ];
              const widthClass =
                widthClasses[colIdx % widthClasses.length];
              return (
                <Skeleton
                  key={`cell-${rowIdx}-${colIdx}`}
                  className={`h-4 flex-1 max-w-[140px] ${widthClass}`}
                  style={{
                    animationDelay: `${rowIdx * 50 + colIdx * 25}ms`,
                    opacity: 0.7 + Math.random() * 0.3,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / pagination skeleton */}
      <div className="flex items-center justify-between mt-3 px-1">
        <Skeleton className="h-4 w-36 opacity-60" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}
