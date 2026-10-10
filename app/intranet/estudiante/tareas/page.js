"use client";

import { useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { fechaCorta, useApi } from "../../../../lib/intranet";
import { useApiEst, usePortal } from "../../../../components/intranet/PortalLayout";
import SubirArchivo from "../../../../components/intranet/SubirArchivo";
import Icono from "../../../../components/intranet/Icono";
import { Titulo, Tarjeta, Cargando, Vacio, Etiqueta, Nivel, Pestanas, Modal, Campo, inputClase, botonClase, AvisoError } from "../../../../components/intranet/ui";

const ESTADOS = {
  pendiente: ["Pendiente", "amber"],
  vencida: ["Vencida", "red"],
  entregada: ["Entregada", "blue"],
  calificada: ["Calificada", "green"],
};

export default function TareasEstudiante() {
  const { rol, hijo } = usePortal();
  const hijos = useApi(rol === "apoderado" ? "/familia/hijos" : null);
  const hijoSinCuenta = rol === "apoderado" && hijos.data?.find((h) => h._id === hijo)?.tieneCuenta === false;
  // Entrega el alumno; en los primeros grados (sin cuenta propia) entrega la familia.
  const esEstudiante = rol === "estudiante" || hijoSinCuenta;
  const { data, cargando, error, recargar } = useApiEst("/estudiante/tareas");
  const [filtro, setFiltro] = useState("pendiente");
  const [abierta, setAbierta] = useState(null);
  const [form, setForm] = useState({ respuesta: "", enlace: "", archivos: [] });
  const [errForm, setErrForm] = useState("");

  const abrir = (t) => {
    setAbierta(t);
    setForm({ respuesta: t.entrega?.respuesta || "", enlace: t.entrega?.enlace || "", archivos: t.entrega?.archivos || [] });
    setErrForm("");
  };

  const entregar = async (e) => {
    e.preventDefault();
    try {
      await apiIntranet(`/estudiante/tareas/${abierta._id}/entrega`, { method: "PUT", body: { ...form, hijo } });
      setAbierta(null);
      recargar();
    } catch (err) {
      setErrForm(err.message);
    }
  };

  const lista = (data || []).filter((t) => filtro === "todas" || t.estado === filtro || (filtro === "entregada" && t.estado === "calificada"));
  const cuenta = (e) => (data || []).filter((t) => t.estado === e).length;

  return (
    <>
      <Titulo titulo="Tareas" subtitulo={rol === "estudiante" ? "Actividades asignadas por tus docentes" : hijoSinCuenta ? "Tu hijo(a) aún no tiene cuenta propia: entrega sus tareas desde aquí (foto del cuaderno, por ejemplo)" : "Seguimiento de las tareas de tu hijo(a)"} />
      <AvisoError texto={error} />
      <div className="mb-4">
        <Pestanas valor={filtro} onChange={setFiltro} opciones={[
          ["pendiente", `Pendientes (${cuenta("pendiente")})`], ["entregada", `Entregadas (${cuenta("entregada") + cuenta("calificada")})`],
          ["vencida", `Vencidas (${cuenta("vencida")})`], ["todas", "Todas"],
        ]} />
      </div>
      {cargando ? <Cargando /> : lista.length === 0 ? <Tarjeta><Vacio texto="No hay tareas en esta sección" icono="tareas" /></Tarjeta> : (
        <div className="grid gap-4 md:grid-cols-2">
          {lista.map((t) => (
            <div key={t._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex">
              <span className="w-1.5" style={{ background: t.curso.color }} />
              <div className="p-4 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold" style={{ color: t.curso.color }}>{t.curso.nombre}</p>
                    <h3 className="font-semibold text-gray-900">{t.titulo}</h3>
                  </div>
                  <Etiqueta color={ESTADOS[t.estado][1]}>{ESTADOS[t.estado][0]}</Etiqueta>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3 whitespace-pre-line">{t.descripcion}</p>
                {t.enlace && <a href={t.enlace} target="_blank" rel="noreferrer" className="text-xs text-aduni-700 underline">Material de la tarea</a>}
                <div className="flex items-center justify-between mt-3 gap-2">
                  <p className="text-xs text-gray-500">Entrega: <strong>{fechaCorta(t.fechaEntrega)}</strong> · {t.curso.docente?.nombre}</p>
                  {t.estado === "calificada" ? (
                    <span className="flex items-center gap-1 text-xs">Nota <Nivel nivel={t.entrega.nivel} /></span>
                  ) : esEstudiante ? (
                    <button onClick={() => abrir(t)} className={`text-sm font-semibold hover:underline ${t.estado === "vencida" && !t.entrega ? "text-red-700" : "text-aduni-700"}`}>
                      {t.entrega ? "Editar entrega" : t.estado === "vencida" ? "Entregar tarde" : "Entregar"}
                    </button>
                  ) : null}
                </div>
                {t.entrega?.archivos?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">{t.entrega.archivos.map((a) => <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="text-xs text-aduni-700 flex items-center gap-1"><Icono nombre="clip" className="w-3 h-3" />{a.nombre}</a>)}</div>
                )}
                {t.entrega?.comentario && <p className="text-xs bg-gray-50 rounded p-2 mt-2">Docente: {t.entrega.comentario}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal abierto={!!abierta} titulo={abierta?.titulo} onCerrar={() => setAbierta(null)}>
        <form onSubmit={entregar} className="grid gap-3">
          <p className="text-sm text-gray-600 whitespace-pre-line">{abierta?.descripcion}</p>
          <Campo etiqueta="Tu respuesta"><textarea rows={5} className={inputClase} value={form.respuesta} onChange={(e) => setForm({ ...form, respuesta: e.target.value })} /></Campo>
          <Campo etiqueta="Enlace (Drive, Canva, YouTube...)"><input type="url" className={inputClase} value={form.enlace} onChange={(e) => setForm({ ...form, enlace: e.target.value })} placeholder="https://" /></Campo>
          <div>
            <span className="block text-xs font-semibold text-gray-600 mb-1">Archivos (fotos del cuaderno, PDF, Word — máx. 5)</span>
            <ul className="grid gap-1 mb-2">
              {form.archivos.map((a, i) => (
                <li key={a.url} className="text-sm flex items-center gap-2"><Icono nombre="clip" className="w-4 h-4 text-gray-400" />{a.nombre}
                  <button type="button" onClick={() => setForm({ ...form, archivos: form.archivos.filter((_, j) => j !== i) })} className="text-xs text-red-600">quitar</button></li>
              ))}
            </ul>
            {form.archivos.length < 5 && <SubirArchivo carpeta="tareas" texto="Agregar archivo" onSubido={(r) => setForm((f) => ({ ...f, archivos: [...f.archivos, { url: r.url, nombre: r.nombre }] }))} />}
          </div>
          <AvisoError texto={errForm} />
          <button className={`${botonClase} w-fit`}>Enviar entrega</button>
        </form>
      </Modal>
    </>
  );
}
