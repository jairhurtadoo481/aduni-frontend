"use client";

import { useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { useApi } from "../../../../lib/intranet";
import Icono from "../../../../components/intranet/Icono";
import { Titulo, Tarjeta, Cargando, Vacio, Etiqueta, Nivel, Modal, Campo, inputClase, botonClase, botonSecundario, AvisoError } from "../../../../components/intranet/ui";

const local = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };
const fecha = (d) => new Date(d).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
const preguntaVacia = () => ({ enunciado: "", opciones: ["", "", "", ""], correcta: 0, puntaje: 1 });

function Editor({ examen, cursos, onCerrar }) {
  const [f, setF] = useState(() => examen ? {
    ...examen, curso: examen.curso._id || examen.curso, inicio: local(examen.inicio), fin: local(examen.fin),
  } : {
    curso: cursos[0]?.id, titulo: "", instrucciones: "", inicio: local(Date.now() + 3600e3), fin: local(Date.now() + 7 * 864e5),
    duracionMin: 30, aleatorio: true, mostrarResultados: true, preguntas: [preguntaVacia()],
  });
  const [error, setError] = useState("");
  const setP = (i, cambios) => setF({ ...f, preguntas: f.preguntas.map((p, j) => (j === i ? { ...p, ...cambios } : p)) });

  const guardar = async (e) => {
    e.preventDefault();
    try {
      const body = { ...f, inicio: new Date(f.inicio).toISOString(), fin: new Date(f.fin).toISOString() };
      await apiIntranet(examen ? `/docente/examenes/${examen._id}` : "/docente/examenes", { method: examen ? "PUT" : "POST", body });
      onCerrar(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const total = f.preguntas.reduce((s, p) => s + Number(p.puntaje || 0), 0);

  return (
    <Modal abierto titulo={examen ? "Editar examen" : "Nuevo examen"} onCerrar={() => onCerrar(false)} ancho="max-w-3xl">
      <form onSubmit={guardar} className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Curso"><select className={inputClase} value={f.curso} onChange={(e) => setF({ ...f, curso: e.target.value })} disabled={!!examen}>{cursos.map((c) => <option key={c.id} value={c.id}>{c.nombre} — {c.aula.nombre}</option>)}</select></Campo>
          <Campo etiqueta="Título"><input className={inputClase} value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} required /></Campo>
          <Campo etiqueta="Disponible desde"><input type="datetime-local" className={inputClase} value={f.inicio} onChange={(e) => setF({ ...f, inicio: e.target.value })} required /></Campo>
          <Campo etiqueta="Hasta"><input type="datetime-local" className={inputClase} value={f.fin} onChange={(e) => setF({ ...f, fin: e.target.value })} required /></Campo>
          <Campo etiqueta="Duración (minutos)"><input type="number" min="1" max="300" className={inputClase} value={f.duracionMin} onChange={(e) => setF({ ...f, duracionMin: e.target.value })} /></Campo>
          <div className="flex flex-col gap-2 text-sm pt-5">
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.aleatorio} onChange={(e) => setF({ ...f, aleatorio: e.target.checked })} /> Mezclar el orden de las preguntas</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.mostrarResultados} onChange={(e) => setF({ ...f, mostrarResultados: e.target.checked })} /> Mostrar nota al terminar</label>
          </div>
        </div>
        <Campo etiqueta="Instrucciones"><textarea rows={2} className={inputClase} value={f.instrucciones} onChange={(e) => setF({ ...f, instrucciones: e.target.value })} /></Campo>

        <div className="flex items-center justify-between"><p className="font-semibold">Preguntas ({f.preguntas.length}) · {total} puntos</p>
          <button type="button" onClick={() => setF({ ...f, preguntas: [...f.preguntas, preguntaVacia()] })} className={botonSecundario}><Icono nombre="mas" className="w-4 h-4" /> Pregunta</button></div>
        <div className="grid gap-3 max-h-[45vh] overflow-y-auto pr-1">
          {f.preguntas.map((p, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 grid gap-2">
              <div className="flex gap-2 items-start">
                <span className="font-bold text-aduni-700 pt-2">{i + 1}.</span>
                <textarea rows={2} className={inputClase} placeholder="Enunciado" value={p.enunciado} onChange={(e) => setP(i, { enunciado: e.target.value })} required />
                <input type="number" min="0" step="0.5" title="Puntaje" className={`${inputClase} w-20`} value={p.puntaje} onChange={(e) => setP(i, { puntaje: e.target.value })} />
                <button type="button" onClick={() => setF({ ...f, preguntas: f.preguntas.filter((_, j) => j !== i) })} className="text-red-600 text-xs pt-2" disabled={f.preguntas.length === 1}>Quitar</button>
              </div>
              {p.opciones.map((o, k) => (
                <label key={k} className="flex items-center gap-2 pl-6">
                  <input type="radio" name={`c${i}`} checked={Number(p.correcta) === k} onChange={() => setP(i, { correcta: k })} title="Respuesta correcta" />
                  <span className="text-xs font-semibold text-gray-400 w-4">{String.fromCharCode(65 + k)}</span>
                  <input className={`${inputClase} py-1`} placeholder={`Opción ${String.fromCharCode(65 + k)}${k < 2 ? "" : " (opcional)"}`} value={o} onChange={(e) => setP(i, { opciones: p.opciones.map((x, z) => (z === k ? e.target.value : x)) })} />
                </label>
              ))}
              <p className="text-[11px] text-gray-400 pl-6">Marca el círculo de la respuesta correcta.</p>
            </div>
          ))}
        </div>
        <AvisoError texto={error} />
        <button className={`${botonClase} w-fit`}>Guardar (queda como borrador hasta publicar)</button>
      </form>
    </Modal>
  );
}

