"use client";

import Icono from "./Icono";
import { NIVEL, ASISTENCIA } from "../../lib/intranet";

export const inputClase = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-aduni-600/30 focus:border-aduni-600";
export const botonClase = "inline-flex items-center justify-center gap-2 bg-aduni-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-aduni-900 transition disabled:opacity-50";
export const botonSecundario = "inline-flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50";

export function Titulo({ titulo, subtitulo, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
        {subtitulo && <p className="text-sm text-gray-500 mt-1">{subtitulo}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Tarjeta({ titulo, accion, children, className = "" }) {
  return (
    <section className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {titulo && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{titulo}</h2>
          {accion}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Indicador({ etiqueta, valor, detalle, icono, color = "text-aduni-700 bg-aduni-100" }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-3">
      {icono && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icono nombre={icono} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{etiqueta}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{valor}</p>
        {detalle && <p className="text-xs text-gray-500 mt-0.5">{detalle}</p>}
      </div>
    </div>
  );
}

export function Nivel({ nivel, grande = false }) {
  if (!nivel) return <span className="text-gray-300">—</span>;
  const n = NIVEL[nivel];
  return (
    <span title={n?.nombre} className={`inline-flex items-center justify-center rounded-md font-bold ${grande ? "w-11 h-9 text-base" : "w-8 h-6 text-xs"} ${n?.clase}`}>
      {nivel}
    </span>
  );
}

export function EstadoAsistencia({ estado }) {
  if (!estado) return <span className="text-xs text-gray-400">Sin registro</span>;
  const a = ASISTENCIA[estado];
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.clase}`}>{a.nombre}</span>;
}

export function Etiqueta({ children, color = "gray" }) {
  const colores = {
    gray: "bg-gray-100 text-gray-700", green: "bg-emerald-100 text-emerald-800", red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-800", blue: "bg-blue-100 text-blue-800", violet: "bg-violet-100 text-violet-800",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${colores[color]}`}>{children}</span>;
}

export function Cargando({ texto = "Cargando..." }) {
  return (
    <div className="flex items-center gap-3 text-gray-500 py-10 justify-center">
      <span className="w-5 h-5 border-2 border-aduni-600 border-t-transparent rounded-full animate-spin" />
      {texto}
    </div>
  );
}

export function Vacio({ texto, icono = "inicio" }) {
  return (
    <div className="text-center py-10 text-gray-400">
      <Icono nombre={icono} className="w-10 h-10 mx-auto mb-2" />
      <p className="text-sm">{texto}</p>
    </div>
  );
}

export function AvisoError({ texto }) {
  if (!texto) return null;
  return <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{texto}</p>;
}

export function Exito({ texto }) {
  if (!texto) return null;
  return <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{texto}</p>;
}

export function Pestanas({ opciones, valor, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit max-w-full overflow-x-auto">
      {opciones.map((o) => {
        const [v, etiqueta] = Array.isArray(o) ? o : [o, o];
        return (
          <button key={v} onClick={() => onChange(v)} className={`px-3 py-1.5 rounded-md text-sm font-semibold whitespace-nowrap transition ${valor === v ? "bg-white text-aduni-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
            {etiqueta}
          </button>
        );
      })}
    </div>
  );
}

export function Campo({ etiqueta, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-600 mb-1">{etiqueta}</span>
      {children}
    </label>
  );
}

export function Modal({ abierto, titulo, onCerrar, children, ancho = "max-w-lg" }) {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={onCerrar}>
      <div className={`bg-white rounded-xl shadow-xl w-full ${ancho}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{titulo}</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-700" aria-label="Cerrar"><Icono nombre="x" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
