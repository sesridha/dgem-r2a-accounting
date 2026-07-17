"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Crumb = {
  label: string;
  href?: string; // use with react-router Link
  onClick?: () => void; // optional click handler
};

interface AppBreadcrumbProps {
  items: Crumb[];
  listClassName?: string;
  itemClassName?: string;
  separatorClassName?: string;
  variant?: "success" | "failure" | null; // for coloring the active page
}

export function AppBreadcrumb({
  items,
  listClassName,
  itemClassName,
  separatorClassName,
  variant = null,
}: AppBreadcrumbProps) {
  // Shared text style for ALL breadcrumb items
  const baseText = "text-[10px] uppercase tracking-[0.15em] font-bold";
  const inactiveColor = "text-[rgb(97,117,137)] dark:text-slate-400";
  const activeColor = "text-primary dark:text-primary-light";

  const mergedActiveColor =
    variant === "success"
      ? "text-green-600"
      : variant === "failure"
        ? "text-red-600"
        : activeColor;

  return (
    <Breadcrumb>
      <BreadcrumbList className={cn("flex items-center gap-1", listClassName)}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isInteractive = (item.href || item.onClick) && !isLast;

          return (
            <div key={index} className="flex items-center">
              <BreadcrumbItem className={itemClassName}>
                {isInteractive ? (
                  <BreadcrumbLink
                    asChild
                    className={cn(baseText, inactiveColor)}
                  >
                    {item.href ? (
                      // Case 1: Link navigation (can also have onClick)
                      <Link to={item.href} onClick={item.onClick}>
                        {item.label}
                      </Link>
                    ) : (
                      // Case 2: Click only (no href) — render a button
                      <button
                        type="button"
                        onClick={item.onClick}
                        className={cn(
                          "bg-transparent p-0 m-0 border-0 cursor-pointer",
                          baseText,
                          inactiveColor,
                        )}
                      >
                        {item.label}
                      </button>
                    )}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage
                    className={cn(
                      baseText,
                      isLast ? mergedActiveColor : inactiveColor,
                    )}
                  >
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {!isLast && (
                <BreadcrumbSeparator className={separatorClassName} />
              )}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
