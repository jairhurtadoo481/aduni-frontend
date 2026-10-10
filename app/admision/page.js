import FormularioAdmision from "../../components/FormularioAdmision";

export const metadata = { title: "Admisión 2027 | Colegio ADUNI+", description: "Postula en línea al Colegio ADUNI+ (primaria y secundaria) y consulta el estado de tu postulación." };

const PASOS = [
  ["Postula en línea", "Llena el formulario y sube los documentos del estudiante."],
  ["Evaluación y entrevista", "Te contactamos por WhatsApp para coordinar la fecha."],
  ["Resultados", "Consulta el estado con tu código de seguimiento."],
  ["Matrícula", "Al ser admitido se crean las cuentas de la intranet para el estudiante y la familia."],
];

export default function Admision() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-aduni-900 mb-3">Admisión 2027</h1>
      <p className="text-gray-700 mb-8">Proceso de ingreso a primaria y secundaria, 100 % en línea.</p>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {PASOS.map(([t, d], i) => (
          <li key={t} className="rounded-2xl border border-gray-200 p-4">
            <span className="w-8 h-8 rounded-full bg-aduni-700 text-white font-bold flex items-center justify-center mb-2">{i + 1}</span>
            <p className="font-semibold text-aduni-900">{t}</p>
            <p className="text-sm text-gray-600">{d}</p>
          </li>
        ))}
      </ol>
      <FormularioAdmision />
    </div>
  );
}
