/**
 * Pure-React Popover – no Radix UI.
 * Uses position:absolute on a relative wrapper – no portal, no getBoundingClientRect.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

/* ── Context ── */
interface PopoverContextValue {
  open: boolean
  onOpenChange: (o: boolean) => void
}
const PopoverCtx = React.createContext<PopoverContextValue>({ open: false, onOpenChange: () => {} })

/* ── Root ── */
interface PopoverProps {
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}
function Popover({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: PopoverProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isOpen = controlledOpen ?? uncontrolled
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  const handleOpenChange = React.useCallback((o: boolean) => {
    setUncontrolled(o)
    onOpenChange?.(o)
  }, [onOpenChange])

  /* Close on outside click */
  React.useEffect(() => {
    if (!isOpen) return
    const close = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        handleOpenChange(false)
      }
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [isOpen, handleOpenChange])

  return (
    <PopoverCtx.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      <div ref={wrapperRef} className="relative inline-block w-full">
        {children}
      </div>
    </PopoverCtx.Provider>
  )
}

/* ── Trigger – just toggles the popover on click ── */
function PopoverTrigger({ children, asChild: _asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { open, onOpenChange } = React.useContext(PopoverCtx)
  const child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>
  return React.cloneElement(child, {
    onClick: (e: React.MouseEvent) => {
      onOpenChange(!open)
      child.props.onClick?.(e as React.MouseEvent<HTMLElement>)
    },
  })
}

/* ── Anchor (no-op) ── */
function PopoverAnchor({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

/* ── Content (absolute below trigger) ── */
interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  sideOffset?: number
  side?: "top" | "bottom" | "left" | "right"
}
const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "start", sideOffset = 4, children, side = "bottom", ...props }, ref) => {
    const { open } = React.useContext(PopoverCtx)
    if (!open) return null

    const alignClass = align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
    const sideClass = side === "top" ? `bottom-[calc(100%+${sideOffset}px)]` : `top-[calc(100%+${sideOffset}px)]`

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 w-full min-w-[12rem]",
          "rounded-md border border-grey-200 bg-white shadow-md p-2",
          "animate-in fade-in-0 zoom-in-95",
          alignClass,
          sideClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent };
