"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Actividad, Seguridad } from "../../../../components/intranet/Bitacora";
import { Titulo, Cargando, Pestanas } from "../../../../components/intranet/ui";

function Contenido() {
  const usuarioUrl = useSearchParams().get("usuario") || "";
  const [tab, setTab] = useState("actividad");
  const [usuario, setUsuario] = useState(usuarioUrl);
  return (
    <>
      <Titulo titulo="Bitácora y seguridad" subtitulo="Quién creó, modificó o eliminó cada cosa, inicios de sesión, intentos fallidos y cambios de contraseña. Solo Dirección." />
      <div className="mb-6"><Pestanas valor={tab} onChange={setTab} opciones={[["actividad", "Actividad"], ["seguridad", "Seguridad de cuentas"]]} /></div>
      {tab === "actividad" ? <Actividad key={usuario} usuarioInicial={usuario} /> : <Seguridad verActividad={(id) => { setUsuario(id); setTab("actividad"); }} />}
    </>
  );
}

export default function Auditoria() {
  return <Suspense fallback={<Cargando />}><Contenido /></Suspense>;
}
