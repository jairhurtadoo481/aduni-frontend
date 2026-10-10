"use client";

import { Tarjeta, Cargando, Vacio, Etiqueta } from "./ui";

const RIESGO = { alto: ["Riesgo alto", "red"], medio: ["Riesgo medio", "amber"], bajo: ["Riesgo bajo", "gray"] };

// Estudiantes que requieren atención (faltas, tardanzas, competencias en C, deuda).
export default function ListaAlertas({ datos, cargando }) {
  return (
    <Tarjeta>
      {cargando ? <Cargando /> : !datos?.length ? <Vacio texto="Ningún estudiante en riesgo. ¡Excelente!" icono="check" /> : (
        <div className="overflow-x-auto -m-5">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="text-left px-5 py-3">Estudiante</th><th className="px-3 py-3">Nivel</th><th className="text-left px-3 py-3">Motivos</th><th className="text-left px-5 py-3">Contacto familia</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {datos.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3"><p className="font-medium">{a.nombre}</p><p className="text-xs text-gray-400">{a.codigo} · {a.aula}</p></td>
                  <td className="px-3 py-3 text-center"><Etiqueta color={RIESGO[a.riesgo][1]}>{RIESGO[a.riesgo][0]}</Etiqueta></td>
                  <td className="px-3 py-3"><ul className="list-disc pl-4 text-gray-700">{a.motivos.map((m) => <li key={m}>{m}</li>)}</ul></td>
                  <td className="px-5 py-3 text-xs">
                    {a.apoderado?.nombre}
                    {a.apoderado?.celular && <a className="block text-emerald-700 hover:underline" target="_blank" rel="noreferrer" href={`https://wa.me/51${a.apoderado.celular}`}>WhatsApp {a.apoderado.celular}</a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Tarjeta>
  );
}
