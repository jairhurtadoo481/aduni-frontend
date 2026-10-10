"use client";

import { useState } from "react";
import Link from "next/link";
import { apiPublico, subirDocumentoAdmision } from "../lib/api";

const campo = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white";
const anioSiguiente = new Date().getFullYear() + 1;
const VACIO = {
  nivel: "secundaria", grado: 1, anio: anioSiguiente,
  postulante: { nombres: "", apellidos: "", dni: "", fechaNacimiento: "", sexo: "", colegioProcedencia: "" },
  apoderado: { nombre: "", parentesco: "Madre", dni: "", celular: "", email: "", direccion: "" },
  documentos: [], comentario: "", aceptaPrivacidad: false,
};

function Seguimiento() {
  const [codigo, setCodigo] = useState("");
  const [dni, setDni] = useState("");
  const [r, setR] = useState(null);
  const [error, setError] = useState("");
  const ESTADO = { recibida: "Recibida", en_evaluacion: "En evaluación", admitida: "¡Admitido(a)!", no_admitida: "No admitido(a)", matriculada: "Matriculado(a)" };
  const consultar = async (e) => {
    e.preventDefault();
    setError("");
    try { setR(await apiPublico(`/admision/${encodeURIComponent(codigo.trim())}?dni=${dni.trim()}`)); } catch (err) { setR(null); setError(err.message); }
  };
  return (
    <div className="rounded-2xl border border-gray-200 p-6 bg-white">
      <h3 className="font-bold text-aduni-900 mb-3">Consultar estado de mi postulación</h3>
      <form onSubmit={consultar} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input className={campo} placeholder="Código (ADM-XXXXXX)" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
        <input className={campo} placeholder="DNI del postulante" value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))} maxLength={8} required />
        <button className="bg-aduni-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">Consultar</button>
      </form>
      {error && <p className="text-sm text-red-700 mt-3">{error}</p>}
      {r && (
        <div className="mt-4 bg-aduni-100 rounded-lg p-4 text-sm">
          <p><strong>{r.postulante}</strong> · {r.grado}.° de {r.nivel}</p>
          <p className="text-lg font-bold text-aduni-900 mt-1">{ESTADO[r.estado]}</p>
          {r.cita && <p>Cita programada: <strong>{r.cita}</strong></p>}
        </div>
      )}
    </div>
  );
}

