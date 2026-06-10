import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-white placeholder:text-white/35 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
