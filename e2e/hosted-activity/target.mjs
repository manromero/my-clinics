export const approvedTarget = "https://lvqbrjybwstvdhaxyxyn.supabase.co";

export function assertApprovedTarget(url) {
  if (url !== approvedTarget) {
    throw new Error(
      "Hosted Activity acceptance requires the exact approved synthetic Supabase URL.",
    );
  }
}
