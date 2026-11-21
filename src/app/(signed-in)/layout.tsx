import { monthlyPeriodFromQuery } from "@/lib/monthly-scope/monthly-scope";
import { requireSupabaseSession } from "@/lib/supabase/session";
import { SignedInHistoryGuard } from "./_components/signed-in-history-guard";
import { SignedInShell } from "./_components/signed-in-shell";

export default async function SignedInLayout({
  children,
}: Pick<LayoutProps<"/">, "children">) {
  const { user, context } = await requireSupabaseSession();
  const name = user.user_metadata?.full_name;
  const displayName =
    (typeof name === "string" && name.trim()) || user.email || "Usuario";

  return (
    <SignedInHistoryGuard
      key={context.generation}
      ownerId={user.id}
      context={context}
    >
      <SignedInShell
        displayName={displayName}
        email={user.email}
        defaultPeriod={monthlyPeriodFromQuery({})}
      >
        {children}
      </SignedInShell>
    </SignedInHistoryGuard>
  );
}
