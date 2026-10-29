import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { foundationExamples } from "./foundations";

export const metadata: Metadata = {
  title: "Fundamentos visuales | MyClinics",
  description: "Color, tipografía y espaciado que darán coherencia al sistema.",
};

export default function Page() {
  return (
    <Catalogue
      title="Fundamentos visuales"
      description="Color, tipografía y espaciado que darán coherencia al sistema."
      sections={[
        {
          id: "fundamentos",
          title: "Fundamentos visuales",
          description:
            "Explora los fundamentos del sistema visual de MyClinics.",
          examples: foundationExamples,
        },
      ]}
    />
  );
}
