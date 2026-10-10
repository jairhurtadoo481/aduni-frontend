"use client";

import { useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { useApi, ASISTENCIA, hoyLima, fechaLarga } from "../../../../lib/intranet";
import Icono from "../../../../components/intranet/Icono";
import { Titulo, Tarjeta, Cargando, Campo, inputClase, botonClase, botonSecundario, AvisoError, Exito, Vacio, Etiqueta } from "../../../../components/intranet/ui";

const VENTANA = { antes: ["Aún no empieza", "gray"], abierta: ["Puedes pasar lista", "green"], cerrada: ["Cerrada", "gray"] };

function Lista({ clase, fecha, onVolver }) {
  const { data, cargando, error, recargar } = useApi(`/docente/clases/${clase._id}/asistencia?fecha=${fecha}`);
  const [marcas, setMarcas] = useState({});
  const [msg, setMsg] = useState({ ok: "", error: "" });

  if (cargando) return <Cargando />;
  if (error) return <AvisoError texto={error} />;
  const estado = (e) => marcas[e.id] ?? e.estado;
  const marcar = (e, v) => { setMarcas({ ...marcas, [e.id]: v }); setMsg({ ok: "", error: "" }); };
  const todosPresentes = () => setMarcas(Object.fromEntries(data.estudiantes.map((e) => [e.id, estado(e) || "P"])));
  const faltan = data.estudiantes.filter((e) => !estado(e)).length;
  const c = { P: 0, T: 0, F: 0, J: 0 };
  data.estudiantes.forEach((e) => { if (estado(e)) c[estado(e)]++; });

  const guardar = async () => {
    try {
      const r = await apiIntranet(`/docente/clases/${clase._id}/asistencia`, { method: "PUT", body: { registros: data.estudiantes.map((e) => ({ estudiante: e.id, estado: estado(e) })) } });
      setMsg({ ok: `${r.mensaje}. Las familias de quienes faltaron a la primera hora reciben el aviso.`, error: "" });
      setMarcas({});
      recargar();
    } catch (err) {
      setMsg({ ok: "", error: err.message });
    }
  };

  return (
    <>
      <button onClick={onVolver} className="text-sm text-aduni-700 hover:underline mb-3">← Mis clases</button>
      <Tarjeta>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-semibold" style={{ color: data.clase.curso.color }}>{data.clase.curso.nombre}</p>
            <h2 className="text-xl font-bold">{data.clase.aula.nombre}</h2>
            <p className="text-sm text-gray-500 first-letter:uppercase">{fechaLarga(fecha)} · {data.clase.horaInicio}-{data.clase.horaFin}</p>
          </div>
          <div className="text-right">
            <Etiqueta color={VENTANA[data.ventana.estado][1]}>{VENTANA[data.ventana.estado][0]}</Etiqueta>
            <p className="text-xs text-gray-500 mt-1">Lista habilitada de {data.ventana.abre} a {data.ventana.cierra}</p>
            {data.tomadaEn && <p className="text-xs text-emerald-700">Guardada {new Date(data.tomadaEn).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</p>}
          </div>
        </div>
        {!data.editable && (
          <p className="text-sm bg-amber-50 text-amber-900 rounded-lg p-3 mb-4 flex items-center gap-2">
            <Icono nombre="alerta" className="w-4 h-4" />
            {data.ventana.estado === "antes" ? "Todavía no es hora de esta clase." : "El plazo para pasar lista terminó. Si hay un error, pide la corrección al auxiliar."}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {Object.entries(c).map(([k, n]) => <Etiqueta key={k} color={{ P: "green", T: "amber", F: "red", J: "blue" }[k]}>{ASISTENCIA[k].nombre}: {n}</Etiqueta>)}
          {data.editable && <button onClick={todosPresentes} className={`${botonSecundario} ml-auto`}>Marcar faltantes como presentes</button>}
        </div>
        <ul className="divide-y divide-gray-100">
          {data.estudiantes.map((e, i) => (
            <li key={e.id} className="py-2 flex flex-wrap items-center gap-3">
              <span className="w-6 text-xs text-gray-400">{i + 1}</span>
              <div className="flex-1 min-w-[180px]"><p className="text-sm font-medium">{e.nombre}</p><p className="text-xs text-gray-400">{e.codigo}</p></div>
              <div className="flex gap-1">
                {["P", "T", "F"].map((k) => (
                  <button key={k} disabled={!data.editable || estado(e) === "J"} onClick={() => marcar(e, k)} title={ASISTENCIA[k].nombre}
                    className={`w-11 h-9 rounded-md text-sm font-bold border transition disabled:cursor-not-allowed ${estado(e) === k ? `${ASISTENCIA[k].punto} text-white border-transparent` : "border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"}`}>
                    {k}
                  </button>
                ))}
                {estado(e) === "J" && <Etiqueta color="blue">Justificada</Etiqueta>}
              </div>
            </li>
          ))}
        </ul>
        {data.editable && (
          <div className="mt-5 grid gap-3">
            <AvisoError texto={msg.error} /><Exito texto={msg.ok} />
            <button onClick={guardar} disabled={faltan > 0} className={`${botonClase} w-fit`}>{faltan ? `Faltan ${faltan} por marcar` : "Guardar asistencia"}</button>
          </div>
        )}
      </Tarjeta>
    </>
  );
}

export default function AsistenciaDocente() {
  const [fecha, setFecha] = useState(hoyLima());
  const [abierta, setAbierta] = useState(null);
  const { data, cargando, error } = useApi(`/docente/clases?fecha=${fecha}`);

  if (abierta) return <Lista clase={abierta} fecha={fecha} onVolver={() => setAbierta(null)} />;

  return (
    <>
      <Titulo titulo="Tomar asistencia" subtitulo="Pasa lista en cada clase desde tu celular o la PC del aula. Solo se puede durante tu horario; luego se bloquea." />
      <div className="mb-4"><Campo etiqueta="Fecha"><input type="date" max={hoyLima()} className={`${inputClase} w-auto`} value={fecha} onChange={(e) => setFecha(e.target.value)} /></Campo></div>
      <AvisoError texto={error} />
      {cargando || !data ? <Cargando /> : data.feriado ? <Tarjeta><Vacio texto={`Feriado: ${data.feriado}`} icono="calendario" /></Tarjeta> : data.clases.length === 0 ? <Tarjeta><Vacio texto="No tienes clases este día" icono="horario" /></Tarjeta> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.clases.map((c) => (
            <button key={c._id} onClick={() => setAbierta(c)} className={`text-left bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition ${c.ventana.estado === "abierta" && !c.tomada ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-200"}`}>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-xs font-semibold" style={{ color: c.curso.color }}>{c.curso.nombre}</p>
                  <p className="font-bold">{c.aula.nombre}</p>
                  <p className="text-sm text-gray-500">{c.horaInicio} - {c.horaFin}</p>
                </div>
                {c.tomada ? <Etiqueta color="green">Lista tomada</Etiqueta> : c.ventana.estado === "cerrada" ? <Etiqueta color="red">Sin lista</Etiqueta> : <Etiqueta color={VENTANA[c.ventana.estado][1]}>{VENTANA[c.ventana.estado][0]}</Etiqueta>}
              </div>
              {c.tomada && <p className="text-xs text-gray-500 mt-2">P {c.conteo.P} · T {c.conteo.T} · F {c.conteo.F} · J {c.conteo.J}</p>}
              {!c.tomada && c.ventana.estado !== "cerrada" && <p className="text-xs text-gray-400 mt-2">Habilitada de {c.ventana.abre} a {c.ventana.cierra}</p>}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
