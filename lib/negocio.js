// Datos del colegio. Los marcados con (!) son provisionales: reemplazar por los reales.
export const NEGOCIO = {
  nombreComercial: "Colegio ADUNI+",
  titular: "ADUNI MAS S.A.C.",
  ruc: "20564504751",
  versionLegal: "7 de octubre de 2026",
  direccion: "Av. Leoncio Prado 572 (costado del Arco de San Jerónimo), San Jerónimo, Andahuaylas, Apurímac",
  // (!) Pendientes de confirmar con el colegio:
  telefonoPrincipal: { texto: "(!) pendiente", tel: "" },
  telefonoSoporte: { texto: "(!) pendiente", tel: "" },
  email: "(!) pendiente",
  horario: ["Lunes a Viernes: (!) por confirmar"],
  // Aproximado: San Jerónimo, Andahuaylas
  coordenadasAprox: { lat: -13.6572, lng: -73.3606 },
  sucursales: [],
};

export const NIVELES = [
  { nombre: "Primaria", detalle: "1.° a 6.° grado" },
  { nombre: "Secundaria", detalle: "1.° a 5.° año" },
];

export const NOTICIAS = [
  {
    slug: "inicio-anio-escolar-2027",
    titulo: "Se aproxima el inicio del año escolar 2027",
    fecha: "2026-10-01",
    resumen: "Las matrículas están abiertas. Conoce los requisitos y las fechas de admisión.",
  },
  {
    slug: "feria-de-ciencias",
    titulo: "Feria de ciencias ADUNI+",
    fecha: "2026-09-20",
    resumen: "Nuestros estudiantes de primaria y secundaria presentaron sus proyectos de investigación.",
  },
  {
    slug: "olimpiadas-deportivas",
    titulo: "Olimpiadas deportivas interescolares",
    fecha: "2026-09-05",
    resumen: "Las delegaciones de ADUNI participaron con excelentes resultados.",
  },
];
