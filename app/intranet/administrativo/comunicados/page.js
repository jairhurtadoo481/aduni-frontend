"use client";

import { useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { useApi } from "../../../../lib/intranet";
import ListaComunicados from "../../../../components/intranet/ListaComunicados";
import Agenda from "../../../../components/intranet/Agenda";
import { Titulo, Tarjeta, Campo, inputClase, botonClase, AvisoError } from "../../../../components/intranet/ui";

export default function ComunicadosAdmin() {
  const aulas = useApi("/admin/aulas");
  const [c, setC] = useState({ titulo: "", contenido: "", destinatarios: "todos", aula: "", importante: false });
  const [ev, setEv] = useState({ titulo: "", fecha: "", tipo: "actividad" });
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");

  const publicar = async (e) => {
    e.preventDefault();
    try {
      await apiIntranet("/admin/comunicados", { method: "POST", body: c });
      setC({ titulo: "", contenido: "", destinatarios: "todos", aula: "", importante: false });
      setVersion(version + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const agendar = async (e) => {
    e.preventDefault();
    try {
      await apiIntranet("/admin/eventos", { method: "POST", body: ev });
      setEv({ titulo: "", fecha: "", tipo: "actividad" });
      setVersion(version + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Titulo titulo="Comunicados y agenda" subtitulo="Publica avisos para estudiantes, docentes o un aula específica" />
      <AvisoError texto={error} />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] mt-2">
        <div className="grid gap-6 content-start">
          <Tarjeta titulo="Nuevo comunicado">
            <form onSubmit={publicar} className="grid gap-3">
              <Campo etiqueta="Título"><input className={inputClase} value={c.titulo} onChange={(e) => setC({ ...c, titulo: e.target.value })} required /></Campo>
              <Campo etiqueta="Contenido"><textarea rows={4} className={inputClase} value={c.contenido} onChange={(e) => setC({ ...c, contenido: e.target.value })} required /></Campo>
              <div className="grid gap-3 sm:grid-cols-3">
                <Campo etiqueta="Dirigido a"><select className={inputClase} value={c.destinatarios} onChange={(e) => setC({ ...c, destinatarios: e.target.value })}><option value="todos">Todos</option><option value="estudiante">Estudiantes y familias</option><option value="profesor">Docentes</option></select></Campo>
                <Campo etiqueta="Solo un aula (opcional)"><select className={inputClase} value={c.aula} onChange={(e) => setC({ ...c, aula: e.target.value })}><option value="">Todas</option>{aulas.data?.map((a) => <option key={a._id} value={a._id}>{a.nombre}</option>)}</select></Campo>
                <label className="flex items-center gap-2 text-sm mt-5"><input type="checkbox" checked={c.importante} onChange={(e) => setC({ ...c, importante: e.target.checked })} /> Marcar como importante</label>
              </div>
              <button className={`${botonClase} w-fit`}>Publicar</button>
            </form>
          </Tarjeta>
          <ListaComunicados puedeBorrar version={version} titulo="Publicados" />
        </div>
        <div className="grid gap-6 content-start">
          <Tarjeta titulo="Agregar a la agenda">
            <form onSubmit={agendar} className="grid gap-3">
              <Campo etiqueta="Evento"><input className={inputClase} value={ev.titulo} onChange={(e) => setEv({ ...ev, titulo: e.target.value })} required /></Campo>
              <Campo etiqueta="Fecha"><input type="date" className={inputClase} value={ev.fecha} onChange={(e) => setEv({ ...ev, fecha: e.target.value })} required /></Campo>
              <Campo etiqueta="Tipo"><select className={inputClase} value={ev.tipo} onChange={(e) => setEv({ ...ev, tipo: e.target.value })}><option value="actividad">Actividad</option><option value="academico">Académico</option><option value="examen">Evaluación</option><option value="reunion">Reunión</option><option value="feriado">Feriado (sin clases)</option></select></Campo>
              <button className={`${botonClase} w-fit`}>Agregar</button>
            </form>
          </Tarjeta>
          <Agenda puedeBorrar version={version} />
        </div>
      </div>
    </>
  );
}
