import { obtenerToken, eliminarToken } from "./auth";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

const leer = async (res, mensajeError) => {
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) throw new Error(data?.mensaje || mensajeError);
  return data;
};

const sesionExpirada = (res) => {
  if (res.status === 401) {
    eliminarToken();
    if (typeof window !== "undefined") window.dispatchEvent(new Event("sesion-expirada"));
  }
  if (res.status === 503 && typeof window !== "undefined") {
    res.clone().json().then((d) => d?.mantenimiento && window.dispatchEvent(new CustomEvent("mantenimiento", { detail: d.mensaje }))).catch(() => {});
  }
};

const postJson = async (ruta, body, error) => {
  const res = await fetch(`${API_URL}${ruta}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return leer(res, error);
};

// `usuario` puede ser código, DNI o correo.
export const login = (usuario, password, rol) => postJson("/auth/login", { usuario, password, rol }, "Error al iniciar sesión");
export const verificar2FA = (temporal, codigo) => postJson("/auth/2fa", { temporal, codigo }, "Código incorrecto");
export const olvidePassword = (usuario, rol) => postJson("/auth/olvide", { usuario, rol }, "No se pudo procesar la solicitud");
export const restablecerPassword = (u, t, nueva) => postJson("/auth/restablecer", { u, t, nueva }, "No se pudo restablecer");

// Llamadas autenticadas a la intranet: apiIntranet("/docente/cursos")
export const apiIntranet = async (ruta, { method = "GET", body } = {}) => {
  const res = await fetch(`${API_URL}/intranet${ruta}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${obtenerToken()}` },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  sesionExpirada(res);
  return leer(res, "No se pudo completar la operación");
};

// Sube un archivo (imagen, PDF, Word...) y devuelve { url, nombre, tipo }.
export const subirArchivo = async (archivo, carpeta = "otros", ruta = `/archivos?carpeta=${carpeta}`) => {
  const datos = new FormData();
  datos.append("archivo", archivo);
  const res = await fetch(`${API_URL}/intranet${ruta}`, { method: "POST", headers: { Authorization: `Bearer ${obtenerToken()}` }, body: datos });
  sesionExpirada(res);
  return leer(res, "No se pudo subir el archivo");
};

// Descarga (o abre en otra pestaña) un PDF / Excel / ZIP protegido.
export const descargar = async (ruta, nombre, { abrir = false } = {}) => {
  const res = await fetch(`${API_URL}/intranet${ruta}`, { headers: { Authorization: `Bearer ${obtenerToken()}` } });
  sesionExpirada(res);
  if (!res.ok) {
    let msg = "No se pudo descargar";
    try { msg = (await res.json()).mensaje || msg; } catch {}
    throw new Error(msg);
  }
  const url = URL.createObjectURL(await res.blob());
  if (abrir) {
    window.open(url, "_blank");
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

// ---- Público ----
export const apiPublico = async (ruta, { method = "GET", body } = {}) => {
  const res = await fetch(`${API_URL}/publico${ruta}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  return leer(res, "No se pudo completar la operación");
};

export const subirDocumentoAdmision = async (archivo) => {
  const datos = new FormData();
  datos.append("archivo", archivo);
  const res = await fetch(`${API_URL}/publico/admision/archivos`, { method: "POST", body: datos });
  return leer(res, "No se pudo subir el archivo");
};

export const crearReclamoApi = (payload) => postJson("/reclamos", payload, "No se pudo registrar el reclamo");
