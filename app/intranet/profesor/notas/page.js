"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiIntranet } from "../../../../lib/api";
import { useApi, NIVEL } from "../../../../lib/intranet";
import { Titulo, Tarjeta, Cargando, Campo, inputClase, botonClase, AvisoError, Exito, Nivel, Pestanas } from "../../../../components/intranet/ui";

const OPCIONES = ["", "AD", "A", "B", "C"];
const VALOR = { AD: 4, A: 3, B: 2, C: 1 };
const resumir = (niveles) => {
  const v = niveles.filter((n) => VALOR[n]);
  if (!v.length) return "";
  const r = Math.round(v.reduce((s, n) => s + VALOR[n], 0) / v.length);
  return Object.keys(VALOR).find((k) => VALOR[k] === r);
};

function Registro() {
  const params = useSearchParams();
  const cursos = useApi("/docente/cursos");
  const config = useApi("/config");
  const [curso, setCurso] = useState(params.get("curso") || "");
  const [periodo, setPeriodo] = useState(null);
  const cursoSel = curso || cursos.data?.[0]?.id || "";
  const per = periodo || config.data?.periodoActual || 1;
  const reg = useApi(cursoSel ? `/docente/cursos/${cursoSel}/registro?periodo=${per}` : null);
  const [edit, setEdit] = useState({});
  const [msg, setMsg] = useState({ ok: "", error: "" });

  const clave = (e, i) => `${cursoSel}:${per}:${e.id}:${i}`;
  const nivelDe = (e, i) => edit[clave(e, i)] ?? e.niveles[i];
  const conclusionDe = (e) => edit[clave(e, "c")] ?? e.conclusion;
  const poner = (e, i, v) => { setEdit({ ...edit, [clave(e, i)]: v }); setMsg({ ok: "", error: "" }); };

  const guardar = async () => {
    try {
      const calificaciones = reg.data.estudiantes.map((e) => ({
        estudiante: e.id,
        niveles: reg.data.curso.competencias.map((_, i) => nivelDe(e, i)),
        conclusion: conclusionDe(e),
      }));
      const r = await apiIntranet(`/docente/cursos/${cursoSel}/registro`, { method: "PUT", body: { periodo: per, calificaciones } });
      setMsg({ ok: r.mensaje, error: "" });
    } catch (err) {
      setMsg({ ok: "", error: err.message });
    }
  };

  return (
    <>
      <Titulo titulo="Registro de notas" subtitulo="Registro auxiliar por competencias · escala AD / A / B / C" />
      <Tarjeta className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <Campo etiqueta="Curso">
            <select className={`${inputClase} min-w-64`} value={cursoSel} onChange={(e) => setCurso(e.target.value)}>
              {cursos.data?.map((c) => <option key={c.id} value={c.id}>{c.nombre} — {c.aula.nombre}</option>)}
            </select>
          </Campo>
          <div>
            <span className="block text-xs font-semibold text-gray-600 mb-1">Bimestre</span>
            <Pestanas valor={per} onChange={setPeriodo} opciones={[1, 2, 3, 4].map((p) => [p, `B${p}${p === config.data?.periodoActual ? " •" : ""}`])} />
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 ml-auto">
            {Object.entries(NIVEL).map(([k, v]) => <span key={k} className="flex items-center gap-1"><Nivel nivel={k} />{v.nombre}</span>)}
          </div>
        </div>
      </Tarjeta>

      {reg.cargando || !reg.data ? <Cargando /> : (
        <Tarjeta>
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 sticky left-0 bg-gray-50 min-w-52">Estudiante</th>
                  {reg.data.curso.competencias.map((c, i) => (
                    <th key={i} className="px-2 py-3 font-medium align-bottom min-w-28" title={c}>
                      <span className="block text-aduni-700 font-bold">C{i + 1}</span>
                      <span className="block text-[10px] text-gray-500 font-normal leading-tight line-clamp-3">{c}</span>
                    </th>
                  ))}
                  <th className="px-2 py-3">Logro</th>
                  <th className="px-3 py-3 text-left min-w-64">Conclusión descriptiva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reg.data.estudiantes.map((e) => {
                  const niveles = reg.data.curso.competencias.map((_, i) => nivelDe(e, i));
                  return (
                    <tr key={e.id}>
                      <td className="px-4 py-2 sticky left-0 bg-white">
                        <p className="font-medium">{e.nombre}</p>
                        <p className="text-xs text-gray-400">{e.codigo}</p>
                      </td>
                      {niveles.map((n, i) => (
                        <td key={i} className="px-2 py-2 text-center">
                          <select value={n} onChange={(ev) => poner(e, i, ev.target.value)}
                            className={`w-16 rounded-md text-center font-bold text-sm py-1 border ${n ? `${NIVEL[n].clase} border-transparent` : "border-gray-300 text-gray-400"}`}>
                            {OPCIONES.map((o) => <option key={o} value={o} className="bg-white text-gray-900">{o || "—"}</option>)}
                          </select>
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center"><Nivel nivel={resumir(niveles)} /></td>
                      <td className="px-3 py-2">
                        <input className={`${inputClase} text-xs`} value={conclusionDe(e)} onChange={(ev) => poner(e, "c", ev.target.value)}
                          placeholder={niveles.some((n) => n === "B" || n === "C") ? "Recomendado para B o C" : ""} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-8 grid gap-3">
            <AvisoError texto={msg.error} /><Exito texto={msg.ok} />
            <button onClick={guardar} className={`${botonClase} w-fit`}>Guardar calificaciones del B{per}</button>
          </div>
        </Tarjeta>
      )}
    </>
  );
}

export default function NotasDocente() {
  return <Suspense fallback={<Cargando />}><Registro /></Suspense>;
}
