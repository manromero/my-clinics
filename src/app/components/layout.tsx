import { notFound } from "next/navigation";

export default function CatalogueLayout({
  children,
}: LayoutProps<"/components">) {
  if (process.env.NODE_ENV !== "development") notFound();

  return children;
}
