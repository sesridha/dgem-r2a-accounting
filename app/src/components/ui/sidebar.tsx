/**
 * Pure-React Sidebar – no Radix UI, no Tailwind v4 syntax.
 * Uses @dgem/design-system dgem-sidebar / dgem-sidebar-link classes.
 * Sidebar is IN-FLOW (not fixed) so the flex layout in MainLayout
 * naturally pushes the content area to the right.
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PanelLeftIcon } from "lucide-react";
import { SidebarContext, useSidebar, type SidebarContextProps } from "./sidebar-context";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

/* ══════════════════════════════════════════════════
   PROVIDER
══════════════════════════════════════════════════ */
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o);
  }, [isMobile, setOpen, setOpenMobile]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON, ...style } as React.CSSProperties}
        className={cn("flex min-h-screen w-full", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

/* ══════════════════════════════════════════════════
   SIDEBAR ROOT
══════════════════════════════════════════════════ */
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"aside"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  /* Mobile: render in a Sheet */
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side={side}
          className="p-0 w-[18rem] bg-[var(--color-card)] border-r border-[var(--color-border)]"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Mobile navigation</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  /* Desktop: in-flow aside using dgem-sidebar */
  const width = state === "collapsed" && collapsible === "icon"
    ? SIDEBAR_WIDTH_ICON
    : state === "collapsed" && collapsible === "offcanvas"
    ? "0"
    : SIDEBAR_WIDTH;

  return (
    <aside
      data-state={state}
      data-side={side}
      className={cn(
        "dgem-sidebar shrink-0 transition-[width] duration-200 ease-linear overflow-hidden",
        state === "collapsed" && collapsible === "offcanvas" && "hidden",
        className,
      )}
      style={{ width }}
      {...props}
    >
      {children}
    </aside>
  );
}

/* ══════════════════════════════════════════════════
   TRIGGER / RAIL
══════════════════════════════════════════════════ */
function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(className)}
      onClick={(event) => { onClick?.(event); toggleSidebar(); }}
      {...props}
    >
      <PanelLeftIcon className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle Sidebar"
      onClick={toggleSidebar}
      className={cn(
        "absolute inset-y-0 right-0 z-20 hidden w-px cursor-col-resize bg-[var(--color-border)] hover:bg-[var(--color-primary)] transition-colors md:flex",
        className,
      )}
      {...props}
    />
  );
}

/* ══════════════════════════════════════════════════
   STRUCTURAL SECTIONS
══════════════════════════════════════════════════ */
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return <main className={cn("flex flex-col flex-1 overflow-auto", className)} {...props} />;
}

function SidebarInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn("h-8 w-full bg-[var(--color-background)] shadow-none", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-4 border-b border-[var(--color-border)]", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-4 border-t border-[var(--color-border)] mt-auto", className)}
      {...props}
    />
  );
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator className={cn("mx-2 w-auto", className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col flex-1 overflow-y-auto overflow-x-hidden p-2", className)}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("relative flex flex-col min-w-0 gap-2 p-2", className)} {...props} />;
}

function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-md px-2 py-1 text-xs font-medium text-[var(--color-muted-foreground)] outline-none",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0",
        "text-[var(--color-foreground)] outline-none transition-transform",
        "hover:bg-[var(--color-muted)]",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("w-full text-sm", className)} {...props} />;
}

/* ══════════════════════════════════════════════════
   MENU
══════════════════════════════════════════════════ */
function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex w-full min-w-0 flex-col gap-1 list-none p-0 m-0", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("group/menu-item relative", className)} {...props} />;
}

const sidebarMenuButtonVariants = cva(
  "dgem-sidebar-link w-full justify-start gap-2 rounded-md text-sm font-normal transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        outline: "border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm hover:bg-[var(--color-muted)]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-10 text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function SidebarMenuButton({
  asChild: _asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
}) {
  const button = (
    <button
      type="button"
      className={cn(
        sidebarMenuButtonVariants({ variant, size }),
        isActive && "dgem-sidebar-link-active",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );

  if (!tooltip) return button;

  const tooltipContent = typeof tooltip === "string" ? { children: tooltip } : tooltip;
  return (
    <Tooltip>
      <TooltipTrigger>{button}</TooltipTrigger>
      <TooltipContent side="right" {...tooltipContent} />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & { showOnHover?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "absolute right-1 top-1/2 -translate-y-1/2 flex aspect-square w-5 items-center justify-center rounded-md p-0",
        "text-[var(--color-foreground)] outline-none transition-colors",
        "hover:bg-[var(--color-muted)]",
        showOnHover && "opacity-0 group-hover/menu-item:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1",
        "text-xs font-medium tabular-nums",
        "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & { showIcon?: boolean }) {
  const width = React.useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, []);
  return (
    <div className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)} {...props}>
      {showIcon && <Skeleton className="size-4 rounded-md" />}
      <Skeleton className="h-4 flex-1 max-w-[var(--skeleton-width)]" style={{ "--skeleton-width": width } as React.CSSProperties} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SUB-MENU
══════════════════════════════════════════════════ */
function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn(
        "mx-3.5 my-0.5 border-l border-[var(--color-border)] pl-2.5 flex min-w-0 flex-col gap-1 list-none",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("group/menu-sub-item relative", className)} {...props} />;
}

function SidebarMenuSubButton({
  asChild: _asChild = false,
  size = "md",
  isActive = false,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  return (
    <a
      className={cn(
        "dgem-sidebar-link flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md",
        "text-[var(--color-foreground)] outline-none",
        "hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        isActive && "dgem-sidebar-link-active",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
