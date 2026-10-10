export const metadata = { title: "Becas | Colegio ADUNI" };

const BECAS = [
  { nombre: "Beca por excelencia académica", detalle: "Para estudiantes con los más altos promedios. (!)" },
  { nombre: "Beca por hermanos", detalle: "Descuento para familias con dos o más hijos matriculados. (!)" },
  { nombre: "Beca deportiva y artística", detalle: "Reconocimiento a talentos destacados. (!)" },
];

export default function Becas() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-aduni-900 mb-3">Becas</h1>
      <p className="text-gray-700 mb-8">Conoce las becas disponibles y cómo postular. Los porcentajes y requisitos son provisionales (!).</p>
      <div className="grid gap-5 md:grid-cols-3">
        {BECAS.map((b) => (
          <div key={b.nombre} className="rounded-2xl border-t-4 border-oro bg-white shadow-sm p-6">
            <h2 className="font-bold text-aduni-700 mb-2">{b.nombre}</h2>
            <p className="text-sm text-gray-600">{b.detalle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
