/**
 * Pure-React Dialog – no Radix UI dependency.
 * Uses @dgem/design-system dgem-modal-* classes.
 */
import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Context ── */
interface DialogContextValue { open: boolean; onClose: () => void }
const DialogContext = React.createContext<DialogContextValue>({ open: false, onClose: () => {} })

/* ── Dialog root ── */
interface DialogProps {
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function Dialog({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isOpen = controlledOpen ?? uncontrolledOpen
  const onClose = () => {
    setUncontrolledOpen(false)
    onOpenChange?.(false)
  }
  return (
    <DialogContext.Provider value={{ open: isOpen, onClose }}>
      {children}
    </DialogContext.Provider>
  )
}

/* ── Trigger ── */
function DialogTrigger({ children, asChild: _asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return <>{children}</>
}

/* ── Portal wrapper (no-op; used for API compat) ── */
function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

/* ── Overlay ── */
const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onClick, ...props }, ref) => {
    const { onClose } = React.useContext(DialogContext)
    return (
      <div
        ref={ref}
        className={cn("dgem-modal-overlay", className)}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); onClick?.(e) }}
        {...props}
      />
    )
  }
)
DialogOverlay.displayName = "DialogOverlay"

/* ── Close button ── */
function DialogClose({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onClose } = React.useContext(DialogContext)
  return (
    <button
      type="button"
      onClick={onClose}
      className={cn("rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none", className)}
      {...props}
    >
      {children}
    </button>
  )
}

/* ── Content ── */
const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, onClose } = React.useContext(DialogContext)
    if (!open) return null
    return createPortal(
      <div
        className="dgem-modal-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn("dgem-modal relative", className)}
          {...props}
        >
          {children}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>,
      document.body
    )
  }
)
DialogContent.displayName = "DialogContent"

/* ── Header / Footer / Title / Description ── */
function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("dgem-modal-header", className)} {...props} />
}
DialogHeader.displayName = "DialogHeader"

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("dgem-modal-footer flex-col-reverse sm:flex-row sm:space-x-2", className)} {...props} />
}
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-grey-600", className)} {...props} />
  )
)
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
