"use client";

import Link from "next/link";
import { useApi, fechaLarga, soles } from "../../../lib/intranet";
import { usePortal, NOMBRE_AREA } from "../../../components/intranet/PortalLayout";
import { Indicador, Tarjeta, Cargando, AvisoError, Vacio, Etiqueta } from "../../../components/intranet/ui";

const B = "/intranet/administrativo";

function AsistenciaPorAula() {
  const dia = useApi("/admin/asistencia/dia");
  if (dia.cargando) return <Cargando />;
  if (!dia.data) return <Vacio texto="Sin datos" icono="asistencia" />;
  return (
    <div className="grid gap-4">
      {dia.data.aulas.map((x) => {
        const pct = (n) => (x.total ? (n / x.total) * 100 : 0);
        return (
          <div key={x.aula._id}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{x.aula.nombre}</span>
              <span className="text-gray-500">{x.P + x.T}/{x.total} asistieron</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
              <div className="bg-emerald-500" style={{ width: `${pct(x.P)}%` }} title={`Puntual: ${x.P}`} />
              <div className="bg-amber-400" style={{ width: `${pct(x.T)}%` }} title={`Tardanza: ${x.T}`} />
              <div className="bg-sky-500" style={{ width: `${pct(x.J)}%` }} title={`Justificada: ${x.J}`} />
              <div className="bg-red-500" style={{ width: `${pct(x.F)}%` }} title={`Falta: ${x.F}`} />
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        {[["bg-emerald-500", "Puntual"], ["bg-amber-400", "Tardanza"], ["bg-sky-500", "Justificada"], ["bg-red-500", "Falta"], ["bg-gray-200", "Sin lista aún"]].map(([c, t]) => (
          <span key={t} className="flex items-center gap-1"><span className={`w-2.5 h-2.5 rounded-sm ${c}`} />{t}</span>
        ))}
      </div>
    </div>
  );
}

function ControlListas() {
  const c = useApi("/admin/asistencia/control");
  if (c.cargando) return <Cargando />;
  if (!c.data) return null;
  return (
    <div>
      <p className="text-sm mb-3"><strong>{c.data.tomadas}</strong> de <strong>{c.data.total}</strong> clases de hoy ya tienen lista.</p>
      {c.data.sinTomar.length === 0 ? <Vacio texto="Ningún docente pendiente" icono="check" /> : (
        <ul className="grid gap-2 max-h-64 overflow-y-auto">
          {c.data.sinTomar.map((x) => (
            <li key={x._id} className="text-sm flex justify-between gap-2">
              <span><span className="font-medium">{x.docente}</span><span className="block text-xs text-gray-500">{x.curso} · {x.aula} · {x.horaInicio}</span></span>
              <Etiqueta color="red">Sin lista</Etiqueta>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PanelAdministrativo() {
  const { data: d, cargando, error } = useApi("/admin/dashboard");
  const { puede, areas } = usePortal();
  if (cargando) return <Cargando />;
  if (error) return <AvisoError texto={error} />;
  const a = d.asistencia;
  const p = d.pensiones;
  const verAsistencia = puede("auxiliar", "coordinacion", "secretaria");
  const verControl = puede("auxiliar", "coordinacion");
  const verFinanzas = puede("tesoreria");

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel general</h1>
          <p className="text-sm text-gray-500 first-letter:uppercase">{fechaLarga(d.hoy)} · {d.hora} · Año académico {d.anio}</p>
          <p className="text-xs text-gray-400 mt-1">Tu acceso: {areas.map((x) => NOMBRE_AREA[x]).join(", ")}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {puede("auxiliar", "secretaria") && <Link href={`${B}/ingreso-personal`} className="bg-aduni-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-aduni-900">Ingreso del personal (QR)</Link>}
          {puede("secretaria") && <Link href={`${B}/estudiantes`} className="border border-gray-300 bg-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50">Nuevo estudiante</Link>}
          {verFinanzas && <Link href={`${B}/pensiones`} className="border border-gray-300 bg-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50">Registrar pago</Link>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador etiqueta="Estudiantes activos" valor={d.estudiantes} detalle={`${d.aulas} aulas · ${d.docentes} docentes`} icono="usuarios" />
        {verAsistencia && <Indicador etiqueta="Asistieron hoy" valor={`${a.P + a.T}/${d.estudiantes}`} detalle={`${a.T} tardanzas · ${a.F} faltas · ${a.sinRegistro} sin lista`} icono="asistencia" color="text-emerald-700 bg-emerald-100" />}
        {verFinanzas && <Indicador etiqueta="Recaudado este mes" valor={soles(p.recaudadoMes)} detalle={`de ${soles(p.esperadoMes)} esperado`} icono="dinero" color="text-violet-700 bg-violet-100" />}
        {verFinanzas && <Indicador etiqueta="Deuda vencida" valor={soles(p.montoVencido)} detalle={`${p.morosos} familias · ${p.vencidas} cuotas`} icono="alerta" color="text-red-700 bg-red-100" />}
        {puede("auxiliar", "coordinacion") && <Indicador etiqueta="Justificaciones pendientes" valor={d.justificacionesPendientes} icono="justificacion" color="text-amber-700 bg-amber-100" />}
      </div>

      {(verAsistencia || verControl) && (
        <div className="grid gap-6 lg:grid-cols-3">
          {verAsistencia && (
            <Tarjeta titulo="Asistencia de hoy por aula" className="lg:col-span-2" accion={verControl && <Link href={`${B}/asistencia`} className="text-xs text-aduni-700 font-semibold">Detalle</Link>}>
              <AsistenciaPorAula />
            </Tarjeta>
          )}
          {verControl && (
            <Tarjeta titulo="Control de listas de los docentes" accion={<Link href={`${B}/asistencia`} className="text-xs text-aduni-700 font-semibold">Ver</Link>}>
              <ControlListas />
            </Tarjeta>
          )}
        </div>
      )}
    </div>
  );
}
