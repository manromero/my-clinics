import { ClinicTemplateSpecimen } from "./clinic-template-specimen";

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="font-headline text-headline">
        Plantilla de clínica · Demostración local
      </h1>
      <p>
        Formulario real con datos sintéticos. No realiza escrituras ni subidas.
      </p>
      <ClinicTemplateSpecimen />
    </main>
  );
}
