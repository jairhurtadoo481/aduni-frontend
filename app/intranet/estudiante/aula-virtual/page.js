"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fechaCorta } from "../../../../lib/intranet";
import { useApiEst } from "../../../../components/intranet/PortalLayout";
import Icono from "../../../../components/intranet/Icono";
import { Titulo, Tarjeta, Cargando, Vacio, Etiqueta, AvisoError } from "../../../../components/intranet/ui";

const TIPO = { archivo: ["Archivo", "blue", "clip"], enlace: ["Enlace", "violet", "enviar"], video: ["Video", "red", "aulavirtual"], anuncio: ["Anuncio", "amber", "comunicados"] };

function Curso({ id, onVolver }) {
  const { data, cargando, error } = useApiEst(`/estudiante/aula-virtual/${id}`);
  if (cargando) return <Cargando />;
  if (error) return <AvisoError texto={error} />;
  const unidades = [...new Set(data.materiales.map((m) => m.unidad))];
  return (
    <>
      <button onClick={onVolver} className="text-sm text-aduni-700 hover:underline mb-3">← Todos los cursos</button>
      <div className="rounded-2xl p-6 text-white mb-6" style={{ background: data.curso.color }}>
        <h1 className="text-2xl font-bold">{data.curso.nombre}</h1>
        <p className="text-sm opacity-90">Docente: {data.curso.docente?.nombre || "Por asignar"}</p>
      </div>
      {data.materiales.length === 0 ? <Tarjeta><Vacio texto="El docente aún no publicó materiales" icono="aulavirtual" /></Tarjeta> : unidades.map((u) => (
        <Tarjeta key={u} titulo={u} className="mb-4">
          <ul className="divide-y divide-gray-100 -my-3">
            {data.materiales.filter((m) => m.unidad === u).map((m) => (
              <li key={m._id} className="py-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-aduni-100 text-aduni-700 flex items-center justify-center shrink-0"><Icono nombre={TIPO[m.tipo][2]} className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm">{m.titulo}</p>
                    <Etiqueta color={TIPO[m.tipo][1]}>{TIPO[m.tipo][0]}</Etiqueta>
                  </div>
                  {m.descripcion && <p className="text-sm text-gray-600 whitespace-pre-line mt-1">{m.descripcion}</p>}
                  {m.url && <a href={m.url} target="_blank" rel="noreferrer" className="text-sm text-aduni-700 underline break-all">{m.nombreArchivo || "Abrir"}</a>}
                  <p className="text-xs text-gray-400 mt-1">{fechaCorta(m.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Tarjeta>
      ))}
    </>
  );
}

function AulaVirtual() {
  const params = useSearchParams();
  const [curso, setCurso] = useState(params.get("curso"));
  const { data, cargando, error } = useApiEst("/estudiante/aula-virtual");
  if (curso) return <Curso id={curso} onVolver={() => setCurso(null)} />;
  return (
    <>
      <Titulo titulo="Aula virtual" subtitulo="Materiales, videos, enlaces y anuncios de cada curso" />
      <AvisoError texto={error} />
      {cargando ? <Cargando /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((c) => (
            <button key={c.id} onClick={() => setCurso(c.id)} className="text-left bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="h-20 p-4 text-white flex items-end" style={{ background: c.color }}><p className="font-bold text-lg leading-tight">{c.nombre}</p></div>
              <div className="p-4 text-sm">
                <p className="text-gray-600">{c.docente || "Docente por asignar"}</p>
                <p className="text-xs text-gray-400 mt-1">{c.materiales} recursos{c.ultimo && ` · último ${fechaCorta(c.ultimo)}`}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default function PaginaAulaVirtual() {
  return <Suspense fallback={<Cargando />}><AulaVirtual /></Suspense>;
}
