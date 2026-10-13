import Link from "next/link";
import Image from "next/image";
import Revelar from "../components/Revelar";
import { obtenerNoticias, fechaNoticia as fmt } from "../lib/noticias";

const INGRESANTES = [
  { img: "/img/ingresante-ruth-administracion.jpg", nombre: "Ruth M. Carrión Yauris", carrera: "Administración de Empresas", puesto: "1.er puesto" },
  { img: "/img/ingresante-merly-psicologia.jpg", nombre: "Merly Gonzales Loa", carrera: "Psicología", puesto: "2.° puesto" },
  { img: "/img/ingresante-jeinms-contabilidad.jpg", nombre: "Jeinms Huaman Rincon", carrera: "Contabilidad", puesto: "2.° puesto" },
  { img: "/img/ingresante-ronald-contabilidad.jpg", nombre: "Ronald Contreras R.", carrera: "Contabilidad", puesto: "3.er puesto" },
];

const CIFRAS = [
  { valor: "2014", texto: "formando estudiantes en San Jerónimo" },
  { valor: "1.er", texto: "puesto nacional en Comunicación FERMAT 2025" },
  { valor: "UNAJMA", texto: "primeros puestos en el examen 2026" },
];

const PILARES = [
  { n: "01", titulo: "Colegio y academia", texto: "La preparación preuniversitaria de ADUNI MÁS acompaña a nuestros estudiantes de secundaria: del colegio a la universidad." },
  { n: "02", titulo: "Excelencia académica", texto: "Evaluación por competencias del Currículo Nacional, seguimiento permanente y concursos de matemática y comunicación." },
  { n: "03", titulo: "Formación integral", texto: "Deporte, arte y valores. Celebramos cada logro dentro y fuera del aula, junto a las familias." },
  { n: "04", titulo: "Intranet moderna", texto: "Notas, asistencia, tareas, pagos y comunicados en línea para estudiantes, docentes y familias." },
];

