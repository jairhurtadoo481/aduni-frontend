import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerNoticia, fechaNoticia } from "../../../lib/noticias";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const n = await obtenerNoticia(slug);
  return { title: n ? `${n.titulo} | Colegio ADUNI+` : "Noticia | Colegio ADUNI+", description: n?.resumen };
}

export default async function Noticia({ params }) {
  const { slug } = await params;
  const n = await obtenerNoticia(slug);
  if (!n) notFound();
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/noticias" className="text-sm text-aduni-700 hover:underline">← Todas las noticias</Link>
      <p className="text-sm text-gray-500 mt-4">{fechaNoticia(n.fecha)}</p>
      <h1 className="text-3xl md:text-4xl font-extrabold text-aduni-900 mt-1 mb-4">{n.titulo}</h1>
      {n.imagen && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={n.imagen} alt="" className="w-full rounded-2xl mb-6" />
      )}
      {n.resumen && <p className="text-lg text-gray-700 mb-4">{n.resumen}</p>}
      <div className="text-gray-800 whitespace-pre-line leading-relaxed">{n.contenido}</div>
    </article>
  );
}
