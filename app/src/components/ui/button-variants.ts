import { cva, type VariantProps } from "class-variance-authority"

/**
 * Button variants built on @dgem/design-system dgem-btn classes.
 * No Radix UI dependency.
 */
export const buttonVariants = cva("dgem-btn", {
  variants: {
    variant: {
      default: "dgem-btn--filled",
      destructive: "dgem-btn--destructive",
      outline: "dgem-btn--outlined",
      secondary: "dgem-btn-outlined-dark",
      ghost: "dgem-btn--ghost",
      link: "dgem-btn-text-blue underline-offset-4",
    },
    size: {
      default: "dgem-btn-md",
      sm: "dgem-btn-sm",
      lg: "dgem-btn-lg",
      icon: "dgem-btn--icon dgem-btn-md",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export type ButtonVariants = VariantProps<typeof buttonVariants>
