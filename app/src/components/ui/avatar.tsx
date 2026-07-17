import * as React from "react"

import { cn } from "@/lib/utils"

/* ── Avatar root ── */
const Avatar = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  )
)
Avatar.displayName = "Avatar"

/* ── Avatar image ── */
interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onLoadingStatusChange, onLoad, onError, ...props }, ref) => {
    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      onLoadingStatusChange?.("loaded")
      onLoad?.(e)
    }
    const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      onLoadingStatusChange?.("error")
      onError?.(e)
    }
    return (
      <img
        ref={ref}
        className={cn("aspect-square h-full w-full object-cover", className)}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

/* ── Avatar fallback (shown when no image or image errors) ── */
const AvatarFallback = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-grey-100 text-sm font-medium text-grey-600",
        className
      )}
      {...props}
    />
  )
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
