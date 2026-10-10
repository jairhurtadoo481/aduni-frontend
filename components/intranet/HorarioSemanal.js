"use client";

import { DIAS } from "../../lib/intranet";

const aMin = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));

// Vista semanal tipo universidad: columnas lunes-viernes, bloques de color por curso.
// bloques: [{ _id, dia, horaInicio, horaFin, curso: { nombre, color }, detalle }]
export default function HorarioSemanal({ bloques, onEliminar }) {
  if (!bloques.length) return <p className="text-sm text-gray-500 py-6 text-center">No hay horario registrado.</p>;
  const inicio = Math.min(...bloques.map((b) => aMin(b.horaInicio)));
  const fin = Math.max(...bloques.map((b) => aMin(b.horaFin)));
  const escala = 1.1; // px por minuto
  const alto = (fin - inicio) * escala;
  const horas = [];
  for (let m = Math.ceil(inicio / 60) * 60; m <= fin; m += 60) horas.push(m);
  const hoy = new Date().getDay();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px] grid grid-cols-[56px_repeat(5,1fr)] gap-x-2">
        <div />
        {[1, 2, 3, 4, 5].map((d) => (
          <div key={d} className={`text-center text-xs font-semibold py-2 rounded-t-lg ${d === hoy ? "bg-aduni-700 text-white" : "text-gray-600"}`}>{DIAS[d]}</div>
        ))}
        <div className="relative" style={{ height: alto }}>
          {horas.map((m) => (
            <span key={m} className="absolute right-2 text-[11px] text-gray-400 -translate-y-1/2" style={{ top: (m - inicio) * escala }}>
              {String(Math.floor(m / 60)).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((d) => (
          <div key={d} className={`relative rounded-b-lg border border-gray-100 ${d === hoy ? "bg-aduni-100/40" : "bg-gray-50"}`} style={{ height: alto }}>
            {horas.map((m) => (
              <div key={m} className="absolute left-0 right-0 border-t border-dashed border-gray-200" style={{ top: (m - inicio) * escala }} />
            ))}
            {bloques.filter((b) => b.dia === d).map((b) => (
              <div key={b._id} className="absolute left-1 right-1 rounded-lg p-2 text-white overflow-hidden shadow-sm group"
                style={{ top: (aMin(b.horaInicio) - inicio) * escala + 1, height: (aMin(b.horaFin) - aMin(b.horaInicio)) * escala - 2, background: b.curso?.color || "#1b4aa0" }}>
                <p className="text-xs font-bold leading-tight">{b.curso?.nombre}</p>
                <p className="text-[11px] opacity-90">{b.horaInicio} - {b.horaFin}</p>
                {b.detalle && <p className="text-[11px] opacity-90 truncate">{b.detalle}</p>}
                {onEliminar && (
                  <button onClick={() => onEliminar(b)} className="absolute top-1 right-1 hidden group-hover:block bg-black/30 rounded px-1 text-[10px]">Quitar</button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
