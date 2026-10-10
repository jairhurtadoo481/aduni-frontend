"use client";

import { apiIntranet } from "../../lib/api";
import { useApi, fechaLarga } from "../../lib/intranet";
import { Tarjeta, Cargando, Vacio, Etiqueta } from "./ui";

const TIPOS = { academico: ["Académico", "blue"], feriado: ["Feriado", "red"], actividad: ["Actividad", "violet"], reunion: ["Reunión", "amber"], examen: ["Evaluación", "green"] };

export default function Agenda({ puedeBorrar = false, version = 0 }) {
  const { data, cargando, recargar } = useApi(`/eventos?v=${version}`);
  const borrar = async (id) => {
    if (!confirm("¿Eliminar este evento?")) return;
    await apiIntranet(`/admin/eventos/${id}`, { method: "DELETE" });
    recargar();
  };
  return (
    <Tarjeta titulo="Agenda escolar">
      {cargando ? <Cargando /> : !data?.length ? <Vacio texto="No hay eventos" icono="calendario" /> : (
        <ul className="grid gap-3">
          {data.map((e) => (
            <li key={e._id} className="flex items-center gap-3">
              <div className="w-12 text-center rounded-lg bg-aduni-100 text-aduni-900 py-1 shrink-0">
                <p className="text-[10px] uppercase">{new Date(`${e.fecha}T12:00:00Z`).toLocaleDateString("es-PE", { month: "short", timeZone: "UTC" })}</p>
                <p className="text-base font-bold leading-none">{e.fecha.slice(8, 10)}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{e.titulo}</p>
                <p className="text-xs text-gray-500 first-letter:uppercase">{fechaLarga(e.fecha)}</p>
              </div>
              <Etiqueta color={TIPOS[e.tipo]?.[1]}>{TIPOS[e.tipo]?.[0]}</Etiqueta>
              {puedeBorrar && <button onClick={() => borrar(e._id)} className="text-xs text-red-600 hover:underline">Quitar</button>}
            </li>
          ))}
        </ul>
      )}
    </Tarjeta>
  );
}
