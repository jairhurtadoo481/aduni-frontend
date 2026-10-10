import Link from "next/link";

export const metadata = { title: "Intranet | Colegio ADUNI+" };

const PORTALES = [
  { href: "/intranet/estudiante", titulo: "Estudiantes", detalle: "Aula virtual, tareas, exámenes, notas y carné digital." },
  { href: "/intranet/profesor", titulo: "Docentes", detalle: "Registro de notas, asistencia, aula virtual y exámenes." },
  { href: "/intranet/familia", titulo: "Familias", detalle: "Ingreso al colegio, notas, conducta y pagos de tus hijos." },
];

export default function Intranet() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <h1 className="text-3xl md:text-4xl font-extrabold text-aduni-900 text-center">Intranet</h1>
      <p className="text-gray-600 text-center mt-2 mb-10">Elige tu portal para ingresar.</p>
      <div className="grid gap-5 md:grid-cols-3">
        {PORTALES.map((p) => (
          <Link key={p.href} href={p.href} className="rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-aduni-600 transition text-center">
            <h2 className="text-xl font-bold text-aduni-700">{p.titulo}</h2>
            <p className="text-sm text-gray-600 mt-1">{p.detalle}</p>
          </Link>
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mt-8">¿Problemas para ingresar? <Link href="/intranet/recuperar" className="text-aduni-700 hover:underline">Recupera tu contraseña</Link> o acércate a secretaría.</p>
    </div>
  );
}
