import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { UserIdentitySpecimen } from "./user-identity-specimen";

export const metadata: Metadata = {
  title: "UserIdentity · Identidad personal | MyClinics",
  description:
    "Nombre, correo, avatar y zona horaria en formato completo o compacto.",
};

export default function Page() {
  return (
    <Catalogue
      title="UserIdentity · Identidad personal"
      description="Datos de identidad recibidos por propiedades, con presentación completa o compacta y alternativas sin imagen."
      sections={[
        {
          id: "identidad",
          title: "Identidad personal",
          description:
            "Avatar circular azul, texto discreto y metadatos tonales inspirados en las cabeceras S02–S04 de Alexandria.",
          examples: [
            {
              id: "user-identity",
              title: "UserIdentity",
              content: <UserIdentitySpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
