"use client";

import PortalLayout from "../../../components/intranet/PortalLayout";

const B = "/intranet/profesor";
const MENU = [
  { href: B, etiqueta: "Inicio", icono: "inicio" },
  { href: `${B}/horario`, etiqueta: "Mi horario", icono: "horario" },
  { href: `${B}/asistencia`, etiqueta: "Tomar asistencia", icono: "asistencia" },
  { href: `${B}/notas`, etiqueta: "Registro de notas", icono: "notas" },
  { href: `${B}/aula-virtual`, etiqueta: "Aula virtual", icono: "aulavirtual" },
  { href: `${B}/tareas`, etiqueta: "Tareas", icono: "tareas" },
  { href: `${B}/examenes`, etiqueta: "Exámenes en línea", icono: "examen" },
  { href: `${B}/conducta`, etiqueta: "Conducta", icono: "conducta" },
  { href: `${B}/alertas`, etiqueta: "Alertas tempranas", icono: "alerta" },
  { href: `${B}/mensajes`, etiqueta: "Mensajes", icono: "mensajes" },
  { href: `${B}/comunicados`, etiqueta: "Comunicados y agenda", icono: "comunicados" },
  { href: `${B}/ayuda`, etiqueta: "Ayuda y soporte", icono: "soporte" },
  { href: `${B}/perfil`, etiqueta: "Mi perfil", icono: "perfil" },
];

export default function LayoutDocente({ children }) {
  return (
    <PortalLayout rol="profesor" titulo="Portal docente" etiquetaUsuario="Código docente, DNI o correo" menu={MENU}>
      {children}
    </PortalLayout>
  );
}