function Resultados({ id, onCerrar }) {
  const { data, cargando } = useApi(`/docente/examenes/${id}/resultados`);
  return (
    <Modal abierto titulo={data ? `Resultados: ${data.examen.titulo}` : "Resultados"} onCerrar={onCerrar} ancho="max-w-3xl">
      {cargando || !data ? <Cargando /> : (
        <div className="grid gap-5">
          <div>
            <p className="text-sm font-semibold mb-2">Aciertos por pregunta</p>
            {data.porPregunta.map((p, i) => {
              const pct = p.total ? Math.round((p.aciertos / p.total) * 100) : 0;
              return (
                <div key={i} className="mb-2">
                  <p className="text-xs text-gray-600 truncate">{i + 1}. {p.enunciado}</p>
                  <div className="flex items-center gap-2"><div className="h-2 flex-1 bg-gray-100 rounded-full"><div className={`h-2 rounded-full ${pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${pct}%` }} /></div><span className="text-xs w-10">{pct}%</span></div>
                </div>
              );
            })}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="text-left p-2">Estudiante</th><th className="p-2">Estado</th><th className="p-2">Puntaje</th><th className="p-2">Nivel</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.estudiantes.map((e) => (
                <tr key={e.id}>
                  <td className="p-2">{e.nombre}</td>
                  <td className="p-2 text-center"><Etiqueta color={e.estado === "enviado" ? "green" : e.estado === "en_curso" ? "amber" : "gray"}>{e.estado === "enviado" ? "Enviado" : e.estado === "en_curso" ? "En curso" : "No inició"}</Etiqueta>{e.fueraDeTiempo && <span className="text-[10px] text-red-600 block">fuera de tiempo</span>}</td>
                  <td className="p-2 text-center">{e.estado === "enviado" ? `${e.puntaje}/${e.total}` : "—"}</td>
                  <td className="p-2 text-center"><Nivel nivel={e.nivel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

export default function ExamenesDocente() {
  const { data, cargando, error, recargar } = useApi("/docente/examenes");
  const cursos = useApi("/docente/cursos");
  const [editando, setEditando] = useState(null); // null | "nuevo" | examen
  const [viendo, setViendo] = useState(null);
  const [err, setErr] = useState("");

  const publicar = async (e) => {
    try { await apiIntranet(`/docente/examenes/${e._id}/publicar`, { method: "PUT", body: { publicado: !e.publicado } }); recargar(); } catch (x) { setErr(x.message); }
  };
  const eliminar = async (e) => {
    if (!confirm(`¿Eliminar "${e.titulo}" y sus resultados?`)) return;
    await apiIntranet(`/docente/examenes/${e._id}`, { method: "DELETE" });
    recargar();
  };
  const editar = async (e) => setEditando(await apiIntranet(`/docente/examenes/${e._id}`));

  return (
    <>
      <Titulo titulo="Exámenes en línea" subtitulo="Opción múltiple con tiempo límite, corrección automática y estadísticas por pregunta">
        <button onClick={() => setEditando("nuevo")} className={botonClase}><Icono nombre="mas" className="w-4 h-4" /> Nuevo examen</button>
      </Titulo>
      <AvisoError texto={error || err} />
      {cargando ? <Cargando /> : data.length === 0 ? <Tarjeta><Vacio texto="Aún no creaste exámenes" icono="examen" /></Tarjeta> : (
        <Tarjeta>
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="text-left px-5 py-3">Examen</th><th className="px-3 py-3">Ventana</th><th className="px-3 py-3">Preguntas</th><th className="px-3 py-3">Enviados</th><th className="px-3 py-3">Estado</th><th className="px-5 py-3" /></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((e) => (
                  <tr key={e._id}>
                    <td className="px-5 py-3"><p className="font-semibold">{e.titulo}</p><p className="text-xs" style={{ color: e.curso.color }}>{e.curso.nombre} · {e.curso.aula?.nombre}</p></td>
                    <td className="px-3 py-3 text-xs text-gray-600 text-center">{fecha(e.inicio)}<br />{fecha(e.fin)}</td>
                    <td className="px-3 py-3 text-center">{e.numPreguntas}</td>
                    <td className="px-3 py-3 text-center">{e.enviados}</td>
                    <td className="px-3 py-3 text-center"><Etiqueta color={e.publicado ? "green" : "gray"}>{e.publicado ? "Publicado" : "Borrador"}</Etiqueta></td>
                    <td className="px-5 py-3 text-right whitespace-nowrap space-x-3">
                      <button onClick={() => setViendo(e._id)} className="text-aduni-700 font-semibold hover:underline">Resultados</button>
                      {e.enviados === 0 && <button onClick={() => editar(e)} className="text-gray-600 hover:underline text-xs">Editar</button>}
                      <button onClick={() => publicar(e)} className="text-gray-600 hover:underline text-xs">{e.publicado ? "Ocultar" : "Publicar"}</button>
                      <button onClick={() => eliminar(e)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tarjeta>
      )}
      {editando && cursos.data && <Editor examen={editando === "nuevo" ? null : editando} cursos={cursos.data} onCerrar={(ok) => { setEditando(null); if (ok) recargar(); }} />}
      {viendo && <Resultados id={viendo} onCerrar={() => setViendo(null)} />}
    </>
  );
}
