"use client";

import { useApi } from "../../../../lib/intranet";
import RegistroConducta from "../../../../components/intranet/RegistroConducta";
import { Titulo, Cargando } from "../../../../components/intranet/ui";

export default function ConductaDocente() {
  const aulas = useApi("/docente/aulas");
  return (
    <>
      <Titulo titulo="Conducta" subtitulo="Méritos, deméritos e incidencias de tus estudiantes" />
      {aulas.cargando ? <Cargando /> : <RegistroConducta rutaLista="/docente/incidencias" aulas={aulas.data} />}
    </>
  );
}
