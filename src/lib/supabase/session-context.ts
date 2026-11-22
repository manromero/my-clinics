export const sessionMarkerName = "myclinics-session";

// Presentation metadata only. It contains neither credentials nor user details.
export type SessionContext = {
  generation: string;
  expiresAt: number;
  verifiedAt: number;
};

export function sessionMarker(context: SessionContext) {
  return `${context.generation}.${context.expiresAt}.${context.verifiedAt}`;
}

export function parseSessionMarker(
  value: string | undefined,
): SessionContext | null {
  const match = value?.match(/^([a-f0-9]{64})\.(\d+)\.(\d+)$/);
  if (!match) return null;
  const expiresAt = Number(match[2]);
  const verifiedAt = Number(match[3]);
  return Number.isSafeInteger(expiresAt) &&
    expiresAt > 0 &&
    Number.isSafeInteger(verifiedAt) &&
    verifiedAt > 0
    ? { generation: match[1], expiresAt, verifiedAt }
    : null;
}

export function sameSession(
  a: SessionContext,
  b: SessionContext | null,
  now = Date.now(),
) {
  return Boolean(
    b &&
    a.generation === b.generation &&
    a.expiresAt * 1000 > now &&
    b.expiresAt * 1000 > now,
  );
}
