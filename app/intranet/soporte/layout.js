"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PortalLayout from "../../../components/intranet/PortalLayout";
import Icono from "../../../components/intranet/Icono";
import { useApi } from "../../../lib/intranet";

const B = "/intranet/soporte";
const MENU = [
  { href: B, etiqueta: "Estado del sistema", icono: "servidor" },
  { href: `${B}/tickets`, etiqueta: "Mesa de ayuda", icono: "soporte" },
  { href: `${B}/cuentas`, etiqueta: "Cuentas y accesos", icono: "candado" },
  { href: `${B}/usuarios`, etiqueta: "Usuarios", icono: "usuarios" },
  { href: `${B}/bitacora`, etiqueta: "Bitácora (auditoría)", icono: "bitacora" },
  { href: `${B}/errores`, etiqueta: "Errores del sistema", icono: "error" },
  { href: `${B}/mantenimiento`, etiqueta: "Mantenimiento y respaldo", icono: "herramienta" },
  { href: `${B}/perfil`, etiqueta: "Mi perfil", icono: "perfil" },
];

// La cuenta de soporte tiene acceso a todo: sin verificación en dos pasos no puede usar nada más que su perfil.
function Exigir2FA({ children }) {
  const pathname = usePathname();
  const { data } = useApi(`/yo?v=${encodeURIComponent(pathname)}`);
  if (!data) return null;
  if (!data.totpActivo && pathname !== `${B}/perfil`) {
    return (
      <div className="max-w-xl mx-auto mt-10 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
        <Icono nombre="candado" className="w-8 h-8 mb-2" />
        <h2 className="text-lg font-bold">Activa la verificación en dos pasos</h2>
        <p className="text-sm mt-1">La cuenta de soporte técnico puede ver y gestionar todo el sistema. Por seguridad, antes de usarla debes activar la verificación en dos pasos con una app autenticadora en tu celular.</p>
        <Link href={`${B}/perfil`} className="inline-block mt-4 bg-aduni-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-aduni-900">Ir a Mi perfil</Link>
      </div>
    );
  }
  return children;
}

export default function LayoutSoporte({ children }) {
  return (
    <PortalLayout rol="soporte" titulo="Soporte técnico" etiquetaUsuario="Código de soporte o correo" menu={MENU}>
      <Exigir2FA>{children}</Exigir2FA>
    </PortalLayout>
  );
}
