/**
 * Pure-React Dropdown Menu – no Radix UI.
 * Uses position:absolute on a relative wrapper.
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronRightIcon } from "lucide-react";

/* ── Context ── */
interface DDMContextValue { open: boolean; setOpen: (o: boolean) => void }
const DDMCtx = React.createContext<DDMContextValue>({ open: false, setOpen: () => {} })

/* ── Root ── */
interface DropdownMenuProps {
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (o: boolean) => void
  modal?: boolean
}
function DropdownMenu({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: DropdownMenuProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isOpen = controlledOpen ?? uncontrolled
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  const setOpen = React.useCallback((o: boolean) => {
    setUncontrolled(o)
    onOpenChange?.(o)
  }, [onOpenChange])

  React.useEffect(() => {
    if (!isOpen) return
    const close = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [isOpen, setOpen])

  return (
    <DDMCtx.Provider value={{ open: isOpen, setOpen }}>
      <div ref={wrapperRef} className="relative inline-block">
        {children}
      </div>
    </DDMCtx.Provider>
  )
}

function DropdownMenuPortal({ children }: { children?: React.ReactNode }) { return <>{children}</> }

function DropdownMenuTrigger({ children, asChild: _asChild, className, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { open, setOpen } = React.useContext(DDMCtx)
  return (
    <button
      type="button"
      className={cn("inline-flex items-center w-full", className)}
      onClick={(e) => { setOpen(!open); onClick?.(e) }}
      aria-expanded={open}
      aria-haspopup="menu"
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 4,
  children,
  side = "bottom",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end"; sideOffset?: number; side?: "top" | "bottom" }) {
  const { open } = React.useContext(DDMCtx)
  if (!open) return null

  const alignClass = align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
  const sideClass = side === "top" ? `bottom-[calc(100%+${sideOffset}px)]` : `top-[calc(100%+${sideOffset}px)]`

  return (
    <div
      role="menu"
      className={cn(
        "absolute z-50 min-w-[10rem] overflow-hidden rounded-lg border border-grey-200 bg-white p-1 shadow-md",
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

function DropdownMenuGroup({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-0", className)}>{children}</div>
}

function DropdownMenuItem({
  className, inset, variant = "default", children, onClick, ...props
}: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean; variant?: "default" | "destructive" }) {
  const { setOpen } = React.useContext(DDMCtx)
  return (
    <div
      role="menuitem"
      onClick={(e) => { setOpen(false); onClick?.(e) }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm",
        "text-[#121A38] outline-none transition-colors",
        "hover:bg-grey-100",
        variant === "destructive" && "text-red hover:bg-red/10",
        inset && "pl-7",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuCheckboxItem({
  className, children, checked, inset, onCheckedChange, ...props
}: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean; checked?: boolean; onCheckedChange?: (c: boolean) => void }) {
  const { setOpen } = React.useContext(DDMCtx)
  return (
    <div
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={() => { onCheckedChange?.(!checked); setOpen(false) }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md py-1.5 pl-2 pr-8 text-sm",
        "text-[#121A38] hover:bg-grey-100",
        inset && "pl-7",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex items-center justify-center">
        {checked && <CheckIcon className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
}

const RadioGroupCtx = React.createContext<{ value: string; onValueChange: (v: string) => void }>({ value: "", onValueChange: () => {} })

function DropdownMenuRadioGroup({ value = "", onValueChange = () => {}, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { value?: string; onValueChange?: (v: string) => void }) {
  return <RadioGroupCtx.Provider value={{ value, onValueChange }}><div {...props}>{children}</div></RadioGroupCtx.Provider>
}

function DropdownMenuRadioItem({ className, children, value = "", inset, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean; value?: string }) {
  const { value: selected, onValueChange } = React.useContext(RadioGroupCtx)
  const { setOpen } = React.useContext(DDMCtx)
  const isSelected = selected === value
  return (
    <div
      role="menuitemradio"
      aria-checked={isSelected}
      onClick={() => { onValueChange(value); setOpen(false) }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md py-1.5 pl-2 pr-8 text-sm",
        "text-[#121A38] hover:bg-grey-100",
        inset && "pl-7",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex items-center justify-center">
        {isSelected && <CheckIcon className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
}

function DropdownMenuLabel({ className, inset, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
  return <div className={cn("px-2 py-1 text-xs font-medium text-grey-600", inset && "pl-7", className)} {...props} />
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("-mx-1 my-1 h-px bg-grey-200", className)} {...props} />
}

function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("ml-auto text-xs tracking-widest text-grey-600", className)} {...props} />
}

function DropdownMenuSub({ children }: { children?: React.ReactNode }) { return <>{children}</> }

function DropdownMenuSubTrigger({ className, inset, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
  return (
    <div
      role="menuitem"
      aria-haspopup="menu"
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm",
        "text-[#121A38] hover:bg-grey-100",
        inset && "pl-7",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </div>
  )
}

function DropdownMenuSubContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-grey-200 bg-white p-1 shadow-md",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem, DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
};
