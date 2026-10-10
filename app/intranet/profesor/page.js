"use client";

import Link from "next/link";
import { useApi, fechaLarga, hoyLima } from "../../../lib/intranet";
import { descargar } from "../../../lib/api";
import { usePortal } from "../../../components/intranet/PortalLayout";
import ListaComunicados from "../../../components/intranet/ListaComunicados";
import { Indicador, Tarjeta, Cargando, Vacio, AvisoError } from "../../../components/intranet/ui";

const B = "/intranet/profesor";

export default function InicioDocente() {
  const { data: d, cargando, error } = useApi("/docente/resumen");
  const { usuario } = usePortal();
  if (cargando) return <Cargando />;
  if (error) return <AvisoError texto={error} />;
  const totalEst = d.cursos.reduce((s, c) => s + c.estudiantes, 0);
  const at = d.asistenciaTutoria;

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl bg-gradient-to-r from-aduni-900 to-aduni-600 text-white p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-blue-100 first-letter:uppercase">{fechaLarga(hoyLima())}</p>
          <h1 className="text-2xl font-bold mt-1">Bienvenido(a), {usuario.nombres?.split(" ")[0]}</h1>
          <p className="text-blue-100 text-sm mt-1">{d.periodoActual}.° bimestre en curso{d.tutoria && <> · Tutor(a) de {d.tutoria.nombre}</>}</p>
        </div>
        {d.tutoria && (
          <button onClick={() => descargar("/docente/tutoria/libretas.pdf", "libretas.pdf", { abrir: true })} className="bg-white/15 hover:bg-white/25 text-sm font-semibold px-4 py-2 rounded-lg">
            Libretas de mi tutoría (PDF)
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador etiqueta="Cursos a cargo" valor={d.cursos.length} icono="cursos" />
        <Indicador etiqueta="Estudiantes" valor={totalEst} detalle="en todos tus cursos" icono="usuarios" color="text-violet-700 bg-violet-100" />
        <Indicador etiqueta="Entregas por revisar" valor={d.porRevisar} icono="tareas" color={d.porRevisar ? "text-amber-700 bg-amber-100" : "text-emerald-700 bg-emerald-100"} />
        <Indicador etiqueta="Asistencia de tu tutoría hoy" valor={at ? `${at.presentes}/${at.total}` : "—"} detalle={at ? `${at.tardanzas} tardanzas · ${at.faltas} faltas` : "No eres tutor"} icono="asistencia" color="text-emerald-700 bg-emerald-100" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Tarjeta titulo="Clases de hoy" accion={<Link href={`${B}/horario`} className="text-xs text-aduni-700 font-semibold">Horario</Link>}>
          {d.horarioHoy.length === 0 ? <Vacio texto="No tienes clases hoy" icono="horario" /> : (
            <ul className="grid gap-2">
              {d.horarioHoy.map((h) => (
                <li key={h._id} className="flex items-center gap-3">
                  <span className="w-1.5 h-9 rounded-full" style={{ background: h.curso.color }} />
                  <div><p className="text-sm font-semibold">{h.curso.nombre}</p><p className="text-xs text-gray-500">{h.horaInicio} - {h.horaFin} · {h.aula.nombre}</p></div>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
        <Tarjeta titulo="Mis cursos" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {d.cursos.map((c) => (
              <Link key={c.id} href={`${B}/notas?curso=${c.id}`} className="rounded-lg border border-gray-200 p-3 hover:border-aduni-600 hover:shadow-sm transition flex gap-3">
                <span className="w-1.5 rounded-full" style={{ background: c.color }} />
                <div>
                  <p className="font-semibold text-gray-900">{c.nombre}</p>
                  <p className="text-xs text-gray-500">{c.aula.nombre} · {c.estudiantes} estudiantes</p>
                </div>
              </Link>
            ))}
          </div>
        </Tarjeta>
      </div>
      <ListaComunicados limite={3} titulo="Últimos comunicados" />
    </div>
  );
}
