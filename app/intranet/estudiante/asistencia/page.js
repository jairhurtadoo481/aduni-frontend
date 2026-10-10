"use client";

import { useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { ASISTENCIA, fechaCorta, fechaLarga, hoyLima } from "../../../../lib/intranet";
import { useApiEst, usePortal } from "../../../../components/intranet/PortalLayout";
import SubirArchivo from "../../../../components/intranet/SubirArchivo";
import { Titulo, Tarjeta, Indicador, Cargando, EstadoAsistencia, Etiqueta, Campo, inputClase, botonClase, AvisoError, Exito, Vacio } from "../../../../components/intranet/ui";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function Calendario({ registros, anio }) {
  const porFecha = Object.fromEntries(registros.map((r) => [r.fecha, r]));
  const meses = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // marzo a diciembre
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {meses.map((m) => {
        const dias = new Date(Date.UTC(anio, m + 1, 0)).getUTCDate();
        const primero = (new Date(Date.UTC(anio, m, 1)).getUTCDay() + 6) % 7; // lunes = 0
        return (
          <div key={m}>
            <p className="text-xs font-semibold text-gray-600 mb-1">{MESES[m]}</p>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: primero }).map((_, i) => <span key={`v${i}`} />)}
              {Array.from({ length: dias }).map((_, i) => {
                const f = `${anio}-${String(m + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
                const r = porFecha[f];
                return (
                  <span key={f} title={r ? `${fechaCorta(f)}: ${ASISTENCIA[r.estado].nombre} ${r.horaIngreso}` : fechaCorta(f)}
                    className={`aspect-square rounded-[3px] ${r ? ASISTENCIA[r.estado].punto : "bg-gray-100"}`} />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AsistenciaEstudiante() {
  const { hijo } = usePortal();
  const { data, cargando, error } = useApiEst("/estudiante/asistencia");
  const just = useApiEst("/estudiante/justificaciones");
  const [form, setForm] = useState({ fecha: "", motivo: "", evidenciaUrl: "" });
  const [msg, setMsg] = useState({ ok: "", error: "" });

  if (cargando) return <Cargando />;
  if (error) return <AvisoError texto={error} />;
  const r = data.resumen;
  const incidencias = data.registros.filter((x) => x.estado !== "P");
  const anio = Number((data.registros[0]?.fecha || hoyLima()).slice(0, 4));

  const enviar = async (e) => {
    e.preventDefault();
    try {
      await apiIntranet("/estudiante/justificaciones", { method: "POST", body: { ...form, hijo } });
      setMsg({ ok: "Justificación enviada. Secretaría la revisará.", error: "" });
      setForm({ fecha: "", motivo: "", evidenciaUrl: "" });
      just.recargar();
    } catch (err) {
      setMsg({ ok: "", error: err.message });
    }
  };

  return (
    <>
      <Titulo titulo="Asistencia" subtitulo="Registro de ingreso al colegio (carné QR)" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 mb-6">
        <Indicador etiqueta="Asistencia" valor={r.porcentaje !== null ? `${r.porcentaje}%` : "—"} detalle={`${r.total} días registrados`} icono="asistencia" />
        <Indicador etiqueta="Puntual" valor={r.P} icono="check" color="text-emerald-700 bg-emerald-100" />
        <Indicador etiqueta="Tardanzas" valor={r.T} icono="horario" color="text-amber-700 bg-amber-100" />
        <Indicador etiqueta="Faltas" valor={r.F} icono="x" color="text-red-700 bg-red-100" />
        <Indicador etiqueta="Justificadas" valor={r.J} icono="justificacion" color="text-sky-700 bg-sky-100" />
      </div>

      <Tarjeta titulo={`Calendario ${anio}`} className="mb-6"
        accion={<div className="hidden sm:flex gap-3 text-xs text-gray-500">{Object.entries(ASISTENCIA).map(([k, v]) => <span key={k} className="flex items-center gap-1"><span className={`w-2.5 h-2.5 rounded-sm ${v.punto}`} />{v.nombre}</span>)}</div>}>
        <Calendario registros={data.registros} anio={anio} />
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Tardanzas y faltas">
          {incidencias.length === 0 ? <Vacio texto="¡Asistencia perfecta!" icono="check" /> : (
            <ul className="divide-y divide-gray-100 -my-3 max-h-96 overflow-y-auto">
              {incidencias.map((x) => (
                <li key={x._id} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="first-letter:uppercase">{fechaLarga(x.fecha)}</span>
                  <span className="flex items-center gap-2">{x.horaIngreso && <span className="text-xs text-gray-500">{x.horaIngreso}</span>}<EstadoAsistencia estado={x.estado} /></span>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta titulo="Justificar inasistencia o tardanza">
          <form onSubmit={enviar} className="grid gap-3">
            <Campo etiqueta="Fecha"><input type="date" max={hoyLima()} className={inputClase} value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required /></Campo>
            <Campo etiqueta="Motivo"><textarea rows={3} className={inputClase} value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} required placeholder="Ej. cita médica, adjunto constancia" /></Campo>
            <div>
              <span className="block text-xs font-semibold text-gray-600 mb-1">Evidencia (opcional): constancia médica, foto...</span>
              {form.evidenciaUrl
                ? <p className="text-sm">Adjunto listo · <button type="button" className="text-red-600 text-xs" onClick={() => setForm({ ...form, evidenciaUrl: "" })}>quitar</button></p>
                : <SubirArchivo carpeta="justificaciones" texto="Subir foto o PDF" onSubido={(r) => setForm({ ...form, evidenciaUrl: r.url })} />}
            </div>
            <AvisoError texto={msg.error} /><Exito texto={msg.ok} />
            <button className={`${botonClase} w-fit`}>Enviar justificación</button>
          </form>
          {just.data?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-500 mb-2">MIS SOLICITUDES</p>
              <ul className="grid gap-2">
                {just.data.map((j) => (
                  <li key={j._id} className="text-sm flex items-start justify-between gap-3 border border-gray-100 rounded-lg p-2.5">
                    <div><p className="font-medium">{fechaCorta(j.fecha)} · {j.motivo}</p>{j.respuesta && <p className="text-xs text-gray-500">Respuesta: {j.respuesta}</p>}</div>
                    <Etiqueta color={j.estado === "aprobada" ? "green" : j.estado === "rechazada" ? "red" : "amber"}>{j.estado}</Etiqueta>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Tarjeta>
      </div>
    </>
  );
}
