import { NEGOCIO } from "../../lib/negocio";

export const metadata = { title: "Contacto | Colegio ADUNI" };

export default function Contacto() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold text-aduni-900 mb-8">Contacto</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-aduni-100 p-6 space-y-2 text-gray-700">
          <p><strong>Dirección:</strong> {NEGOCIO.direccion}</p>
          <p><strong>Teléfono:</strong>{" "}
            {NEGOCIO.telefonoPrincipal.tel ? (
              <a href={`tel:${NEGOCIO.telefonoPrincipal.tel}`} className="text-aduni-700">{NEGOCIO.telefonoPrincipal.texto}</a>
            ) : (
              NEGOCIO.telefonoPrincipal.texto
            )}
          </p>
          <p><strong>Correo:</strong> {NEGOCIO.email}</p>
          {NEGOCIO.horario.map((h) => <p key={h}>{h}</p>)}
        </div>
        <div className="rounded-2xl border border-gray-200 p-6 text-gray-600 text-sm">
          Formulario de contacto: próximamente (se conectará al backend).
        </div>
      </div>
    </div>
  );
}
