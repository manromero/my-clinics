import { requireSupabaseSession } from "@/lib/supabase/session";
import { SignedInHistoryGuard } from "./_components/signed-in-history-guard";
import { SignedInShell } from "./_components/signed-in-shell";

export default async function SignedInLayout({
  children,
}: Pick<LayoutProps<"/">, "children">) {
  const { user } = await requireSupabaseSession();
  const name = user.user_metadata?.full_name;
  const displayName =
    (typeof name === "string" && name.trim()) || user.email || "Usuario";

  return (
    <SignedInHistoryGuard key={user.id} ownerId={user.id}>
      <SignedInShell displayName={displayName} email={user.email}>
        {children}
      </SignedInShell>
    </SignedInHistoryGuard>
  );
}
