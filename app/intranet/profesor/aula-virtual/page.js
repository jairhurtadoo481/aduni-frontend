"use client";

import { useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { useApi, fechaCorta } from "../../../../lib/intranet";
import SubirArchivo from "../../../../components/intranet/SubirArchivo";
import { Titulo, Tarjeta, Cargando, Vacio, Etiqueta, Campo, inputClase, botonClase, AvisoError, Pestanas } from "../../../../components/intranet/ui";

const TIPOS = [["anuncio", "Anuncio"], ["archivo", "Archivo"], ["enlace", "Enlace"], ["video", "Video"]];
const COLOR = { archivo: "blue", enlace: "violet", video: "red", anuncio: "amber" };

export default function AulaVirtualDocente() {
  const cursos = useApi("/docente/cursos");
  const [curso, setCurso] = useState("");
  const sel = curso || cursos.data?.[0]?.id || "";
  const mats = useApi(sel ? `/docente/cursos/${sel}/materiales` : null);
  const [form, setForm] = useState({ tipo: "anuncio", unidad: "Unidad 4", titulo: "", descripcion: "", url: "", nombreArchivo: "" });
  const [error, setError] = useState("");

  const publicar = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiIntranet(`/docente/cursos/${sel}/materiales`, { method: "POST", body: form });
      setForm({ ...form, titulo: "", descripcion: "", url: "", nombreArchivo: "" });
      mats.recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (m) => {
    if (!confirm(`¿Eliminar "${m.titulo}"?`)) return;
    await apiIntranet(`/docente/materiales/${m._id}`, { method: "DELETE" });
    mats.recargar();
  };

  return (
    <>
      <Titulo titulo="Aula virtual" subtitulo="Comparte materiales, enlaces, videos y anuncios con tus estudiantes (reciben aviso al instante)" />
      <div className="mb-4">
        <select className={`${inputClase} w-auto`} value={sel} onChange={(e) => setCurso(e.target.value)}>
          {cursos.data?.map((c) => <option key={c.id} value={c.id}>{c.nombre} — {c.aula.nombre}</option>)}
        </select>
      </div>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Tarjeta titulo="Publicar">
          <form onSubmit={publicar} className="grid gap-3">
            <Pestanas valor={form.tipo} onChange={(t) => setForm({ ...form, tipo: t, url: "", nombreArchivo: "" })} opciones={TIPOS} />
            <Campo etiqueta="Unidad / semana"><input className={inputClase} value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} /></Campo>
            <Campo etiqueta="Título"><input className={inputClase} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></Campo>
            <Campo etiqueta="Descripción"><textarea rows={3} className={inputClase} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></Campo>
            {form.tipo === "archivo" && (form.url
              ? <p className="text-sm">Archivo: {form.nombreArchivo} <button type="button" className="text-xs text-red-600" onClick={() => setForm({ ...form, url: "", nombreArchivo: "" })}>quitar</button></p>
              : <SubirArchivo carpeta="materiales" texto="Subir archivo (PDF, Word, PPT, imagen)" onSubido={(r) => setForm((f) => ({ ...f, url: r.url, nombreArchivo: r.nombre }))} />)}
            {(form.tipo === "enlace" || form.tipo === "video") && (
              <Campo etiqueta={form.tipo === "video" ? "Enlace del video (YouTube, Drive...)" : "Enlace"}><input type="url" className={inputClase} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required placeholder="https://" /></Campo>
            )}
            <AvisoError texto={error} />
            <button className={`${botonClase} w-fit`}>Publicar</button>
          </form>
        </Tarjeta>
        <Tarjeta titulo="Publicado en este curso">
          {mats.cargando ? <Cargando /> : !mats.data?.materiales.length ? <Vacio texto="Aún no hay materiales" icono="aulavirtual" /> : (
            <ul className="divide-y divide-gray-100 -my-3">
              {mats.data.materiales.map((m) => (
                <li key={m._id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><Etiqueta color={COLOR[m.tipo]}>{m.tipo}</Etiqueta><span className="text-xs text-gray-400">{m.unidad} · {fechaCorta(m.createdAt)}</span></div>
                    <p className="font-semibold text-sm mt-1">{m.titulo}</p>
                    {m.descripcion && <p className="text-sm text-gray-600 line-clamp-2">{m.descripcion}</p>}
                    {m.url && <a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-aduni-700 underline break-all">{m.nombreArchivo || m.url}</a>}
                  </div>
                  <button onClick={() => eliminar(m)} className="text-xs text-red-600 hover:underline shrink-0">Eliminar</button>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </>
  );
}
