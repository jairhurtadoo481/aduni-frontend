"use client";

import { useState } from "react";
import { useApi } from "../../../../lib/intranet";
import { Titulo, Tarjeta, Cargando, Vacio, inputClase, botonSecundario } from "../../../../components/intranet/ui";
import { ROLES, fechaHora } from "../../../../components/intranet/Bitacora";

export default function Errores() {
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(null);
  const { data, cargando, recargar } = useApi(`/soporte/errores${busqueda ? `?q=${encodeURIComponent(busqueda)}` : ""}`);
  return (
    <>
      <Titulo titulo="Errores del sistema" subtitulo="Fallos inesperados del servidor (se guardan 60 días). Si un usuario reporta un problema, aquí ves qué pasó exactamente.">
        <button onClick={recargar} className={botonSecundario}>Actualizar</button>
      </Titulo>
      <form onSubmit={(e) => { e.preventDefault(); setBusqueda(q); }} className="flex gap-2 mb-4 max-w-md"><input className={inputClase} placeholder="Ruta o mensaje" value={q} onChange={(e) => setQ(e.target.value)} /><button className={botonSecundario}>Buscar</button></form>
      <Tarjeta>
        {cargando || !data ? <Cargando /> : data.length === 0 ? <Vacio texto="Sin errores registrados" icono="check" /> : (
          <ul className="divide-y divide-gray-100 -m-5">
            {data.map((x) => (
              <li key={x._id} className="px-5 py-3">
                <button onClick={() => setAbierto(abierto === x._id ? null : x._id)} className="w-full text-left">
                  <p className="flex flex-wrap items-center gap-2 text-sm"><span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5">{x.metodo}</span><span className="font-mono text-xs">{x.ruta}</span></p>
                  <p className="text-sm text-red-700 mt-1">{x.mensaje}</p>
                  <p className="text-xs text-gray-400">{fechaHora(x.createdAt)}{x.usuario && ` · ${x.usuario.nombre} (${x.usuario.codigo})`}{x.rol && ` · ${ROLES[x.rol] || x.rol}`}</p>
                </button>
                {abierto === x._id && x.detalle && <pre className="mt-2 text-[11px] bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{x.detalle}</pre>}
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </>
  );
}