export default async function Inicio() {
  const NOTICIAS = await obtenerNoticias(3);
  return (
    <>
      {/* ---------- Portada: la barra superior flota transparente encima ---------- */}
      <section className="relative -mt-16 min-h-[100svh] flex items-center overflow-hidden bg-aduni-900 text-white">
        <Image src="/img/colegio-aduni.jpg" alt="Estudiantes en los pabellones del Colegio y Academia ADUNI MÁS" fill priority sizes="100vw" className="object-cover kenburns" />
        <div className="absolute inset-0 bg-aduni-900/70 md:bg-transparent md:bg-gradient-to-r md:from-aduni-900/90 md:via-aduni-900/55 md:to-aduni-900/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-aduni-900 via-transparent to-black/40" />

        <div className="relative max-w-7xl mx-auto px-4 w-full pt-28 pb-24">
          <Revelar>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur px-4 py-1.5 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-oro animate-pulse" /> Matrículas abiertas · Año escolar 2027
            </span>
          </Revelar>
          <Revelar retraso={120}>
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-7xl font-black leading-[1.05] tracking-tight max-w-4xl">
              Del colegio <span className="text-oro">a la universidad</span>
            </h1>
          </Revelar>
          <Revelar retraso={240}>
            <p className="mt-6 text-lg md:text-xl text-blue-100/90 max-w-2xl leading-relaxed">
              Primaria y secundaria con excelencia académica, valores y la preparación preuniversitaria de ADUNI MÁS, en San Jerónimo, Andahuaylas.
            </p>
          </Revelar>
          <Revelar retraso={360}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/admision" className="group inline-flex items-center gap-2 bg-oro text-aduni-900 font-bold px-7 py-3.5 rounded-full shadow-xl shadow-oro/20 hover:brightness-105 transition">
                Postula 2027 <span className="transition group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/becas" className="inline-flex items-center px-7 py-3.5 rounded-full font-semibold ring-1 ring-white/50 bg-white/5 backdrop-blur hover:bg-white hover:text-aduni-900 transition">
                Conoce las becas
              </Link>
            </div>
          </Revelar>

          <Revelar retraso={480}>
            <dl className="mt-16 grid gap-3 sm:grid-cols-3 max-w-3xl">
              {CIFRAS.map((c) => (
                <div key={c.texto} className="rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md px-5 py-4">
                  <dt className="text-2xl md:text-3xl font-black text-oro">{c.valor}</dt>
                  <dd className="text-sm text-blue-100 mt-1">{c.texto}</dd>
                </div>
              ))}
            </dl>
          </Revelar>
        </div>

        <a href="#ingresantes" className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-[11px] tracking-[0.3em] text-white/70 hover:text-white" aria-label="Ver más">
          DESCUBRE
          <span className="w-px h-10 bg-gradient-to-b from-white/70 to-transparent rebote" />
        </a>
      </section>

      {/* ---------- Ingresantes ---------- */}
      <section id="ingresantes" className="relative bg-aduni-900 text-white overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-aduni-600/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-oro/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <Revelar className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-oro font-bold tracking-[0.25em] text-xs">UNAJMA 2026 · PRIMERA OPORTUNIDAD</p>
              <h2 className="text-3xl md:text-5xl font-black mt-3 tracking-tight">Nuestros primeros puestos</h2>
              <p className="text-blue-100/80 mt-3 max-w-xl">Estudiantes que se prepararon con ADUNI MÁS e ingresaron a la Universidad Nacional José María Arguedas.</p>
            </div>
            <Link href="/admision" className="text-sm font-semibold text-oro hover:underline">Quiero ser parte →</Link>
          </Revelar>

          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 [scrollbar-width:none] lg:grid lg:grid-cols-4 lg:overflow-visible lg:mx-0 lg:px-0">
            {INGRESANTES.map((p, i) => (
              <Revelar key={p.nombre} retraso={i * 100} className="snap-start shrink-0 w-[75%] sm:w-[45%] lg:w-auto">
                <figure className="group rounded-3xl overflow-hidden bg-white/5 ring-1 ring-white/10 shadow-2xl shadow-black/30 hover:ring-oro/60 transition">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image src={p.img} alt={`${p.nombre}, ${p.puesto} en ${p.carrera}`} fill sizes="(min-width:1024px) 25vw, 75vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  </div>
                  <figcaption className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <span className="min-w-0">
                      <span className="block font-bold leading-tight truncate">{p.nombre}</span>
                      <span className="block text-xs text-blue-100/80">{p.carrera}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-oro text-aduni-900 text-[11px] font-bold px-2.5 py-1">{p.puesto}</span>
                  </figcaption>
                </figure>
              </Revelar>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Por qué ADUNI+ ---------- */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <Revelar className="max-w-2xl">
          <p className="text-aduni-700 font-bold tracking-[0.25em] text-xs">POR QUÉ ADUNI+</p>
          <h2 className="text-3xl md:text-5xl font-black text-aduni-900 mt-3 tracking-tight">Una educación que se nota en los resultados</h2>
        </Revelar>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILARES.map((p, i) => (
            <Revelar key={p.n} retraso={i * 100}>
              <div className="group h-full rounded-3xl border border-gray-200 bg-white p-7 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(18,48,107,0.12)] hover:border-aduni-600/30 transition duration-300">
                <span className="text-sm font-black text-oro">{p.n}</span>
                <h3 className="text-lg font-bold text-aduni-900 mt-4">{p.titulo}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{p.texto}</p>
                <span className="block h-0.5 w-10 bg-aduni-700 mt-6 transition-all duration-300 group-hover:w-20" />
              </div>
            </Revelar>
          ))}
        </div>
      </section>

      {/* ---------- Logros ---------- */}
      <section className="bg-gradient-to-b from-aduni-100/60 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 grid gap-12 lg:grid-cols-2 items-center">
          <Revelar className="relative">
            <div className="absolute -inset-2 sm:-inset-4 rounded-[2rem] bg-oro/30 rotate-2" />
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-square">
              <Image src="/img/logros-fermat-2025.jpg" alt="Estudiantes ganadores del Concurso Nacional Escolar de Comunicación FERMAT 2025" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </Revelar>
          <Revelar retraso={150}>
            <p className="text-aduni-700 font-bold tracking-[0.25em] text-xs">LOGROS</p>
            <h2 className="text-3xl md:text-5xl font-black text-aduni-900 mt-3 tracking-tight">Ganamos en todas las canchas</h2>
            <p className="text-gray-600 mt-5 text-lg leading-relaxed">
              Primer puesto en el Concurso Nacional Escolar de Comunicación FERMAT 2025, nivel secundaria. Nuestros estudiantes destacan en matemática, comunicación y deporte.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Matemática", "Comunicación", "Deportes"].map((x) => (
                <li key={x} className="rounded-2xl bg-white border border-gray-200 px-4 py-3 text-center font-semibold text-aduni-900 shadow-sm">{x}</li>
              ))}
            </ul>
            <Link href="/noticias" className="inline-flex mt-8 font-semibold text-aduni-700 hover:underline">Ver todas las noticias →</Link>
          </Revelar>
        </div>
      </section>

      {/* ---------- Niveles ---------- */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <Revelar className="text-center max-w-2xl mx-auto">
          <p className="text-aduni-700 font-bold tracking-[0.25em] text-xs">NIVELES EDUCATIVOS</p>
          <h2 className="text-3xl md:text-5xl font-black text-aduni-900 mt-3 tracking-tight">Te acompañamos en cada etapa</h2>
        </Revelar>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Revelar>
            <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-aduni-700 to-aduni-900 text-white p-9">
              <span className="absolute -right-4 -bottom-10 text-[10rem] font-black text-white/5 leading-none select-none">P</span>
              <p className="text-oro text-xs font-bold tracking-[0.25em]">1.° A 6.° GRADO</p>
              <h3 className="text-3xl font-black mt-2">Primaria</h3>
              <p className="text-blue-100 mt-3 max-w-sm">Bases sólidas en lectura, matemática y ciencia, con acompañamiento cercano y comunicación constante con las familias.</p>
            </div>
          </Revelar>
          <Revelar retraso={120}>
            <div className="relative h-full overflow-hidden rounded-3xl bg-oro text-aduni-900 p-9">
              <span className="absolute -right-4 -bottom-10 text-[10rem] font-black text-aduni-900/5 leading-none select-none">S</span>
              <p className="text-aduni-700 text-xs font-bold tracking-[0.25em]">1.° A 5.° AÑO</p>
              <h3 className="text-3xl font-black mt-2">Secundaria</h3>
              <p className="text-aduni-900/80 mt-3 max-w-sm">Formación académica exigente con preparación preuniversitaria para ingresar a la universidad desde la primera oportunidad.</p>
            </div>
          </Revelar>
        </div>
      </section>

      {/* ---------- Comunidad ---------- */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <Revelar className="mb-10">
          <p className="text-aduni-700 font-bold tracking-[0.25em] text-xs">FAMILIA ADUNI+</p>
          <h2 className="text-3xl md:text-4xl font-black text-aduni-900 mt-3 tracking-tight">Celebramos a nuestra comunidad</h2>
        </Revelar>
        <div className="grid gap-6 md:grid-cols-2">
          {[["/img/super-mamas.png", "Súper mamás ADUNI+", "object-center"], ["/img/super-papas.png", "Súper papás ADUNI+", "object-top"]].map(([src, titulo, posicion], i) => (
            <Revelar key={src} retraso={i * 120}>
              <figure className="group relative overflow-hidden rounded-3xl aspect-[16/9] bg-aduni-900">
                <Image src={src} alt={titulo} fill sizes="(min-width:768px) 50vw, 100vw" className={`object-cover ${posicion} transition duration-700 group-hover:scale-105`} />
                <figcaption className="absolute left-4 bottom-4 rounded-full bg-white/90 backdrop-blur px-4 py-1.5 text-sm font-bold text-aduni-900">{titulo}</figcaption>
              </figure>
            </Revelar>
          ))}
        </div>
      </section>

      {/* ---------- Noticias ---------- */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <Revelar className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-aduni-700 font-bold tracking-[0.25em] text-xs">ACTUALIDAD</p>
              <h2 className="text-3xl md:text-4xl font-black text-aduni-900 mt-3 tracking-tight">Últimas noticias</h2>
            </div>
            <Link href="/noticias" className="rounded-full border border-aduni-700 text-aduni-700 font-semibold px-5 py-2 hover:bg-aduni-700 hover:text-white transition">Ver todas</Link>
          </Revelar>
          <div className="grid gap-6 md:grid-cols-3">
            {NOTICIAS.map((n, i) => (
              <Revelar key={n.slug} retraso={i * 100}>
                <Link href={`/noticias/${n.slug}`} className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-gray-200 hover:shadow-[0_20px_50px_rgba(18,48,107,0.12)] hover:-translate-y-1 transition duration-300">
                  {n.imagen ? (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={n.imagen} alt="" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="h-1.5 bg-gradient-to-r from-aduni-700 via-aduni-600 to-oro" />
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-xs font-semibold text-aduni-700">{fmt(n.fecha)}</p>
                    <h3 className="font-bold text-lg text-aduni-900 mt-2 leading-snug group-hover:text-aduni-700">{n.titulo}</h3>
                    <p className="text-sm text-gray-600 mt-2 flex-1">{n.resumen}</p>
                    <span className="text-sm font-semibold text-aduni-700 mt-4">Leer más →</span>
                  </div>
                </Link>
              </Revelar>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Intranet ---------- */}
      <section className="max-w-7xl mx-auto px-4 pt-20 pb-4">
        <Revelar>
          <div className="relative overflow-hidden rounded-[2rem] bg-aduni-900 text-white px-8 py-14 md:px-14">
            <Image src="/img/colegio-aduni.jpg" alt="" fill sizes="100vw" className="object-cover opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-r from-aduni-900 via-aduni-900/90 to-aduni-700/70" />
            <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">¿Eres estudiante, docente o padre de familia?</h2>
                <p className="text-blue-100 mt-3 max-w-xl">Ingresa a la intranet para ver notas, asistencia, tareas, horarios, pagos y comunicados desde cualquier dispositivo.</p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link href="/intranet/estudiante" className="bg-white text-aduni-900 font-bold px-6 py-3 rounded-full hover:bg-aduni-100 transition">Intranet Estudiante</Link>
                <Link href="/intranet/profesor" className="bg-oro text-aduni-900 font-bold px-6 py-3 rounded-full hover:brightness-105 transition">Intranet Docentes</Link>
                <Link href="/intranet/familia" className="ring-1 ring-white/40 font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition">Portal de familias</Link>
              </div>
            </div>
          </div>
        </Revelar>
      </section>
    </>
  );
}
