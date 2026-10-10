const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap() {
  const paginas = ["", "nosotros", "noticias", "becas", "admision", "contacto", "intranet", "terminos", "privacidad", "libro-de-reclamaciones"];
  return paginas.map((p) => ({
    url: `${SITE_URL}/${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" || p === "noticias" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.5,
  }));
}
