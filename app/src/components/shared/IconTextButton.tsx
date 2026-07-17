// components/ui/icon-text-button.tsx
"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface IconTextButtonProps extends Omit<ButtonProps, "children"> {
  /** Main label text */
  text: string;
  /** Left icon component (e.g., Eye) */
  icon?: IconComponent;
  /** Optional right icon component */
  rightIcon?: IconComponent;
  /** When true, shows a spinner and disables the button */
  loading?: boolean;
  /** Size of the icons (defaults to 16px) */
  iconSize?: number;
  /** Extra className to merge */
  className?: string;
}

/**
 * A reusable Icon + Text button built on shadcn/ui Button.
 */
export function IconTextButton({
  text,
  icon: Icon,
  rightIcon: RightIcon,
  loading = false,
  disabled,
  iconSize = 16,
  className,
  variant = "outline",
  size = "default",
  ...rest
}: IconTextButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={isDisabled}
      className={cn(
        // sensible defaults you can override from the caller
        "gap-2 whitespace-nowrap",
        className,
      )}
      {...rest}
    >
      {/* Left adornment: loader overrides icon when loading */}
      {loading ? (
        <Loader2 className="animate-spin" width={iconSize} height={iconSize} />
      ) : Icon ? (
        <Icon width={iconSize} height={iconSize} />
      ) : null}

      <span>{text}</span>

      {/* Right adornment (optional) */}
      {RightIcon ? <RightIcon width={iconSize} height={iconSize} /> : null}
    </Button>
  );
}
