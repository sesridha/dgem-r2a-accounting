"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

type StatusVariant = "success" | "failure";

interface StatusToastProps {
  variant: StatusVariant;
  title: string;
  description?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  iconClassName?: string;
  iconWrapperClassName?: string;
  showIcon?: boolean;
  errorTitleClassName?: string;
  errorDescriptionClassName?: string;
  autoHideDuration?: number;
}

export function StatusToast({
  variant,
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  iconClassName,
  iconWrapperClassName,
  showIcon = true,
  errorTitleClassName,
  errorDescriptionClassName,
  autoHideDuration,
}: StatusToastProps) {
  const isSuccess = variant === "success";
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));

    if (autoHideDuration && autoHideDuration > 0) {
      const timeoutId = window.setTimeout(() => {
        setIsVisible(false);
      }, autoHideDuration);

      return () => {
        cancelAnimationFrame(id);
        window.clearTimeout(timeoutId);
      };
    }

    return () => cancelAnimationFrame(id);
  }, [autoHideDuration, title, description, variant]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ",
        isSuccess
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-800",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {showIcon ? (
        <div
          className={cn(
            "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full",
            isSuccess ? "bg-green-100" : "bg-red-100",
            iconWrapperClassName,
          )}
        >
          {isSuccess ? (
            <CheckCircle2 className={cn("h-4 w-4", iconClassName)} />
          ) : (
            <XCircle className={cn("h-4 w-4", iconClassName)} />
          )}
        </div>
      ) : null}
      <div>
        <div
          className={cn("font-semibold", titleClassName, errorTitleClassName)}
        >
          {title}
        </div>
        {description ? (
          <div
            className={cn(
              `text-xs text-slate-600 ${variant === "failure" ? "text-red-600" : "text-green-600"}`,
              descriptionClassName,
              errorDescriptionClassName,
            )}
          >
            {description}
          </div>
        ) : null}
      </div>
      <div></div>
    </div>
  );
}
