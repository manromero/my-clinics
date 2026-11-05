import type { HTMLAttributes } from "react";

export type PageContainerProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "main" | "section" | "article";
};

/** Centers page content with shared width, responsive gutters and vertical spacing. */
export function PageContainer({
  as: Element = "div",
  className = "",
  children,
  ...props
}: PageContainerProps) {
  return (
    <Element
      {...props}
      className={`mx-auto w-full min-w-0 max-w-7xl px-4 py-8 [overflow-wrap:anywhere] sm:px-6 lg:px-12 ${className}`}
    >
      {children}
    </Element>
  );
}
