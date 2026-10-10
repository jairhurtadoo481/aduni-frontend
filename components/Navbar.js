"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", texto: "Inicio" },
  { href: "/nosotros", texto: "Nosotros" },
  { href: "/noticias", texto: "Noticias" },
  { href: "/becas", texto: "Becas" },
  { href: "/admision", texto: "Admisión" },
  { href: "/contacto", texto: "Contacto" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [desplazado, setDesplazado] = useState(false);

  useEffect(() => {
    const revisar = () => setDesplazado(window.scrollY > 40);
    revisar();
    window.addEventListener("scroll", revisar, { passive: true });
    return () => window.removeEventListener("scroll", revisar);
  }, []);

  // En el inicio la barra flota transparente sobre la foto; al bajar (o en otras páginas) se vuelve sólida.
  const transparente = pathname === "/" && !desplazado && !abierto;
  const activo = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${transparente
        ? "bg-transparent border-b border-white/10"
        : "bg-white/90 backdrop-blur-md border-b border-gray-200/70 shadow-[0_8px_30px_rgba(18,48,107,0.08)]"}`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-4">
        <Link href="/" onClick={() => setAbierto(false)} className={`rounded-xl transition ${transparente ? "bg-white/95 px-2.5 py-1 shadow-lg shadow-black/10" : ""}`}>
          <Image src="/logo-aduni.png" alt="ADUNI Primaria - Secundaria" width={150} height={42} priority />
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative px-3 py-2 rounded-full transition ${transparente
                ? "text-white/90 hover:text-white hover:bg-white/10"
                : `hover:text-aduni-700 hover:bg-aduni-100/70 ${activo(l.href) ? "text-aduni-700" : "text-gray-700"}`}`}
            >
              {l.texto}
              {activo(l.href) && <span className={`absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full ${transparente ? "bg-oro" : "bg-aduni-700"}`} />}
            </Link>
          ))}
          <span className={`w-px h-6 mx-2 ${transparente ? "bg-white/25" : "bg-gray-200"}`} />
          <Link
            href="/intranet/estudiante"
            className={`px-4 py-2 rounded-full transition ${transparente
              ? "bg-white/10 text-white ring-1 ring-white/40 backdrop-blur hover:bg-white hover:text-aduni-900"
              : "bg-aduni-700 text-white hover:bg-aduni-900"}`}
          >
            Intranet Estudiante
          </Link>
          <Link href="/intranet/profesor" className="ml-2 bg-oro text-aduni-900 px-4 py-2 rounded-full hover:brightness-105 hover:shadow-lg hover:shadow-oro/30 transition">
            Intranet Docentes
          </Link>
        </nav>

        <button
          onClick={() => setAbierto(!abierto)}
          className={`lg:hidden flex flex-col gap-1.5 p-2 rounded-lg ${transparente ? "bg-white/10 backdrop-blur" : ""}`}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={abierto}
        >
          <span className={`w-6 h-0.5 transition ${transparente ? "bg-white" : "bg-aduni-900"} ${abierto ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`w-6 h-0.5 transition ${transparente ? "bg-white" : "bg-aduni-900"} ${abierto ? "opacity-0" : ""}`} />
          <span className={`w-6 h-0.5 transition ${transparente ? "bg-white" : "bg-aduni-900"} ${abierto ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {abierto && (
        <nav className="lg:hidden border-t border-gray-200 px-4 py-4 flex flex-col gap-1 text-sm font-semibold bg-white">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setAbierto(false)}
              className={`px-3 py-2.5 rounded-lg ${activo(l.href) ? "bg-aduni-100 text-aduni-700" : "text-gray-700"}`}>
              {l.texto}
            </Link>
          ))}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Link href="/intranet/estudiante" onClick={() => setAbierto(false)} className="bg-aduni-700 text-white text-center px-4 py-2.5 rounded-full">
              Intranet Estudiante
            </Link>
            <Link href="/intranet/profesor" onClick={() => setAbierto(false)} className="bg-oro text-aduni-900 text-center px-4 py-2.5 rounded-full">
              Intranet Docentes
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
