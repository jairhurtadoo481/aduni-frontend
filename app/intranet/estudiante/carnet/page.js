"use client";

import Image from "next/image";
import { useApiEst } from "../../../../components/intranet/PortalLayout";
import { Titulo, Cargando, AvisoError } from "../../../../components/intranet/ui";

export default function CarnetEstudiante() {
  const { data: c, cargando, error } = useApiEst("/estudiante/carnet");
  if (cargando) return <Cargando />;
  if (error) return <AvisoError texto={error} />;

  return (
    <>
      <Titulo titulo="Carné digital" subtitulo="Muéstralo en la puerta para registrar tu ingreso" />
      <div className="flex flex-col items-center">
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-white">
          <div className="bg-gradient-to-br from-aduni-900 to-aduni-600 px-6 pt-5 pb-14 text-white relative">
            <div className="bg-white rounded-lg p-1.5 w-fit">
              <Image src="/logo-aduni.png" alt="ADUNI+" width={130} height={36} />
            </div>
            <p className="text-xs tracking-widest text-oro font-semibold mt-3">CARNÉ ESTUDIANTIL {c.anio}</p>
          </div>
          <div className="-mt-10 px-6 pb-6 text-center">
            <div className="bg-white rounded-2xl shadow-md p-3 w-fit mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.qr} alt={`QR ${c.codigo}`} className="w-52 h-52" />
            </div>
            {c.foto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.foto} alt="Foto" className="w-20 h-24 object-cover rounded-lg mx-auto mt-4 border" />
            )}
            <p className="text-xl font-bold text-gray-900 mt-4">{c.nombres}</p>
            <p className="text-gray-600">{c.apellidos}</p>
            <div className="grid grid-cols-2 gap-3 mt-5 text-left">
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">CÓDIGO</p><p className="font-mono font-bold text-aduni-900">{c.codigo}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-[11px] text-gray-500">DNI</p><p className="font-mono font-bold text-aduni-900">{c.dni || "—"}</p></div>
              <div className="bg-gray-50 rounded-lg p-3 col-span-2"><p className="text-[11px] text-gray-500">AULA</p><p className="font-semibold text-aduni-900">{c.aula}</p></div>
            </div>
          </div>
          <div className="h-2 bg-oro" />
        </div>
        <p className="text-xs text-gray-500 mt-4 max-w-sm text-center">Sube el brillo de tu pantalla al mostrar el código. El carné es personal e intransferible.</p>
      </div>
    </>
  );
}
