import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyClinics",
  description:
    "Gestión de clínicas, actividad e ingresos para profesionales dentales.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
