/**
 * Pure-React Select – no Radix UI dependency.
 * Uses a native <select> styled with dgem-input, plus a
 * custom dropdown list for richer UI when needed.
 */
import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

/* ── Context ── */
interface SelectContextValue {
  value: string
  onValueChange: (v: string) => void
  open: boolean
  setOpen: (o: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}
const SelectCtx = React.createContext<SelectContextValue>({
  value: "", onValueChange: () => {}, open: false, setOpen: () => {}, triggerRef: React.createRef()
})

/* ── Root ── */
interface SelectProps {
  children?: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}
function Select({ children, value: controlledValue, defaultValue = "", onValueChange }: SelectProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const value = controlledValue ?? uncontrolled
  const handleValueChange = (v: string) => {
    setUncontrolled(v)
    onValueChange?.(v)
    setOpen(false)
  }
  return (
    <SelectCtx.Provider value={{ value, onValueChange: handleValueChange, open, setOpen, triggerRef }}>
      {children}
    </SelectCtx.Provider>
  )
}

function SelectGroup({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectCtx)
  return <span className={value ? "" : "text-[var(--color-muted-foreground)]"}>{value || placeholder}</span>
}

/* ── Trigger ── */
const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, onClick, ...props }, ref) => {
    const { setOpen, open, triggerRef } = React.useContext(SelectCtx)
    return (
      <button
        ref={(el) => {
          (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el
        }}
        type="button"
        onClick={(e) => { setOpen(!open); onClick?.(e) }}
        className={cn(
          "dgem-input flex items-center justify-between cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

/* Scroll helpers – no-ops for API compat */
function SelectScrollUpButton({ className: _c }: { className?: string }) { return null }
function SelectScrollDownButton({ className: _c }: { className?: string }) { return null }

/* ── Content ── */
const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { position?: string }>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, triggerRef } = React.useContext(SelectCtx)
    const [rect, setRect] = React.useState<DOMRect | null>(null)

    React.useEffect(() => {
      if (open && triggerRef.current) setRect(triggerRef.current.getBoundingClientRect())
    }, [open, triggerRef])

    React.useEffect(() => {
      if (!open) return
      const close = () => setOpen(false)
      document.addEventListener("mousedown", close)
      return () => document.removeEventListener("mousedown", close)
    }, [open, setOpen])

    if (!open || !rect) return null
    return createPortal(
      <div
        ref={ref}
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border",
          "bg-[var(--color-background)] text-[var(--color-foreground)] shadow-md",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
        style={{ top: rect.bottom + 4, left: rect.left, width: rect.width }}
        {...props}
      >
        <div className="p-1">{children}</div>
      </div>,
      document.body
    )
  }
)
SelectContent.displayName = "SelectContent"

/* ── Label ── */
const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
  )
)
SelectLabel.displayName = "SelectLabel"

/* ── Item ── */
interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}
const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(SelectCtx)
    const isSelected = selectedValue === value
    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        onClick={() => !disabled && onValueChange(value)}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
          "hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
          isSelected && "bg-[var(--color-muted)] font-medium",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        {...props}
      >
        {isSelected && (
          <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
            <Check className="h-4 w-4" />
          </span>
        )}
        {children}
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

/* ── Separator ── */
const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-1 my-1 h-px bg-[var(--color-muted)]", className)} {...props} />
  )
)
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
