export const metadata = { title: "Nosotros | Colegio ADUNI" };

const VALORES = ["Respeto", "Responsabilidad", "Excelencia", "Solidaridad", "Honestidad"];

export default function Nosotros() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-aduni-900 mb-6">Nosotros</h1>
      <p className="text-gray-700 mb-10">
        ADUNI+ es un colegio privado de primaria y secundaria ubicado en San Jerónimo, Andahuaylas, que inició
        actividades en noviembre de 2014 y trabaja por la formación integral de sus estudiantes.
        (!) Reemplazar con la reseña institucional real.
      </p>
      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <div className="rounded-2xl bg-aduni-100 p-6">
          <h2 className="font-bold text-aduni-700 text-xl mb-2">Misión</h2>
          <p className="text-gray-700">Brindar una educación de calidad que desarrolle el pensamiento crítico, la creatividad y los valores. (!)</p>
        </div>
        <div className="rounded-2xl bg-aduni-100 p-6">
          <h2 className="font-bold text-aduni-700 text-xl mb-2">Visión</h2>
          <p className="text-gray-700">Ser una institución líder en la región, reconocida por su excelencia académica y humana. (!)</p>
        </div>
      </div>
      <h2 className="font-bold text-aduni-900 text-xl mb-3">Nuestros valores</h2>
      <div className="flex flex-wrap gap-2">
        {VALORES.map((v) => (
          <span key={v} className="px-4 py-2 rounded-full bg-aduni-700 text-white text-sm font-semibold">{v}</span>
        ))}
      </div>
    </div>
  );
}
