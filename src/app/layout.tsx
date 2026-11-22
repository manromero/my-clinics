import type { Metadata } from "next";
import { Inter, Noto_Serif, Public_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const noto = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
});
const labels = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MyClinics",
  description:
    "Gestión de clínicas, actividad e ingresos para profesionales dentales.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${noto.variable} ${labels.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
