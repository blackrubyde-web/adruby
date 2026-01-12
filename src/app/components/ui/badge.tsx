import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // NEW: Extended variants from layout/Badge.tsx and layout/Chip.tsx
        success:
          "border-transparent bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 [a&]:hover:bg-green-500/20",
        warning:
          "border-transparent bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 [a&]:hover:bg-yellow-500/20",
        info:
          "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 [a&]:hover:bg-blue-500/20",
        purple:
          "border-transparent bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 [a&]:hover:bg-purple-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">,
  VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  icon?: React.ReactNode; // NEW: Support for icons (from Chip)
}

function Badge({
  className,
  variant,
  asChild = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {icon && <span className="[&>svg]:size-3">{icon}</span>}
      {children}
    </Comp>
  );
}

export { Badge, badgeVariants };