export default function FormularioAdmision() {
  const [f, setF] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [codigo, setCodigo] = useState(null);
  const setP = (k, v) => setF({ ...f, postulante: { ...f.postulante, [k]: v } });
  const setA = (k, v) => setF({ ...f, apoderado: { ...f.apoderado, [k]: v } });

  const subir = async (e, nombre) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    setSubiendo(true);
    setError("");
    try {
      const r = await subirDocumentoAdmision(archivo);
      setF((x) => ({ ...x, documentos: [...x.documentos.filter((d) => d.nombre !== nombre), { nombre, url: r.url }] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const r = await apiPublico("/admision", { method: "POST", body: { ...f, grado: Number(f.grado) } });
      setCodigo(r.codigoSeguimiento);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (codigo) {
    return (
      <div className="grid gap-6">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
          <p className="text-emerald-800 font-semibold">¡Postulación enviada!</p>
          <p className="text-sm text-emerald-900 mt-1">Tu código de seguimiento es</p>
          <p className="text-3xl font-mono font-bold text-aduni-900 my-2">{codigo}</p>
          <p className="text-sm text-gray-700">Guárdalo. Te contactaremos por WhatsApp para coordinar la evaluación y entrevista.</p>
        </div>
        <Seguimiento />
      </div>
    );
  }

  const grados = f.nivel === "primaria" ? 6 : 5;
  const docs = ["DNI del postulante", "Libreta o constancia de notas", "DNI del apoderado"];

  return (
    <div className="grid gap-8">
      <form onSubmit={enviar} className="rounded-2xl border border-gray-200 p-6 bg-white grid gap-5">
        <h2 className="text-xl font-bold text-aduni-900">Postula en línea · Año {f.anio}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Nivel<select className={campo} value={f.nivel} onChange={(e) => setF({ ...f, nivel: e.target.value, grado: 1 })}><option value="primaria">Primaria</option><option value="secundaria">Secundaria</option></select></label>
          <label className="text-sm">Grado al que postula<select className={campo} value={f.grado} onChange={(e) => setF({ ...f, grado: e.target.value })}>{Array.from({ length: grados }).map((_, i) => <option key={i} value={i + 1}>{i + 1}.°</option>)}</select></label>
        </div>
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="font-semibold text-gray-900 mb-2">Datos del postulante</legend>
          <input className={campo} placeholder="Nombres" value={f.postulante.nombres} onChange={(e) => setP("nombres", e.target.value)} required />
          <input className={campo} placeholder="Apellidos" value={f.postulante.apellidos} onChange={(e) => setP("apellidos", e.target.value)} required />
          <input className={campo} placeholder="DNI (8 dígitos)" inputMode="numeric" maxLength={8} value={f.postulante.dni} onChange={(e) => setP("dni", e.target.value.replace(/\D/g, ""))} required />
          <label className="text-xs text-gray-500">Fecha de nacimiento<input type="date" className={campo} value={f.postulante.fechaNacimiento} onChange={(e) => setP("fechaNacimiento", e.target.value)} /></label>
          <select className={campo} value={f.postulante.sexo} onChange={(e) => setP("sexo", e.target.value)}><option value="">Sexo</option><option value="M">Masculino</option><option value="F">Femenino</option></select>
          <input className={campo} placeholder="Colegio de procedencia" value={f.postulante.colegioProcedencia} onChange={(e) => setP("colegioProcedencia", e.target.value)} />
        </fieldset>
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="font-semibold text-gray-900 mb-2">Datos del padre, madre o apoderado</legend>
          <input className={campo} placeholder="Nombre completo" value={f.apoderado.nombre} onChange={(e) => setA("nombre", e.target.value)} required />
          <select className={campo} value={f.apoderado.parentesco} onChange={(e) => setA("parentesco", e.target.value)}>{["Madre", "Padre", "Abuelo(a)", "Tío(a)", "Otro"].map((p) => <option key={p}>{p}</option>)}</select>
          <input className={campo} placeholder="DNI" inputMode="numeric" maxLength={8} value={f.apoderado.dni} onChange={(e) => setA("dni", e.target.value.replace(/\D/g, ""))} required />
          <input className={campo} placeholder="Celular (WhatsApp)" inputMode="numeric" maxLength={9} value={f.apoderado.celular} onChange={(e) => setA("celular", e.target.value.replace(/\D/g, ""))} required />
          <input type="email" className={campo} placeholder="Correo (opcional)" value={f.apoderado.email} onChange={(e) => setA("email", e.target.value)} />
          <input className={campo} placeholder="Dirección" value={f.apoderado.direccion} onChange={(e) => setA("direccion", e.target.value)} />
        </fieldset>
        <div>
          <p className="font-semibold text-gray-900 mb-2">Documentos (foto o PDF, opcional ahora)</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {docs.map((d) => {
              const listo = f.documentos.find((x) => x.nombre === d);
              return (
                <label key={d} className={`border border-dashed rounded-lg p-3 text-sm cursor-pointer text-center ${listo ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-300 text-gray-600 hover:border-aduni-600"}`}>
                  <input type="file" className="hidden" accept="image/*,.pdf" disabled={subiendo} onChange={(e) => subir(e, d)} />
                  {listo ? `${d}: listo` : subiendo ? "Subiendo..." : `Subir ${d}`}
                </label>
              );
            })}
          </div>
        </div>
        <textarea rows={2} className={campo} placeholder="Comentario o consulta (opcional)" value={f.comentario} onChange={(e) => setF({ ...f, comentario: e.target.value })} />
        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input type="checkbox" className="mt-1" checked={f.aceptaPrivacidad} onChange={(e) => setF({ ...f, aceptaPrivacidad: e.target.checked })} required />
          Acepto la <Link href="/privacidad" className="text-aduni-700 underline">política de privacidad</Link> y autorizo el uso de estos datos para el proceso de admisión.
        </label>
        {error && <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{error}</p>}
        <button disabled={enviando || subiendo} className="bg-oro text-aduni-900 font-bold px-6 py-3 rounded-lg hover:brightness-110 transition w-fit disabled:opacity-50">{enviando ? "Enviando..." : "Enviar postulación"}</button>
      </form>
      <Seguimiento />
    </div>
  );
}
