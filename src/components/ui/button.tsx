import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs hover:bg-[color-mix(in oklch, var(--primary) 85%, black)] dark:hover:bg-[color-mix(in oklch, var(--primary) 80%, white)] focus-visible:ring-[var(--ring)]",

        destructive:
          "bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-xs hover:bg-[var(--destructive)/90] focus-visible:ring-[var(--destructive)/20] dark:focus-visible:ring-[var(--destructive)/40] dark:bg-[color-mix(in oklch, var(--destructive) 60%, black)]",

        outline:
          "bg-transparent border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-[var(--foreground)] dark:border-[var(--muted-foreground)] dark:text-[var(--muted-foreground)] dark:hover:bg-[color-mix(in oklch, var(--accent) 30%, black)] dark:hover:border-[var(--accent)] dark:hover:text-white shadow-none",

        secondary:
          "bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-xs hover:bg-[var(--secondary)/80] dark:bg-[var(--secondary)] dark:text-white dark:hover:bg-[color-mix(in oklch, var(--secondary) 80%, black)]",

        ghost:
          "bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] dark:text-[var(--muted-foreground)] dark:hover:bg-[color-mix(in oklch, var(--accent) 30%, black)] dark:hover:text-white shadow-none",

        link:
          "text-[var(--primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
