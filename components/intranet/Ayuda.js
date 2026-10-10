"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiIntranet } from "../../lib/api";
import { useApi } from "../../lib/intranet";
import SubirArchivo from "./SubirArchivo";
import { Titulo, Tarjeta, Cargando, Vacio, Etiqueta, Campo, AvisoError, Exito, inputClase, botonClase, botonSecundario } from "./ui";

export const CATEGORIAS = {
  acceso: "No puedo ingresar / contraseña", notas: "Notas y libretas", asistencia: "Asistencia", pagos: "Pagos y comprobantes",
  tareas: "Tareas, aula virtual y exámenes", error: "Algo no funciona (error)", sugerencia: "Sugerencia de mejora", otro: "Otro",
};
export const ESTADOS = { abierto: ["Abierto", "amber"], en_proceso: ["En proceso", "blue"], resuelto: ["Resuelto", "green"], cerrado: ["Cerrado", "gray"] };
export const PRIORIDADES = { baja: ["Baja", "gray"], media: ["Media", "blue"], alta: ["Alta", "amber"], urgente: ["Urgente", "red"] };
export const fechaHora = (d) => new Date(d).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });

// Conversación de una solicitud. `ruta` es el endpoint para responder.
export function HiloTicket({ ticket, ruta, onRespondido, soporte = false }) {
  const [texto, setTexto] = useState("");
  const [adjunto, setAdjunto] = useState(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (resolver = false) => {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      await apiIntranet(ruta, { method: "POST", body: { texto, adjunto, resolver } });
      setTexto("");
      setAdjunto(null);
      setError("");
      onRespondido();
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="grid gap-4">
      <ul className="grid gap-3">
        {ticket.mensajes.map((m) => (
          <li key={m._id} className={`rounded-xl px-4 py-3 text-sm max-w-[90%] ${m.esSoporte ? "bg-aduni-100/60 border border-aduni-100 justify-self-start" : "bg-gray-100 justify-self-end"}`}>
            <p className="text-xs font-semibold text-gray-500 mb-1">{m.esSoporte ? "Soporte técnico" : m.de?.nombre || "Usuario"} · {fechaHora(m.fecha)}</p>
            <p className="whitespace-pre-wrap">{m.texto}</p>
            {m.adjunto?.url && <a href={m.adjunto.url} target="_blank" rel="noreferrer" className="text-xs text-aduni-700 underline mt-1 inline-block">{m.adjunto.nombre || "Archivo adjunto"}</a>}
          </li>
        ))}
      </ul>
      {ticket.estado === "cerrado" && !soporte ? (
        <p className="text-sm text-gray-500">Esta solicitud está cerrada. Si el problema continúa, crea una nueva.</p>
      ) : (
        <div className="grid gap-2">
          <textarea className={inputClase} rows={3} placeholder={soporte ? "Respuesta para el usuario" : "Escribe un mensaje para soporte"} value={texto} onChange={(e) => setTexto(e.target.value)} />
          <div className="flex flex-wrap items-center gap-2">
            <SubirArchivo carpeta="soporte" texto={adjunto ? adjunto.nombre : "Adjuntar captura"} onSubido={setAdjunto} />
            <button disabled={enviando || !texto.trim()} onClick={() => enviar(false)} className={botonClase}>Enviar</button>
            {soporte && <button disabled={enviando || !texto.trim()} onClick={() => enviar(true)} className={botonSecundario}>Enviar y marcar resuelto</button>}
          </div>
          <AvisoError texto={error} />
        </div>
      )}
    </div>
  );
}

function NuevaSolicitud({ onCreada, onCancelar }) {
  const [f, setF] = useState({ asunto: "", categoria: "otro", mensaje: "" });
  const [adjunto, setAdjunto] = useState(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const t = await apiIntranet("/ayuda/tickets", { method: "POST", body: { ...f, adjunto, pagina: document.referrer ? new URL(document.referrer).pathname : "" } });
      onCreada(t);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tarjeta titulo="Nueva solicitud">
      <form onSubmit={enviar} className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Tema"><select className={inputClase} value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })}>{Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Campo>
          <Campo etiqueta="Asunto"><input className={inputClase} maxLength={150} required value={f.asunto} onChange={(e) => setF({ ...f, asunto: e.target.value })} placeholder="Ej.: No puedo subir mi tarea" /></Campo>
        </div>
        <Campo etiqueta="Describe el problema"><textarea className={inputClase} rows={5} required maxLength={3000} value={f.mensaje} onChange={(e) => setF({ ...f, mensaje: e.target.value })} placeholder="Qué intentabas hacer, en qué sección y qué mensaje apareció." /></Campo>
        <div className="flex flex-wrap items-center gap-2">
          <SubirArchivo carpeta="soporte" texto={adjunto ? adjunto.nombre : "Adjuntar captura de pantalla"} accept="image/*,.pdf" onSubido={setAdjunto} />
          <button disabled={enviando} className={botonClase}>{enviando ? "Enviando..." : "Enviar a soporte"}</button>
          <button type="button" onClick={onCancelar} className={botonSecundario}>Cancelar</button>
        </div>
        <AvisoError texto={error} />
        <p className="text-xs text-gray-400">Nunca compartas tu contraseña: soporte técnico no la necesita ni te la pedirá.</p>
      </form>
    </Tarjeta>
  );
}

function Contenido() {
  const idUrl = useSearchParams().get("id");
  const { data, cargando, recargar } = useApi("/ayuda/tickets");
  const [abierto, setAbierto] = useState(idUrl);
  const [nueva, setNueva] = useState(false);
  const [aviso, setAviso] = useState("");
  const ticket = data?.find((t) => t._id === abierto);

  return (
    <>
      <Titulo titulo="Ayuda y soporte" subtitulo="¿Algo no funciona o tienes una duda con la intranet? Escríbenos y te responderemos aquí mismo.">
        {!nueva && <button onClick={() => { setNueva(true); setAviso(""); }} className={botonClase}>Nueva solicitud</button>}
      </Titulo>
      <div className="grid gap-6">
        <Exito texto={aviso} />
        {nueva && <NuevaSolicitud onCancelar={() => setNueva(false)} onCreada={(t) => { setNueva(false); setAviso(`Solicitud ${t.codigo} enviada. Te avisaremos cuando soporte responda.`); setAbierto(t._id); recargar(); }} />}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <Tarjeta titulo="Mis solicitudes">
            {cargando || !data ? <Cargando /> : data.length === 0 ? <Vacio texto="Aún no has enviado solicitudes" icono="soporte" /> : (
              <ul className="divide-y divide-gray-100 -m-5">
                {data.map((t) => (
                  <li key={t._id}>
                    <button onClick={() => setAbierto(t._id)} className={`w-full text-left px-5 py-3 hover:bg-gray-50 ${abierto === t._id ? "bg-aduni-100/40" : ""}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">{t.asunto}</p>
                        <Etiqueta color={ESTADOS[t.estado][1]}>{ESTADOS[t.estado][0]}</Etiqueta>
                      </div>
                      <p className="text-xs text-gray-400">{t.codigo} · {CATEGORIAS[t.categoria]} · {fechaHora(t.updatedAt)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>
          {ticket ? (
            <Tarjeta titulo={`${ticket.codigo} · ${ticket.asunto}`} accion={<Etiqueta color={ESTADOS[ticket.estado][1]}>{ESTADOS[ticket.estado][0]}</Etiqueta>}>
              <HiloTicket ticket={ticket} ruta={`/ayuda/tickets/${ticket._id}/responder`} onRespondido={recargar} />
            </Tarjeta>
          ) : (
            <Tarjeta><Vacio texto="Elige una solicitud para ver la conversación" icono="mensajes" /></Tarjeta>
          )}
        </div>
      </div>
    </>
  );
}

export default function Ayuda() {
  return <Suspense fallback={<Cargando />}><Contenido /></Suspense>;
}
