"use client";

import { useState } from "react";
import { apiIntranet, descargar, API_URL } from "../../lib/api";
import { obtenerToken } from "../../lib/auth";
import { useApi, soles, iniciales, hoyLima } from "../../lib/intranet";
import SubirArchivo from "./SubirArchivo";
import Link from "next/link";
import { usePortal, NOMBRE_AREA } from "./PortalLayout";
import Icono from "./Icono";
import { Tarjeta, Cargando, Vacio, Etiqueta, Modal, Campo, inputClase, botonClase, botonSecundario, AvisoError, Exito, Indicador } from "./ui";

const VACIO = { areas: [], nombres: "", apellidos: "", dni: "", sexo: "", fechaNacimiento: "", celular: "", email: "", direccion: "", aula: "", especialidad: "", cargo: "", apoderado: { nombre: "", parentesco: "Madre", dni: "", celular: "", email: "" } };
const ROL_NOMBRE = { estudiante: "estudiante", profesor: "docente", administrativo: "administrativo", apoderado: "apoderado", soporte: "soporte técnico" };

function FormUsuario({ rol, inicial, aulas, onGuardar, textoBoton }) {
  const { areas: misAreas, rol: miRol } = usePortal();
  const editarAreas = miRol === "soporte" || misAreas.includes("direccion");
  const [f, setF] = useState({ ...VACIO, ...inicial, apoderado: { ...VACIO.apoderado, ...(inicial?.apoderado || {}) }, aula: inicial?.aula?._id || inicial?.aula || "" });
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const set = (k, v) => setF({ ...f, [k]: v });
  const setAp = (k, v) => setF({ ...f, apoderado: { ...f.apoderado, [k]: v } });

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    try {
      await onGuardar(f);
      setOk("Guardado");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={enviar} className="grid gap-3 sm:grid-cols-2">
      <Campo etiqueta="Nombres"><input className={inputClase} value={f.nombres} onChange={(e) => set("nombres", e.target.value)} required /></Campo>
      <Campo etiqueta="Apellidos"><input className={inputClase} value={f.apellidos} onChange={(e) => set("apellidos", e.target.value)} required /></Campo>
      <Campo etiqueta="DNI"><input className={inputClase} inputMode="numeric" maxLength={8} value={f.dni} onChange={(e) => set("dni", e.target.value.replace(/\D/g, ""))} required={rol === "apoderado"} /></Campo>
      {rol !== "apoderado" && (
        <Campo etiqueta="Sexo">
          <select className={inputClase} value={f.sexo} onChange={(e) => set("sexo", e.target.value)}><option value="">—</option><option value="M">Masculino</option><option value="F">Femenino</option></select>
        </Campo>
      )}
      {rol === "estudiante" ? (
        <>
          <Campo etiqueta="Fecha de nacimiento"><input type="date" className={inputClase} value={f.fechaNacimiento} onChange={(e) => set("fechaNacimiento", e.target.value)} /></Campo>
          <Campo etiqueta="Aula (matrícula)">
            <select className={inputClase} value={f.aula} onChange={(e) => set("aula", e.target.value)}>
              <option value="">Sin aula</option>
              {aulas?.map((a) => <option key={a._id} value={a._id}>{a.nombre}</option>)}
            </select>
          </Campo>
        </>
      ) : (
        <>
          <Campo etiqueta="Correo"><input type="email" className={inputClase} value={f.email || ""} onChange={(e) => set("email", e.target.value)} /></Campo>
          {rol !== "apoderado" && (
            <Campo etiqueta={rol === "profesor" ? "Especialidad" : "Cargo"}>
              <input className={inputClase} value={rol === "profesor" ? f.especialidad : f.cargo} onChange={(e) => set(rol === "profesor" ? "especialidad" : "cargo", e.target.value)} />
            </Campo>
          )}
        </>
      )}
      <Campo etiqueta="Celular"><input className={inputClase} value={f.celular} onChange={(e) => set("celular", e.target.value)} /></Campo>
      <Campo etiqueta="Dirección"><input className={inputClase} value={f.direccion} onChange={(e) => set("direccion", e.target.value)} /></Campo>
      {rol === "administrativo" && (
        <fieldset className="sm:col-span-2 border border-gray-200 rounded-lg p-3">
          <legend className="text-xs font-semibold text-gray-600 px-1">Áreas de acceso (qué secciones del portal puede ver)</legend>
          {editarAreas ? (
            <div className="flex flex-wrap gap-4">
              {Object.entries(NOMBRE_AREA).map(([k, t]) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={(f.areas || []).includes(k)} onChange={(e) => set("areas", e.target.checked ? [...(f.areas || []), k] : (f.areas || []).filter((x) => x !== k))} />
                  {t}{k === "direccion" && <span className="text-xs text-gray-400">(acceso total)</span>}
                </label>
              ))}
            </div>
          ) : <p className="text-sm">{(f.areas || []).map((x) => NOMBRE_AREA[x]).join(", ") || "—"} <span className="text-xs text-gray-400">· solo Dirección puede cambiarlas</span></p>}
        </fieldset>
      )}

      {rol === "estudiante" && (
        <fieldset className="sm:col-span-2 grid gap-3 sm:grid-cols-2 border border-gray-200 rounded-lg p-3">
          <legend className="text-xs font-semibold text-gray-600 px-1">Apoderado (con su DNI se crea su cuenta del portal de familias)</legend>
          <Campo etiqueta="Nombre completo"><input className={inputClase} value={f.apoderado.nombre} onChange={(e) => setAp("nombre", e.target.value)} /></Campo>
          <Campo etiqueta="Parentesco">
            <select className={inputClase} value={f.apoderado.parentesco} onChange={(e) => setAp("parentesco", e.target.value)}>
              {["Madre", "Padre", "Abuelo(a)", "Tío(a)", "Hermano(a)", "Otro"].map((p) => <option key={p}>{p}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="DNI"><input className={inputClase} value={f.apoderado.dni} onChange={(e) => setAp("dni", e.target.value.replace(/\D/g, ""))} maxLength={8} /></Campo>
          <Campo etiqueta="Celular (WhatsApp)"><input className={inputClase} value={f.apoderado.celular} onChange={(e) => setAp("celular", e.target.value)} /></Campo>
          <Campo etiqueta="Correo"><input type="email" className={inputClase} value={f.apoderado.email} onChange={(e) => setAp("email", e.target.value)} /></Campo>
        </fieldset>
      )}
      <div className="sm:col-span-2 grid gap-2">
        <AvisoError texto={error} /><Exito texto={ok} />
        <button className={`${botonClase} w-fit`}>{textoBoton}</button>
      </div>
    </form>
  );
}

// Fichas de acceso imprimibles (una o varias)
export function Credenciales({ lista: todos, onCerrar }) {
  const lista = (todos || []).filter((c) => c.passwordTemporal);
  const sinCuenta = (todos || []).filter((c) => !c.passwordTemporal && c.sinCuenta);
  if (!todos?.length) return null;
  return (
    <Modal abierto titulo={`Credenciales de acceso (${lista.length})`} onCerrar={onCerrar} ancho="max-w-3xl">
      <p className="text-sm text-gray-600 mb-4 no-imprimir">Entrega estos datos a cada usuario. Las contraseñas son temporales y no se volverán a mostrar.</p>
      {sinCuenta.length > 0 && (
        <p className="text-sm bg-sky-50 text-sky-900 rounded-lg p-3 mb-4 no-imprimir">{sinCuenta.length} alumno(s) de los primeros grados de primaria no tienen cuenta propia: su intranet la maneja la familia desde el Portal de familias ({sinCuenta.map((c) => c.nombre).join(", ")}).</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto">
        {lista.map((c) => (
          <div key={c.codigo} className="border border-dashed border-gray-300 rounded-lg p-3 text-sm break-inside-avoid">
            <p className="text-xs text-aduni-700 font-semibold">INTRANET ADUNI+ · {c.rol || "acceso"}</p>
            <p className="font-semibold">{c.nombre}</p>
            {c.detalle && <p className="text-xs text-gray-500">{c.detalle}</p>}
            <p className="mt-1">Usuario: <span className="font-mono font-bold">{c.codigo}</span>{c.dni && <span className="text-xs text-gray-500"> (o DNI {c.dni})</span>}</p>
            <p>Contraseña: <span className="font-mono font-bold">{c.passwordTemporal}</span></p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-5 justify-end no-imprimir">
        <button onClick={() => window.print()} className={botonSecundario}><Icono nombre="imprimir" className="w-4 h-4" /> Imprimir fichas</button>
        <button onClick={onCerrar} className={botonClase}>Listo</button>
      </div>
    </Modal>
  );
}

function EditorHijos({ apoderado, onCambio }) {
  const [q, setQ] = useState("");
  const busqueda = useApi(q.length >= 2 ? `/admin/usuarios?rol=estudiante&q=${encodeURIComponent(q)}` : null);
  const [hijos, setHijos] = useState(apoderado.hijos || []);
  const [msg, setMsg] = useState("");
  const guardar = async (lista) => {
    setHijos(lista);
    await apiIntranet(`/admin/apoderados/${apoderado._id}/hijos`, { method: "PUT", body: { hijos: lista.map((h) => h._id) } });
    setMsg("Vínculos guardados");
    onCambio();
  };
  return (
    <div className="border border-gray-200 rounded-lg p-3 mb-5">
      <p className="text-sm font-semibold mb-2">Estudiantes a su cargo</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {hijos.length === 0 && <span className="text-sm text-gray-400">Ninguno</span>}
        {hijos.map((h) => <span key={h._id} className="bg-aduni-100 text-aduni-900 text-xs rounded-full px-3 py-1 flex items-center gap-2">{h.nombre}<button onClick={() => guardar(hijos.filter((x) => x._id !== h._id))} className="text-red-600">×</button></span>)}
      </div>
      <input className={inputClase} placeholder="Buscar estudiante para vincular (nombre, código o DNI)" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="mt-1 max-h-40 overflow-y-auto">
        {busqueda.data?.filter((e) => !hijos.some((h) => h._id === e._id)).map((e) => (
          <li key={e._id}><button onClick={() => { guardar([...hijos, { _id: e._id, nombre: e.nombre }]); setQ(""); }} className="text-sm text-left w-full px-2 py-1 hover:bg-gray-50">{e.nombre} · {e.codigo} · {e.aula?.nombre}</button></li>
        ))}
      </ul>
      {msg && <p className="text-xs text-emerald-700 mt-1">{msg}</p>}
    </div>
  );
}

function Detalle({ id, rol, aulas, onCerrar, onCambio }) {
  const { areas: misAreas, rol: miRol } = usePortal();
  const esDireccion = miRol === "soporte" || misAreas.includes("direccion");
  const { data, cargando, recargar } = useApi(`/admin/usuarios/${id}`);
  const [aviso, setAviso] = useState("");
  const hijosInfo = useApi(rol === "apoderado" ? `/admin/usuarios?rol=estudiante` : null);
  const [cred, setCred] = useState(null);
  const [error, setError] = useState("");

  if (cargando || !data) return <Modal abierto titulo="Cargando..." onCerrar={onCerrar}><Cargando /></Modal>;
  const u = data.usuario;

  const guardar = async (f) => {
    await apiIntranet(`/admin/usuarios/${id}`, { method: "PUT", body: f });
    onCambio();
  };
  const restablecer = async () => {
    if (!confirm("Se generará una nueva contraseña temporal. ¿Continuar?")) return;
    const r = await apiIntranet(`/admin/usuarios/${id}/restablecer`, { method: "POST" });
    setCred([{ ...r, nombre: u.nombre, rol: ROL_NOMBRE[u.rol] }]);
  };
  const estado = async () => {
    await apiIntranet(`/admin/usuarios/${id}/estado`, { method: "PUT", body: { activo: !u.activo } });
    recargar();
    onCambio();
  };
  // Acciones de seguridad: desbloquear, cerrar sesiones, quitar verificación en dos pasos.
  const seguridad = async (accion, confirmar) => {
    if (confirmar && !confirm(confirmar)) return;
    try {
      const r = await apiIntranet(`/admin/usuarios/${id}/${accion}`, { method: "POST" });
      setAviso(r.mensaje);
      setError("");
      recargar();
    } catch (e) {
      setError(e.message);
    }
  };
  const bloqueada = u.bloqueadoHasta && new Date(u.bloqueadoHasta) > new Date();
  const abrirPdf = (ruta, nombre) => descargar(ruta, nombre, { abrir: true }).catch((e) => setError(e.message));
  const deuda = data.pensiones?.filter((p) => p.estado === "pendiente" && p.vencimiento < hoyLima()).reduce((s, p) => s + p.monto - p.descuento, 0) || 0;
  const hijosApoderado = (u.hijos || []).map((h) => hijosInfo.data?.find((e) => e._id === (h._id || h)) || { _id: h._id || h, nombre: "Estudiante" });

  return (
    <Modal abierto titulo={u.nombre} onCerrar={onCerrar} ancho="max-w-3xl">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {u.foto
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={u.foto} alt="" className="w-14 h-14 rounded-full object-cover" />
          : <div className="w-14 h-14 rounded-full bg-aduni-100 text-aduni-900 font-bold text-xl flex items-center justify-center">{iniciales(u.nombre)}</div>}
        <div className="flex-1 min-w-40">
          <p className="font-mono font-bold text-aduni-900">{u.codigo}</p>
          <p className="text-xs text-gray-500">{u.aula?.nombre || u.especialidad || u.cargo}{u.ultimoAcceso && ` · último acceso ${new Date(u.ultimoAcceso).toLocaleString("es-PE")}`}</p>
        </div>
        <Etiqueta color={u.activo ? "green" : "red"}>{u.activo ? "Activo" : "Suspendido"}</Etiqueta>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        <SubirArchivo ruta={`/foto?usuario=${u._id}`} accept="image/*" texto="Foto para carné" onSubido={() => { recargar(); onCambio(); }} />
        {rol === "estudiante" && <button onClick={() => abrirPdf(`/admin/usuarios/${u._id}/libreta.pdf`, "libreta.pdf")} className={botonSecundario}>Libreta PDF</button>}
        {["estudiante", "profesor", "administrativo"].includes(rol) && <button onClick={() => abrirPdf(`/admin/carnes.pdf?usuario=${u._id}`, "carne.pdf")} className={botonSecundario}>Carné PDF</button>}
        <button onClick={restablecer} className={botonSecundario}>Restablecer contraseña</button>
        <button onClick={estado} className={botonSecundario}>{u.activo ? "Suspender" : "Reactivar"}</button>
        {bloqueada && <button onClick={() => seguridad("desbloquear")} className={botonSecundario}>Desbloquear cuenta</button>}
        <button onClick={() => seguridad("cerrar-sesiones", "Se cerrará su sesión en todos los dispositivos. ¿Continuar?")} className={botonSecundario}>Cerrar sesiones</button>
        {esDireccion && u.totpActivo && u.rol !== "soporte" && <button onClick={() => seguridad("quitar-2fa", "Úsalo solo si perdió su celular. ¿Quitar la verificación en dos pasos?")} className={botonSecundario}>Quitar verificación en 2 pasos</button>}
      </div>
      {bloqueada && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">Cuenta bloqueada por intentos fallidos hasta las {new Date(u.bloqueadoHasta).toLocaleTimeString("es-PE", { timeStyle: "short" })}.</p>}
      {aviso && <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-3">{aviso}</p>}
      <AvisoError texto={error} />
      <div className="grid gap-2 sm:grid-cols-4 text-xs bg-gray-50 rounded-lg p-3 mb-5">
        <p><span className="text-gray-500 block">Último acceso</span>{u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleString("es-PE") : "Nunca"}</p>
        <p><span className="text-gray-500 block">Contraseña</span>{u.debeCambiarPassword ? "Temporal (aún no la cambia)" : u.passwordCambiadaEn ? `Cambiada el ${new Date(u.passwordCambiadaEn).toLocaleDateString("es-PE")}` : "Propia"}</p>
        <p><span className="text-gray-500 block">Verificación en dos pasos</span>{u.totpActivo ? "Activa" : "No"}</p>
        {esDireccion && <p><span className="text-gray-500 block">Actividad</span><Link href={`/intranet/${miRol === "soporte" ? "soporte/bitacora" : "administrativo/auditoria"}?usuario=${u._id}`} className="text-aduni-700 hover:underline">Ver en la bitácora</Link></p>}
      </div>
      {rol === "estudiante" && (
        <div className="grid gap-3 sm:grid-cols-3 mb-5">
          <Indicador etiqueta="Asistencia" valor={data.asistencia?.porcentaje !== null ? `${data.asistencia.porcentaje}%` : "—"} detalle={`${data.asistencia?.F} faltas · ${data.asistencia?.T} tardanzas`} />
          <Indicador etiqueta="Cuotas pagadas" valor={`${data.pensiones.filter((p) => p.estado === "pagado").length}/${data.pensiones.length}`} />
          <Indicador etiqueta="Deuda vencida" valor={soles(deuda)} />
        </div>
      )}
      {rol === "profesor" && data.cursos?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">{data.cursos.map((c) => <Etiqueta key={c._id} color="blue">{c.nombre} · {c.aula.nombre}</Etiqueta>)}</div>
      )}
      {rol === "apoderado" && hijosInfo.data && <EditorHijos apoderado={{ _id: u._id, hijos: hijosApoderado }} onCambio={onCambio} />}
      <FormUsuario rol={rol} inicial={u} aulas={aulas} onGuardar={guardar} textoBoton="Guardar cambios" />
      <Credenciales lista={cred} onCerrar={() => setCred(null)} />
    </Modal>
  );
}

function Importar({ onCerrar, onListo }) {
  const [archivo, setArchivo] = useState(null);
  const [res, setRes] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [cred, setCred] = useState(null);

  const procesar = async (simular) => {
    if (!archivo) return;
    setCargando(true);
    setError("");
    try {
      const datos = new FormData();
      datos.append("archivo", archivo);
      const r = await fetch(`${API_URL}/intranet/admin/importar/estudiantes${simular ? "?simular=1" : ""}`, { method: "POST", headers: { Authorization: `Bearer ${obtenerToken()}` }, body: datos });
      const j = await r.json();
      if (!r.ok) throw new Error(j.mensaje || "Error al importar");
      setRes(j);
      if (!simular) {
        onListo();
        setCred([
          ...j.creados.map((c) => ({ ...c, rol: "estudiante", detalle: c.aula })),
          ...j.apoderados.map((a) => ({ ...a, rol: "familia", detalle: `Apoderado de ${a.hijo}` })),
        ]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal abierto titulo="Importar estudiantes desde Excel" onCerrar={onCerrar} ancho="max-w-2xl">
      <ol className="text-sm text-gray-600 list-decimal pl-5 space-y-1 mb-4">
        <li>Descarga la plantilla y llena una fila por estudiante (con los datos del apoderado).</li>
        <li>Súbela y pulsa <strong>Revisar</strong> para validar sin guardar.</li>
        <li>Si todo está bien, pulsa <strong>Importar</strong>: se crean los códigos, las cuentas de familias y las fichas de acceso.</li>
      </ol>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <button onClick={() => descargar("/admin/importar/plantilla", "plantilla-estudiantes.xlsx")} className={botonSecundario}><Icono nombre="descargar" className="w-4 h-4" /> Plantilla Excel</button>
        <input type="file" accept=".xlsx" onChange={(e) => { setArchivo(e.target.files?.[0] || null); setRes(null); }} className="text-sm" />
      </div>
      <div className="flex gap-2">
        <button disabled={!archivo || cargando} onClick={() => procesar(true)} className={botonSecundario}>Revisar</button>
        <button disabled={!archivo || cargando || !res?.simulacion || !res.creados.length} onClick={() => procesar(false)} className={botonClase}>{cargando ? "Procesando..." : "Importar"}</button>
      </div>
      <div className="mt-4 grid gap-2">
        <AvisoError texto={error} />
        {res && (
          <div className="text-sm">
            <p className="font-semibold">{res.simulacion ? "Revisión" : "Resultado"}: {res.creados.length} estudiantes {res.simulacion ? "listos para importar" : "creados"}{!res.simulacion && `, ${res.apoderados.length} cuentas de familia nuevas`}.</p>
            {res.errores.length > 0 && (
              <ul className="mt-2 text-xs text-red-700 max-h-40 overflow-y-auto list-disc pl-5">{res.errores.map((e, i) => <li key={i}>Fila {e.fila}: {e.mensaje}</li>)}</ul>
            )}
          </div>
        )}
      </div>
      <Credenciales lista={cred} onCerrar={() => { setCred(null); onCerrar(); }} />
    </Modal>
  );
}

export default function GestionUsuarios({ rol }) {
  const aulas = useApi(rol === "estudiante" ? "/admin/aulas" : null);
  const [q, setQ] = useState("");
  const [aula, setAula] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const lista = useApi(`/admin/usuarios?rol=${rol}${aula ? `&aula=${aula}` : ""}${busqueda ? `&q=${encodeURIComponent(busqueda)}` : ""}`);
  const [nuevo, setNuevo] = useState(false);
  const [importar, setImportar] = useState(false);
  const [cred, setCred] = useState(null);
  const [viendo, setViendo] = useState(null);
  const [msg, setMsg] = useState("");

  const crear = async (f) => {
    const r = await apiIntranet("/admin/usuarios", { method: "POST", body: { ...f, rol } });
    setNuevo(false);
    setCred([
      { ...r, rol: ROL_NOMBRE[rol] },
      ...(r.apoderado ? [{ ...r.apoderado, rol: "familia", detalle: `Apoderado de ${r.nombre}` }] : []),
    ]);
    lista.recargar();
  };

  const generarApoderados = async () => {
    if (!confirm("Se crearán cuentas del portal de familias para todos los apoderados con DNI registrado. ¿Continuar?")) return;
    const r = await apiIntranet("/admin/apoderados/generar", { method: "POST" });
    setMsg(r.mensaje);
    if (r.nuevos.length) setCred(r.nuevos.map((n) => ({ ...n, rol: "familia", detalle: `Apoderado de ${n.hijo}` })));
    lista.recargar();
  };

  return (
    <>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <form onSubmit={(e) => { e.preventDefault(); setBusqueda(q); }} className="flex gap-2 flex-1 min-w-64">
          <input className={inputClase} placeholder="Buscar por nombre, código o DNI" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className={botonSecundario}>Buscar</button>
        </form>
        {rol === "estudiante" && (
          <select className={`${inputClase} w-auto`} value={aula} onChange={(e) => setAula(e.target.value)}>
            <option value="">Todas las aulas</option>
            <option value="sin">Sin aula</option>
            {aulas.data?.map((a) => <option key={a._id} value={a._id}>{a.nombre}</option>)}
          </select>
        )}
        {rol === "estudiante" && <button onClick={() => setImportar(true)} className={botonSecundario}><Icono nombre="subir" className="w-4 h-4" /> Importar Excel</button>}
        {rol === "apoderado" && <button onClick={generarApoderados} className={botonSecundario}>Generar cuentas desde fichas de estudiantes</button>}
        <button onClick={() => setNuevo(true)} className={botonClase}><Icono nombre="mas" className="w-4 h-4" /> Nuevo {ROL_NOMBRE[rol]}</button>
      </div>
      {msg && <div className="mb-3"><Exito texto={msg} /></div>}

      <Tarjeta>
        {lista.cargando ? <Cargando /> : lista.data?.length === 0 ? <Vacio texto="No hay resultados" icono="usuarios" /> : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">Código</th><th className="text-left px-3 py-3">Apellidos y nombres</th><th className="px-3 py-3">DNI</th>
                  <th className="text-left px-3 py-3">{rol === "estudiante" ? "Aula" : rol === "profesor" ? "Especialidad" : rol === "apoderado" ? "Hijos" : "Cargo"}</th>
                  {(rol === "estudiante" || rol === "apoderado") && <th className="text-left px-3 py-3">{rol === "estudiante" ? "Apoderado" : "Celular"}</th>}
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lista.data?.map((u) => (
                  <tr key={u._id} onClick={() => setViendo(u._id)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-5 py-2.5 font-mono font-semibold text-aduni-900">{u.codigo}</td>
                    <td className="px-3 py-2.5 font-medium">{u.nombre}</td>
                    <td className="px-3 py-2.5 text-center text-gray-600">{u.dni || "—"}</td>
                    <td className="px-3 py-2.5 text-gray-600">{rol === "estudiante" ? u.aula?.nombre || <Etiqueta color="amber">Sin aula</Etiqueta> : rol === "apoderado" ? `${u.hijos?.length || 0} estudiante(s)` : rol === "administrativo" ? <span>{u.cargo}<span className="block text-xs text-aduni-700">{(u.areas || []).map((x) => NOMBRE_AREA[x]).join(" · ")}</span></span> : u.especialidad || u.cargo || "—"}</td>
                    {rol === "estudiante" && <td className="px-3 py-2.5 text-xs text-gray-500">{u.apoderado?.nombre}{u.apoderado?.celular && ` · ${u.apoderado.celular}`}</td>}
                    {rol === "apoderado" && <td className="px-3 py-2.5 text-xs text-gray-500">{u.celular}</td>}
                    <td className="px-5 py-2.5 text-center"><Etiqueta color={u.activo ? "green" : "red"}>{u.activo ? "Activo" : "Suspendido"}</Etiqueta></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>
      <p className="text-xs text-gray-400 mt-2">{lista.data?.length || 0} registros · haz clic en una fila para ver o editar</p>

      <Modal abierto={nuevo} titulo={`Nuevo ${ROL_NOMBRE[rol]}`} onCerrar={() => setNuevo(false)} ancho="max-w-2xl">
        <p className="text-xs text-gray-500 mb-4">El código institucional y la contraseña temporal se generan automáticamente.</p>
        <FormUsuario rol={rol} inicial={VACIO} aulas={aulas.data} onGuardar={crear} textoBoton="Registrar" />
      </Modal>
      {importar && <Importar onCerrar={() => setImportar(false)} onListo={lista.recargar} />}
      <Credenciales lista={cred} onCerrar={() => setCred(null)} />
      {viendo && <Detalle id={viendo} rol={rol} aulas={aulas.data} onCerrar={() => setViendo(null)} onCambio={lista.recargar} />}
    </>
  );
}
