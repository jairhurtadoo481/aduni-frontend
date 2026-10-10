"use client";

import ListaComunicados from "../../../../components/intranet/ListaComunicados";
import Agenda from "../../../../components/intranet/Agenda";
import { Titulo } from "../../../../components/intranet/ui";

export default function ComunicadosEstudiante() {
  return (
    <>
      <Titulo titulo="Comunicados y agenda" subtitulo="Avisos del colegio y fechas importantes" />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <ListaComunicados />
        <Agenda />
      </div>
    </>
  );
}
