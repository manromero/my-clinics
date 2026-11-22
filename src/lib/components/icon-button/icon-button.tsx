import type { ReactNode } from "react";
import { Button, type ButtonProps } from "../button/button";

export type IconButtonProps = Omit<
  ButtonProps,
  "children" | "startIcon" | "endIcon" | "aria-label" | "aria-labelledby"
> & {
  label?: string;
  icon: ReactNode;
};

const widths = { sm: "w-11", md: "w-12", lg: "w-14" };

/** Icon-only action; a descriptive label is recommended for accessibility. */
export function IconButton({
  label,
  icon,
  size = "md",
  variant = "tertiary",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <Button
      {...props}
      aria-label={label}
      variant={variant}
      size={size}
      startIcon={icon}
      className={`shrink-0 gap-0! p-0! ${widths[size]} ${className}`}
    />
  );
}
