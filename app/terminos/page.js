import Link from "next/link";
import PaginaLegal, { Seccion } from "../../components/PaginaLegal";
import { NEGOCIO } from "../../lib/negocio";

export const metadata = {
  title: "Términos y Condiciones | Colegio ADUNI+",
  description: "Condiciones de uso de la web y de la intranet del Colegio ADUNI+.",
};

export default function TerminosPage() {
  return (
    <PaginaLegal titulo="Términos y Condiciones" actualizado={NEGOCIO.versionLegal}>
      <p className="text-sm leading-relaxed text-gray-700 mb-8">
        Estas condiciones regulan el uso de la web pública y de la intranet de {NEGOCIO.nombreComercial}. Al
        usarlas, usted las acepta.
      </p>

      <Seccion titulo="1. Quiénes somos">
        <p>
          {NEGOCIO.nombreComercial} es una institución educativa privada de primaria y secundaria, promovida por{" "}
          {NEGOCIO.titular}, con RUC {NEGOCIO.ruc} y domicilio en {NEGOCIO.direccion}.
        </p>
      </Seccion>

      <Seccion titulo="2. Información de la web">
        <p>
          La información sobre admisión, becas, costos y actividades es referencial. Las condiciones que rigen
          son las del reglamento interno, la información que el colegio entrega antes de la matrícula y el
          contrato o compromiso de prestación del servicio educativo firmado con cada familia.
        </p>
      </Seccion>

      <Seccion titulo="3. Cuentas de la intranet">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Cada estudiante (desde el grado que defina el colegio), padre, madre o apoderado, docente y trabajador
            recibe una cuenta personal e intransferible.
          </li>
          <li>
            Usted es responsable de mantener su contraseña en reserva y de cambiar la contraseña temporal en su
            primer ingreso. El colegio nunca le pedirá su contraseña.
          </li>
          <li>
            Por seguridad, las cuentas se bloquean temporalmente tras varios intentos fallidos, y todos los
            ingresos y cambios quedan registrados.
          </li>
          <li>
            El colegio puede suspender una cuenta ante un uso indebido o cuando termina la relación educativa o
            laboral.
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="4. Uso adecuado">
        <p>No está permitido:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ingresar con la cuenta de otra persona o intentar acceder a información que no le corresponde.</li>
          <li>Publicar o enviar contenido ofensivo, discriminatorio o que afecte a cualquier miembro de la comunidad.</li>
          <li>Difundir datos, notas, fotografías o materiales de otros estudiantes o del colegio sin autorización.</li>
          <li>Intentar dañar, sobrecargar o vulnerar la seguridad del sistema.</li>
        </ul>
        <p>Estas conductas se atienden según el reglamento interno y la normativa vigente.</p>
      </Seccion>

      <Seccion titulo="5. Pagos">
        <p>
          Los montos de matrícula y pensiones, sus fechas de vencimiento y las becas se rigen por lo informado
          por el colegio. Los pagos reportados por la intranet se consideran válidos una vez verificados por
          tesorería, que emite el recibo y, cuando corresponde, el comprobante electrónico.
        </p>
      </Seccion>

      <Seccion titulo="6. Disponibilidad">
        <p>
          Procuramos que la intranet esté disponible en todo momento, pero puede interrumpirse por mantenimiento
          o por causas ajenas al colegio. Ante cualquier problema puede usar la opción «Ayuda y soporte» de su
          portal.
        </p>
      </Seccion>

      <Seccion titulo="7. Propiedad intelectual">
        <p>
          El nombre, el logotipo y los contenidos propios del colegio, incluidos los materiales del aula virtual,
          no pueden copiarse ni difundirse fuera de la comunidad educativa sin autorización.
        </p>
      </Seccion>

      <Seccion titulo="8. Reclamos y protección de datos">
        <p>
          Puede registrar un reclamo o una queja en nuestro{" "}
          <Link href="/libro-de-reclamaciones" className="underline text-blue-700">Libro de Reclamaciones</Link>.
          El tratamiento de datos personales se describe en la{" "}
          <Link href="/privacidad" className="underline text-blue-700">Política de Privacidad</Link>.
        </p>
      </Seccion>

      <Seccion titulo="9. Ley aplicable">
        <p>
          Estas condiciones se rigen por las leyes del Perú, incluidas la Ley de los Centros Educativos Privados,
          el Código de Protección y Defensa del Consumidor y la Ley de Protección de Datos Personales.
        </p>
      </Seccion>
    </PaginaLegal>
  );
}
