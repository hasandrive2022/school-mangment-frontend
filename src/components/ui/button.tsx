import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex h-10 items-center justify-center rounded-md border px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50", { variants: { variant: { default: "border-primary bg-primary text-primary-foreground hover:bg-primary/90", outline: "border-primary bg-background text-primary hover:bg-primary/5", secondary: "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80", ghost: "border-transparent hover:bg-muted", destructive: "border-destructive bg-destructive text-white hover:bg-destructive/90", link: "border-transparent px-0 text-primary underline-offset-4 hover:underline" }, size: { default: "h-10", sm: "h-8 px-3 text-xs", lg: "h-12", icon: "size-10 px-0" } }, defaultVariants: { variant: "default", size: "default" } });
export function Button({ className, variant, size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) { return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />; }
export { buttonVariants };
