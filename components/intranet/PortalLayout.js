"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Icono from "./Icono";
import { login, verificar2FA, apiIntranet } from "../../lib/api";
import { guardarSesion, obtenerToken, obtenerUsuario, eliminarToken } from "../../lib/auth";
import { iniciales, useApi } from "../../lib/intranet";

export const NOMBRE_AREA = { direccion: "Dirección", secretaria: "Secretaría", tesoreria: "Tesorería", coordinacion: "Coordinación", auxiliar: "Auxiliar" };

const PortalContexto = createContext(null);
export const usePortal = () => useContext(PortalContexto);

// Para páginas compartidas entre el portal del estudiante y el de la familia:
// agrega ?hijo=<id> cuando quien consulta es el apoderado.
export const conHijo = (ruta, hijo) => (hijo ? `${ruta}${ruta.includes("?") ? "&" : "?"}hijo=${hijo}` : ruta);
export function useApiEst(ruta) {
  const p = usePortal();
  const listo = p?.rol !== "apoderado" || p?.hijo;
  return useApi(ruta && listo ? conHijo(ruta, p?.hijo) : null);
}

const leerLocal = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const guardarLocal = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

function Login({ rol, titulo, etiquetaUsuario, onIngreso, pie }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [codigo2fa, setCodigo2fa] = useState("");
  const [temporal, setTemporal] = useState(null);
  const [ver, setVer] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const data = temporal ? await verificar2FA(temporal, codigo2fa) : await login(usuario.trim(), password, rol);
      if (data.requiere2FA) {
        setTemporal(data.temporal);
        return;
      }
      guardarSesion(data.token, data.usuario);
      onIngreso(data.usuario);
    } catch (err) {
      setError(err.message);
      if (temporal && /expir/i.test(err.message)) setTemporal(null);
    } finally {
      setCargando(false);
    }
  };

  const campo = "w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-aduni-600/30 focus:border-aduni-600";

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-aduni-900 to-aduni-700 text-white p-12">
        <div className="bg-white rounded-xl p-3 w-fit">
          <Image src="/logo-aduni.png" alt="ADUNI+" width={200} height={56} />
        </div>
        <div>
          <p className="text-oro font-semibold tracking-widest text-xs mb-3">INTRANET ADUNI+</p>
          <h2 className="text-4xl font-bold leading-tight">{titulo}</h2>
          <p className="text-blue-100 mt-4 max-w-md">Notas por competencias, asistencia con carné QR, aula virtual, exámenes en línea, pagos y comunicados en un solo lugar.</p>
        </div>
        <p className="text-xs text-blue-200">Colegio ADUNI+ · San Jerónimo, Andahuaylas</p>
      </div>

      <div className="flex items-center justify-center p-6 bg-gray-50">
        <form onSubmit={enviar} className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <Link href="/intranet" className="text-xs text-aduni-700 hover:underline">← Elegir otro portal</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">{titulo}</h1>
          {temporal ? (
            <>
              <p className="text-sm text-gray-500 mb-6">Ingresa el código de 6 dígitos de tu app autenticadora (Google Authenticator, Microsoft Authenticator...).</p>
              <input value={codigo2fa} onChange={(e) => setCodigo2fa(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoFocus required className={`${campo} text-center text-2xl tracking-[0.5em] mb-4`} />
              <p className="text-xs text-gray-500 mb-4">
                ¿Perdiste tu celular o cambiaste de app? Pide a Dirección o a soporte técnico que te quite la verificación en dos pasos.{" "}
                <button type="button" onClick={() => { setTemporal(null); setCodigo2fa(""); setError(""); }} className="text-aduni-700 hover:underline">Volver</button>
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">Ingresa con tus credenciales institucionales.</p>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{etiquetaUsuario}</label>
              <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" required className={`${campo} mb-4`} />
              <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña</label>
              <div className="relative mb-4">
                <input type={ver ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className={`${campo} pr-10`} />
                <button type="button" onClick={() => setVer(!ver)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" aria-label="Mostrar contraseña"><Icono nombre="ojo" /></button>
              </div>
            </>
          )}
          {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}
          <button disabled={cargando} className="w-full bg-aduni-700 text-white rounded-lg py-2.5 font-semibold hover:bg-aduni-900 transition disabled:opacity-50">
            {cargando ? "Verificando..." : temporal ? "Verificar" : "Ingresar"}
          </button>
          <div className="text-xs text-gray-500 mt-5 text-center space-y-2">
            <p><Link href={`/intranet/recuperar?rol=${rol}`} className="text-aduni-700 hover:underline">¿Olvidaste tu contraseña?</Link></p>
            {pie}
          </div>
        </form>
      </div>
    </div>
  );
}

function Campana({ base, rol }) {
  const router = useRouter();
  const [abierta, setAbierta] = useState(false);
  const [datos, setDatos] = useState({ lista: [], sinLeer: 0 });
  const ref = useRef(null);

  const cargar = useCallback(() => apiIntranet("/notificaciones").then(setDatos).catch(() => {}), []);
  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 60000);
    return () => clearInterval(t);
  }, [cargar]);
  useEffect(() => {
    const cerrar = (e) => ref.current && !ref.current.contains(e.target) && setAbierta(false);
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  const abrir = async (n) => {
    if (!n.leida) await apiIntranet("/notificaciones/leer", { method: "PUT", body: { id: n._id } }).catch(() => {});
    setAbierta(false);
    cargar();
    // Los avisos del estudiante llevan a las mismas secciones del portal de familias.
    let destino = n.enlace || base;
    if (rol === "apoderado") destino = destino.replace("/intranet/estudiante", "/intranet/familia");
    router.push(destino);
  };

  const leerTodas = async () => {
    await apiIntranet("/notificaciones/leer", { method: "PUT", body: {} }).catch(() => {});
    cargar();
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAbierta(!abierta)} className="relative p-2 rounded-lg hover:bg-white/10" aria-label="Notificaciones">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {datos.sinLeer > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">{datos.sinLeer > 99 ? "99+" : datos.sinLeer}</span>}
      </button>
      {abierta && (
        <div className="absolute right-0 lg:left-0 lg:right-auto mt-2 w-80 max-w-[90vw] bg-white text-gray-900 rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <p className="font-semibold text-sm">Notificaciones</p>
            {datos.sinLeer > 0 && <button onClick={leerTodas} className="text-xs text-aduni-700 hover:underline">Marcar todo como leído</button>}
          </div>
          <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {datos.lista.length === 0 && <li className="p-4 text-sm text-gray-400 text-center">Sin notificaciones</li>}
            {datos.lista.map((n) => (
              <li key={n._id}>
                <button onClick={() => abrir(n)} className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 ${n.leida ? "" : "bg-aduni-100/50"}`}>
                  <p className="text-sm font-medium flex items-start gap-2">{!n.leida && <span className="mt-1.5 w-2 h-2 rounded-full bg-aduni-600 shrink-0" />}{n.titulo}</p>
                  {n.mensaje && <p className="text-xs text-gray-500 line-clamp-2">{n.mensaje}</p>}
                  <p className="text-[11px] text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SelectorHijo({ hijos, hijo, setHijo }) {
  if (!hijos?.length) return null;
  return (
    <div className="px-2 mb-3">
      <p className="text-[11px] font-semibold tracking-widest text-blue-300 mb-1 px-1">ESTUDIANTE</p>
      <select value={hijo || ""} onChange={(e) => setHijo(e.target.value)} className="w-full bg-white/10 text-white text-sm rounded-lg px-2 py-2 border border-white/20 [&>option]:text-gray-900">
        {hijos.map((h) => <option key={h._id} value={h._id}>{h.nombres} · {h.aula?.nombre || "sin aula"}</option>)}
      </select>
    </div>
  );
}

function Portal({ rol, titulo, menu, usuario, setUsuario, salir, children }) {
  const pathname = usePathname();
  const [menuMovil, setMenuMovil] = useState(false);
  const [oscuro, setOscuro] = useState(() => leerLocal("aduni-oscuro") === "1");
  const [hijoElegido, setHijoElegido] = useState(() => leerLocal("aduni-hijo"));
  const yo = useApi(rol === "apoderado" ? "/yo" : null);
  const sinLeer = useApi("/mensajes/sin-leer");
  const hijos = yo.data?.hijos || [];
  const hijo = rol === "apoderado" ? (hijos.find((h) => h._id === hijoElegido)?._id || hijos[0]?._id || null) : null;
  const setHijo = (id) => { setHijoElegido(id); guardarLocal("aduni-hijo", id); };

  useEffect(() => {
    document.documentElement.classList.toggle("oscuro", oscuro);
    return () => document.documentElement.classList.remove("oscuro");
  }, [oscuro]);
  const alternarOscuro = () => { guardarLocal("aduni-oscuro", oscuro ? "0" : "1"); setOscuro(!oscuro); };

  const base = menu[0].href;
  const activo = (href) => (href === base ? pathname === href : pathname.startsWith(href));
  const mensajes = sinLeer.data?.sinLeer || 0;
  // Personal administrativo: cada uno ve solo las secciones de su área (Dirección ve todo).
  const misAreas = usuario.areas || [];
  const puede = (...areas) => rol !== "administrativo" || !areas.length || misAreas.includes("direccion") || areas.some((a) => misAreas.includes(a));
  const visibles = menu.filter((m) => !m.areas || puede(...m.areas));

  const enlaces = (
    <nav className="flex flex-col gap-0.5">
      {visibles.map((m) => (
        <Link key={m.href} href={m.href} onClick={() => setMenuMovil(false)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${activo(m.href) ? "bg-white/15 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"}`}>
          <Icono nombre={m.icono} className="w-[18px] h-[18px]" />
          <span className="flex-1">{m.etiqueta}</span>
          {m.icono === "mensajes" && mensajes > 0 && <span className="bg-oro text-aduni-900 text-[10px] font-bold rounded-full px-1.5">{mensajes}</span>}
        </Link>
      ))}
    </nav>
  );

  const acciones = (
    <div className="flex items-center gap-1">
      <Campana base={base} rol={rol} />
      <button onClick={alternarOscuro} className="p-2 rounded-lg hover:bg-white/10" aria-label="Modo oscuro" title={oscuro ? "Modo claro" : "Modo oscuro"}>
        <Icono nombre={oscuro ? "sol" : "luna"} />
      </button>
    </div>
  );

  return (
    <PortalContexto.Provider value={{ usuario, setUsuario, salir, base, rol, hijo, setHijo, hijos, areas: misAreas, puede }}>
      <div className="intranet flex min-h-[calc(100vh-4rem)] bg-gray-50">
        <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-aduni-900 text-white p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex items-center gap-3 px-2 pb-3 mb-3 border-b border-white/10">
            {usuario.foto
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={usuario.foto} alt="" className="w-10 h-10 rounded-full object-cover" />
              : <div className="w-10 h-10 rounded-full bg-oro text-aduni-900 font-bold flex items-center justify-center">{iniciales(usuario.nombre)}</div>}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{usuario.nombres || usuario.nombre}</p>
              <p className="text-xs text-blue-200">{usuario.codigo}</p>
              {rol === "administrativo" && misAreas.length > 0 && <p className="text-[10px] text-oro truncate">{misAreas.map((a) => NOMBRE_AREA[a] || a).join(" · ")}</p>}
            </div>
          </div>
          <div className="flex justify-end -mt-1 mb-2">{acciones}</div>
          {rol === "apoderado" && <SelectorHijo hijos={hijos} hijo={hijo} setHijo={setHijo} />}
          <p className="px-3 text-[11px] font-semibold tracking-widest text-blue-300 mb-2">{titulo.toUpperCase()}</p>
          {enlaces}
          <button onClick={salir} className="mt-auto flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10">
            <Icono nombre="salir" className="w-[18px] h-[18px]" /> Cerrar sesión
          </button>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="lg:hidden flex items-center justify-between bg-aduni-900 text-white px-4 py-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{usuario.nombres || usuario.nombre}</p>
              <p className="text-xs text-blue-200">{titulo} · {usuario.codigo}</p>
            </div>
            <div className="flex items-center gap-1">
              {acciones}
              <button onClick={() => setMenuMovil(!menuMovil)} className="p-2" aria-label="Menú"><Icono nombre="menu" className="w-6 h-6" /></button>
            </div>
          </div>
          {menuMovil && (
            <div className="lg:hidden bg-aduni-900 px-3 pb-3">
              {rol === "apoderado" && <SelectorHijo hijos={hijos} hijo={hijo} setHijo={setHijo} />}
              {enlaces}
              <button onClick={salir} className="flex items-center gap-3 px-3 py-2 text-sm text-blue-100"><Icono nombre="salir" className="w-[18px] h-[18px]" /> Cerrar sesión</button>
            </div>
          )}

          {usuario.debeCambiarPassword && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-sm text-amber-900 flex items-center gap-2">
              <Icono nombre="alerta" className="w-4 h-4" />
              Estás usando una contraseña temporal.
              <Link href={`${base}/perfil`} className="font-semibold underline">Cámbiala aquí</Link>
            </div>
          )}
          {rol === "apoderado" && yo.data && hijos.length === 0 && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-sm text-amber-900">Tu cuenta aún no tiene estudiantes vinculados. Comunícate con secretaría.</div>
          )}

          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl">{(rol !== "apoderado" || hijo || (yo.data && !hijos.length)) ? children : null}</main>
        </div>
      </div>
    </PortalContexto.Provider>
  );
}

