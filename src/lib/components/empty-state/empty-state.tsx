import { useId, type ReactNode } from "react";
import { ActionLink, type ActionLinkProps } from "../action-link/action-link";
import { Button, type ButtonProps } from "../button/button";
import { Surface } from "../surface/surface";

export type EmptyStateAction =
  | {
      label: string;
      onClick: NonNullable<ButtonProps["onClick"]>;
      href?: never;
    }
  | { label: string; href: ActionLinkProps["href"]; onClick?: never };

export type EmptyStateProps = {
  title: string;
  explanation: string;
  icon?: ReactNode;
  action?: EmptyStateAction;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
};

/** An empty result with an optional next step, separate from errors and loading. */
export function EmptyState({
  title,
  explanation,
  icon,
  action,
  headingLevel = 2,
  className = "",
}: EmptyStateProps) {
  const id = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <Surface
      as="section"
      variant="tonal"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-explanation`}
      className={className}
    >
      <div className="flex flex-col items-center gap-4 py-4 text-center sm:py-6">
        {icon != null && (
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant [&>svg]:size-6"
          >
            {icon}
          </span>
        )}
        <Heading id={`${id}-title`} className="font-headline text-title">
          {title}
        </Heading>
        <p
          id={`${id}-explanation`}
          className="max-w-prose text-body text-on-surface-variant"
        >
          {explanation}
        </p>
        {action && (
          <div className="mt-2 max-w-full">
            {action.href !== undefined ? (
              <ActionLink href={action.href} variant="secondary">
                {action.label}
              </ActionLink>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            )}
          </div>
        )}
      </div>
    </Surface>
  );
}
