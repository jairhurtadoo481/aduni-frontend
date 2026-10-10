"use client";

import { useState } from "react";
import GestionUsuarios from "../../../../components/intranet/GestionUsuarios";
import { Titulo, Pestanas } from "../../../../components/intranet/ui";

export default function PersonalAdmin() {
  const [rol, setRol] = useState("profesor");
  return (
    <>
      <Titulo titulo="Docentes, personal y familias" subtitulo="Cuentas de docentes, personal administrativo y apoderados (portal de familias)" />
      <div className="mb-4"><Pestanas valor={rol} onChange={setRol} opciones={[["profesor", "Docentes"], ["administrativo", "Administrativos"], ["apoderado", "Apoderados"]]} /></div>
      <GestionUsuarios key={rol} rol={rol} />
    </>
  );
}
