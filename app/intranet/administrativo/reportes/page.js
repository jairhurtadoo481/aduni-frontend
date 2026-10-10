"use client";

import { useState } from "react";
import { useApi, soles } from "../../../../lib/intranet";
import { Barras, BarrasDobles, Apilada } from "../../../../components/intranet/Graficos";
import ListaAlertas from "../../../../components/intranet/ListaAlertas";
import { Titulo, Tarjeta, Cargando, Indicador, Pestanas, AvisoError } from "../../../../components/intranet/ui";

const COLORES = { AD: "#059669", A: "#2563eb", B: "#f59e0b", C: "#dc2626" };

export default function Reportes() {
  const [periodo, setPeriodo] = useState("");
  const { data, cargando, error } = useApi(`/admin/reportes${periodo ? `?periodo=${periodo}` : ""}`);
  const alertas = useApi("/admin/alertas");

  return (
    <>
      <Titulo titulo="Reportes y alertas" subtitulo="Indicadores para dirección: asistencia, rendimiento, cobranza y estudiantes en riesgo" />
      <AvisoError texto={error} />
      {cargando || !data ? <Cargando /> : (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Indicador etiqueta="Méritos registrados" valor={data.conducta.merito || 0} icono="conducta" color="text-emerald-700 bg-emerald-100" />
            <Indicador etiqueta="Deméritos" valor={data.conducta.demerito || 0} icono="alerta" color="text-red-700 bg-red-100" />
            <Indicador etiqueta="Estudiantes en riesgo" valor={alertas.data?.length ?? "…"} detalle={`${alertas.data?.filter((a) => a.riesgo === "alto").length ?? 0} con riesgo alto`} icono="alerta" color="text-amber-700 bg-amber-100" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Tarjeta titulo="Asistencia mensual (%)">
              <Barras datos={data.asistenciaMensual} valor={(d) => d.porcentaje} etiqueta={(d) => d.mes.slice(0, 3)} formato={(v) => `${v}%`} maximo={100} color="#15803d" />
            </Tarjeta>
            <Tarjeta titulo="Pensiones: esperado vs. cobrado">
              <BarrasDobles datos={data.pensionesMensual} a={(d) => d.esperado} b={(d) => d.cobrado} etiqueta={(d) => d.mes.slice(0, 3)} nombres={["Esperado", "Cobrado"]} formato={soles} />
            </Tarjeta>
          </div>
          <Tarjeta titulo="Rendimiento por aula (distribución de niveles de logro)" accion={<Pestanas valor={periodo || String(data.periodo)} onChange={setPeriodo} opciones={["1", "2", "3", "4"].map((p) => [p, `B${p}`])} />}>
            <div className="grid gap-4">
              {data.rendimiento.map((r) => {
                const total = r.AD + r.A + r.B + r.C;
                return (
                  <div key={r.aula}>
                    <div className="flex justify-between text-sm mb-1"><span className="font-medium">{r.aula}</span><span className="text-xs text-gray-500">{total ? `${Math.round(((r.AD + r.A) / total) * 100)}% en logro esperado o destacado` : "sin notas"}</span></div>
                    <Apilada partes={["AD", "A", "B", "C"].map((k) => ({ nombre: k, valor: r[k], color: COLORES[k] }))} />
                  </div>
                );
              })}
              <div className="flex gap-4 text-xs text-gray-500">{Object.entries(COLORES).map(([k, c]) => <span key={k} className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />{k}</span>)}</div>
            </div>
          </Tarjeta>
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Alertas tempranas</h2>
            <ListaAlertas datos={alertas.data} cargando={alertas.cargando} />
          </div>
        </div>
      )}
    </>
  );
}
