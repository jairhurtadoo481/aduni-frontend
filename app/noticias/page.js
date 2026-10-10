import Link from "next/link";
import { obtenerNoticias, fechaNoticia } from "../../lib/noticias";

export const metadata = { title: "Noticias | Colegio ADUNI+" };

export default async function Noticias() {
  const noticias = await obtenerNoticias(50);
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-aduni-900 mb-8">Noticias</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {noticias.map((n) => (
          <Link key={n.slug} href={`/noticias/${n.slug}`} className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition bg-white">
            {n.imagen
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={n.imagen} alt="" className="w-full h-44 object-cover" />
              : <div className="h-44 bg-gradient-to-br from-aduni-900 to-aduni-600" />}
            <div className="p-5">
              <p className="text-xs text-gray-500 mb-1">{fechaNoticia(n.fecha)}</p>
              <h2 className="text-lg font-bold text-aduni-700 mb-2">{n.titulo}</h2>
              <p className="text-sm text-gray-700">{n.resumen}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
