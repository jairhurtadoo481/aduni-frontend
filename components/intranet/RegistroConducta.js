"use client";

import { useState } from "react";
import { apiIntranet } from "../../lib/api";
import { useApi, fechaCorta, hoyLima } from "../../lib/intranet";
import { Tarjeta, Cargando, Vacio, Etiqueta, Campo, inputClase, botonClase, AvisoError, Exito } from "./ui";

const TIPO = { merito: ["Mérito", "green"], demerito: ["Demérito", "red"], incidencia: ["Incidencia", "amber"] };
const CATEGORIAS = ["Participación", "Responsabilidad", "Solidaridad", "Puntualidad", "Uniforme", "Convivencia", "Respeto", "Cumplimiento de tareas", "Otro"];

// Registro de méritos/deméritos/incidencias. `rutaLista` y `rutaAulas` varían entre docente y administración.
export default function RegistroConducta({ rutaLista, aulas, rutaEstudiantes = (a) => `/docente/asistencia?aula=${a}` }) {
  const [aula, setAula] = useState("");
  const sel = aula || aulas?.[0]?._id || "";
  const lista = useApi(`${rutaLista}${sel ? `?aula=${sel}` : ""}`);
  const estudiantes = useApi(sel ? rutaEstudiantes(sel) : null);
  const [f, setF] = useState({ estudiante: "", tipo: "merito", categoria: "Participación", descripcion: "", fecha: hoyLima() });
  const [msg, setMsg] = useState({ ok: "", error: "" });
  const est = Array.isArray(estudiantes.data) ? estudiantes.data : estudiantes.data?.estudiantes;

  const guardar = async (e) => {
    e.preventDefault();
    try {
      await apiIntranet("/docente/incidencias", { method: "POST", body: { ...f, estudiante: f.estudiante || est?.[0]?.id } });
      setMsg({ ok: "Registrado. La familia recibió el aviso.", error: "" });
      setF({ ...f, descripcion: "" });
      lista.recargar();
    } catch (err) {
      setMsg({ ok: "", error: err.message });
    }
  };

  const eliminar = async (i) => {
    if (!confirm("¿Eliminar este registro?")) return;
    await apiIntranet(`/docente/incidencias/${i._id}`, { method: "DELETE" }).catch((e) => setMsg({ ok: "", error: e.message }));
    lista.recargar();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Tarjeta titulo="Nuevo registro">
        <form onSubmit={guardar} className="grid gap-3">
          <Campo etiqueta="Aula"><select className={inputClase} value={sel} onChange={(e) => { setAula(e.target.value); setF({ ...f, estudiante: "" }); }}>{aulas?.map((a) => <option key={a._id} value={a._id}>{a.nombre}</option>)}</select></Campo>
          <Campo etiqueta="Estudiante">
            <select className={inputClase} value={f.estudiante || est?.[0]?.id || ""} onChange={(e) => setF({ ...f, estudiante: e.target.value })}>
              {est?.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
            </select>
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Tipo"><select className={inputClase} value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>{Object.entries(TIPO).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select></Campo>
            <Campo etiqueta="Fecha"><input type="date" max={hoyLima()} className={inputClase} value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></Campo>
          </div>
          <Campo etiqueta="Categoría"><select className={inputClase} value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })}>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</select></Campo>
          <Campo etiqueta="Descripción"><textarea rows={3} className={inputClase} value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} required /></Campo>
          <AvisoError texto={msg.error} /><Exito texto={msg.ok} />
          <button className={`${botonClase} w-fit`}>Registrar y avisar a la familia</button>
        </form>
      </Tarjeta>
      <Tarjeta titulo="Registros recientes">
        {lista.cargando ? <Cargando /> : !lista.data?.length ? <Vacio texto="Sin registros" icono="conducta" /> : (
          <ul className="divide-y divide-gray-100 -my-3">
            {lista.data.map((i) => (
              <li key={i._id} className="py-3 flex items-start gap-3">
                <Etiqueta color={TIPO[i.tipo][1]}>{TIPO[i.tipo][0]}</Etiqueta>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{i.estudiante?.nombre}</p>
                  <p className="text-sm text-gray-600">{i.categoria && <strong>{i.categoria}: </strong>}{i.descripcion}</p>
                  <p className="text-xs text-gray-400">{fechaCorta(i.fecha)} · {i.registradoPor?.nombre}</p>
                </div>
                <button onClick={() => eliminar(i)} className="text-xs text-red-600 hover:underline">Eliminar</button>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
