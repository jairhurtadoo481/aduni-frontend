"use client";

import { useState } from "react";
import { apiIntranet, descargar } from "../../../../lib/api";
import { useApi } from "../../../../lib/intranet";
import { Titulo, Tarjeta, Cargando, Campo, inputClase, botonClase, AvisoError, Exito } from "../../../../components/intranet/ui";

function Formulario({ inicial }) {
  const [c, setC] = useState(inicial);
  const [msg, setMsg] = useState({ ok: "", error: "" });
  const setPeriodo = (i, k, v) => setC({ ...c, periodos: c.periodos.map((p, j) => (j === i ? { ...p, [k]: v } : p)) });

  const guardar = async (e) => {
    e.preventDefault();
    try {
      await apiIntranet("/admin/configuracion", { method: "PUT", body: c });
      setMsg({ ok: "Configuración guardada", error: "" });
    } catch (err) {
      setMsg({ ok: "", error: err.message });
    }
  };

  return (
    <form onSubmit={guardar} className="grid gap-6 lg:grid-cols-2">
      <Tarjeta titulo={`Periodos de evaluación ${c.anio}`}>
        <div className="grid gap-3">
          {c.periodos.map((p, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr] gap-2 items-end">
              <Campo etiqueta="Nombre"><input className={inputClase} value={p.nombre} onChange={(e) => setPeriodo(i, "nombre", e.target.value)} /></Campo>
              <Campo etiqueta="Inicio"><input type="date" className={inputClase} value={p.inicio} onChange={(e) => setPeriodo(i, "inicio", e.target.value)} /></Campo>
              <Campo etiqueta="Fin"><input type="date" className={inputClase} value={p.fin} onChange={(e) => setPeriodo(i, "fin", e.target.value)} /></Campo>
            </div>
          ))}
        </div>
      </Tarjeta>
      <div className="grid gap-6 content-start">
        <Tarjeta titulo="Asistencia">
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Ingreso del personal con QR (después es tardanza)"><input type="time" className={inputClase} value={c.horaIngresoPersonal || "07:30"} onChange={(e) => setC({ ...c, horaIngresoPersonal: e.target.value })} /></Campo>
            <div />
            <Campo etiqueta="El docente puede pasar lista desde (min antes de su clase)"><input type="number" min="0" max="180" className={inputClase} value={c.margenAsistenciaAntes ?? 10} onChange={(e) => setC({ ...c, margenAsistenciaAntes: e.target.value })} /></Campo>
            <Campo etiqueta="…hasta (min después de terminar su clase)"><input type="number" min="0" max="180" className={inputClase} value={c.margenAsistenciaDespues ?? 30} onChange={(e) => setC({ ...c, margenAsistenciaDespues: e.target.value })} /></Campo>
          </div>
          <p className="text-xs text-gray-400 mt-2">Fuera de ese rango la lista se bloquea; solo el auxiliar puede corregir (queda en la bitácora).</p>
        </Tarjeta>
        <Tarjeta titulo="Cuentas de estudiantes">
          <Campo etiqueta="En primaria, los alumnos tienen cuenta propia desde">
            <select className={inputClase} value={c.gradoMinimoCuentaPrimaria ?? 5} onChange={(e) => setC({ ...c, gradoMinimoCuentaPrimaria: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>{g}.° de primaria</option>)}
              <option value={7}>Solo secundaria</option>
            </select>
          </Campo>
          <p className="text-xs text-gray-400 mt-2">Los grados menores no inician sesión: su información y sus tareas las maneja la familia desde el Portal de familias.</p>
        </Tarjeta>
        <Tarjeta titulo="Pensiones">
          <div className="grid gap-3 sm:grid-cols-3">
            <Campo etiqueta="Matrícula (S/)"><input type="number" min="0" className={inputClase} value={c.montoMatricula} onChange={(e) => setC({ ...c, montoMatricula: e.target.value })} /></Campo>
            <Campo etiqueta="Pensión mensual (S/)"><input type="number" min="0" className={inputClase} value={c.montoPension} onChange={(e) => setC({ ...c, montoPension: e.target.value })} /></Campo>
            <Campo etiqueta="Día de vencimiento"><input type="number" min="1" max="31" className={inputClase} value={c.diaVencimiento} onChange={(e) => setC({ ...c, diaVencimiento: e.target.value })} /></Campo>
          </div>
          <p className="text-xs text-gray-400 mt-2">Los montos se aplican a los cronogramas que se generen desde ahora.</p>
        </Tarjeta>
        <AvisoError texto={msg.error} /><Exito texto={msg.ok} />
        <button className={`${botonClase} w-fit`}>Guardar configuración</button>
        <Tarjeta titulo="Copia de seguridad">
          <p className="text-sm text-gray-600 mb-3">Descarga un respaldo completo de la base de datos (estudiantes, notas, asistencia, pagos...). Guárdalo en un lugar seguro: contiene datos personales.</p>
          <button type="button" onClick={() => descargar("/admin/respaldo", `respaldo-aduni-${new Date().toISOString().slice(0, 10)}.zip`).catch((e) => setMsg({ ok: "", error: e.message }))} className={botonClase}>Descargar respaldo (.zip)</button>
          <p className="text-xs text-gray-400 mt-2">También puedes programar un respaldo diario automático en el servidor con <code>node scripts/respaldo.js</code>.</p>
        </Tarjeta>
      </div>
    </form>
  );
}

export default function ConfiguracionAdmin() {
  const { data, cargando, error } = useApi("/admin/configuracion");
  return (
    <>
      <Titulo titulo="Año académico" subtitulo="Bimestres, horario de ingreso y montos de pensión" />
      <AvisoError texto={error} />
      {cargando ? <Cargando /> : data && <Formulario inicial={data} />}
    </>
  );
}
