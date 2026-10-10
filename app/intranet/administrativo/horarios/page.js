"use client";

import { useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { useApi, DIAS } from "../../../../lib/intranet";
import HorarioSemanal from "../../../../components/intranet/HorarioSemanal";
import { Titulo, Tarjeta, Cargando, Campo, inputClase, botonClase, AvisoError } from "../../../../components/intranet/ui";

export default function HorariosAdmin() {
  const aulas = useApi("/admin/aulas");
  const [aula, setAula] = useState("");
  const aulaSel = aula || aulas.data?.[0]?._id || "";
  const horario = useApi(aulaSel ? `/admin/horarios?aula=${aulaSel}` : null);
  const cursos = useApi(aulaSel ? `/admin/cursos?aula=${aulaSel}` : null);
  const [form, setForm] = useState({ curso: "", dia: 1, horaInicio: "08:00", horaFin: "09:30" });
  const [error, setError] = useState("");

  const agregar = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiIntranet("/admin/horarios", { method: "POST", body: { ...form, curso: form.curso || cursos.data?.[0]?._id } });
      horario.recargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const quitar = async (b) => {
    if (!confirm(`¿Quitar ${b.curso.nombre} del ${DIAS[b.dia]} ${b.horaInicio}?`)) return;
    await apiIntranet(`/admin/horarios/${b._id}`, { method: "DELETE" });
    horario.recargar();
  };

  return (
    <>
      <Titulo titulo="Horarios" subtitulo="Arma el horario semanal de cada aula; se validan cruces de aula y de docente" />
      <Tarjeta className="mb-6">
        <form onSubmit={agregar} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end">
          <Campo etiqueta="Aula">
            <select className={inputClase} value={aulaSel} onChange={(e) => { setAula(e.target.value); setForm({ ...form, curso: "" }); }}>
              {aulas.data?.map((a) => <option key={a._id} value={a._id}>{a.nombre}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Curso">
            <select className={inputClase} value={form.curso || cursos.data?.[0]?._id || ""} onChange={(e) => setForm({ ...form, curso: e.target.value })}>
              {cursos.data?.map((c) => <option key={c._id} value={c._id}>{c.nombre}{c.docente ? ` (${c.docente.nombre.split(",")[0]})` : ""}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Día">
            <select className={inputClase} value={form.dia} onChange={(e) => setForm({ ...form, dia: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>{DIAS[d]}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Inicio"><input type="time" className={inputClase} value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} /></Campo>
          <Campo etiqueta="Fin"><input type="time" className={inputClase} value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })} /></Campo>
          <button className={botonClase}>Agregar bloque</button>
        </form>
        <div className="mt-3"><AvisoError texto={error} /></div>
      </Tarjeta>
      <Tarjeta titulo="Horario semanal" accion={<span className="text-xs text-gray-400">Pasa el mouse sobre un bloque para quitarlo</span>}>
        {horario.cargando ? <Cargando /> : <HorarioSemanal bloques={(horario.data || []).map((b) => ({ ...b, detalle: b.curso?.docente?.nombre }))} onEliminar={quitar} />}
      </Tarjeta>
    </>
  );
}
