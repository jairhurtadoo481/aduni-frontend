"use client";

import { useState } from "react";
import { apiIntranet, descargar } from "../../../../lib/api";
import { useApi } from "../../../../lib/intranet";
import { Titulo, Tarjeta, Cargando, Campo, AvisoError, Exito, inputClase, botonClase, botonSecundario } from "../../../../components/intranet/ui";
import { fechaHora } from "../../../../components/intranet/Bitacora";

const tamano = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`);

function Mantenimiento({ inicial, onCambio }) {
  const [mensaje, setMensaje] = useState(inicial.mensaje);
  const [msg, setMsg] = useState({ ok: "", error: "" });
  const cambiar = async (activo) => {
    if (activo && !confirm("Nadie (excepto soporte) podrá usar la intranet y las sesiones abiertas dejarán de funcionar hasta que lo desactives. ¿Activar?")) return;
    try {
      await apiIntranet("/soporte/mantenimiento", { method: "PUT", body: { activo, mensaje } });
      setMsg({ ok: activo ? "Modo mantenimiento activado." : "Modo mantenimiento desactivado: todos pueden ingresar.", error: "" });
      onCambio();
    } catch (e) {
      setMsg({ ok: "", error: e.message });
    }
  };
  return (
    <Tarjeta titulo="Modo mantenimiento">
      <div className="grid gap-3">
        <p className="text-sm text-gray-600">Úsalo cuando vayas a actualizar el sistema o restaurar un respaldo: los usuarios verán el mensaje y no podrán hacer cambios mientras trabajas.</p>
        <p className={`text-sm font-semibold ${inicial.activo ? "text-red-700" : "text-emerald-700"}`}>Estado actual: {inicial.activo ? "ACTIVO (intranet cerrada)" : "Desactivado (intranet abierta)"}</p>
        <Campo etiqueta="Mensaje para los usuarios"><textarea className={inputClase} rows={2} maxLength={300} value={mensaje} onChange={(e) => setMensaje(e.target.value)} /></Campo>
        <div className="flex gap-2">
          {inicial.activo
            ? <button onClick={() => cambiar(false)} className={botonClase}>Desactivar y abrir la intranet</button>
            : <button onClick={() => cambiar(true)} className={botonSecundario}>Activar mantenimiento</button>}
        </div>
        <AvisoError texto={msg.error} />
        <Exito texto={msg.ok} />
      </div>
    </Tarjeta>
  );
}

export default function MantenimientoPage() {
  const { data, cargando, recargar } = useApi("/soporte/estado");
  const [error, setError] = useState("");
  if (cargando || !data) return <Cargando />;
  return (
    <>
      <Titulo titulo="Mantenimiento y respaldo" subtitulo="Cierra temporalmente la intranet para actualizar y controla los respaldos de la base de datos." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Mantenimiento key={String(data.mantenimiento.activo)} inicial={data.mantenimiento} onCambio={recargar} />
        <Tarjeta titulo="Respaldo de la base de datos">
          <div className="grid gap-3">
            <p className="text-sm text-gray-600">Descarga ahora una copia completa (estudiantes, notas, asistencia, pagos, comprobantes...). Contiene datos personales: guárdala cifrada y fuera del alcance de terceros.</p>
            <button onClick={() => descargar("/admin/respaldo", `respaldo-aduni-${new Date().toISOString().slice(0, 10)}.zip`).catch((e) => setError(e.message))} className={`${botonClase} w-fit`}>Descargar respaldo (.zip)</button>
            <AvisoError texto={error} />
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Respaldos automáticos guardados en el servidor</p>
              {data.respaldos.lista.length === 0 ? <p className="text-sm text-gray-400">Ninguno todavía.</p> : (
                <ul className="text-xs text-gray-600 divide-y divide-gray-100">
                  {data.respaldos.lista.map((r) => <li key={r.archivo} className="py-1.5 flex justify-between gap-3"><span className="font-mono truncate">{r.archivo}</span><span className="whitespace-nowrap">{fechaHora(r.fecha)} · {tamano(r.tamano)}</span></li>)}
                </ul>
              )}
            </div>
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <p className="font-semibold mb-1">Programar el respaldo diario en el servidor</p>
              <p>Ejecuta <code>node scripts/respaldo.js</code> una vez al día (Programador de tareas en Windows o <code>cron</code> en Linux). Se conservan los 30 más recientes. Para restaurar: activa el mantenimiento y ejecuta <code>node scripts/restaurar.js archivo.zip</code>.</p>
            </div>
          </div>
        </Tarjeta>
      </div>
    </>
  );
}
