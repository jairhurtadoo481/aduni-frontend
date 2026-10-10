"use client";

import { useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { useApi, fechaLarga, fechaCorta } from "../../../../lib/intranet";
import { Titulo, Tarjeta, Cargando, Vacio, Pestanas, Etiqueta, inputClase, AvisoError } from "../../../../components/intranet/ui";

export default function JustificacionesAdmin() {
  const [estado, setEstado] = useState("pendiente");
  const { data, cargando, recargar } = useApi(`/admin/justificaciones?estado=${estado}`);
  const [respuestas, setRespuestas] = useState({});
  const [error, setError] = useState("");

  const resolver = async (j, nuevo) => {
    try {
      await apiIntranet(`/admin/justificaciones/${j._id}`, { method: "PUT", body: { estado: nuevo, respuesta: respuestas[j._id] || "" } });
      recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Titulo titulo="Justificaciones" subtitulo="Solicitudes enviadas por estudiantes y apoderados desde la intranet" />
      <div className="mb-4"><Pestanas valor={estado} onChange={setEstado} opciones={[["pendiente", "Pendientes"], ["aprobada", "Aprobadas"], ["rechazada", "Rechazadas"]]} /></div>
      <AvisoError texto={error} />
      {cargando ? <Cargando /> : data.length === 0 ? <Tarjeta><Vacio texto="No hay solicitudes" icono="justificacion" /></Tarjeta> : (
        <div className="grid gap-4">
          {data.map((j) => (
            <Tarjeta key={j._id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{j.estudiante?.nombre} <span className="text-xs text-gray-400 font-normal">{j.estudiante?.codigo} · {j.estudiante?.aula?.nombre}</span></p>
                  <p className="text-sm text-aduni-700 first-letter:uppercase">Fecha a justificar: {fechaLarga(j.fecha)}</p>
                  <p className="text-sm text-gray-700 mt-2">{j.motivo}</p>
                  {j.evidenciaUrl && <a href={j.evidenciaUrl} target="_blank" rel="noreferrer" className="text-xs text-aduni-700 underline">Ver evidencia</a>}
                  <p className="text-xs text-gray-400 mt-1">Enviada {fechaCorta(j.createdAt)}</p>
                </div>
                <Etiqueta color={j.estado === "aprobada" ? "green" : j.estado === "rechazada" ? "red" : "amber"}>{j.estado}</Etiqueta>
              </div>
              {j.estado === "pendiente" ? (
                <div className="flex flex-wrap gap-2 mt-4">
                  <input className={`${inputClase} flex-1 min-w-52`} placeholder="Respuesta (opcional)" value={respuestas[j._id] || ""} onChange={(e) => setRespuestas({ ...respuestas, [j._id]: e.target.value })} />
                  <button onClick={() => resolver(j, "aprobada")} className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700">Aprobar</button>
                  <button onClick={() => resolver(j, "rechazada")} className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700">Rechazar</button>
                </div>
              ) : j.respuesta && <p className="text-xs text-gray-500 mt-3">Respuesta: {j.respuesta}</p>}
            </Tarjeta>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4">Al aprobar, la falta del día pasa a “justificada” y la tardanza a “puntual”.</p>
    </>
  );
}
