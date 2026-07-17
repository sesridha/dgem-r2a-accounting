/**
 * Pure-React Select – no Radix UI.
 * Uses position:absolute on a relative wrapper – no portal, no getBoundingClientRect.
 */
import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

/* ── Context ── */
interface SelectContextValue {
  value: string
  onValueChange: (v: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}
const SelectCtx = React.createContext<SelectContextValue>({
  value: "", onValueChange: () => {}, open: false, setOpen: () => {},
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
  const value = controlledValue ?? uncontrolled

  const handleValueChange = React.useCallback((v: string) => {
    setUncontrolled(v)
    onValueChange?.(v)
    setOpen(false)
  }, [onValueChange])

  /* Close on outside click */
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open])

  return (
    <SelectCtx.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
      <div ref={wrapperRef} className="relative w-full">
        {children}
      </div>
    </SelectCtx.Provider>
  )
}

function SelectGroup({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectCtx)
  return <span className={value ? "" : "text-grey-400"}>{value || placeholder}</span>
}

/* ── Trigger ── */
const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, onClick, ...props }, ref) => {
    const { setOpen, open } = React.useContext(SelectCtx)
    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => { setOpen((o) => !o); onClick?.(e) }}
        className={cn(
          "dgem-input flex items-center justify-between cursor-pointer w-full text-left",
          open && "border-[var(--dgem-light-blue,#1DB8F2)]",
          className
        )}
        aria-expanded={open}
        {...props}
      >
        {children}
        <ChevronDown className={cn("h-4 w-4 opacity-50 ml-2 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

/* ── Content (absolute, no portal) ── */
const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { position?: string }>(
  ({ className, children, ...props }, ref) => {
    const { open } = React.useContext(SelectCtx)
    if (!open) return null
    return (
      <div
        ref={ref}
        className={cn(
          "absolute left-0 top-[calc(100%+4px)] z-50 w-full",
          "rounded-md border border-grey-200 bg-white shadow-md",
          "max-h-72 overflow-y-auto",
          className
        )}
        {...props}
      >
        <div className="p-1">{children}</div>
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

/* ── Label ── */
const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-2 py-1.5 text-xs font-semibold text-grey-600", className)} {...props} />
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
        onMouseDown={(e) => { e.preventDefault(); if (!disabled) onValueChange(value) }}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-3 pr-8 text-sm",
          "text-[#121A38] transition-colors",
          "hover:bg-grey-100",
          isSelected && "bg-grey-100 font-medium",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        {...props}
      >
        {isSelected && (
          <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
            <Check className="h-4 w-4 text-[var(--dgem-blue,#0058AB)]" />
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
    <div ref={ref} className={cn("-mx-1 my-1 h-px bg-grey-200", className)} {...props} />
  )
)
SelectSeparator.displayName = "SelectSeparator"

function SelectScrollUpButton({ className: _c }: { className?: string }) { return null }
function SelectScrollDownButton({ className: _c }: { className?: string }) { return null }

export {
  Select, SelectGroup, SelectValue, SelectTrigger, SelectContent,
  SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton,
}
