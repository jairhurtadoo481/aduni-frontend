"use client";

import { useApi } from "../../../../lib/intranet";
import HorarioSemanal from "../../../../components/intranet/HorarioSemanal";
import { Titulo, Tarjeta, Cargando, AvisoError } from "../../../../components/intranet/ui";

export default function HorarioDocente() {
  const { data, cargando, error } = useApi("/docente/horario");
  return (
    <>
      <Titulo titulo="Mi horario" subtitulo="Tus clases de la semana en todas las aulas" />
      <AvisoError texto={error} />
      <Tarjeta>
        {cargando ? <Cargando /> : <HorarioSemanal bloques={(data || []).map((b) => ({ ...b, detalle: b.aula?.nombre }))} />}
      </Tarjeta>
    </>
  );
}
