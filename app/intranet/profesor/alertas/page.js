"use client";

import { useApi } from "../../../../lib/intranet";
import ListaAlertas from "../../../../components/intranet/ListaAlertas";
import { Titulo, AvisoError } from "../../../../components/intranet/ui";

export default function AlertasDocente() {
  const { data, cargando, error } = useApi("/docente/alertas");
  return (
    <>
      <Titulo titulo="Alertas tempranas" subtitulo="Estudiantes de tus aulas que necesitan acompañamiento (últimos 30 días y bimestre actual)" />
      <AvisoError texto={error} />
      <ListaAlertas datos={data} cargando={cargando} />
    </>
  );
}
