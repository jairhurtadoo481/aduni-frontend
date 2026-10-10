"use client";

import { fechaLarga } from "../../../../lib/intranet";
import { useApiEst } from "../../../../components/intranet/PortalLayout";
import { Titulo, Tarjeta, Cargando, Vacio, Etiqueta, Indicador, AvisoError } from "../../../../components/intranet/ui";

const TIPO = { merito: ["Mérito", "green"], demerito: ["Demérito", "red"], incidencia: ["Incidencia", "amber"] };

export default function ConductaEstudiante() {
  const { data, cargando, error } = useApiEst("/estudiante/incidencias");
  if (cargando) return <Cargando />;
  if (error) return <AvisoError texto={error} />;
  const cuenta = (t) => data.filter((i) => i.tipo === t).length;
  return (
    <>
      <Titulo titulo="Conducta" subtitulo="Reconocimientos y observaciones registradas por docentes y dirección" />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Indicador etiqueta="Méritos" valor={cuenta("merito")} icono="conducta" color="text-emerald-700 bg-emerald-100" />
        <Indicador etiqueta="Deméritos" valor={cuenta("demerito")} icono="alerta" color="text-red-700 bg-red-100" />
        <Indicador etiqueta="Incidencias" valor={cuenta("incidencia")} icono="justificacion" color="text-amber-700 bg-amber-100" />
      </div>
      <Tarjeta titulo="Historial">
        {data.length === 0 ? <Vacio texto="Sin registros" icono="conducta" /> : (
          <ul className="divide-y divide-gray-100 -my-3">
            {data.map((i) => (
              <li key={i._id} className="py-3 flex gap-3">
                <Etiqueta color={TIPO[i.tipo][1]}>{TIPO[i.tipo][0]}</Etiqueta>
                <div>
                  <p className="text-sm">{i.categoria && <strong>{i.categoria}: </strong>}{i.descripcion}</p>
                  <p className="text-xs text-gray-400 first-letter:uppercase">{fechaLarga(i.fecha)} · {i.registradoPor?.nombre}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </>
  );
}
