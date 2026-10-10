import { NOTICIAS } from "./negocio";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Noticias publicadas desde el portal administrativo; si la API no responde, usa las de respaldo.
export const obtenerNoticias = async (limite = 30) => {
  try {
    const r = await fetch(`${API_URL}/publico/noticias?limite=${limite}`, { next: { revalidate: 60 } });
    if (!r.ok) throw new Error();
    return await r.json();
  } catch {
    return NOTICIAS.slice(0, limite);
  }
};

export const obtenerNoticia = async (slug) => {
  try {
    const r = await fetch(`${API_URL}/publico/noticias/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return NOTICIAS.find((n) => n.slug === slug) || null;
  }
};

export const fechaNoticia = (f) =>
  new Date(`${f}T12:00:00Z`).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
