"use client";

import { useState } from "react";
import { descargar } from "../../../../lib/api";
import GestionUsuarios from "../../../../components/intranet/GestionUsuarios";
import { usePortal } from "../../../../components/intranet/PortalLayout";
import { Titulo, Pestanas, AvisoError, botonSecundario } from "../../../../components/intranet/ui";

export default function PersonalAdmin() {
  const [rol, setRol] = useState("profesor");
  const [error, setError] = useState("");
  const { puede } = usePortal();
  // Carnés con QR para marcar el ingreso en la puerta (los imprime Secretaría).
  const imprimirCarnes = () => descargar(`/admin/carnes.pdf?personal=${rol}`, "carnes-personal.pdf", { abrir: true }).catch((e) => setError(e.message));
  return (
    <>
      <Titulo titulo="Docentes, personal y familias" subtitulo="Cuentas de docentes, personal administrativo y apoderados (portal de familias)">
        {rol !== "apoderado" && puede("secretaria") && (
          <button onClick={imprimirCarnes} className={botonSecundario}>Imprimir carnés con QR ({rol === "profesor" ? "docentes" : "administrativos"})</button>
        )}
      </Titulo>
      <AvisoError texto={error} />
      <div className="mb-4"><Pestanas valor={rol} onChange={(r) => { setRol(r); setError(""); }} opciones={[["profesor", "Docentes"], ["administrativo", "Administrativos"], ["apoderado", "Apoderados"]]} /></div>
      <GestionUsuarios key={rol} rol={rol} />
    </>
  );
}
