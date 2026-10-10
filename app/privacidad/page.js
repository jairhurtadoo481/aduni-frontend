import Link from "next/link";
import PaginaLegal, { Seccion } from "../../components/PaginaLegal";
import { NEGOCIO } from "../../lib/negocio";

export const metadata = {
  title: "Política de Privacidad | Colegio ADUNI+",
  description: "Cómo el Colegio ADUNI+ trata los datos personales de estudiantes, familias, postulantes y personal.",
};

export default function PrivacidadPage() {
  return (
    <PaginaLegal titulo="Política de Privacidad" actualizado={NEGOCIO.versionLegal}>
      <p className="text-sm leading-relaxed text-gray-700 mb-8">
        En {NEGOCIO.nombreComercial} protegemos los datos personales de nuestros estudiantes, sus familias, los
        postulantes y nuestro personal. Esta política explica qué datos tratamos, para qué, con quién los
        compartimos y cómo ejercer sus derechos, conforme a la Ley N.° 29733, Ley de Protección de Datos
        Personales, y su reglamento.
      </p>

      <Seccion titulo="1. Responsable del tratamiento">
        <p>
          El responsable es {NEGOCIO.titular}, promotora de {NEGOCIO.nombreComercial}, con RUC {NEGOCIO.ruc} y
          domicilio en {NEGOCIO.direccion}.
        </p>
      </Seccion>

      <Seccion titulo="2. Qué datos tratamos">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="font-semibold">Estudiantes:</span> nombres, DNI, fecha de nacimiento, sexo, grado y
            sección, fotografía para el carné, calificaciones, asistencia, tareas, conducta, justificaciones y
            pagos de matrícula y pensiones.
          </li>
          <li>
            <span className="font-semibold">Padres, madres o apoderados:</span> nombres, DNI, parentesco,
            celular, correo y dirección, y los comprobantes de pago que registren.
          </li>
          <li>
            <span className="font-semibold">Postulantes (admisión):</span> los datos del formulario de admisión
            del estudiante y de su familia.
          </li>
          <li>
            <span className="font-semibold">Personal docente y administrativo:</span> datos de identificación y
            contacto, cargo y registro de ingreso.
          </li>
          <li>
            <span className="font-semibold">Uso de la intranet:</span> fecha y hora de ingreso, dirección IP y
            acciones realizadas, para la seguridad de las cuentas.
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="3. Para qué los usamos">
        <ul className="list-disc pl-5 space-y-1">
          <li>Brindar el servicio educativo: matrícula, evaluación por competencias, asistencia y libretas.</li>
          <li>Operar la intranet para estudiantes, familias, docentes y personal.</li>
          <li>Comunicarnos con las familias mediante comunicados, notificaciones, correo o WhatsApp.</li>
          <li>Gestionar pensiones y emitir comprobantes electrónicos ante la SUNAT.</li>
          <li>Atender el proceso de admisión, las becas y el Libro de Reclamaciones.</li>
          <li>Cumplir las obligaciones con el Ministerio de Educación y demás autoridades.</li>
        </ul>
        <p>No usamos los datos para fines distintos ni los vendemos o alquilamos.</p>
      </Seccion>

      <Seccion titulo="4. Datos de menores de edad">
        <p>
          Los datos de los estudiantes menores de edad son proporcionados por sus padres o apoderados, quienes
          autorizan su tratamiento al matricularlos. Solo el personal autorizado accede a ellos, según su función.
        </p>
        <p>
          La publicación de fotografías de estudiantes en la web o redes del colegio, por ejemplo de logros o
          ingresantes, se realiza con autorización de la familia. Pueden solicitar su retiro en cualquier momento.
        </p>
      </Seccion>

      <Seccion titulo="5. Con quién los compartimos">
        <ul className="list-disc pl-5 space-y-1">
          <li>Con el Ministerio de Educación y sus órganos, como el SIAGIE o la UGEL, cuando la normativa lo exige.</li>
          <li>Con la SUNAT, al emitir comprobantes electrónicos.</li>
          <li>
            Con proveedores tecnológicos que nos permiten operar la web y la intranet, como el alojamiento, la base
            de datos y el almacenamiento de archivos. Algunos tienen servidores fuera del Perú y están obligados a
            proteger la información.
          </li>
          <li>Con autoridades competentes, cuando la ley lo requiera.</li>
        </ul>
      </Seccion>

      <Seccion titulo="6. Cuánto tiempo los conservamos">
        <p>
          Conservamos los datos mientras dure la relación educativa o laboral y, después, el tiempo que exijan las
          normas educativas, tributarias y contables. Los datos de postulantes no matriculados se conservan solo
          durante el proceso de admisión correspondiente.
        </p>
      </Seccion>

      <Seccion titulo="7. Seguridad">
        <p>
          Usamos conexión segura (HTTPS), contraseñas cifradas que nadie puede ver (ni el propio colegio),
          verificación en dos pasos para el personal, accesos limitados según el área de cada trabajador,
          bloqueo de cuentas ante intentos de acceso indebidos, registro de auditoría de los cambios y copias de
          respaldo. Cada usuario es responsable de no compartir su contraseña.
        </p>
      </Seccion>

      <Seccion titulo="8. Sus derechos">
        <p>
          Pueden solicitar el acceso, la rectificación, la cancelación de sus datos o la oposición a su
          tratamiento, en secretaría o por los medios de la página de{" "}
          <Link href="/contacto" className="underline text-blue-700">Contacto</Link>, indicando su nombre, DNI y
          el del estudiante. Si consideran que su solicitud no fue atendida, pueden acudir a la Autoridad Nacional
          de Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos.
        </p>
      </Seccion>

      <Seccion titulo="9. Cambios en esta política">
        <p>
          Podemos actualizar esta política; la fecha de la última actualización aparece al inicio. Revise también
          los <Link href="/terminos" className="underline text-blue-700">Términos y Condiciones</Link>.
        </p>
      </Seccion>
    </PaginaLegal>
  );
}
