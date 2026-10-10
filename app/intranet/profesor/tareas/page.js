"use client";

import { useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { useApi, fechaCorta, hoyLima } from "../../../../lib/intranet";
import Icono from "../../../../components/intranet/Icono";
import { Titulo, Tarjeta, Cargando, Vacio, Modal, Campo, inputClase, botonClase, AvisoError, Etiqueta, Nivel } from "../../../../components/intranet/ui";

function Entregas({ tarea, onCerrar }) {
  const { data, cargando, recargar } = useApi(`/docente/tareas/${tarea._id}/entregas`);
  const [error, setError] = useState("");

  const calificar = async (entrega, nivel, comentario) => {
    try {
      await apiIntranet(`/docente/entregas/${entrega._id}`, { method: "PUT", body: { nivel, comentario } });
      recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal abierto titulo={`Entregas: ${tarea.titulo}`} onCerrar={onCerrar} ancho="max-w-3xl">
      <AvisoError texto={error} />
      {cargando ? <Cargando /> : (
        <ul className="divide-y divide-gray-100 max-h-[65vh] overflow-y-auto">
          {data.estudiantes.map((e) => (
            <li key={e.id} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{e.nombre}</p>
                  <p className="text-xs text-gray-400">{e.codigo}{e.entrega && ` · entregó ${fechaCorta(e.entrega.updatedAt)}`}</p>
                </div>
                {!e.entrega ? <Etiqueta color="red">Sin entrega</Etiqueta> : (
                  <div className="flex items-center gap-1">
                    {["AD", "A", "B", "C"].map((n) => (
                      <button key={n} onClick={() => calificar(e.entrega, n, e.entrega.comentario)} className={`rounded-md ${e.entrega.nivel === n ? "ring-2 ring-offset-1 ring-gray-900" : "opacity-60 hover:opacity-100"}`}>
                        <Nivel nivel={n} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {e.entrega && (
                <div className="mt-2 text-sm bg-gray-50 rounded-lg p-3">
                  {e.entrega.respuesta && <p className="whitespace-pre-line text-gray-700">{e.entrega.respuesta}</p>}
                  {e.entrega.enlace && <a href={e.entrega.enlace} target="_blank" rel="noreferrer" className="text-aduni-700 underline text-xs break-all">{e.entrega.enlace}</a>}
                  {e.entrega.archivos?.map((a) => <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="block text-aduni-700 underline text-xs">Archivo: {a.nombre}</a>)}
                  <input defaultValue={e.entrega.comentario} placeholder="Comentario para el estudiante (se guarda al salir del campo)"
                    onBlur={(ev) => ev.target.value !== e.entrega.comentario && calificar(e.entrega, e.entrega.nivel, ev.target.value)}
                    className={`${inputClase} mt-2 text-xs`} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

export default function TareasDocente() {
  const { data, cargando, error, recargar } = useApi("/docente/tareas");
  const cursos = useApi("/docente/cursos");
  const [nueva, setNueva] = useState(false);
  const [form, setForm] = useState({ curso: "", titulo: "", descripcion: "", enlace: "", fechaEntrega: "" });
  const [errForm, setErrForm] = useState("");
  const [viendo, setViendo] = useState(null);

  const crear = async (e) => {
    e.preventDefault();
    try {
      await apiIntranet("/docente/tareas", { method: "POST", body: { ...form, curso: form.curso || cursos.data?.[0]?.id } });
      setNueva(false);
      setForm({ curso: "", titulo: "", descripcion: "", enlace: "", fechaEntrega: "" });
      recargar();
    } catch (err) {
      setErrForm(err.message);
    }
  };

  const eliminar = async (t) => {
    if (!confirm(`¿Eliminar la tarea "${t.titulo}" y sus entregas?`)) return;
    await apiIntranet(`/docente/tareas/${t._id}`, { method: "DELETE" });
    recargar();
  };

  return (
    <>
      <Titulo titulo="Tareas" subtitulo="Publica actividades y revisa las entregas de tus estudiantes">
        <button onClick={() => { setNueva(true); setErrForm(""); }} className={botonClase}><Icono nombre="mas" className="w-4 h-4" /> Nueva tarea</button>
      </Titulo>
      <AvisoError texto={error} />
      {cargando ? <Cargando /> : data.length === 0 ? <Tarjeta><Vacio texto="Aún no publicaste tareas" icono="tareas" /></Tarjeta> : (
        <Tarjeta>
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr><th className="text-left px-5 py-3">Tarea</th><th className="px-3 py-3">Entrega</th><th className="px-3 py-3">Entregaron</th><th className="px-3 py-3">Revisadas</th><th className="px-5 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((t) => (
                  <tr key={t._id}>
                    <td className="px-5 py-3">
                      <p className="font-semibold">{t.titulo}</p>
                      <p className="text-xs" style={{ color: t.curso.color }}>{t.curso.nombre} · {t.curso.aula.nombre}</p>
                    </td>
                    <td className="px-3 py-3 text-center">{fechaCorta(t.fechaEntrega)} {t.fechaEntrega < hoyLima() && <Etiqueta>Cerrada</Etiqueta>}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="w-24 mx-auto">
                        <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-1.5 bg-aduni-600 rounded-full" style={{ width: `${t.total ? (t.entregas / t.total) * 100 : 0}%` }} /></div>
                        <p className="text-xs text-gray-500 mt-1">{t.entregas}/{t.total}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">{t.entregas - t.revisadas > 0 ? <Etiqueta color="amber">{t.entregas - t.revisadas} por revisar</Etiqueta> : <Etiqueta color="green">Al día</Etiqueta>}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button onClick={() => setViendo(t)} className="text-aduni-700 font-semibold hover:underline mr-3">Revisar</button>
                      <button onClick={() => eliminar(t)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tarjeta>
      )}

      <Modal abierto={nueva} titulo="Nueva tarea" onCerrar={() => setNueva(false)}>
        <form onSubmit={crear} className="grid gap-3">
          <Campo etiqueta="Curso">
            <select className={inputClase} value={form.curso || cursos.data?.[0]?.id || ""} onChange={(e) => setForm({ ...form, curso: e.target.value })}>
              {cursos.data?.map((c) => <option key={c.id} value={c.id}>{c.nombre} — {c.aula.nombre}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Título"><input className={inputClase} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></Campo>
          <Campo etiqueta="Indicaciones"><textarea rows={4} className={inputClase} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></Campo>
          <Campo etiqueta="Enlace a material (opcional)"><input type="url" className={inputClase} value={form.enlace} onChange={(e) => setForm({ ...form, enlace: e.target.value })} placeholder="https://" /></Campo>
          <Campo etiqueta="Fecha de entrega"><input type="date" className={inputClase} value={form.fechaEntrega} onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })} required /></Campo>
          <AvisoError texto={errForm} />
          <button className={`${botonClase} w-fit`}>Publicar tarea</button>
        </form>
      </Modal>

      {viendo && <Entregas tarea={viendo} onCerrar={() => { setViendo(null); recargar(); }} />}
    </>
  );
}
