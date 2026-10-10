"use client";

import { useState } from "react";
import { apiIntranet } from "../../lib/api";
import { useApi, iniciales } from "../../lib/intranet";
import { activarPush, pushDisponible } from "../../lib/push";
import { guardarSesion, obtenerToken } from "../../lib/auth";
import { usePortal } from "./PortalLayout";
import SubirArchivo from "./SubirArchivo";
import { Titulo, Tarjeta, Campo, inputClase, botonClase, botonSecundario, AvisoError, Exito, Cargando, Etiqueta } from "./ui";

function DosPasos({ activo, onCambio, obligatorio = false }) {
  const [qr, setQr] = useState(null);
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ ok: "", error: "" });

  const iniciar = async () => {
    try { setQr(await apiIntranet("/2fa/iniciar", { method: "POST" })); setMsg({ ok: "", error: "" }); } catch (e) { setMsg({ ok: "", error: e.message }); }
  };
  const activar = async (e) => {
    e.preventDefault();
    try { const r = await apiIntranet("/2fa/activar", { method: "POST", body: { codigo } }); setMsg({ ok: r.mensaje, error: "" }); setQr(null); onCambio(); } catch (err) { setMsg({ ok: "", error: err.message }); }
  };
  const desactivar = async (e) => {
    e.preventDefault();
    try { const r = await apiIntranet("/2fa/desactivar", { method: "POST", body: { password } }); setMsg({ ok: r.mensaje, error: "" }); onCambio(); } catch (err) { setMsg({ ok: "", error: err.message }); }
  };

  return (
    <Tarjeta titulo="Verificación en dos pasos" accion={<Etiqueta color={activo ? "green" : "gray"}>{activo ? "Activada" : "Desactivada"}</Etiqueta>}>
      <p className="text-sm text-gray-600 mb-4">Además de tu contraseña, se pedirá un código de 6 dígitos de una app autenticadora (Google Authenticator, Microsoft Authenticator). Recomendado para cuentas administrativas.</p>
      {activo && obligatorio ? (
        <p className="text-sm text-emerald-700">Obligatoria para la cuenta de soporte técnico: no se puede desactivar.</p>
      ) : activo ? (
        <form onSubmit={desactivar} className="flex flex-wrap gap-2 items-end">
          <Campo etiqueta="Confirma tu contraseña para desactivar"><input type="password" className={inputClase} value={password} onChange={(e) => setPassword(e.target.value)} required /></Campo>
          <button className={botonSecundario}>Desactivar</button>
        </form>
      ) : !qr ? (
        <button onClick={iniciar} className={botonClase}>Configurar</button>
      ) : (
        <form onSubmit={activar} className="grid gap-3">
          <p className="text-sm">1. Escanea este código con tu app autenticadora:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr.qr} alt="Código QR de configuración" className="w-44 h-44 border rounded-lg" />
          <p className="text-xs text-gray-500 break-all">O ingresa la clave manualmente: <span className="font-mono">{qr.secreto}</span></p>
          <Campo etiqueta="2. Escribe el código de 6 dígitos que muestra la app"><input className={`${inputClase} w-40 tracking-widest`} inputMode="numeric" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))} required /></Campo>
          <button className={`${botonClase} w-fit`}>Activar</button>
        </form>
      )}
      <div className="mt-3 grid gap-2"><AvisoError texto={msg.error} /><Exito texto={msg.ok} /></div>
    </Tarjeta>
  );
}

