/**
 * Pure-React Dropdown Menu – no Radix UI dependency.
 */
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronRightIcon } from "lucide-react";

/* ── Context ── */
interface DDMContextValue { open: boolean; setOpen: (o: boolean) => void; triggerRef: React.RefObject<HTMLElement | null> }
const DDMCtx = React.createContext<DDMContextValue>({ open: false, setOpen: () => {}, triggerRef: React.createRef() })

/* ── Root ── */
interface DropdownMenuProps { children?: React.ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (o: boolean) => void; modal?: boolean }
function DropdownMenu({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: DropdownMenuProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isOpen = controlledOpen ?? uncontrolled
  const triggerRef = React.useRef<HTMLElement>(null)
  const setOpen = (o: boolean) => { setUncontrolled(o); onOpenChange?.(o) }
  return <DDMCtx.Provider value={{ open: isOpen, setOpen, triggerRef }}>{children}</DDMCtx.Provider>
}

function DropdownMenuPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function DropdownMenuTrigger({ children, asChild: _asChild, className, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { open, setOpen, triggerRef } = React.useContext(DDMCtx)
  return (
    <button
      ref={triggerRef as React.Ref<HTMLButtonElement>}
      type="button"
      className={cn("inline-flex items-center", className)}
      onClick={(e) => { setOpen(!open); onClick?.(e) }}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuContent({ className, align = "start", sideOffset = 4, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { align?: string; sideOffset?: number }) {
  const { open, setOpen, triggerRef } = React.useContext(DDMCtx)
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
      const t = e.target as Node
      if (!triggerRef.current?.contains(t)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open, setOpen, triggerRef])
  if (!open) return null
  return createPortal(
    <div
      onMouseDown={(e) => e.stopPropagation()}
      className={cn(
        "fixed z-50 min-w-[8rem] overflow-hidden rounded-lg p-1",
        "bg-[var(--color-background)] text-[var(--color-foreground)] shadow-md",
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

function DropdownMenuGroup({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-0", className)}>{children}</div>
}

function DropdownMenuItem({ className, inset, variant = "default", children, onClick, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean; variant?: "default" | "destructive" }) {
  const { setOpen } = React.useContext(DDMCtx)
  return (
    <div
      role="menuitem"
      onClick={(e) => { setOpen(false); onClick?.(e) }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none",
        "hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        variant === "destructive" && "text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10",
        inset && "pl-7",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuCheckboxItem({ className, children, checked, inset, onCheckedChange, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean; checked?: boolean; onCheckedChange?: (c: boolean) => void }) {
  const { setOpen } = React.useContext(DDMCtx)
  return (
    <div
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={(e) => { onCheckedChange?.(!checked); setOpen(false) }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-1.5 rounded-md py-1 pl-1.5 pr-8 text-sm outline-none",
        "hover:bg-[var(--color-muted)]",
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

interface DropdownMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> { value?: string; onValueChange?: (v: string) => void }
const RadioGroupCtx = React.createContext<{ value: string; onValueChange: (v: string) => void }>({ value: "", onValueChange: () => {} })
function DropdownMenuRadioGroup({ value = "", onValueChange = () => {}, children, ...props }: DropdownMenuRadioGroupProps) {
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
        "relative flex cursor-pointer select-none items-center gap-1.5 rounded-md py-1 pl-1.5 pr-8 text-sm outline-none",
        "hover:bg-[var(--color-muted)]",
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
  return (
    <div
      className={cn("px-1.5 py-1 text-xs font-medium text-[var(--color-muted-foreground)]", inset && "pl-7", className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("-mx-1 my-1 h-px bg-[var(--color-border)]", className)} {...props} />
}

function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("ml-auto text-xs tracking-widest text-[var(--color-muted-foreground)]", className)} {...props} />
}

function DropdownMenuSub({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
  return (
    <div
      role="menuitem"
      aria-haspopup="menu"
      className={cn(
        "flex cursor-pointer select-none items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none",
        "hover:bg-[var(--color-muted)]",
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
        "z-50 min-w-[8rem] overflow-hidden rounded-lg p-1",
        "bg-[var(--color-background)] text-[var(--color-foreground)] shadow-md",
        "animate-in fade-in-0",
        className
      )}
      {...props}
      className={cn(
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-[96px] rounded-md p-1 shadow-lg ring-1 duration-100 z-50 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
