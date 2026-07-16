import type { TopNavProps } from "@/types";
import { AppBreadcrumb } from "../shared/Breadcrumb";
import { SidebarTrigger } from "../ui/sidebar";

export default function ICItemSolverTopNav({
  title = "IC Item Solver",
  description = "Select company and periods to run anomaly detection.",
  breadcrumbItems,
  variant = null,
}: TopNavProps) {
  return (
    <div className="w-full">
      {/* Top Row: Sidebar + Breadcrumb + Status */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-6">
        {/* Sidebar + Breadcrumb */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SidebarTrigger className="md:hidden h-9 w-9" />

          <AppBreadcrumb
            items={
              breadcrumbItems || [
                { label: "Automation", href: "/" },
                { label: "IC Item Solver" },
                { label: "Detection Results" },
              ]
            }
            variant={variant}
          />
        </div>

        {/* Status Badge (Success) */}
        {variant === "success" && (
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-green-600">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
            STATUS <span className="text-green-700">SUCCESS</span>
          </div>
        )}
      </div>

      {/* Title + Description + Export */}
      <div className="mt-4 mb-3 flex flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left: title + description (flexes) */}
        <div className="min-w-0 flex-1">
          <h2
            className="text-[#111418] dark:text-white
                 text-base sm:text-xl md:text-2xl
                 font-black tracking-tight
                 "
            title={title} /* show full text on hover */
          >
            {title}
          </h2>

          <p
            className="text-[#617589] dark:text-slate-400
                 text-xs sm:text-sm mt-1
                 "
            title={description}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
