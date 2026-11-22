import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { FormPanelSpecimen } from "./form-panel-specimen";

export const metadata: Metadata = {
  title: "FormPanel · Formularios | MyClinics",
};
export default function Page() {
  return (
    <Catalogue
      title="FormPanel · Formularios"
      description="Una presentación común para editar, guardar y cancelar, con valores disponibles para reintentar."
      sections={[
        {
          id: "panel",
          title: "Panel en página",
          description:
            "Prueba la validación, el fallo y el reintento. Desmarca la simulación de fallo para guardar correctamente.",
          examples: [
            {
              id: "inline",
              title: "Edición en contexto",
              content: <FormPanelSpecimen />,
            },
          ],
        },
        {
          id: "modal",
          title: "Formulario modal",
          description:
            "Foco inicial en el campo, Escape para cancelar y retorno al botón de apertura. Durante el guardado se bloquean los campos, las acciones y el cierre.",
          examples: [
            {
              id: "dialog",
              title: "Edición en diálogo",
              content: <FormPanelSpecimen modal />,
            },
          ],
        },
        {
          id: "api",
          title: "API and composition",
          description:
            "FormPanel owns the form element: pass fields as children, never another form. Values, field validation and persistence stay with the caller.",
          examples: [
            {
              id: "contract",
              title: "Public contract",
              content: (
                <div className="space-y-3 text-sm leading-7">
                  <p>
                    title, optional description, children, onSubmit and onCancel
                    are shared by both presentations. Native validation is
                    enabled unless noValidate is set. onSubmit receives the
                    prevented native form event.
                  </p>
                  <p>
                    presentation defaults to panel. Modal requires open and
                    accepts initialFocusRef, forwarding focus management to
                    Dialog. Cancel, Escape, backdrop and close request onCancel;
                    the caller controls open.
                  </p>
                  <p>
                    pending blocks submit, field editing and cancellation. error
                    displays an announced save failure without resetting values.
                    saveLabel, cancelLabel and pendingLabel customize Spanish
                    defaults. The caller handles success, closing and any
                    resets.
                  </p>
                </div>
              ),
            },
          ],
        },
      ]}
    />
  );
}
