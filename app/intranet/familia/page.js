"use client";

import { useApi } from "../../../lib/intranet";
import { usePortal } from "../../../components/intranet/PortalLayout";
import InicioEstudiante from "../estudiante/page";
import { EstadoAsistencia, Etiqueta } from "../../../components/intranet/ui";

export default function InicioFamilia() {
  const { hijo, setHijo, usuario } = usePortal();
  const { data: hijos } = useApi("/familia/hijos");

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hola, {usuario.nombres?.split(" ")[0]}</h1>
        <p className="text-sm text-gray-500">Elige a tu hijo(a) para ver su información.</p>
      </div>
      {hijos?.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {hijos.map((h) => (
            <button key={h._id} onClick={() => setHijo(h._id)}
              className={`text-left bg-white rounded-xl border p-4 transition ${hijo === h._id ? "border-aduni-600 ring-2 ring-aduni-600/20" : "border-gray-200 hover:border-aduni-600"}`}>
              <p className="font-semibold">{h.nombre}</p>
              <p className="text-xs text-gray-500">{h.aula?.nombre || "Sin aula"} · {h.codigo}</p>
              <div className="flex flex-wrap gap-2 mt-2 items-center text-xs">
                Hoy: {h.ingresoHoy ? <EstadoAsistencia estado={h.ingresoHoy.estado} /> : <span className="text-gray-400">aún sin lista</span>}
                {h.tieneCuenta === false && <Etiqueta color="blue">Sin cuenta propia (la manejas tú)</Etiqueta>}
                {h.cuotasVencidas > 0 && <Etiqueta color="red">{h.cuotasVencidas} cuota(s) vencida(s)</Etiqueta>}
              </div>
            </button>
          ))}
        </div>
      )}
      {hijo && <InicioEstudiante key={hijo} />}
      <p className="text-xs text-gray-400">Activa las notificaciones en “Mi perfil” para recibir en tu celular los avisos de asistencia, notas, tareas y pagos.</p>
    </div>
  );
}
