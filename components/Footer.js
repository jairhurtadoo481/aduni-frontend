import Link from "next/link";
import Image from "next/image";
import { NEGOCIO } from "../lib/negocio";

const COLEGIO = [
  ["/nosotros", "Nosotros"],
  ["/noticias", "Noticias"],
  ["/becas", "Becas"],
  ["/admision", "Admisión 2027"],
  ["/contacto", "Contacto"],
];
const INTRANET = [
  ["/intranet/estudiante", "Intranet Estudiante"],
  ["/intranet/profesor", "Intranet Docentes"],
  ["/intranet/familia", "Portal de familias"],
];
const LEGAL = [
  ["/libro-de-reclamaciones", "Libro de Reclamaciones"],
  ["/privacidad", "Política de privacidad"],
  ["/terminos", "Términos y condiciones"],
];

function Columna({ titulo, enlaces }) {
  return (
    <div className="text-sm">
      <h3 className="font-bold text-white mb-4 tracking-wide">{titulo}</h3>
      <ul className="space-y-2.5 text-blue-100/80">
        {enlaces.map(([href, texto]) => (
          <li key={href}><Link href={href} className="hover:text-oro transition">{texto}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative bg-aduni-900 text-white mt-16 overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-aduni-600/30 blur-3xl" />
      <div className="h-1 bg-gradient-to-r from-aduni-600 via-oro to-aduni-600" />
      <div className="relative max-w-7xl mx-auto px-4 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="bg-white rounded-xl inline-block px-3 py-2 mb-5">
            <Image src="/logo-aduni.png" alt="ADUNI" width={150} height={42} />
          </div>
          <p className="text-sm text-blue-100/80 max-w-xs leading-relaxed">Colegio privado de primaria y secundaria. Del colegio a la universidad.</p>
          <div className="mt-5 text-sm text-blue-100/80 space-y-1.5">
            <p>{NEGOCIO.direccion}</p>
            <p>Tel: {NEGOCIO.telefonoPrincipal.texto}</p>
            <p>{NEGOCIO.email}</p>
            {NEGOCIO.horario.map((h) => <p key={h}>{h}</p>)}
          </div>
        </div>
        <Columna titulo="El colegio" enlaces={COLEGIO} />
        <Columna titulo="Intranet" enlaces={INTRANET} />
        <Columna titulo="Legal" enlaces={LEGAL} />
      </div>
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-blue-200/70">
          <p>© {new Date().getFullYear()} {NEGOCIO.nombreComercial} · {NEGOCIO.titular} · RUC {NEGOCIO.ruc}</p>
          <div className="flex gap-4">
            <Link href="/intranet/administrativo" className="hover:text-white">Administrativo</Link>
            <Link href="/intranet/soporte" className="hover:text-white">Soporte técnico</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
