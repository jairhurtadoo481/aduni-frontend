"use client";

import { useRef, useState } from "react";
import { subirArchivo } from "../../lib/api";
import Icono from "./Icono";

// Botón para subir un archivo a la nube. onSubido({ url, nombre, tipo })
export default function SubirArchivo({ carpeta = "otros", onSubido, texto = "Adjuntar archivo", accept, ruta, className = "" }) {
  const input = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  const elegir = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    if (archivo.size > 10 * 1024 * 1024) return setError("El archivo supera 10 MB");
    setError("");
    setSubiendo(true);
    try {
      onSubido(await subirArchivo(archivo, carpeta, ruta));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <span className={`inline-flex flex-col ${className}`}>
      <input ref={input} type="file" className="hidden" onChange={elegir} accept={accept || "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"} />
      <button type="button" disabled={subiendo} onClick={() => input.current?.click()}
        className="inline-flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:border-aduni-600 hover:text-aduni-700 disabled:opacity-50">
        <Icono nombre={subiendo ? "subir" : "clip"} className="w-4 h-4" />
        {subiendo ? "Subiendo..." : texto}
      </button>
      {error && <span className="text-xs text-red-600 mt-1">{error}</span>}
    </span>
  );
}
