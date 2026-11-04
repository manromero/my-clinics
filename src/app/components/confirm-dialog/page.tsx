import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { ConfirmDialogSpecimen } from "./confirm-dialog-specimen";

export const metadata: Metadata = {
  title: "ConfirmDialog · Confirmaciones | MyClinics",
  description:
    "Confirmaciones accesibles con acciones destructivas y reintento.",
};
export default function Page() {
  return (
    <Catalogue
      title="ConfirmDialog · Confirmaciones"
      description="Una pausa para decidir. Foco inicial en Cancelar, confirmación explícita y protección mientras la operación está en curso."
      sections={[
        {
          id: "confirmaciones",
          title: "Confirmar con contexto",
          description:
            "Prueba Cancelar, Escape y el cierre exterior. Durante la espera se bloquean las acciones y el cierre; los fallos conservan el diálogo y permiten reintentar.",
          examples: [
            {
              id: "normal",
              title: "Confirmación estándar",
              content: <ConfirmDialogSpecimen />,
            },
            {
              id: "destructiva",
              title: "Eliminación de un registro sintético",
              content: <ConfirmDialogSpecimen destructive />,
            },
          ],
        },
        {
          id: "contrato",
          title: "Contrato de composición",
          description:
            "El consumidor controla open y onOpenChange, cierra tras el éxito y aporta error. onConfirm puede devolver una promesa: ConfirmDialog bloquea confirmaciones simultáneas hasta que termina, incluso si se rechaza.",
          examples: [
            {
              id: "api",
              title: "Variantes y estados",
              content: (
                <p className="text-sm leading-7 text-on-surface-variant">
                  title y description identifican la decisión; children contiene
                  detalles del consumidor. destructive cambia el énfasis de la
                  acción. pending permite controlar una espera externa.
                  confirmLabel, cancelLabel y pendingLabel personalizan los
                  textos. Una promesa rechazada no cierra el diálogo ni genera
                  mensajes propios: el consumidor aporta la explicación mediante
                  error.
                </p>
              ),
            },
          ],
        },
      ]}
    />
  );
}
