"use client";

import Link from "next/link";
import PortalLayout from "../../../components/intranet/PortalLayout";

const B = "/intranet/estudiante";
const MENU = [
  { href: B, etiqueta: "Inicio", icono: "inicio" },
  { href: `${B}/horario`, etiqueta: "Mi horario", icono: "horario" },
  { href: `${B}/aula-virtual`, etiqueta: "Aula virtual", icono: "aulavirtual" },
  { href: `${B}/tareas`, etiqueta: "Tareas", icono: "tareas" },
  { href: `${B}/examenes`, etiqueta: "Exámenes en línea", icono: "examen" },
  { href: `${B}/notas`, etiqueta: "Notas y libreta", icono: "notas" },
  { href: `${B}/asistencia`, etiqueta: "Asistencia", icono: "asistencia" },
  { href: `${B}/conducta`, etiqueta: "Conducta", icono: "conducta" },
  { href: `${B}/pagos`, etiqueta: "Estado de cuenta", icono: "pagos" },
  { href: `${B}/carnet`, etiqueta: "Carné digital", icono: "carnet" },
  { href: `${B}/mensajes`, etiqueta: "Mensajes", icono: "mensajes" },
  { href: `${B}/comunicados`, etiqueta: "Comunicados y agenda", icono: "comunicados" },
  { href: `${B}/ayuda`, etiqueta: "Ayuda y soporte", icono: "soporte" },
  { href: `${B}/perfil`, etiqueta: "Mi perfil", icono: "perfil" },
];

export default function LayoutEstudiante({ children }) {
  return (
    <PortalLayout rol="estudiante" titulo="Portal del estudiante" etiquetaUsuario="Código de estudiante o DNI" menu={MENU}
      pieLogin={<p>¿Eres padre o madre de familia? <Link href="/intranet/familia" className="text-aduni-700 hover:underline">Ingresa al portal de familias</Link></p>}>
      {children}
    </PortalLayout>
  );
}
