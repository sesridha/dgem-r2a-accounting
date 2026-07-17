/**
 * Pure-React Popover – no Radix UI dependency.
 */
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/* ── Context ── */
interface PopoverContextValue {
  open: boolean
  onOpenChange: (o: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
}
const PopoverCtx = React.createContext<PopoverContextValue>({
  open: false, onOpenChange: () => {}, triggerRef: React.createRef()
})

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
  const triggerRef = React.useRef<HTMLElement>(null)
  const handleOpenChange = (o: boolean) => { setUncontrolled(o); onOpenChange?.(o) }
  return (
    <PopoverCtx.Provider value={{ open: isOpen, onOpenChange: handleOpenChange, triggerRef }}>
      {children}
    </PopoverCtx.Provider>
  )
}

/* ── Trigger ── */
function PopoverTrigger({ children, asChild: _asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { open, onOpenChange, triggerRef } = React.useContext(PopoverCtx)
  const child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>
  return React.cloneElement(child, {
    ref: triggerRef as React.Ref<HTMLElement>,
    onClick: (e: React.MouseEvent) => {
      onOpenChange(!open)
      child.props.onClick?.(e as React.MouseEvent<HTMLElement>)
    },
  })
}

/* ── Anchor (no-op for API compat) ── */
function PopoverAnchor({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

/* ── Content ── */
interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  sideOffset?: number
  side?: "top" | "bottom" | "left" | "right"
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "center", sideOffset = 4, children, ...props }, ref) => {
    const { open, onOpenChange, triggerRef } = React.useContext(PopoverCtx)
    const [pos, setPos] = React.useState({ top: 0, left: 0 })

    React.useEffect(() => {
      if (open && triggerRef.current) {
        const r = triggerRef.current.getBoundingClientRect()
        setPos({ top: r.bottom + sideOffset, left: r.left })
      }
    }, [open, triggerRef, sideOffset])

    React.useEffect(() => {
      if (!open) return
      const close = (e: MouseEvent) => {
        const target = e.target as Node
        if (!triggerRef.current?.contains(target)) onOpenChange(false)
      }
      document.addEventListener("mousedown", close)
      return () => document.removeEventListener("mousedown", close)
    }, [open, onOpenChange, triggerRef])

    if (!open) return null
    return createPortal(
      <div
        ref={ref}
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          "fixed z-50 min-w-[18rem] rounded-md border",
          "bg-white text-[#121A38] p-4 shadow-md outline-none",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
        style={{ top: pos.top, left: pos.left }}
        {...props}
      >
        {children}
      </div>,
      document.body
    )
  }
)
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent };
