"use client";

import Link from "next/link";
import { useApi } from "../../../lib/intranet";
import { Titulo, Tarjeta, Cargando, AvisoError, Indicador, Etiqueta, botonSecundario } from "../../../components/intranet/ui";
import { ROLES, fechaHora } from "../../../components/intranet/Bitacora";

const B = "/intranet/soporte";
const duracion = (s) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d ? `${d} d ${h} h` : h ? `${h} h ${m} min` : `${m} min`;
};
// `ahora` = hora del servidor en la respuesta (el render debe ser puro).
const hace = (fecha, ahora) => {
  const horas = (new Date(ahora) - new Date(fecha)) / 36e5;
  return horas < 1 ? "hace menos de 1 hora" : horas < 48 ? `hace ${Math.round(horas)} h` : `hace ${Math.round(horas / 24)} días`;
};

function Servicio({ nombre, ok, detalle }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-2 text-sm"><span className={`w-2.5 h-2.5 rounded-full ${ok ? "bg-emerald-500" : "bg-gray-300"}`} />{nombre}</span>
      <span className="text-xs text-gray-500 text-right">{detalle}</span>
    </li>
  );
}

export default function PanelSoporte() {
  const { data: e, error, cargando, recargar } = useApi("/soporte/estado");
  if (cargando) return <Cargando />;
  if (error) return <AvisoError texto={error} />;

  const respaldoViejo = !e.respaldos.ultimo || new Date(e.servidor.hora) - new Date(e.respaldos.ultimo.fecha) > 2 * 864e5;
  const avisos = [
    e.mantenimiento.activo && { texto: "El modo mantenimiento está ACTIVO: nadie más puede ingresar a la intranet.", href: `${B}/mantenimiento` },
    e.cuentas.bloqueadas.length > 0 && { texto: `${e.cuentas.bloqueadas.length} cuenta(s) bloqueada(s) ahora por intentos fallidos.`, href: `${B}/cuentas?estado=bloqueadas` },
    e.tickets.urgentes > 0 && { texto: `${e.tickets.urgentes} solicitud(es) de prioridad alta o urgente sin resolver.`, href: `${B}/tickets` },
    e.errores.ultimas24h > 0 && { texto: `${e.errores.ultimas24h} error(es) del servidor en las últimas 24 horas.`, href: `${B}/errores` },
    e.comprobantes.conError > 0 && { texto: `${e.comprobantes.conError} comprobante(s) electrónico(s) rechazados o con error en SUNAT.`, href: null },
    e.cuentas.adminSin2FA > 0 && { texto: `${e.cuentas.adminSin2FA} cuenta(s) del personal administrativo sin verificación en dos pasos.`, href: `${B}/cuentas?estado=sin2fa` },
    respaldoViejo && { texto: e.respaldos.ultimo ? `El último respaldo automático es de ${hace(e.respaldos.ultimo.fecha, e.servidor.hora)}.` : "No hay respaldos automáticos en el servidor.", href: `${B}/mantenimiento` },
  ].filter(Boolean);

  return (
    <>
      <Titulo titulo="Estado del sistema" subtitulo={`Actualizado ${fechaHora(e.servidor.hora)}`}>
        <button onClick={recargar} className={botonSecundario}>Actualizar</button>
      </Titulo>

      {avisos.length > 0 ? (
        <ul className="grid gap-2 mb-6">
          {avisos.map((a) => (
            <li key={a.texto} className="flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
              {a.texto}
              {a.href && <Link href={a.href} className="font-semibold underline whitespace-nowrap">Revisar</Link>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-6 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">Todo en orden: sin alertas pendientes.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Indicador etiqueta="Solicitudes abiertas" valor={e.tickets.abiertos} detalle={`${e.tickets.urgentes} prioritarias`} icono="soporte" />
        <Indicador etiqueta="Ingresos (24 h)" valor={e.accesos.exitosos24h} detalle={`${e.accesos.fallidos24h} intentos fallidos`} icono="candado" color={e.accesos.fallidos24h > 20 ? "text-red-700 bg-red-100" : undefined} />
        <Indicador etiqueta="Errores (24 h)" valor={e.errores.ultimas24h} detalle="del servidor" icono="error" color={e.errores.ultimas24h ? "text-red-700 bg-red-100" : undefined} />
        <Indicador etiqueta="Servidor activo" valor={duracion(e.servidor.uptime)} detalle={`${e.servidor.memoriaMB} MB de memoria`} icono="servidor" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Tarjeta titulo="Servicios">
          <ul className="divide-y divide-gray-100 -my-2">
            <Servicio nombre="Base de datos" ok={e.baseDatos.estado === "conectada"} detalle={`${e.baseDatos.estado}${e.baseDatos.pingMs != null ? ` · ${e.baseDatos.pingMs} ms` : ""}`} />
            <Servicio nombre="Archivos (Cloudinary)" ok={e.servicios.cloudinary} detalle={e.servicios.cloudinary ? "Configurado" : "Sin configurar"} />
            <Servicio nombre="Facturación SUNAT" ok={e.servicios.sunat?.activo} detalle={e.servicios.sunat ? `${e.servicios.sunat.activo ? "Activa" : "Inactiva"} · ${e.servicios.sunat.ambiente === "produccion" ? "Producción" : "Pruebas (beta)"}` : "Sin configurar"} />
            <Servicio nombre="Notificaciones push" ok={e.servicios.push} detalle={e.servicios.push ? "Activas" : "Sin claves VAPID"} />
            <Servicio nombre="Correo" ok={e.servicios.correo} detalle={e.servicios.correo ? "Activo" : "Sin SMTP"} />
            <Servicio nombre="WhatsApp" ok={e.servicios.whatsapp} detalle={e.servicios.whatsapp ? "Activo" : "Sin configurar"} />
          </ul>
          <p className="text-xs text-gray-400 mt-3">Node {e.servidor.node} · BD «{e.baseDatos.nombre}»</p>
        </Tarjeta>

        <Tarjeta titulo="Cuentas">
          <ul className="divide-y divide-gray-100 -my-2 text-sm">
            {e.cuentas.porRol.map((r) => (
              <li key={r._id} className="flex justify-between py-2"><span>{ROLES[r._id] || r._id}</span><span className="text-gray-500">{r.activos} activas{r.total !== r.activos && ` · ${r.total - r.activos} suspendidas`}</span></li>
            ))}
          </ul>
          {e.cuentas.bloqueadas.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-red-700 mb-1">Bloqueadas ahora</p>
              <ul className="text-xs text-gray-600 grid gap-1">
                {e.cuentas.bloqueadas.map((u) => <li key={u._id}>{u.nombre} ({u.codigo}) hasta {new Date(u.bloqueadoHasta).toLocaleTimeString("es-PE", { timeStyle: "short" })}</li>)}
              </ul>
            </div>
          )}
          <Link href={`${B}/cuentas`} className="text-xs text-aduni-700 hover:underline mt-3 inline-block">Gestionar cuentas</Link>
        </Tarjeta>

        <Tarjeta titulo="Respaldos automáticos">
          {e.respaldos.ultimo ? (
            <p className="text-sm">Último: <b>{fechaHora(e.respaldos.ultimo.fecha)}</b> ({hace(e.respaldos.ultimo.fecha, e.servidor.hora)})<span className="block text-xs text-gray-500">{e.respaldos.total} respaldo(s) guardados en el servidor</span></p>
          ) : (
            <p className="text-sm text-gray-500">Aún no hay respaldos en la carpeta del servidor.</p>
          )}
          <Link href={`${B}/mantenimiento`} className="text-xs text-aduni-700 hover:underline mt-3 inline-block">Respaldo y mantenimiento</Link>
        </Tarjeta>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Tarjeta titulo="Cambios sensibles (últimos 7 días)" accion={<Link href={`${B}/bitacora`} className="text-xs text-aduni-700 hover:underline">Ver bitácora</Link>}>
          {e.alertas.length === 0 ? <p className="text-sm text-gray-400">Sin cambios de seguridad ni eliminaciones.</p> : (
            <ul className="divide-y divide-gray-100 -my-2">
              {e.alertas.map((a) => (
                <li key={a._id} className="py-2 text-sm">
                  <p className="flex items-center gap-2"><Etiqueta color={a.tipo === "eliminar" ? "red" : "violet"}>{a.tipo === "eliminar" ? "Eliminó" : "Seguridad"}</Etiqueta><span className="font-medium">{a.accion}</span></p>
                  <p className="text-xs text-gray-500">{a.nombre || "—"} · {fechaHora(a.createdAt)}{a.detalle && ` · ${a.detalle}`}</p>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
        <Tarjeta titulo="Últimos errores del servidor" accion={<Link href={`${B}/errores`} className="text-xs text-aduni-700 hover:underline">Ver todos</Link>}>
          {e.errores.recientes.length === 0 ? <p className="text-sm text-gray-400">Sin errores registrados.</p> : (
            <ul className="divide-y divide-gray-100 -my-2">
              {e.errores.recientes.map((x) => (
                <li key={x._id} className="py-2 text-sm">
                  <p className="font-mono text-xs">{x.metodo} {x.ruta}</p>
                  <p className="text-red-700 text-xs">{x.mensaje}</p>
                  <p className="text-xs text-gray-400">{fechaHora(x.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </>
  );
}
