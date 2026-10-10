"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiIntranet } from "../../../../lib/api";
import { useApi } from "../../../../lib/intranet";
import { Titulo, Tarjeta, Cargando, Vacio, Etiqueta, Pestanas, AvisoError, inputClase, botonSecundario } from "../../../../components/intranet/ui";
import { HiloTicket, CATEGORIAS, ESTADOS, PRIORIDADES, fechaHora } from "../../../../components/intranet/Ayuda";
import { ROLES } from "../../../../components/intranet/Bitacora";

function Contenido() {
  const idUrl = useSearchParams().get("id");
  const [estado, setEstado] = useState("pendientes");
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(idUrl);
  const [error, setError] = useState("");
  const { data, cargando, recargar } = useApi(`/soporte/tickets?estado=${estado}${busqueda ? `&q=${encodeURIComponent(busqueda)}` : ""}`);
  const t = data?.find((x) => x._id === abierto);

  const cambiar = async (cambios) => {
    try {
      await apiIntranet(`/soporte/tickets/${t._id}`, { method: "PUT", body: cambios });
      setError("");
      recargar();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <Titulo titulo="Mesa de ayuda" subtitulo="Solicitudes de estudiantes, familias, docentes y personal. Al responder, el usuario recibe una notificación." />
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <Pestanas valor={estado} onChange={setEstado} opciones={[["pendientes", "Pendientes"], ["resuelto", "Resueltas"], ["cerrado", "Cerradas"], ["todas", "Todas"]]} />
        <form onSubmit={(e) => { e.preventDefault(); setBusqueda(q); }} className="flex gap-2"><input className={inputClase} placeholder="Código o asunto" value={q} onChange={(e) => setQ(e.target.value)} /><button className={botonSecundario}>Buscar</button></form>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <Tarjeta>
          {cargando || !data ? <Cargando /> : data.length === 0 ? <Vacio texto="No hay solicitudes" icono="soporte" /> : (
            <ul className="divide-y divide-gray-100 -m-5">
              {data.map((x) => (
                <li key={x._id}>
                  <button onClick={() => setAbierto(x._id)} className={`w-full text-left px-5 py-3 hover:bg-gray-50 ${abierto === x._id ? "bg-aduni-100/40" : ""}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{x.asunto}</p>
                      <Etiqueta color={ESTADOS[x.estado][1]}>{ESTADOS[x.estado][0]}</Etiqueta>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{x.usuario?.nombre} · {ROLES[x.rol] || x.rol}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                      {x.codigo} · {fechaHora(x.updatedAt)}
                      {["alta", "urgente"].includes(x.prioridad) && <Etiqueta color={PRIORIDADES[x.prioridad][1]}>{PRIORIDADES[x.prioridad][0]}</Etiqueta>}
                      {!x.mensajes[x.mensajes.length - 1]?.esSoporte && x.estado !== "cerrado" && <span className="text-aduni-700 font-semibold">Esperando respuesta</span>}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
        {t ? (
          <Tarjeta titulo={`${t.codigo} · ${t.asunto}`}>
            <div className="grid gap-3 sm:grid-cols-3 text-sm mb-4">
              <div><p className="text-xs text-gray-500">Usuario</p><p className="font-medium">{t.usuario?.nombre}</p><p className="text-xs text-gray-400">{t.usuario?.codigo} · {ROLES[t.rol] || t.rol}</p></div>
              <div><p className="text-xs text-gray-500">Tema</p><p>{CATEGORIAS[t.categoria]}</p>{t.pagina && <p className="text-xs text-gray-400 truncate">Desde: {t.pagina}</p>}</div>
              <div><p className="text-xs text-gray-500">Atiende</p><p>{t.asignado?.nombre || "Sin asignar"}</p>{!t.asignado && <button onClick={() => cambiar({ asignarme: true })} className="text-xs text-aduni-700 hover:underline">Asignármela</button>}</div>
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              <label className="text-xs text-gray-500">Estado
                <select className={`${inputClase} mt-1`} value={t.estado} onChange={(e) => cambiar({ estado: e.target.value })}>{Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select>
              </label>
              <label className="text-xs text-gray-500">Prioridad
                <select className={`${inputClase} mt-1`} value={t.prioridad} onChange={(e) => cambiar({ prioridad: e.target.value })}>{Object.entries(PRIORIDADES).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select>
              </label>
            </div>
            <AvisoError texto={error} />
            <HiloTicket soporte ticket={t} ruta={`/soporte/tickets/${t._id}/responder`} onRespondido={recargar} />
          </Tarjeta>
        ) : (
          <Tarjeta><Vacio texto="Elige una solicitud para atenderla" icono="mensajes" /></Tarjeta>
        )}
      </div>
    </>
  );
}

export default function MesaDeAyuda() {
  return <Suspense fallback={<Cargando />}><Contenido /></Suspense>;
}
