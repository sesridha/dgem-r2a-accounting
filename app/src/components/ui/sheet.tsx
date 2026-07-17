/**
 * Pure-React Sheet (slide-in drawer) – no Radix UI dependency.
 */
import * as React from "react"
import { createPortal } from "react-dom"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/* ── Context ── */
interface SheetContextValue { open: boolean; onClose: () => void }
const SheetCtx = React.createContext<SheetContextValue>({ open: false, onClose: () => {} })

/* ── Root ── */
interface SheetProps {
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}
function Sheet({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: SheetProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isOpen = controlledOpen ?? uncontrolled
  const onClose = () => { setUncontrolled(false); onOpenChange?.(false) }
  return <SheetCtx.Provider value={{ open: isOpen, onClose }}>{children}</SheetCtx.Provider>
}

function SheetTrigger({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function SheetPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

const SheetOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { onClose } = React.useContext(SheetCtx)
    return (
      <div
        ref={ref}
        className={cn("fixed inset-0 z-50 bg-black/60", className)}
        onClick={onClose}
        {...props}
      />
    )
  }
)
SheetOverlay.displayName = "SheetOverlay"

function SheetClose({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onClose } = React.useContext(SheetCtx)
  return (
    <button type="button" onClick={onClose}
      className={cn("rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none", className)}
      {...props}>
      {children}
    </button>
  )
}

/* ── Sheet variants (side) ── */
const sheetVariants = cva(
  "fixed z-50 bg-white p-6 shadow-lg transition-transform ease-in-out duration-300",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-grey-200",
        bottom: "inset-x-0 bottom-0 border-t border-grey-200",
        left: "inset-y-0 left-0 h-full w-3/4 border-r border-grey-200 sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l border-grey-200 sm:max-w-sm",
      },
    },
    defaultVariants: { side: "right" },
  }
)

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => {
    const { open, onClose } = React.useContext(SheetCtx)
    if (!open) return null
    return createPortal(
      <>
        <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} />
        <div ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
          <button type="button" onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      </>,
      document.body
    )
  }
)
SheetContent.displayName = "SheetContent"

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
}
SheetHeader.displayName = "SheetHeader"

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
}
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold text-[#121A38]", className)} {...props} />
  )
)
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-grey-600", className)} {...props} />
  )
)
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
