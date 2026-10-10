"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Seguridad } from "../../../../components/intranet/Bitacora";
import { Titulo, Cargando } from "../../../../components/intranet/ui";

function Contenido() {
  const router = useRouter();
  const estado = useSearchParams().get("estado") || "";
  return (
    <>
      <Titulo titulo="Cuentas y accesos" subtitulo="Desbloquea cuentas, restablece contraseñas, cierra sesiones, quita la verificación en dos pasos o suspende cuentas. Nadie puede ver contraseñas: solo restablecerlas." />
      <Seguridad key={estado} filtroInicial={estado} verActividad={(id) => router.push(`/intranet/soporte/bitacora?usuario=${id}`)} />
    </>
  );
}

export default function Cuentas() {
  return <Suspense fallback={<Cargando />}><Contenido /></Suspense>;
}
