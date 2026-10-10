"use client";

import { useApiEst } from "../../../../components/intranet/PortalLayout";
import HorarioSemanal from "../../../../components/intranet/HorarioSemanal";
import { Titulo, Tarjeta, Cargando, AvisoError } from "../../../../components/intranet/ui";

export default function HorarioEstudiante() {
  const { data, cargando, error } = useApiEst("/estudiante/horario");
  return (
    <>
      <Titulo titulo="Horario" subtitulo="Horario semanal de clases del aula" />
      <AvisoError texto={error} />
      <Tarjeta>
        {cargando ? <Cargando /> : <HorarioSemanal bloques={(data || []).map((b) => ({ ...b, detalle: b.curso?.docente?.nombre }))} />}
      </Tarjeta>
    </>
  );
}
