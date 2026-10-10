"use client";

import PortalLayout from "../../../components/intranet/PortalLayout";

const B = "/intranet/familia";
const MENU = [
  { href: B, etiqueta: "Inicio", icono: "inicio" },
  { href: `${B}/asistencia`, etiqueta: "Asistencia", icono: "asistencia" },
  { href: `${B}/notas`, etiqueta: "Notas y libreta", icono: "notas" },
  { href: `${B}/tareas`, etiqueta: "Tareas", icono: "tareas" },
  { href: `${B}/examenes`, etiqueta: "Exámenes", icono: "examen" },
  { href: `${B}/conducta`, etiqueta: "Conducta", icono: "conducta" },
  { href: `${B}/pagos`, etiqueta: "Pagos", icono: "pagos" },
  { href: `${B}/horario`, etiqueta: "Horario", icono: "horario" },
  { href: `${B}/aula-virtual`, etiqueta: "Aula virtual", icono: "aulavirtual" },
  { href: `${B}/carnet`, etiqueta: "Carné", icono: "carnet" },
  { href: `${B}/mensajes`, etiqueta: "Mensajes", icono: "mensajes" },
  { href: `${B}/comunicados`, etiqueta: "Comunicados y agenda", icono: "comunicados" },
  { href: `${B}/ayuda`, etiqueta: "Ayuda y soporte", icono: "soporte" },
  { href: `${B}/perfil`, etiqueta: "Mi perfil", icono: "perfil" },
];

export default function LayoutFamilia({ children }) {
  return (
    <PortalLayout rol="apoderado" titulo="Portal de familias" etiquetaUsuario="DNI del padre, madre o apoderado" menu={MENU}>
      {children}
    </PortalLayout>
  );
}
