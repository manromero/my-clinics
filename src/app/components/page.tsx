import type { Metadata } from "next";
import { Catalogue } from "./catalogue";

export const metadata: Metadata = {
  title: "Catálogo de componentes | MyClinics",
  description: "Ejemplos y estados de los componentes de MyClinics.",
};

export default function ComponentsPage() {
  return <Catalogue />;
}
