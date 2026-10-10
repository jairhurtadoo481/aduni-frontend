"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiIntranet } from "../../lib/api";
import { useApi, iniciales } from "../../lib/intranet";
import { usePortal } from "./PortalLayout";
import SubirArchivo from "./SubirArchivo";
import Icono from "./Icono";
import { Titulo, Cargando, inputClase, Etiqueta } from "./ui";

const ROL = { estudiante: "Estudiante", apoderado: "Familia", profesor: "Docente", administrativo: "Administración" };

function Hilo({ id, onEnviado }) {
  const { usuario: yo } = usePortal();
  const { data, cargando, recargar } = useApi(`/mensajes/${id}`);
  const [texto, setTexto] = useState("");
  const [adjunto, setAdjunto] = useState(null);
  const [error, setError] = useState("");
  const fin = useRef(null);

  useEffect(() => {
    const t = setInterval(recargar, 15000);
    return () => clearInterval(t);
  }, [recargar]);
  useEffect(() => { fin.current?.scrollIntoView({ block: "end" }); }, [data]);

  const enviar = async (e) => {
    e.preventDefault();
    if (!texto.trim() && !adjunto) return;
    try {
      await apiIntranet("/mensajes", { method: "POST", body: { para: id, texto, adjunto } });
      setTexto("");
      setAdjunto(null);
      setError("");
      recargar();
      onEnviado();
    } catch (err) {
      setError(err.message);
    }
  };

  if (cargando || !data) return <Cargando />;
  return (
    <div className="flex flex-col h-[65vh]">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-aduni-100 text-aduni-900 font-bold text-sm flex items-center justify-center">{iniciales(data.usuario?.nombre)}</div>
        <div>
          <p className="font-semibold text-sm">{data.usuario?.nombre}</p>
          <p className="text-xs text-gray-500">{ROL[data.usuario?.rol]} {data.usuario?.especialidad || data.usuario?.cargo ? `· ${data.usuario.especialidad || data.usuario.cargo}` : ""}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {data.mensajes.length === 0 && <p className="text-center text-sm text-gray-400 mt-10">Escribe el primer mensaje</p>}
        {data.mensajes.map((m) => {
          const mio = String(m.de) === String(yo.id);
          return (
            <div key={m._id} className={`flex ${mio ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mio ? "bg-aduni-700 text-white rounded-br-sm" : "bg-white border border-gray-200 rounded-bl-sm"}`}>
                <p className="whitespace-pre-line break-words">{m.texto}</p>
                {m.adjunto?.url && <a href={m.adjunto.url} target="_blank" rel="noreferrer" className={`text-xs underline flex items-center gap-1 mt-1 ${mio ? "text-blue-100" : "text-aduni-700"}`}><Icono nombre="clip" className="w-3 h-3" />{m.adjunto.nombre || "Archivo"}</a>}
                <p className={`text-[10px] mt-1 ${mio ? "text-blue-200" : "text-gray-400"}`}>{new Date(m.createdAt).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}{mio && m.leido && " · visto"}</p>
              </div>
            </div>
          );
        })}
        <div ref={fin} />
      </div>
      <form onSubmit={enviar} className="p-3 border-t border-gray-100 flex items-end gap-2">
        <div className="flex-1">
          {adjunto && <p className="text-xs text-gray-500 mb-1">Adjunto: {adjunto.nombre} <button type="button" onClick={() => setAdjunto(null)} className="text-red-600">quitar</button></p>}
          <textarea rows={2} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe un mensaje..." className={inputClase}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(e); } }} />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <SubirArchivo carpeta="mensajes" texto="" onSubido={setAdjunto} />
        <button className="bg-aduni-700 text-white rounded-lg p-2.5 hover:bg-aduni-900" aria-label="Enviar"><Icono nombre="enviar" /></button>
      </form>
    </div>
  );
}

function Bandeja() {
  const params = useSearchParams();
  const [abierto, setAbierto] = useState(params.get("con") || null);
  const [nuevo, setNuevo] = useState(false);
  const [q, setQ] = useState("");
  const convs = useApi("/mensajes");
  const contactos = useApi(nuevo ? `/mensajes/contactos${q ? `?q=${encodeURIComponent(q)}` : ""}` : null);

  return (
    <>
      <Titulo titulo="Mensajes" subtitulo="Comunicación directa entre familias, estudiantes, docentes y administración" />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm grid md:grid-cols-[320px_1fr] overflow-hidden">
        <div className={`border-r border-gray-100 ${abierto ? "hidden md:block" : ""}`}>
          <div className="p-3 border-b border-gray-100 flex gap-2">
            <button onClick={() => setNuevo(!nuevo)} className="flex-1 bg-aduni-700 text-white text-sm font-semibold rounded-lg py-2 hover:bg-aduni-900">{nuevo ? "Ver conversaciones" : "Nuevo mensaje"}</button>
          </div>
          {nuevo ? (
            <div>
              <div className="p-3"><input className={inputClase} placeholder="Buscar persona..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
              <ul className="max-h-[55vh] overflow-y-auto divide-y divide-gray-100">
                {contactos.cargando && <li className="p-4"><Cargando /></li>}
                {contactos.data?.map((c) => (
                  <li key={c._id}>
                    <button onClick={() => { setAbierto(c._id); setNuevo(false); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50">
                      <p className="text-sm font-medium">{c.nombre}</p>
                      <p className="text-xs text-gray-500">{ROL[c.rol]}{c.especialidad ? ` · ${c.especialidad}` : ""}{c.cargo ? ` · ${c.cargo}` : ""}{c.aula ? ` · ${c.aula.nombre}` : ""}{c.hijos?.length ? ` · ${c.hijos.map((h) => h.nombre.split(",")[1]).join(", ")}` : ""}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
              {convs.data?.length === 0 && <li className="p-6 text-sm text-gray-400 text-center">Aún no tienes conversaciones</li>}
              {convs.data?.map((c) => (
                <li key={c.usuario._id}>
                  <button onClick={() => setAbierto(c.usuario._id)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3 ${abierto === c.usuario._id ? "bg-aduni-100/50" : ""}`}>
                    <div className="w-9 h-9 rounded-full bg-aduni-100 text-aduni-900 font-bold text-xs flex items-center justify-center shrink-0">{iniciales(c.usuario.nombre)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <p className="text-sm font-medium truncate">{c.usuario.nombre}</p>
                        {c.sinLeer > 0 && <Etiqueta color="blue">{c.sinLeer}</Etiqueta>}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{c.ultimo.texto}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={abierto ? "" : "hidden md:flex items-center justify-center text-gray-400 text-sm min-h-[50vh]"}>
          {abierto ? (
            <>
              <button onClick={() => setAbierto(null)} className="md:hidden text-sm text-aduni-700 px-4 pt-3">← Conversaciones</button>
              <Hilo key={abierto} id={abierto} onEnviado={convs.recargar} />
            </>
          ) : "Elige una conversación o inicia una nueva"}
        </div>
      </div>
    </>
  );
}

export default function Mensajeria() {
  return <Suspense fallback={<Cargando />}><Bandeja /></Suspense>;
}
