/**
 * Pure-React tooltip – no Radix UI dependency.
 * Uses CSS group-hover to show/hide the tooltip panel.
 */
import * as React from "react"
import { cn } from "@/lib/utils"

/* No-op provider for API compatibility */
function TooltipProvider({ children }: { children: React.ReactNode; delayDuration?: number }) {
  return <>{children}</>
}

/* Tooltip root – uses relative + group positioning */
function Tooltip({ children }: { children: React.ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (o: boolean) => void }) {
  return <span className="relative inline-flex group">{children}</span>
}

/* Trigger – just renders children */
function TooltipTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return <>{children}</>
}

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number
  side?: "top" | "bottom" | "left" | "right"
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, children, side = "top", sideOffset: _so, ...props }, ref) => {
    const sideClass =
      side === "bottom" ? "top-full mt-1" :
      side === "left"   ? "right-full mr-1 top-1/2 -translate-y-1/2" :
      side === "right"  ? "left-full ml-1 top-1/2 -translate-y-1/2" :
      /* top */           "bottom-full mb-1"

    return (
      <div
        ref={ref}
        role="tooltip"
        className={cn(
          "absolute z-50 pointer-events-none",
          "invisible opacity-0 group-hover:visible group-hover:opacity-100",
          "transition-opacity duration-150",
          "left-1/2 -translate-x-1/2",
          sideClass,
          "whitespace-nowrap rounded px-2 py-1 text-xs",
          "bg-[var(--dgem-dark-blue)] text-white",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
