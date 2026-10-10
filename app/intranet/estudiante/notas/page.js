"use client";

import { useState } from "react";
import { useApi, NIVEL } from "../../../../lib/intranet";
import { descargar } from "../../../../lib/api";
import { usePortal, useApiEst, conHijo } from "../../../../components/intranet/PortalLayout";
import Icono from "../../../../components/intranet/Icono";
import { Titulo, Tarjeta, Cargando, Nivel, AvisoError, Pestanas, botonSecundario, botonClase } from "../../../../components/intranet/ui";

export default function NotasEstudiante() {
  const { data, cargando, error } = useApiEst("/estudiante/calificaciones");
  const { data: config } = useApi("/config");
  const { usuario, hijo } = usePortal();
  const [vista, setVista] = useState("resumen");
  const [errPdf, setErrPdf] = useState("");

  const pdf = () => descargar(conHijo("/estudiante/libreta.pdf", hijo), "libreta.pdf", { abrir: true }).catch((e) => setErrPdf(e.message));

  return (
    <>
      <Titulo titulo="Notas y libreta" subtitulo="Calificación por competencias · escala literal MINEDU (AD, A, B, C)">
        <button onClick={pdf} className={botonClase}><Icono nombre="descargar" className="w-4 h-4" /> Libreta oficial (PDF)</button>
        <button onClick={() => window.print()} className={botonSecundario}><Icono nombre="imprimir" className="w-4 h-4" /> Imprimir vista</button>
      </Titulo>
      <AvisoError texto={error || errPdf} />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
        <Pestanas opciones={[["resumen", "Resumen por curso"], ["detalle", "Detalle por competencia"]]} valor={vista} onChange={setVista} />
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          {Object.entries(NIVEL).map(([k, v]) => <span key={k} className="flex items-center gap-1"><Nivel nivel={k} /> {v.nombre}</span>)}
        </div>
      </div>

      <div className="hidden print:block mb-4">
        <p className="text-lg font-bold">Libreta de notas {config?.anio} — Colegio ADUNI+</p>
        <p className="text-sm">{usuario.nombre} · Código {usuario.codigo}</p>
      </div>

      {cargando ? <Cargando /> : vista === "resumen" ? (
        <Tarjeta>
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3">Área curricular</th>
                  {[1, 2, 3, 4].map((p) => <th key={p} className={`px-3 py-3 ${p === config?.periodoActual ? "text-aduni-700" : ""}`}>B{p}</th>)}
                  <th className="px-3 py-3">Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                        <span className="font-semibold text-gray-900">{c.nombre}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-4">{c.docente}</p>
                    </td>
                    {c.resumenPeriodos.map((n, i) => <td key={i} className="px-3 py-3 text-center"><Nivel nivel={n} /></td>)}
                    <td className="px-3 py-3 text-center"><Nivel nivel={c.final} grande /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tarjeta>
      ) : (
        <div className="grid gap-4">
          {data.map((c) => (
            <Tarjeta key={c.id} titulo={<span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />{c.nombre}</span>}>
              <div className="overflow-x-auto -m-5">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500">
                    <tr><th className="text-left px-5 py-2 font-medium">Competencia</th>{[1, 2, 3, 4].map((p) => <th key={p} className="px-3 py-2 font-medium">B{p}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {c.competencias.map((comp, i) => (
                      <tr key={i}>
                        <td className="px-5 py-2 text-gray-700">{comp.nombre}</td>
                        {comp.niveles.map((n, j) => <td key={j} className="px-3 py-2 text-center"><Nivel nivel={n} /></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {c.conclusiones.some(Boolean) && (
                <div className="mt-6 text-xs text-gray-600 bg-amber-50 rounded-lg p-3">
                  <p className="font-semibold mb-1">Conclusiones descriptivas</p>
                  {c.conclusiones.map((t, i) => t && <p key={i}>B{i + 1}: {t}</p>)}
                </div>
              )}
            </Tarjeta>
          ))}
        </div>
      )}
    </>
  );
}
