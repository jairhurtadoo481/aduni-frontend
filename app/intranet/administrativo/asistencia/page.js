"use client";

import { useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { useApi, ASISTENCIA, hoyLima } from "../../../../lib/intranet";
import { usePortal } from "../../../../components/intranet/PortalLayout";
import { Titulo, Tarjeta, Cargando, Pestanas, Campo, inputClase, botonSecundario, EstadoAsistencia, AvisoError, Etiqueta, Vacio } from "../../../../components/intranet/ui";

const VENTANA = { antes: ["Aún no empieza", "gray"], abierta: ["En curso", "blue"], cerrada: ["Cerrada", "gray"] };

// Qué docentes ya pasaron lista hoy y cuáles no.
function Control() {
  const [fecha, setFecha] = useState(hoyLima());
  const { data, cargando } = useApi(`/admin/asistencia/control?fecha=${fecha}`);
  return (
    <div className="grid gap-6">
      <Campo etiqueta="Fecha"><input type="date" max={hoyLima()} className={`${inputClase} w-auto`} value={fecha} onChange={(e) => setFecha(e.target.value)} /></Campo>
      {cargando || !data ? <Cargando /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-500 uppercase">Clases del día</p><p className="text-2xl font-bold">{data.total}</p></div>
            <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-500 uppercase">Con lista tomada</p><p className="text-2xl font-bold text-emerald-700">{data.tomadas}</p></div>
            <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-500 uppercase">Vencidas sin lista</p><p className="text-2xl font-bold text-red-600">{data.sinTomar.length}</p></div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Tarjeta titulo="Clases sin lista (plazo vencido)">
              {data.sinTomar.length === 0 ? <Vacio texto="Todos los docentes pasaron lista" icono="check" /> : (
                <ul className="divide-y divide-gray-100 -my-3">
                  {data.sinTomar.map((x) => (
                    <li key={x._id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                      <span><span className="font-medium">{x.docente}</span><span className="block text-xs text-gray-500">{x.curso} · {x.aula} · {x.horaInicio}-{x.horaFin}</span></span>
                      {x.celular && <a className="text-xs text-emerald-700 hover:underline" target="_blank" rel="noreferrer" href={`https://wa.me/51${x.celular}?text=${encodeURIComponent(`Profesor(a), falta registrar la asistencia de ${x.curso} (${x.aula}, ${x.horaInicio}). Coordinar con auxiliatura.`)}`}>WhatsApp</a>}
                    </li>
                  ))}
                </ul>
              )}
            </Tarjeta>
            <Tarjeta titulo="Clases en curso ahora">
              {data.enCurso.length === 0 ? <Vacio texto="No hay clases en este momento" icono="horario" /> : (
                <ul className="divide-y divide-gray-100 -my-3">
                  {data.enCurso.map((x) => (
                    <li key={x._id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                      <span><span className="font-medium">{x.curso} · {x.aula}</span><span className="block text-xs text-gray-500">{x.docente} · {x.horaInicio}-{x.horaFin} (lista hasta {x.ventana.cierra})</span></span>
                      <Etiqueta color={x.tomada ? "green" : "amber"}>{x.tomada ? "Lista tomada" : "Pendiente"}</Etiqueta>
                    </li>
                  ))}
                </ul>
              )}
            </Tarjeta>
          </div>
        </>
      )}
    </div>
  );
}

// Gradilla del aula: estudiantes × clases del día. El auxiliar puede corregir (queda en la bitácora).
function PorAula() {
  const { puede } = usePortal();
  const aulas = useApi("/admin/aulas");
  const [aula, setAula] = useState("");
  const [fecha, setFecha] = useState(hoyLima());
  const sel = aula || aulas.data?.[0]?._id || "";
  const g = useApi(sel ? `/admin/asistencia/clases?aula=${sel}&fecha=${fecha}` : null);
  const [error, setError] = useState("");
  const editable = puede("auxiliar");

  const corregir = async (bloque, e, estado) => {
    const motivo = prompt(`Motivo de la corrección (${e.nombre}, ${bloque.curso?.nombre} ${bloque.horaInicio}):`);
    if (motivo === null) return;
    try {
      await apiIntranet(`/admin/asistencia/clases/${bloque._id}`, { method: "PUT", body: { fecha, estudiante: e.id, estado, motivo } });
      setError("");
      g.recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Campo etiqueta="Aula"><select className={inputClase} value={sel} onChange={(e) => setAula(e.target.value)}>{aulas.data?.map((a) => <option key={a._id} value={a._id}>{a.nombre}</option>)}</select></Campo>
        <Campo etiqueta="Fecha"><input type="date" max={hoyLima()} className={inputClase} value={fecha} onChange={(e) => setFecha(e.target.value)} /></Campo>
        {!editable && <p className="text-xs text-gray-500">Solo el auxiliar puede corregir.</p>}
      </div>
      <AvisoError texto={error} />
      {g.cargando || !g.data ? <Cargando /> : g.data.bloques.length === 0 ? <Tarjeta><Vacio texto="Esta aula no tiene clases ese día" icono="horario" /></Tarjeta> : (
        <Tarjeta>
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th className="text-left px-4 py-2 sticky left-0 bg-gray-50 min-w-48">Estudiante</th>
                  {g.data.bloques.map((b) => (
                    <th key={b._id} className="px-2 py-2 min-w-28 align-bottom">
                      <span className="block font-semibold" style={{ color: b.curso?.color }}>{b.curso?.nombre}</span>
                      <span className="block font-normal">{b.horaInicio}-{b.horaFin}</span>
                      <span className="block font-normal text-[10px] text-gray-400 truncate">{b.curso?.docente?.nombre?.split(",")[0]}</span>
                      {b.tomada ? <Etiqueta color="green">Tomada</Etiqueta> : <Etiqueta color={b.ventana.estado === "cerrada" ? "red" : VENTANA[b.ventana.estado][1]}>{b.ventana.estado === "cerrada" ? "Sin lista" : VENTANA[b.ventana.estado][0]}</Etiqueta>}
                      {b.corregidaPor && <span className="block text-[10px] text-amber-600">corregida por {b.corregidaPor.split(",")[0]}</span>}
                    </th>
                  ))}
                  <th className="px-3 py-2">Día</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {g.data.estudiantes.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-1.5 sticky left-0 bg-white"><p className="font-medium">{e.nombre}</p><p className="text-[11px] text-gray-400">{e.codigo}</p></td>
                    {g.data.bloques.map((b) => {
                      const v = e.estados[b._id] || "";
                      return (
                        <td key={b._id} className="px-2 py-1.5 text-center">
                          {editable && (b.tomada || b.ventana.estado === "cerrada") ? (
                            <select value={v} onChange={(ev) => corregir(b, e, ev.target.value)}
                              className={`rounded-md text-xs font-bold px-1 py-1 border ${v ? `${ASISTENCIA[v].clase} border-transparent` : "border-gray-300 text-gray-400"}`}>
                              <option value="">—</option>
                              {Object.keys(ASISTENCIA).map((k) => <option key={k} value={k}>{k}</option>)}
                            </select>
                          ) : v ? <span className={`text-xs font-bold px-2 py-0.5 rounded ${ASISTENCIA[v].clase}`}>{v}</span> : <span className="text-gray-300">—</span>}
                        </td>
                      );
                    })}
                    <td className="px-3 py-1.5 text-center"><EstadoAsistencia estado={e.diario} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-8">La columna “Día” es la asistencia diaria que ven las familias: cuenta la primera clase; si faltó a la primera pero llegó después, queda como tardanza. Las justificaciones aprobadas se reflejan aquí.</p>
        </Tarjeta>
      )}
    </div>
  );
}

function Reporte() {
  const aulas = useApi("/admin/aulas");
  const config = useApi("/config");
  const [aula, setAula] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState(hoyLima());
  const sel = aula || aulas.data?.[0]?._id;
  const ini = desde || (config.data ? `${config.data.anio}-03-01` : "");
  const rep = useApi(sel && ini ? `/admin/asistencia/reporte?aula=${sel}&desde=${ini}&hasta=${hasta}` : null);

  const exportar = () => {
    const filas = [["Codigo", "Estudiante", "Puntual", "Tardanzas", "Faltas", "Justificadas", "% Asistencia"], ...rep.data.estudiantes.map((e) => [e.codigo, e.nombre, e.P, e.T, e.F, e.J, e.porcentaje ?? ""])];
    const csv = "﻿" + filas.map((f) => f.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `asistencia-${ini}-${hasta}.csv`;
    a.click();
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end gap-3">
        <Campo etiqueta="Aula"><select className={inputClase} value={sel || ""} onChange={(e) => setAula(e.target.value)}>{aulas.data?.map((a) => <option key={a._id} value={a._id}>{a.nombre}</option>)}</select></Campo>
        <Campo etiqueta="Desde"><input type="date" className={inputClase} value={ini} onChange={(e) => setDesde(e.target.value)} /></Campo>
        <Campo etiqueta="Hasta"><input type="date" className={inputClase} value={hasta} onChange={(e) => setHasta(e.target.value)} /></Campo>
        {rep.data && <button onClick={exportar} className={botonSecundario}>Exportar a Excel (CSV)</button>}
      </div>
      {rep.cargando || !rep.data ? <Cargando /> : (
        <Tarjeta>
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="text-left px-5 py-2">Estudiante</th><th className="px-3">P</th><th className="px-3">T</th><th className="px-3">F</th><th className="px-3">J</th><th className="px-5 text-left">Asistencia</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {rep.data.estudiantes.map((e) => (
                  <tr key={e.id}>
                    <td className="px-5 py-2"><p className="font-medium">{e.nombre}</p><p className="text-xs text-gray-400">{e.codigo}</p></td>
                    <td className="px-3 text-center">{e.P}</td><td className="px-3 text-center text-amber-600">{e.T}</td>
                    <td className="px-3 text-center text-red-600">{e.F}</td><td className="px-3 text-center text-sky-600">{e.J}</td>
                    <td className="px-5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 bg-gray-100 rounded-full"><div className={`h-2 rounded-full ${e.porcentaje >= 90 ? "bg-emerald-500" : e.porcentaje >= 80 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${e.porcentaje || 0}%` }} /></div>
                        <span className="text-xs font-semibold">{e.porcentaje ?? "—"}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tarjeta>
      )}
    </div>
  );
}

export default function AsistenciaAdmin() {
  const [tab, setTab] = useState("control");
  return (
    <>
      <Titulo titulo="Asistencia de estudiantes" subtitulo="La toma cada docente en su clase, dentro de su horario. Aquí se controla y, si hace falta, el auxiliar corrige (queda en la bitácora)." />
      <div className="mb-6"><Pestanas valor={tab} onChange={setTab} opciones={[["control", "Control de listas"], ["aula", "Por aula y clase"], ["reporte", "Reporte"]]} /></div>
      {tab === "control" && <Control />}
      {tab === "aula" && <PorAula />}
      {tab === "reporte" && <Reporte />}
    </>
  );
}
