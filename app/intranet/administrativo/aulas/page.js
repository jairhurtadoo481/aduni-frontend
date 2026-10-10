"use client";

import { useState } from "react";
import { apiIntranet, descargar } from "../../../../lib/api";
import { useApi } from "../../../../lib/intranet";
import Icono from "../../../../components/intranet/Icono";
import { Titulo, Tarjeta, Cargando, Modal, Campo, inputClase, botonClase, botonSecundario, AvisoError, Etiqueta, Vacio } from "../../../../components/intranet/ui";

const COLORES = ["#1b4aa0", "#c2410c", "#15803d", "#7c3aed", "#b45309", "#0e7490", "#be123c", "#4d7c0f"];

function CursosDeAula({ aula, docentes }) {
  const cursos = useApi(`/admin/cursos?aula=${aula._id}`);
  const curriculo = useApi("/admin/curriculo");
  const [form, setForm] = useState({ nombre: "", docente: "", personalizado: "", competencias: "" });
  const [error, setError] = useState("");
  const areas = curriculo.data ? Object.keys(curriculo.data[aula.nivel]) : [];
  const existentes = new Set((cursos.data || []).map((c) => c.nombre));

  const crear = async (e) => {
    e.preventDefault();
    setError("");
    const nombre = form.nombre === "otro" ? form.personalizado : form.nombre;
    try {
      await apiIntranet("/admin/cursos", {
        method: "POST",
        body: {
          aula: aula._id, nombre, docente: form.docente,
          competencias: form.nombre === "otro" ? form.competencias.split("\n").map((s) => s.trim()).filter(Boolean) : undefined,
          color: COLORES[(cursos.data?.length || 0) % COLORES.length],
        },
      });
      setForm({ nombre: "", docente: "", personalizado: "", competencias: "" });
      cursos.recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const actualizar = async (c, cambios) => {
    try {
      await apiIntranet(`/admin/cursos/${c._id}`, { method: "PUT", body: cambios });
      cursos.recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (c) => {
    if (!confirm(`¿Eliminar ${c.nombre} de ${aula.nombre}?`)) return;
    try {
      await apiIntranet(`/admin/cursos/${c._id}`, { method: "DELETE" });
      cursos.recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid gap-4">
      <AvisoError texto={error} />
      {cursos.cargando ? <Cargando /> : cursos.data.length === 0 ? <Vacio texto="Esta aula aún no tiene cursos" icono="cursos" /> : (
        <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
          {cursos.data.map((c) => (
            <li key={c._id} className="p-3 flex flex-wrap items-center gap-3">
              <input type="color" value={c.color} onChange={(e) => actualizar(c, { color: e.target.value })} className="w-7 h-7 rounded cursor-pointer" title="Color en el horario" />
              <div className="flex-1 min-w-40">
                <p className="font-semibold text-sm">{c.nombre}</p>
                <p className="text-xs text-gray-500">{c.competencias.length} competencias</p>
              </div>
              <select value={c.docente?._id || ""} onChange={(e) => actualizar(c, { docente: e.target.value })} className="border border-gray-300 rounded-md text-sm px-2 py-1">
                <option value="">Sin docente</option>
                {docentes.map((d) => <option key={d._id} value={d._id}>{d.nombre}</option>)}
              </select>
              <button onClick={() => eliminar(c)} className="text-xs text-red-600 hover:underline">Eliminar</button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={crear} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end bg-gray-50 rounded-lg p-3">
        <Campo etiqueta="Área curricular (CNEB)">
          <select className={inputClase} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required>
            <option value="">Elegir...</option>
            {areas.filter((a) => !existentes.has(a)).map((a) => <option key={a} value={a}>{a}</option>)}
            <option value="otro">Otro curso (taller, razonamiento...)</option>
          </select>
        </Campo>
        <Campo etiqueta="Docente">
          <select className={inputClase} value={form.docente} onChange={(e) => setForm({ ...form, docente: e.target.value })}>
            <option value="">Sin asignar</option>
            {docentes.map((d) => <option key={d._id} value={d._id}>{d.nombre}</option>)}
          </select>
        </Campo>
        <button className={botonClase}><Icono nombre="mas" className="w-4 h-4" />Agregar</button>
        {form.nombre === "otro" && (
          <>
            <Campo etiqueta="Nombre del curso"><input className={inputClase} value={form.personalizado} onChange={(e) => setForm({ ...form, personalizado: e.target.value })} required /></Campo>
            <Campo etiqueta="Competencias (una por línea)"><textarea rows={3} className={inputClase} value={form.competencias} onChange={(e) => setForm({ ...form, competencias: e.target.value })} required /></Campo>
          </>
        )}
      </form>
      <p className="text-xs text-gray-400">Al elegir un área del CNEB se cargan automáticamente sus competencias oficiales.</p>
    </div>
  );
}

export default function AulasAdmin() {
  const aulas = useApi("/admin/aulas");
  const docentes = useApi("/admin/usuarios?rol=profesor");
  const [nueva, setNueva] = useState(false);
  const [form, setForm] = useState({ nivel: "secundaria", grado: 1, seccion: "A", turno: "mañana", tutor: "" });
  const [error, setError] = useState("");
  const [abierta, setAbierta] = useState(null);

  const crear = async (e) => {
    e.preventDefault();
    try {
      await apiIntranet("/admin/aulas", { method: "POST", body: form });
      setNueva(false);
      aulas.recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const abrirDoc = (ruta, nombre, abrir) => descargar(ruta, nombre, { abrir }).catch((e) => setError(e.message));

  const cambiarTutor = async (a, tutor) => {
    await apiIntranet(`/admin/aulas/${a._id}`, { method: "PUT", body: { tutor } });
    aulas.recargar();
  };

  return (
    <>
      <Titulo titulo="Aulas y cursos" subtitulo="Grados y secciones del año, tutores y áreas curriculares">
        <button onClick={() => { setNueva(true); setError(""); }} className={botonClase}><Icono nombre="mas" className="w-4 h-4" /> Nueva aula</button>
      </Titulo>
      {aulas.cargando ? <Cargando /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {aulas.data.map((a) => (
            <Tarjeta key={a._id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-aduni-700 uppercase">{a.nivel} · turno {a.turno}</p>
                  <p className="text-xl font-bold">{a.grado}.° {a.seccion}</p>
                </div>
                <Etiqueta color={a.estudiantes >= a.capacidad ? "red" : "blue"}>{a.estudiantes}/{a.capacidad} estudiantes</Etiqueta>
              </div>
              <Campo etiqueta="Tutor(a)">
                <select className={`${inputClase} mt-1`} value={a.tutor?._id || ""} onChange={(e) => cambiarTutor(a, e.target.value)}>
                  <option value="">Sin tutor</option>
                  {docentes.data?.map((d) => <option key={d._id} value={d._id}>{d.nombre}</option>)}
                </select>
              </Campo>
              <button onClick={() => setAbierta(a)} className={`${botonSecundario} w-full mt-4`}><Icono nombre="cursos" className="w-4 h-4" /> Cursos ({a.cursos})</button>
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                <button onClick={() => abrirDoc(`/admin/aulas/${a._id}/libretas.pdf`, "libretas.pdf", true)} className="border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50">Libretas PDF</button>
                <button onClick={() => abrirDoc(`/admin/carnes.pdf?aula=${a._id}`, "carnes.pdf", true)} className="border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50">Carnés PDF</button>
                <button onClick={() => { const p = prompt("¿Notas de qué bimestre? (1-4)", "1"); if (p) abrirDoc(`/admin/aulas/${a._id}/notas.xlsx?periodo=${p}`, `notas-${a.grado}${a.seccion}-B${p}.xlsx`, false); }} className="border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50">Notas Excel</button>
              </div>
            </Tarjeta>
          ))}
        </div>
      )}

      <Modal abierto={nueva} titulo="Nueva aula" onCerrar={() => setNueva(false)}>
        <form onSubmit={crear} className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Nivel"><select className={inputClase} value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value, grado: 1 })}><option value="primaria">Primaria</option><option value="secundaria">Secundaria</option></select></Campo>
          <Campo etiqueta="Grado"><select className={inputClase} value={form.grado} onChange={(e) => setForm({ ...form, grado: Number(e.target.value) })}>{Array.from({ length: form.nivel === "primaria" ? 6 : 5 }).map((_, i) => <option key={i} value={i + 1}>{i + 1}.°</option>)}</select></Campo>
          <Campo etiqueta="Sección"><input className={inputClase} maxLength={2} value={form.seccion} onChange={(e) => setForm({ ...form, seccion: e.target.value.toUpperCase() })} required /></Campo>
          <Campo etiqueta="Turno"><select className={inputClase} value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value })}><option value="mañana">Mañana</option><option value="tarde">Tarde</option></select></Campo>
          <Campo etiqueta="Tutor(a)"><select className={inputClase} value={form.tutor} onChange={(e) => setForm({ ...form, tutor: e.target.value })}><option value="">Sin tutor</option>{docentes.data?.map((d) => <option key={d._id} value={d._id}>{d.nombre}</option>)}</select></Campo>
          <div className="sm:col-span-2 grid gap-2"><AvisoError texto={error} /><button className={`${botonClase} w-fit`}>Crear aula</button></div>
        </form>
      </Modal>

      <Modal abierto={!!abierta} titulo={`Cursos de ${abierta?.nombre || ""}`} onCerrar={() => { setAbierta(null); aulas.recargar(); }} ancho="max-w-3xl">
        {abierta && <CursosDeAula aula={abierta} docentes={docentes.data || []} />}
      </Modal>
    </>
  );
}
