/**
 * Pure-React Command (search/filter list) – no cmdk or Radix UI dependency.
 * Provides the same exported API surface used by combobox and autocomplete.
 */
import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

/* ── Context: shared filter state ── */
interface CommandContextValue {
  filter: string
  setFilter: (s: string) => void
}
const CommandCtx = React.createContext<CommandContextValue>({ filter: "", setFilter: () => {} })

/* ── Command root ── */
const Command = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const [filter, setFilter] = React.useState("")
    return (
      <CommandCtx.Provider value={{ filter, setFilter }}>
        <div
          ref={ref}
          className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-[var(--color-background)] text-[var(--color-foreground)]", className)}
          {...props}
        >
          {children}
        </div>
      </CommandCtx.Provider>
    )
  }
)
Command.displayName = "Command"

/* ── CommandDialog ── */
interface CommandDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}
function CommandDialog({ children, ...props }: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  )
}

/* ── CommandInput ── */
const CommandInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, onChange, value, ...props }, ref) => {
    const { filter, setFilter } = React.useContext(CommandCtx)
    return (
      <div className="flex items-center border-b border-[var(--color-border)] px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          ref={ref}
          value={value ?? filter}
          onChange={(e) => { setFilter(e.target.value); onChange?.(e) }}
          className={cn(
            "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none",
            "placeholder:text-[var(--color-muted-foreground)] disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
CommandInput.displayName = "CommandInput"

/* ── CommandList ── */
const CommandList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)} {...props} />
  )
)
CommandList.displayName = "CommandList"

/* ── CommandEmpty ── */
const CommandEmpty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => (
    <div ref={ref} className="py-6 text-center text-sm text-[var(--color-muted-foreground)]" {...props} />
  )
)
CommandEmpty.displayName = "CommandEmpty"

/* ── CommandGroup ── */
const CommandGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { heading?: string }>(
  ({ className, heading, children, ...props }, ref) => (
    <div ref={ref} className={cn("overflow-hidden p-1", className)} {...props}>
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-[var(--color-muted-foreground)]">{heading}</div>
      )}
      {children}
    </div>
  )
)
CommandGroup.displayName = "CommandGroup"

/* ── CommandSeparator ── */
const CommandSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-1 h-px bg-[var(--color-border)]", className)} {...props} />
  )
)
CommandSeparator.displayName = "CommandSeparator"

/* ── CommandItem ── */
interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  disabled?: boolean
  onSelect?: (value: string) => void
}
const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className, value = "", disabled, onSelect, onClick, children, ...props }, ref) => (
    <div
      ref={ref}
      role="option"
      aria-disabled={disabled}
      onClick={(e) => {
        if (!disabled) { onSelect?.(value); onClick?.(e) }
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
CommandItem.displayName = "CommandItem"

/* ── CommandShortcut ── */
function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("ml-auto flex items-center gap-1 text-xs tracking-widest text-[var(--color-muted-foreground)]", className)}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
};
