"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Actividad } from "../../../../components/intranet/Bitacora";
import { Titulo, Cargando } from "../../../../components/intranet/ui";

function Contenido() {
  const usuario = useSearchParams().get("usuario") || "";
  return (
    <>
      <Titulo titulo="Bitácora (auditoría)" subtitulo="Todo lo que se crea, modifica o elimina en la intranet, quién lo hizo, cuándo y desde qué IP. Los cambios sensibles también te llegan como notificación." />
      <Actividad key={usuario} usuarioInicial={usuario} />
    </>
  );
}

export default function Bitacora() {
  return <Suspense fallback={<Cargando />}><Contenido /></Suspense>;
}
