"use client";

import { useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { useApi, fechaCorta, hoyLima } from "../../../../lib/intranet";
import SubirArchivo from "../../../../components/intranet/SubirArchivo";
import Icono from "../../../../components/intranet/Icono";
import { Titulo, Tarjeta, Cargando, Vacio, Etiqueta, Modal, Campo, inputClase, botonClase, AvisoError } from "../../../../components/intranet/ui";

const VACIA = { titulo: "", resumen: "", contenido: "", imagen: "", fecha: "", publicada: true };

export default function NoticiasAdmin() {
  const { data, cargando, recargar } = useApi("/admin/noticias");
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");

  const guardar = async (e) => {
    e.preventDefault();
    try {
      await apiIntranet(editando._id ? `/admin/noticias/${editando._id}` : "/admin/noticias", { method: editando._id ? "PUT" : "POST", body: editando });
      setEditando(null);
      recargar();
    } catch (err) {
      setError(err.message);
    }
  };
  const eliminar = async (n) => {
    if (!confirm(`¿Eliminar "${n.titulo}"?`)) return;
    await apiIntranet(`/admin/noticias/${n._id}`, { method: "DELETE" });
    recargar();
  };

  return (
    <>
      <Titulo titulo="Noticias de la web" subtitulo="Lo que publiques aquí aparece en la página de inicio y en /noticias">
        <button onClick={() => { setEditando({ ...VACIA, fecha: hoyLima() }); setError(""); }} className={botonClase}><Icono nombre="mas" className="w-4 h-4" /> Nueva noticia</button>
      </Titulo>
      {cargando ? <Cargando /> : !data?.length ? <Tarjeta><Vacio texto="Sin noticias" icono="noticias" /></Tarjeta> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((n) => (
            <div key={n._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {n.imagen
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={n.imagen} alt="" className="w-full h-36 object-cover" />
                : <div className="h-36 bg-gradient-to-br from-aduni-900 to-aduni-600" />}
              <div className="p-4">
                <div className="flex justify-between gap-2"><p className="text-xs text-gray-500">{fechaCorta(n.fecha)}</p><Etiqueta color={n.publicada ? "green" : "gray"}>{n.publicada ? "Publicada" : "Borrador"}</Etiqueta></div>
                <p className="font-semibold mt-1">{n.titulo}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{n.resumen}</p>
                <div className="flex gap-3 mt-3 text-sm">
                  <button onClick={() => { setEditando(n); setError(""); }} className="text-aduni-700 font-semibold hover:underline">Editar</button>
                  <button onClick={() => eliminar(n)} className="text-red-600 hover:underline">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal abierto={!!editando} titulo={editando?._id ? "Editar noticia" : "Nueva noticia"} onCerrar={() => setEditando(null)} ancho="max-w-2xl">
        {editando && (
          <form onSubmit={guardar} className="grid gap-3">
            <Campo etiqueta="Título"><input className={inputClase} value={editando.titulo} onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} required /></Campo>
            <Campo etiqueta="Resumen (aparece en las tarjetas)"><textarea rows={2} className={inputClase} value={editando.resumen} onChange={(e) => setEditando({ ...editando, resumen: e.target.value })} /></Campo>
            <Campo etiqueta="Contenido completo"><textarea rows={8} className={inputClase} value={editando.contenido} onChange={(e) => setEditando({ ...editando, contenido: e.target.value })} /></Campo>
            <div className="flex flex-wrap items-end gap-3">
              <Campo etiqueta="Fecha"><input type="date" className={inputClase} value={editando.fecha} onChange={(e) => setEditando({ ...editando, fecha: e.target.value })} /></Campo>
              <label className="flex items-center gap-2 text-sm pb-2"><input type="checkbox" checked={editando.publicada} onChange={(e) => setEditando({ ...editando, publicada: e.target.checked })} /> Publicada</label>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-600 mb-1">Imagen de portada</span>
              {editando.imagen ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editando.imagen} alt="" className="h-20 rounded" />
                  <button type="button" className="text-xs text-red-600" onClick={() => setEditando({ ...editando, imagen: "" })}>quitar</button>
                </div>
              ) : <SubirArchivo carpeta="noticias" accept="image/*" texto="Subir imagen" onSubido={(r) => setEditando((x) => ({ ...x, imagen: r.url }))} />}
            </div>
            <AvisoError texto={error} />
            <button className={`${botonClase} w-fit`}>Guardar</button>
          </form>
        )}
      </Modal>
    </>
  );
}
