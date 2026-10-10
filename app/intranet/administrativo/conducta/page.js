"use client";

import { useApi } from "../../../../lib/intranet";
import RegistroConducta from "../../../../components/intranet/RegistroConducta";
import { Titulo, Cargando } from "../../../../components/intranet/ui";

export default function ConductaAdmin() {
  const aulas = useApi("/admin/aulas");
  return (
    <>
      <Titulo titulo="Conducta" subtitulo="Méritos, deméritos e incidencias de todo el colegio" />
      {aulas.cargando ? <Cargando /> : (
        <RegistroConducta rutaLista="/admin/incidencias" aulas={aulas.data} rutaEstudiantes={(a) => `/admin/asistencia/aula?aula=${a}`} />
      )}
    </>
  );
}
