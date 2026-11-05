import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { UserMenuSpecimen } from "./user-menu-specimen";

export const metadata: Metadata = {
  title: "UserMenu · Cuenta | MyClinics",
  description:
    "Acciones de cuenta, teclado, espera y reintento sin integración de sesión.",
};

export default function Page() {
  return (
    <Catalogue
      title="UserMenu · Cuenta"
      description="Identidad personal y acciones de cuenta disponibles en escritorio y móvil, con cierre de sesión controlado por quien lo utiliza."
      sections={[
        {
          id: "cuenta",
          title: "Cuenta completa",
          description:
            "Identidad azul y superficies tonales de S02–S04. El panel flotante aplica la transparencia y el desenfoque de Alexandria.",
          examples: [
            {
              id: "full",
              title: "Identidad, enlace y cierre de sesión",
              content: <UserMenuSpecimen />,
            },
          ],
        },
        {
          id: "compacto",
          title: "Cuenta compacta",
          description:
            "Avatar compacto; al abrir, el nombre y el correo están visibles. El cierre de sesión sigue disponible en pantallas estrechas y sin enlace opcional.",
          examples: [
            {
              id: "compact",
              title: "Solo cierre de sesión",
              content: <UserMenuSpecimen compact />,
            },
          ],
        },
        {
          id: "api",
          title: "API y teclado",
          description:
            "Divulgación accesible con controles nativos; no utiliza el rol menu ni navegación por flechas.",
          examples: [
            {
              id: "contract",
              title: "Contrato público",
              content: (
                <div className="space-y-4 text-sm leading-7 text-on-surface-variant">
                  <p>
                    <code>identity</code> recibe las propiedades de UserIdentity
                    sin variant. <code>variant</code> es full (predeterminado) o
                    compact. <code>accountLink</code> es opcional y recibe href
                    y label.
                  </p>
                  <p>
                    <code>onSignOut</code> solicita la acción. El consumidor
                    establece <code>signOutPending</code> inmediatamente para
                    impedir duplicados y proporciona <code>signOutError</code>{" "}
                    si falla. La acción conserva el foco durante la espera,
                    anuncia el estado y permite reintentar. El componente no
                    espera promesas, navega tras el éxito ni gestiona sesiones.
                  </p>
                  <p>
                    Enter o Espacio abre y cierra el panel desde su botón. El
                    foco permanece en el botón al abrir; Tab y Mayús+Tab
                    recorren Cerrar menú, el enlace opcional y Cerrar sesión en
                    orden nativo. Escape o Cerrar menú cierran y devuelven el
                    foco al botón. Al salir con Tab o pulsar fuera, se cierra
                    sin atrapar el foco. Las flechas mantienen su comportamiento
                    nativo.
                  </p>
                  <p>
                    Ambas variantes ocupan el ancho disponible hasta 24 rem; el
                    panel se alinea con ese contenedor y se desplaza si supera
                    el 65 % de la altura de la ventana. La composición debe
                    permitir que el panel flote sin recortarlo.
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
