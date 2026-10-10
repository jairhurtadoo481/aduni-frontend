"use client";

import PortalLayout from "../../../components/intranet/PortalLayout";

const B = "/intranet/administrativo";
// `areas`: quién ve cada sección (Dirección siempre ve todo). Sin `areas` = todo el personal.
const MENU = [
  { href: B, etiqueta: "Panel general", icono: "inicio" },
  { href: `${B}/asistencia`, etiqueta: "Asistencia", icono: "asistencia", areas: ["auxiliar", "coordinacion"] },
  { href: `${B}/ingreso-personal`, etiqueta: "Ingreso del personal (QR)", icono: "qr", areas: ["auxiliar", "secretaria"] },
  { href: `${B}/estudiantes`, etiqueta: "Estudiantes", icono: "usuarios", areas: ["secretaria", "coordinacion", "auxiliar", "tesoreria"] },
  { href: `${B}/personal`, etiqueta: "Docentes, personal y familias", icono: "familia", areas: ["secretaria", "coordinacion"] },
  { href: `${B}/admision`, etiqueta: "Admisión", icono: "admision", areas: ["secretaria"] },
  { href: `${B}/aulas`, etiqueta: "Aulas y cursos", icono: "aulas", areas: ["secretaria", "coordinacion"] },
  { href: `${B}/horarios`, etiqueta: "Horarios", icono: "horario", areas: ["secretaria", "coordinacion"] },
  { href: `${B}/justificaciones`, etiqueta: "Justificaciones", icono: "justificacion", areas: ["auxiliar", "coordinacion"] },
  { href: `${B}/conducta`, etiqueta: "Conducta", icono: "conducta", areas: ["auxiliar", "coordinacion"] },
  { href: `${B}/pensiones`, etiqueta: "Pensiones", icono: "pagos", areas: ["tesoreria"] },
  { href: `${B}/caja`, etiqueta: "Caja", icono: "caja", areas: ["tesoreria"] },
  { href: `${B}/facturacion`, etiqueta: "Facturación SUNAT", icono: "dinero", areas: ["tesoreria"] },
  { href: `${B}/reportes`, etiqueta: "Reportes y alertas", icono: "grafico", areas: ["coordinacion", "tesoreria"] },
  { href: `${B}/mensajes`, etiqueta: "Mensajes", icono: "mensajes" },
  { href: `${B}/comunicados`, etiqueta: "Comunicados y agenda", icono: "comunicados", areas: ["secretaria", "coordinacion"] },
  { href: `${B}/noticias`, etiqueta: "Noticias web", icono: "noticias", areas: ["secretaria"] },
  { href: `${B}/auditoria`, etiqueta: "Bitácora y seguridad", icono: "bitacora", areas: ["direccion"] },
  { href: `${B}/configuracion`, etiqueta: "Año académico y respaldo", icono: "config", areas: ["direccion"] },
  { href: `${B}/ayuda`, etiqueta: "Ayuda y soporte", icono: "soporte" },
  { href: `${B}/perfil`, etiqueta: "Mi perfil", icono: "perfil" },
];

export default function LayoutAdministrativo({ children }) {
  return (
    <PortalLayout rol="administrativo" titulo="Portal administrativo" etiquetaUsuario="Código, DNI o correo" menu={MENU}>
      {children}
    </PortalLayout>
  );
}
