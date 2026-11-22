import type { HTMLAttributes, ReactNode } from "react";

export type PageHeaderProps = Omit<
  HTMLAttributes<HTMLElement>,
  "title" | "children"
> & {
  title: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  titleId?: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
};

/** Editorial heading with caller-owned context and controls. */
export function PageHeader({
  title,
  headingLevel = 1,
  titleId,
  eyebrow,
  description,
  metadata,
  actions,
  filters,
  className = "",
  ...props
}: PageHeaderProps) {
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <header
      {...props}
      className={`min-w-0 space-y-6 [overflow-wrap:anywhere] ${className}`}
    >
      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          {eyebrow != null && (
            <div className="font-label text-caption font-semibold uppercase tracking-widest text-tertiary">
              {eyebrow}
            </div>
          )}
          <Heading
            id={titleId}
            className="font-headline text-headline font-semibold sm:text-display"
          >
            {title}
          </Heading>
          {description != null && (
            <div className="max-w-3xl leading-7 text-on-surface-variant">
              {description}
            </div>
          )}
          {metadata != null && (
            <div className="flex min-w-0 flex-wrap items-center gap-3 font-label text-label text-on-surface-variant">
              {metadata}
            </div>
          )}
        </div>
        {actions != null && (
          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3 lg:max-w-sm lg:justify-end">
            {actions}
          </div>
        )}
      </div>
      {filters != null && (
        <div className="flex min-w-0 flex-wrap items-end gap-4 [&>*]:min-w-0 [&>*]:max-w-full">
          {filters}
        </div>
      )}
    </header>
  );
}
