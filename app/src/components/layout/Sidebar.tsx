import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "../ui/sidebar";
import {
  Settings,
  BookOpen,
  Scale,
  Layers,
  Grid3x3,
  LogOut,
  Loader2,
  ChevronDown,
  Mail,
  Paperclip,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { AvatarImage, Avatar, AvatarFallback } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAppStore } from "@/store";

/**
 * Sidebar Navigation Component
 */

interface SubSubNavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface SubNavItem {
  icon: React.ReactNode;
  label: string;
  path?: string; // optional when the item is itself expandable (has children)
  children?: SubSubNavItem[];
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  children?: SubNavItem[];
}

export default function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Auto-expand "AD-HOC JEs" if the page loads on one of its sub-routes
  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    const defaults = ["Journal Entry"];
    if (location.pathname.startsWith("/journal-entry/external-jes/")) {
      defaults.push("AD-HOC JEs");
    }
    return defaults;
  });

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  const navItems: NavItem[] = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Journal Entry",
      path: "/journal-entry",
      children: [
        {
          icon: <BookOpen className="w-4 h-4" />,
          label: "Standard JEs",
          path: "/journal-entry",
        },
        {
          icon: <Mail className="w-4 h-4" />,
          label: "AD-HOC JEs",
          // no direct path — this item expands to show sub-parsers
          children: [
            {
              icon: <Mail className="w-3.5 h-3.5" />,
              label: "JE as Email Content",
              path: "/journal-entry/external-jes/email-body",
            },
            {
              icon: <Paperclip className="w-3.5 h-3.5" />,
              label: "JE as Email Attachment",
              path: "/journal-entry/external-jes/email-attachment",
            },
          ],
        },
      ],
    },
    {
      icon: <Scale className="w-5 h-5" />,
      label: "Trial Balance",
      path: "/trial-balance",
    },
    {
      icon: <Layers className="w-5 h-5" />,
      label: "IC Item Solver",
      path: "/ic-item-solver",
    },
    {
      icon: <Grid3x3 className="w-5 h-5" />,
      label: "Balance Sheet Item Solver",
      path: "/balance-sheet-solver",
    },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    logout();
    navigate("/login");
  };

  const displayName = user?.name || "Account User";
  const displayRole = "Senior Accountant";
  const initials =
    displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AU";

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 bg-white">
              <img
                src="/cg.png"
                alt="Capgemini"
                className="h-7 w-7 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[15px] font-semibold leading-tight">
                Capgemini
              </h1>
              <p className="text-[10px] text-muted-foreground font-semibold tracking-[0.14em]">
                R2A AGENTIC AI
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3 py-4">
          <SidebarMenu className="gap-1">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMenus.includes(item.label);

              if (hasChildren) {
                return (
                  <div key={item.label}>
                    {/* Level-1 expandable button — never highlighted */}
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.label)}
                      className={cn(
                        "flex items-center w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                        "text-sidebar-foreground/80",
                      )}
                    >
                      {item.icon}
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          isExpanded ? "rotate-180" : "",
                        )}
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                        {item.children!.map((child) => {
                          const hasSubChildren = !!(
                            child.children && child.children.length > 0
                          );

                          // ── Level-2 expandable item ──────────────────────
                          if (hasSubChildren) {
                            const isSubExpanded = expandedMenus.includes(
                              child.label,
                            );

                            return (
                              <div key={child.label}>
                                {/* Level-2 expandable button — never highlighted */}
                                <button
                                  type="button"
                                  onClick={() => toggleMenu(child.label)}
                                  className={cn(
                                    "flex items-center w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                                    "text-sidebar-foreground/70",
                                  )}
                                >
                                  {child.icon}
                                  <span className="flex-1 text-left">
                                    {child.label}
                                  </span>
                                  <ChevronDown
                                    className={cn(
                                      "w-3.5 h-3.5 transition-transform duration-200",
                                      isSubExpanded ? "rotate-180" : "",
                                    )}
                                  />
                                </button>
                                {isSubExpanded && (
                                  <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                                    {child.children!.map((subChild) => {
                                      const isSubChildActive =
                                        location.pathname === subChild.path ||
                                        location.pathname.startsWith(
                                          subChild.path + "/",
                                        );
                                      return (
                                        <NavLink
                                          key={subChild.label}
                                          to={subChild.path}
                                          className={cn(
                                            "flex items-center w-full justify-start gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                                            "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                                            isSubChildActive
                                              ? "bg-(--sidebar-menu-active) text-(--white) shadow-sm"
                                              : "text-sidebar-foreground/70",
                                          )}
                                        >
                                          {subChild.icon}
                                          <span>{subChild.label}</span>
                                        </NavLink>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          // ── Level-2 leaf item ────────────────────────────
                          if (!child.path) return null;

                          /**
                           * A leaf child is active when:
                           *   1. The pathname matches exactly, OR
                           *   2. The pathname starts with this child's prefix AND
                           *      no sibling (direct path OR any sub-child path)
                           *      is a more-specific match.
                           *
                           * The sub-child check is critical: "Standard JEs" has
                           * path "/journal-entry" which is a prefix of every
                           * External JE sub-route. Without checking sub-children,
                           * "Standard JEs" incorrectly becomes active when on
                           * e.g. /journal-entry/external-jes/email-body.
                           */
                          const isChildActive =
                            location.pathname === child.path ||
                            (location.pathname.startsWith(child.path + "/") &&
                              !item.children!
                                .filter((c) => c !== child)
                                .some((c) => {
                                  // Sibling has a direct matching path
                                  if (
                                    c.path &&
                                    (location.pathname === c.path ||
                                      location.pathname.startsWith(
                                        c.path + "/",
                                      ))
                                  ) {
                                    return true;
                                  }
                                  // Sibling has sub-children — check those too
                                  return (c.children ?? []).some(
                                    (sc) =>
                                      location.pathname === sc.path ||
                                      location.pathname.startsWith(
                                        sc.path + "/",
                                      ),
                                  );
                                }));

                          return (
                            <NavLink
                              key={child.label}
                              to={child.path}
                              className={cn(
                                "flex items-center w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                                isChildActive
                                  ? "bg-(--sidebar-menu-active) text-(--white) shadow-sm"
                                  : "text-sidebar-foreground/70",
                              )}
                            >
                              {child.icon}
                              <span>{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                      isActive
                        ? "bg-(--sidebar-menu-active) text-(--white) shadow-sm hover:bg-(--sidebar-menu-active)"
                        : "text-sidebar-foreground/80",
                    )
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex w-full items-center gap-3 rounded-lg p-2.5 hover:bg-sidebar-accent/70 cursor-pointer transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left flex-1">
                  <span className="text-sm font-semibold">{displayName}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {displayRole}
                  </span>
                </div>
                <div className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors">
                  <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="end" sideOffset={10}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {displayRole}
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                {isLoggingOut ? "Logging out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      {isLoggingOut && (
        <div className="fixed inset-0 z-100 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white px-5 py-3 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-(--sidebar-menu-active)" />
            <span className="text-sm font-semibold text-slate-800">
              Logging out...
            </span>
          </div>
        </div>
      )}
    </>
  );
}
