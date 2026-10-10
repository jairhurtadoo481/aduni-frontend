"use client";

import { useState } from "react";
import { apiIntranet } from "../../../../lib/api";
import { useApi, fechaCorta } from "../../../../lib/intranet";
import { Credenciales } from "../../../../components/intranet/GestionUsuarios";
import { Titulo, Tarjeta, Cargando, Vacio, Etiqueta, Pestanas, Modal, Campo, inputClase, botonClase, AvisoError } from "../../../../components/intranet/ui";

const ESTADOS = { recibida: ["Recibida", "blue"], en_evaluacion: ["En evaluación", "amber"], admitida: ["Admitida", "green"], no_admitida: ["No admitida", "red"], matriculada: ["Matriculada", "violet"] };

function Ficha({ p, onCerrar, onCambio }) {
  const aulas = useApi("/admin/aulas");
  const [f, setF] = useState({ estado: p.estado, cita: p.cita, notasInternas: p.notasInternas });
  const [aula, setAula] = useState("");
  const [error, setError] = useState("");
  const [cred, setCred] = useState(null);

  const guardar = async () => {
    try { await apiIntranet(`/admin/postulaciones/${p._id}`, { method: "PUT", body: f }); onCambio(); onCerrar(); } catch (e) { setError(e.message); }
  };
  const matricular = async () => {
    try {
      const r = await apiIntranet(`/admin/postulaciones/${p._id}/matricular`, { method: "POST", body: { aula: aula || aulas.data?.[0]?._id } });
      onCambio();
      setCred([
        { ...r.estudiante, rol: "estudiante" },
        ...(r.apoderado?.passwordTemporal ? [{ ...r.apoderado, nombre: p.apoderado.nombre, rol: "familia", detalle: `Apoderado de ${p.postulante.nombres}` }] : []),
      ]);
    } catch (e) { setError(e.message); }
  };
  const msgWsp = encodeURIComponent(`Hola ${p.apoderado.nombre}, le saludamos del Colegio ADUNI+ sobre la postulación de ${p.postulante.nombres} (${p.codigoSeguimiento}).`);

  return (
    <Modal abierto titulo={`${p.postulante.apellidos}, ${p.postulante.nombres}`} onCerrar={onCerrar} ancho="max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2 text-sm mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-500">POSTULANTE</p>
          <p>DNI {p.postulante.dni} · {p.postulante.sexo || ""} · nac. {p.postulante.fechaNacimiento || "—"}</p>
          <p>Postula a <strong>{p.grado}.° {p.nivel}</strong> ({p.anio})</p>
          <p>Procedencia: {p.postulante.colegioProcedencia || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500">APODERADO</p>
          <p>{p.apoderado.nombre} ({p.apoderado.parentesco}) · DNI {p.apoderado.dni}</p>
          <p>{p.apoderado.celular} · <a className="text-emerald-700 underline" target="_blank" rel="noreferrer" href={`https://wa.me/51${p.apoderado.celular}?text=${msgWsp}`}>WhatsApp</a></p>
          <p>{p.apoderado.email}</p>
        </div>
      </div>
      {p.comentario && <p className="text-sm bg-gray-50 rounded p-3 mb-4">“{p.comentario}”</p>}
      {p.documentos?.length > 0 && <div className="mb-4 text-sm"><p className="text-xs font-semibold text-gray-500 mb-1">DOCUMENTOS</p>{p.documentos.map((d) => <a key={d.url} href={d.url} target="_blank" rel="noreferrer" className="block text-aduni-700 underline">{d.nombre}</a>)}</div>}
      {p.estado !== "matriculada" ? (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Estado"><select className={inputClase} value={f.estado} onChange={(e) => setF({ ...f, estado: e.target.value })}>{Object.entries(ESTADOS).filter(([k]) => k !== "matriculada").map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select></Campo>
            <Campo etiqueta="Cita de evaluación / entrevista"><input className={inputClase} placeholder="Ej. 15/10 10:00 am" value={f.cita} onChange={(e) => setF({ ...f, cita: e.target.value })} /></Campo>
          </div>
          <Campo etiqueta="Notas internas"><textarea rows={2} className={inputClase} value={f.notasInternas} onChange={(e) => setF({ ...f, notasInternas: e.target.value })} /></Campo>
          <button onClick={guardar} className={`${botonClase} w-fit`}>Guardar y avisar a la familia</button>
          {f.estado === "admitida" && (
            <div className="border-t border-gray-100 pt-4 flex flex-wrap items-end gap-3">
              <Campo etiqueta="Matricular en el aula"><select className={inputClase} value={aula || aulas.data?.[0]?._id || ""} onChange={(e) => setAula(e.target.value)}>{aulas.data?.map((a) => <option key={a._id} value={a._id}>{a.nombre}</option>)}</select></Campo>
              <button onClick={matricular} className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700">Matricular y crear cuentas</button>
            </div>
          )}
        </div>
      ) : <p className="text-sm text-emerald-700">Matriculado(a). Ya figura en Estudiantes.</p>}
      <div className="mt-3"><AvisoError texto={error} /></div>
      <Credenciales lista={cred} onCerrar={() => { setCred(null); onCerrar(); }} />
    </Modal>
  );
}

export default function Admision() {
  const [estado, setEstado] = useState("");
  const { data, cargando, recargar } = useApi(`/admin/postulaciones${estado ? `?estado=${estado}` : ""}`);
  const [viendo, setViendo] = useState(null);

  return (
    <>
      <Titulo titulo="Admisión en línea" subtitulo="Postulaciones recibidas desde la web, evaluación y matrícula" />
      <div className="mb-4"><Pestanas valor={estado} onChange={setEstado} opciones={[["", "Todas"], ...Object.entries(ESTADOS).map(([k, v]) => [k, v[0]])]} /></div>
      <Tarjeta>
        {cargando ? <Cargando /> : !data?.length ? <Vacio texto="Sin postulaciones" icono="admision" /> : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="text-left px-5 py-3">Código</th><th className="text-left px-3 py-3">Postulante</th><th className="px-3 py-3">Grado</th><th className="text-left px-3 py-3">Apoderado</th><th className="px-3 py-3">Fecha</th><th className="px-5 py-3">Estado</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((p) => (
                  <tr key={p._id} onClick={() => setViendo(p)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-5 py-2.5 font-mono text-xs">{p.codigoSeguimiento}</td>
                    <td className="px-3 py-2.5 font-medium">{p.postulante.apellidos}, {p.postulante.nombres}</td>
                    <td className="px-3 py-2.5 text-center">{p.grado}.° {p.nivel}</td>
                    <td className="px-3 py-2.5 text-xs">{p.apoderado.nombre}<span className="block text-gray-400">{p.apoderado.celular}</span></td>
                    <td className="px-3 py-2.5 text-center text-xs">{fechaCorta(p.createdAt)}</td>
                    <td className="px-5 py-2.5 text-center"><Etiqueta color={ESTADOS[p.estado][1]}>{ESTADOS[p.estado][0]}</Etiqueta>{p.cita && <span className="block text-[11px] text-gray-500">Cita: {p.cita}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>
      <p className="text-xs text-gray-400 mt-2">Las familias postulan desde la página pública /admision y consultan su estado con el código de seguimiento.</p>
      {viendo && <Ficha p={viendo} onCerrar={() => setViendo(null)} onCambio={recargar} />}
    </>
  );
}
