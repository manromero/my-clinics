import type { Metadata } from "next";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { GoogleSignIn } from "./google-sign-in";

export const metadata: Metadata = { title: "Acceder | MyClinics" };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader variant="public" />
      <GoogleSignIn />
      <AppFooter identity="MyClinics" />
    </div>
  );
}
