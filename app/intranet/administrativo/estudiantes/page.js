"use client";

import GestionUsuarios from "../../../../components/intranet/GestionUsuarios";
import { Titulo } from "../../../../components/intranet/ui";

export default function EstudiantesAdmin() {
  return (
    <>
      <Titulo titulo="Estudiantes" subtitulo="Matrícula, datos del apoderado y acceso a la intranet" />
      <GestionUsuarios rol="estudiante" />
    </>
  );
}
