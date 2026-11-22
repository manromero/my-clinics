import { LoadingState } from "@/lib/components/loading-state/loading-state";

export function DestinationLoading({
  label = "Cargando página…",
}: {
  label?: string;
}) {
  return (
    <LoadingState
      label={label}
      variant="region"
      indicator="skeleton"
      className="min-h-96 justify-center"
    />
  );
}
