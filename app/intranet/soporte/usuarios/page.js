"use client";

import { useState } from "react";
import GestionUsuarios from "../../../../components/intranet/GestionUsuarios";
import { Titulo, Pestanas } from "../../../../components/intranet/ui";

export default function UsuariosSoporte() {
  const [rol, setRol] = useState("administrativo");
  return (
    <>
      <Titulo titulo="Usuarios" subtitulo="Todas las cuentas de la intranet. Normalmente secretaría crea las de estudiantes y docentes; aquí puedes corregir cualquier cuenta y crear las del personal administrativo." />
      <div className="mb-4"><Pestanas valor={rol} onChange={setRol} opciones={[["administrativo", "Administrativos"], ["profesor", "Docentes"], ["estudiante", "Estudiantes"], ["apoderado", "Familias"], ["soporte", "Soporte técnico"]]} /></div>
      <GestionUsuarios key={rol} rol={rol} />
    </>
  );
}
