"use client";

import Link from "next/link";
import { fechaLarga, fechaCorta, soles, hoyLima } from "../../../lib/intranet";
import { useApiEst, usePortal } from "../../../components/intranet/PortalLayout";
import { Indicador, Tarjeta, Cargando, Vacio, EstadoAsistencia, Etiqueta, AvisoError } from "../../../components/intranet/ui";

const TIPO_CONDUCTA = { merito: ["Mérito", "green"], demerito: ["Demérito", "red"], incidencia: ["Incidencia", "amber"] };

export default function InicioEstudiante() {
  const { base: B, rol } = usePortal();
  const { data: d, cargando, error } = useApiEst("/estudiante/resumen");
  if (cargando) return <Cargando />;
  if (error) return <AvisoError texto={error} />;
  const u = d.usuario;
  const a = d.asistencia;

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl bg-gradient-to-r from-aduni-900 to-aduni-600 text-white p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-blue-100 first-letter:uppercase">{fechaLarga(hoyLima())}</p>
          <h1 className="text-2xl font-bold mt-1">{rol === "apoderado" ? `Resumen de ${u.nombres.split(" ")[0]}` : `¡Hola, ${u.nombres.split(" ")[0]}!`}</h1>
          <p className="text-blue-100 text-sm mt-1">
            {u.aula ? u.aula.nombre : "Sin aula asignada"} · Código {u.codigo}
            {u.aula?.tutor && <> · Tutor(a): {u.aula.tutor.nombre}</>}
          </p>
        </div>
        <div className="bg-white/10 rounded-xl px-4 py-3 text-sm">
          <p className="text-blue-100 text-xs">Asistencia de hoy</p>
          {d.asistenciaHoy ? (
            <p className="font-semibold"><EstadoAsistencia estado={d.asistenciaHoy.estado} /></p>
          ) : <p className="font-semibold">El docente aún no pasa lista</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador etiqueta="Asistencia anual" valor={a.porcentaje !== null ? `${a.porcentaje}%` : "—"} detalle={`${a.T} tardanzas · ${a.F} faltas`} icono="asistencia" color="text-emerald-700 bg-emerald-100" />
        <Indicador etiqueta="Tareas pendientes" valor={d.totalTareasPendientes} detalle="por entregar" icono="tareas" color="text-violet-700 bg-violet-100" />
        <Indicador etiqueta="Periodo actual" valor={`${d.periodoActual}.° bimestre`} detalle="Evaluación por competencias" icono="notas" />
        <Indicador etiqueta="Pagos vencidos" valor={d.deuda.cuotas ? soles(d.deuda.monto) : "Al día"} detalle={d.deuda.cuotas ? `${d.deuda.cuotas} cuota(s)` : "Sin deudas"} icono="pagos" color={d.deuda.cuotas ? "text-red-700 bg-red-100" : "text-emerald-700 bg-emerald-100"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Tarjeta titulo="Clases de hoy" accion={<Link href={`${B}/horario`} className="text-xs text-aduni-700 font-semibold">Ver horario</Link>}>
          {d.horarioHoy.length === 0 ? <Vacio texto="No tienes clases hoy" icono="horario" /> : (
            <ul className="grid gap-2">
              {d.horarioHoy.map((h) => (
                <li key={h._id} className="flex items-center gap-3">
                  <span className="w-1.5 h-9 rounded-full" style={{ background: h.curso.color }} />
                  <div>
                    <p className="text-sm font-semibold">{h.curso.nombre}</p>
                    <p className="text-xs text-gray-500">{h.horaInicio} - {h.horaFin}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta titulo="Próximas tareas" accion={<Link href={`${B}/tareas`} className="text-xs text-aduni-700 font-semibold">Ver todas</Link>}>
          {d.tareasPendientes.length === 0 ? <Vacio texto="¡Estás al día!" icono="tareas" /> : (
            <ul className="grid gap-3">
              {d.tareasPendientes.map((t) => (
                <li key={t._id} className="text-sm">
                  <p className="font-semibold text-gray-900">{t.titulo}</p>
                  <p className="text-xs text-gray-500">{t.curso.nombre} · entrega {fechaCorta(t.fechaEntrega)}</p>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta titulo="Agenda" accion={<Link href={`${B}/comunicados`} className="text-xs text-aduni-700 font-semibold">Ver agenda</Link>}>
          {d.eventos.length === 0 ? <Vacio texto="Sin eventos próximos" icono="calendario" /> : (
            <ul className="grid gap-3">
              {d.eventos.map((e) => (
                <li key={e._id} className="flex items-center gap-3">
                  <div className="w-11 text-center rounded-lg bg-aduni-100 text-aduni-900 py-1">
                    <p className="text-[10px] uppercase">{fechaCorta(e.fecha).split(" ")[1]}</p>
                    <p className="text-sm font-bold leading-none">{e.fecha.slice(8, 10)}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{e.titulo}</p>
                    {e.tipo === "feriado" && <Etiqueta color="red">Feriado</Etiqueta>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>

      {(d.examenes?.length > 0 || d.incidencias?.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Tarjeta titulo="Exámenes en línea" accion={<Link href={`${B}/examenes`} className="text-xs text-aduni-700 font-semibold">Ver todos</Link>}>
            {!d.examenes.length ? <Vacio texto="Sin exámenes programados" icono="examen" /> : (
              <ul className="grid gap-2">
                {d.examenes.map((e) => (
                  <li key={e._id} className="text-sm flex justify-between gap-3">
                    <span><span className="font-semibold">{e.titulo}</span><span className="block text-xs text-gray-500">{e.curso.nombre}</span></span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(e.inicio).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}</span>
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>
          <Tarjeta titulo="Conducta" accion={<Link href={`${B}/conducta`} className="text-xs text-aduni-700 font-semibold">Ver historial</Link>}>
            {!d.incidencias.length ? <Vacio texto="Sin registros" icono="conducta" /> : (
              <ul className="grid gap-2">
                {d.incidencias.map((i) => (
                  <li key={i._id} className="text-sm flex items-start gap-2">
                    <Etiqueta color={TIPO_CONDUCTA[i.tipo][1]}>{TIPO_CONDUCTA[i.tipo][0]}</Etiqueta>
                    <span className="text-gray-700">{i.descripcion}<span className="block text-xs text-gray-400">{fechaCorta(i.fecha)}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>
        </div>
      )}

      <Tarjeta titulo="Últimos comunicados" accion={<Link href={`${B}/comunicados`} className="text-xs text-aduni-700 font-semibold">Ver todos</Link>}>
        {d.comunicados.length === 0 ? <Vacio texto="Sin comunicados" icono="comunicados" /> : (
          <div className="grid gap-4 md:grid-cols-3">
            {d.comunicados.map((c) => (
              <div key={c._id}>
                <p className="font-semibold text-sm">{c.titulo}</p>
                <p className="text-xs text-gray-500 line-clamp-3 mt-1">{c.contenido}</p>
              </div>
            ))}
          </div>
        )}
      </Tarjeta>
    </div>
  );
}