export default function PortalLayout({ rol, titulo, etiquetaUsuario = "Código, DNI o correo", menu, pieLogin, children }) {
  const [usuario, setUsuario] = useState(null);
  const [listo, setListo] = useState(false);
  const [mantenimiento, setMantenimiento] = useState("");

  useEffect(() => {
    const u = obtenerUsuario();
    // La sesión vive en localStorage (solo existe en el navegador), por eso se lee tras montar.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (obtenerToken() && u?.rol === rol) setUsuario(u);
    setListo(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const expirada = () => setUsuario(null);
    const enMantenimiento = (e) => setMantenimiento(e.detail || "La intranet está en mantenimiento.");
    window.addEventListener("sesion-expirada", expirada);
    window.addEventListener("mantenimiento", enMantenimiento);
    return () => {
      window.removeEventListener("sesion-expirada", expirada);
      window.removeEventListener("mantenimiento", enMantenimiento);
    };
  }, [rol]);

  const salir = () => {
    eliminarToken();
    setUsuario(null);
  };

  if (!listo) return <div className="min-h-[60vh]" />;
  if (mantenimiento && rol !== "soporte") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <Icono nombre="herramienta" className="w-10 h-10 mx-auto text-aduni-700 mb-3" />
          <h1 className="text-xl font-bold text-gray-900">Intranet en mantenimiento</h1>
          <p className="text-sm text-gray-600 mt-2">{mantenimiento}</p>
          <button onClick={() => window.location.reload()} className="mt-5 bg-aduni-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-aduni-900">Reintentar</button>
        </div>
      </div>
    );
  }
  if (!usuario) return <Login rol={rol} titulo={titulo} etiquetaUsuario={etiquetaUsuario} onIngreso={setUsuario} pie={pieLogin} />;
  return <Portal rol={rol} titulo={titulo} menu={menu} usuario={usuario} setUsuario={setUsuario} salir={salir}>{children}</Portal>;
}
