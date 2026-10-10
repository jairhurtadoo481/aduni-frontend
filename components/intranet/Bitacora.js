"use client";

import { useState } from "react";
import { apiIntranet } from "../../lib/api";
import { useApi } from "../../lib/intranet";
import { NOMBRE_AREA, usePortal } from "./PortalLayout";
import { Tarjeta, Cargando, Vacio, Etiqueta, Pestanas, Campo, Modal, AvisoError, Exito, inputClase, botonClase, botonSecundario } from "./ui";

export const TIPOS = { crear: ["Creó", "green"], modificar: ["Modificó", "blue"], eliminar: ["Eliminó", "red"], acceso: ["Acceso", "gray"], seguridad: ["Seguridad", "violet"], pago: ["Pagos", "amber"], otro: ["Otro", "gray"] };
export const ROLES = { administrativo: "Administrativo", profesor: "Docente", estudiante: "Estudiante", apoderado: "Familia", soporte: "Soporte técnico" };
export const fechaHora = (d) => (d ? new Date(d).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" }) : "—");
const bloqueada = (u) => u.bloqueadoHasta && new Date(u.bloqueadoHasta) > new Date();

// Registro inmutable de todo lo que se hace en la intranet.
export function Actividad({ usuarioInicial }) {
  const [f, setF] = useState({ q: "", tipo: "", rol: "", desde: "", hasta: "", usuario: usuarioInicial || "" });
  const [aplicado, setAplicado] = useState(f);
  const qs = new URLSearchParams(Object.entries(aplicado).filter(([, v]) => v)).toString();
  const { data, cargando } = useApi(`/admin/auditoria?limite=500${qs ? `&${qs}` : ""}`);

  const exportar = () => {
    const filas = [["Fecha", "Usuario", "Rol", "Tipo", "Acción", "Detalle", "IP"], ...data.map((a) => [fechaHora(a.createdAt), a.nombre, a.rol, a.tipo, a.accion, a.detalle, a.ip])];
    const csv = "﻿" + filas.map((x) => x.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
    const el = document.createElement("a");
    el.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    el.download = "bitacora-aduni.csv";
    el.click();
  };

  return (
    <div className="grid gap-4">
      <form onSubmit={(e) => { e.preventDefault(); setAplicado(f); }} className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 items-end">
        <Campo etiqueta="Buscar"><input className={inputClase} placeholder="Persona, acción o detalle" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} /></Campo>
        <Campo etiqueta="Tipo"><select className={inputClase} value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}><option value="">Todos</option>{Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select></Campo>
        <Campo etiqueta="Rol"><select className={inputClase} value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value })}><option value="">Todos</option>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Campo>
        <Campo etiqueta="Desde"><input type="date" className={inputClase} value={f.desde} onChange={(e) => setF({ ...f, desde: e.target.value })} /></Campo>
        <Campo etiqueta="Hasta"><input type="date" className={inputClase} value={f.hasta} onChange={(e) => setF({ ...f, hasta: e.target.value })} /></Campo>
        <div className="flex gap-2"><button className={botonSecundario}>Filtrar</button>{data?.length > 0 && <button type="button" onClick={exportar} className={botonSecundario}>Excel</button>}</div>
      </form>
      {aplicado.usuario && <p className="text-sm">Mostrando la actividad de un usuario. <button onClick={() => { const n = { ...f, usuario: "" }; setF(n); setAplicado(n); }} className="text-aduni-700 underline">Ver todos</button></p>}
      <Tarjeta>
        {cargando || !data ? <Cargando /> : data.length === 0 ? <Vacio texto="Sin registros" icono="bitacora" /> : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="text-left px-5 py-3">Fecha</th><th className="text-left px-3 py-3">Quién</th><th className="px-3 py-3">Tipo</th><th className="text-left px-3 py-3">Acción</th><th className="text-left px-5 py-3">Detalle</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((a) => (
                  <tr key={a._id}>
                    <td className="px-5 py-2 text-xs text-gray-500 whitespace-nowrap">{fechaHora(a.createdAt)}</td>
                    <td className="px-3 py-2">{a.nombre || "—"}<span className="block text-xs text-gray-400">{ROLES[a.rol] || a.rol}{a.ip && ` · ${a.ip.replace("::ffff:", "")}`}</span></td>
                    <td className="px-3 py-2 text-center"><Etiqueta color={TIPOS[a.tipo]?.[1] || "gray"}>{TIPOS[a.tipo]?.[0] || a.tipo}</Etiqueta></td>
                    <td className={`px-3 py-2 font-medium ${/fallido|incorrecto|suspendida|inexistente|bloquead/i.test(a.accion) ? "text-red-600" : ""}`}>{a.accion}</td>
                    <td className="px-5 py-2 text-xs text-gray-600">{a.detalle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>
      <p className="text-xs text-gray-400">La bitácora no se puede editar ni borrar desde la intranet. Las contraseñas nunca se guardan legibles ni se muestran a nadie (Ley 29733): aquí se ve quién las cambió o restableció, y cuándo.</p>
    </div>
  );
}

// Ventana con las acciones de seguridad sobre una cuenta.
function GestionarCuenta({ u, onCerrar, onCambio, verActividad }) {
  const { usuario: yo, rol, areas } = usePortal();
  const esDireccion = rol === "soporte" || areas.includes("direccion");
  const [msg, setMsg] = useState({ ok: "", error: "" });
  const [clave, setClave] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const accion = async (ruta, opciones = { method: "POST" }, confirmar) => {
    if (confirmar && !window.confirm(confirmar)) return;
    setOcupado(true);
    try {
      const r = await apiIntranet(`/admin/usuarios/${u._id}/${ruta}`, opciones);
      if (r.passwordTemporal) setClave(r);
      setMsg({ ok: r.mensaje || "Listo", error: "" });
      onCambio();
    } catch (e) {
      setMsg({ ok: "", error: e.message });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Modal abierto titulo={`${u.nombre} · ${u.codigo}`} onCerrar={onCerrar}>
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <Etiqueta color="blue">{ROLES[u.rol]}</Etiqueta>
          {!u.activo && <Etiqueta color="red">Suspendida</Etiqueta>}
          {bloqueada(u) && <Etiqueta color="red">Bloqueada hasta {new Date(u.bloqueadoHasta).toLocaleTimeString("es-PE", { timeStyle: "short" })}</Etiqueta>}
          {u.totpActivo ? <Etiqueta color="green">Verificación en 2 pasos</Etiqueta> : <Etiqueta>Sin 2 pasos</Etiqueta>}
          {u.debeCambiarPassword && <Etiqueta color="amber">Contraseña temporal</Etiqueta>}
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-gray-500">Último acceso</dt><dd>{fechaHora(u.ultimoAcceso)}</dd>
          <dt className="text-gray-500">Contraseña cambiada</dt><dd>{fechaHora(u.passwordCambiadaEn)}</dd>
          <dt className="text-gray-500">Intentos fallidos (7 días)</dt><dd>{u.fallidos7d}</dd>
          <dt className="text-gray-500">Sesiones cerradas</dt><dd>{fechaHora(u.sesionesCerradasEn)}</dd>
        </dl>
        {clave && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
            Contraseña temporal para <b>{clave.codigo}</b>: <code className="font-mono text-base font-bold select-all">{clave.passwordTemporal}</code>
            <p className="text-xs text-amber-800 mt-1">Se muestra solo esta vez. Entrégala en persona; el sistema pedirá cambiarla al ingresar.</p>
          </div>
        )}
        <AvisoError texto={msg.error} />
        <Exito texto={msg.ok} />
        <div className="grid gap-2 sm:grid-cols-2">
          {bloqueada(u) && <button disabled={ocupado} onClick={() => accion("desbloquear")} className={botonClase}>Desbloquear ahora</button>}
          {String(u._id) !== String(yo.id) && <>
            <button disabled={ocupado} onClick={() => accion("restablecer", { method: "POST" }, "Se generará una contraseña temporal nueva y se cerrarán sus sesiones. ¿Continuar?")} className={botonSecundario}>Restablecer contraseña</button>
            <button disabled={ocupado} onClick={() => accion("cerrar-sesiones", { method: "POST" }, "Se cerrará su sesión en todos los dispositivos. ¿Continuar?")} className={botonSecundario}>Cerrar todas sus sesiones</button>
            {esDireccion && u.totpActivo && u.rol !== "soporte" && <button disabled={ocupado} onClick={() => accion("quitar-2fa", { method: "POST" }, "Úsalo solo si perdió su celular. ¿Quitar la verificación en dos pasos?")} className={botonSecundario}>Quitar verificación en 2 pasos</button>}
            <button disabled={ocupado} onClick={() => accion("estado", { method: "PUT", body: { activo: !u.activo } }, u.activo ? "La cuenta no podrá ingresar hasta que la reactives. ¿Suspender?" : null)} className={botonSecundario}>{u.activo ? "Suspender cuenta" : "Reactivar cuenta"}</button>
          </>}
          <button onClick={() => verActividad(u._id)} className={botonSecundario}>Ver su actividad</button>
        </div>
        <p className="text-xs text-gray-400">Cada acción queda registrada en la bitácora con tu nombre.</p>
      </div>
    </Modal>
  );
}

// Estado de seguridad de todas las cuentas (sin ver contraseñas) y acciones sobre ellas.
export function Seguridad({ verActividad, filtroInicial = "" }) {
  const [rol, setRol] = useState("");
  const [estado, setEstado] = useState(filtroInicial);
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(null);
  const qs = new URLSearchParams(Object.entries({ rol, estado, q: busqueda }).filter(([, v]) => v)).toString();
  const { data, cargando, recargar } = useApi(`/admin/seguridad?${qs}`);
  const alerta = (u) => u.fallidos7d >= 3 || bloqueada(u);
  const elegido = abierto && data?.find((u) => u._id === abierto);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3 items-end">
        <form onSubmit={(e) => { e.preventDefault(); setBusqueda(q); }} className="flex gap-2"><input className={inputClase} placeholder="Nombre, código o DNI" value={q} onChange={(e) => setQ(e.target.value)} /><button className={botonSecundario}>Buscar</button></form>
        <select className={`${inputClase.replace("w-full ", "")} w-auto`} value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todas las cuentas</option>
          <option value="bloqueadas">Bloqueadas ahora</option>
          <option value="suspendidas">Suspendidas</option>
          <option value="sin2fa">Personal sin 2 pasos</option>
        </select>
        <Pestanas valor={rol} onChange={setRol} opciones={[["", "Todos"], ...Object.entries(ROLES)]} />
      </div>
      <Tarjeta>
        {cargando || !data ? <Cargando /> : data.length === 0 ? <Vacio texto="No hay cuentas con ese filtro" icono="escudo" /> : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="text-left px-5 py-3">Usuario</th><th className="px-3 py-3">Último acceso</th><th className="px-3 py-3">Contraseña</th><th className="px-3 py-3">2 pasos</th><th className="px-3 py-3">Fallidos (7 días)</th><th className="px-5 py-3" /></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((u) => (
                  <tr key={u._id} className={alerta(u) ? "bg-red-50" : ""}>
                    <td className="px-5 py-2">
                      <p className="font-medium">{u.nombre} {bloqueada(u) && <Etiqueta color="red">Bloqueada</Etiqueta>} {!u.activo && <Etiqueta color="red">Suspendida</Etiqueta>}</p>
                      <p className="text-xs text-gray-400">{u.codigo} · {ROLES[u.rol]}{u.areas?.length ? ` · ${u.areas.map((x) => NOMBRE_AREA[x]).join(", ")}` : ""}</p>
                    </td>
                    <td className="px-3 py-2 text-center text-xs">{u.ultimoAcceso ? fechaHora(u.ultimoAcceso) : <span className="text-gray-400">Nunca</span>}</td>
                    <td className="px-3 py-2 text-center text-xs">{u.debeCambiarPassword ? <Etiqueta color="amber">Temporal</Etiqueta> : u.passwordCambiadaEn ? `Cambiada ${fechaHora(u.passwordCambiadaEn)}` : "Propia"}</td>
                    <td className="px-3 py-2 text-center">{u.totpActivo ? <Etiqueta color="green">Sí</Etiqueta> : ["administrativo", "soporte"].includes(u.rol) ? <Etiqueta color="red">No</Etiqueta> : <span className="text-xs text-gray-400">No</span>}</td>
                    <td className="px-3 py-2 text-center">{u.fallidos7d ? <span className={`font-semibold ${alerta(u) ? "text-red-600" : ""}`}>{u.fallidos7d}</span> : "0"}</td>
                    <td className="px-5 py-2 text-right whitespace-nowrap"><button onClick={() => setAbierto(u._id)} className="text-xs font-semibold text-aduni-700 hover:underline">Gestionar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>
      <p className="text-xs text-gray-400">Rojo: cuenta bloqueada o con 3 o más intentos fallidos en 7 días. Tras 5 intentos fallidos seguidos la cuenta se bloquea 15 minutos automáticamente y soporte técnico recibe un aviso.</p>
      {elegido && <GestionarCuenta u={elegido} onCerrar={() => setAbierto(null)} onCambio={recargar} verActividad={(id) => { setAbierto(null); verActividad(id); }} />}
    </div>
  );
}