export default function Perfil() {
  const { data: u, cargando, recargar } = useApi("/yo");
  const { salir, usuario, setUsuario } = usePortal();
  const [form, setForm] = useState(null);
  const [pass, setPass] = useState({ actual: "", nueva: "", repetir: "" });
  const [msg, setMsg] = useState({ ok: "", error: "" });
  const [msgPass, setMsgPass] = useState({ ok: "", error: "" });
  const [msgPush, setMsgPush] = useState({ ok: "", error: "" });

  if (cargando || !u) return <Cargando />;
  const datos = form || { celular: u.celular || "", email: u.email || "", direccion: u.direccion || "" };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      await apiIntranet("/perfil", { method: "PUT", body: datos });
      setMsg({ ok: "Datos actualizados", error: "" });
    } catch (err) {
      setMsg({ ok: "", error: err.message });
    }
  };

  const cambiar = async (e) => {
    e.preventDefault();
    if (pass.nueva !== pass.repetir) return setMsgPass({ ok: "", error: "Las contraseñas no coinciden" });
    try {
      const r = await apiIntranet("/password", { method: "PUT", body: { actual: pass.actual, nueva: pass.nueva } });
      setMsgPass({ ok: r.mensaje, error: "" });
      setTimeout(salir, 1500);
    } catch (err) {
      setMsgPass({ ok: "", error: err.message });
    }
  };

  const fotoSubida = (r) => {
    const nuevo = { ...usuario, foto: r.foto || r.url };
    guardarSesion(obtenerToken(), nuevo);
    setUsuario(nuevo);
    recargar();
  };

  const push = async () => {
    try {
      await activarPush();
      setMsgPush({ ok: "Listo: recibirás avisos en este dispositivo aunque la intranet esté cerrada.", error: "" });
    } catch (err) {
      setMsgPush({ ok: "", error: err.message });
    }
  };

  const fila = (k, v) => (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-100 text-sm">
      <span className="text-gray-500">{k}</span>
      <span className="font-medium text-gray-900 text-right">{v || "—"}</span>
    </div>
  );

  return (
    <>
      <Titulo titulo="Mi perfil" subtitulo="Tus datos, seguridad de la cuenta y notificaciones" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Datos institucionales">
          <div className="flex items-center gap-4 mb-4">
            {u.foto
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={u.foto} alt="Foto" className="w-20 h-20 rounded-full object-cover" />
              : <div className="w-20 h-20 rounded-full bg-aduni-100 text-aduni-900 text-2xl font-bold flex items-center justify-center">{iniciales(u.nombre)}</div>}
            <SubirArchivo ruta="/foto" accept="image/*" texto="Cambiar foto" onSubido={fotoSubida} />
          </div>
          {fila("Código", u.codigo)}
          {fila("Apellidos y nombres", u.nombre)}
          {fila("DNI", u.dni)}
          {u.aula && fila("Aula", u.aula.nombre)}
          {u.aula?.tutor && fila("Tutor(a)", u.aula.tutor.nombre)}
          {u.hijos?.length > 0 && fila("Estudiantes a cargo", u.hijos.map((h) => h.nombres).join(", "))}
          {u.especialidad && fila("Especialidad", u.especialidad)}
          {u.cargo && fila("Cargo", u.cargo)}
          {u.apoderado?.nombre && fila("Apoderado", `${u.apoderado.nombre} (${u.apoderado.parentesco})`)}
          <p className="text-xs text-gray-400 mt-3">Si algún dato institucional es incorrecto, comunícate con secretaría.</p>
        </Tarjeta>

        <Tarjeta titulo="Datos de contacto">
          <form onSubmit={guardar} className="grid gap-3">
            <Campo etiqueta="Celular"><input className={inputClase} value={datos.celular} onChange={(e) => setForm({ ...datos, celular: e.target.value })} /></Campo>
            <Campo etiqueta="Correo (para recuperar tu contraseña)"><input type="email" className={inputClase} value={datos.email} onChange={(e) => setForm({ ...datos, email: e.target.value })} /></Campo>
            <Campo etiqueta="Dirección"><input className={inputClase} value={datos.direccion} onChange={(e) => setForm({ ...datos, direccion: e.target.value })} /></Campo>
            <AvisoError texto={msg.error} /><Exito texto={msg.ok} />
            <button className={`${botonClase} w-fit`}>Guardar</button>
          </form>
        </Tarjeta>

        <Tarjeta titulo="Cambiar contraseña">
          <form onSubmit={cambiar} className="grid gap-3">
            <Campo etiqueta="Contraseña actual"><input type="password" className={inputClase} value={pass.actual} onChange={(e) => setPass({ ...pass, actual: e.target.value })} required /></Campo>
            <Campo etiqueta="Nueva contraseña (mínimo 8 caracteres)"><input type="password" minLength={8} className={inputClase} value={pass.nueva} onChange={(e) => setPass({ ...pass, nueva: e.target.value })} required /></Campo>
            <Campo etiqueta="Repetir nueva contraseña"><input type="password" minLength={8} className={inputClase} value={pass.repetir} onChange={(e) => setPass({ ...pass, repetir: e.target.value })} required /></Campo>
            <AvisoError texto={msgPass.error} /><Exito texto={msgPass.ok} />
            <button className={`${botonClase} w-fit`}>Actualizar contraseña</button>
          </form>
        </Tarjeta>

        <div className="grid gap-6 content-start">
          <Tarjeta titulo="Notificaciones en este dispositivo">
            <p className="text-sm text-gray-600 mb-3">Recibe avisos de ingreso, notas, tareas, pagos y comunicados en tu celular o computadora, como una app.</p>
            {pushDisponible() ? <button onClick={push} className={botonClase}>Activar notificaciones</button> : <p className="text-sm text-gray-500">Tu navegador no admite notificaciones push.</p>}
            <div className="mt-3 grid gap-2"><AvisoError texto={msgPush.error} /><Exito texto={msgPush.ok} /></div>
          </Tarjeta>
          <DosPasos activo={u.totpActivo} onCambio={recargar} obligatorio={u.rol === "soporte"} />
        </div>
      </div>
    </>
  );
}
