"use client";

import { useCallback, useEffect, useState } from "react";
import { apiIntranet } from "./api";

// Carga datos de la intranet. `ruta` null = no cargar todavía.
export function useApi(ruta) {
  const [estado, setEstado] = useState({ data: null, error: "", cargando: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!ruta) return;
    let vivo = true;
    apiIntranet(ruta)
      .then((data) => vivo && setEstado({ data, error: "", cargando: false }))
      .catch((e) => vivo && setEstado({ data: null, error: e.message, cargando: false }));
    return () => {
      vivo = false;
    };
  }, [ruta, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return { ...estado, recargar };
}

export const DIAS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export const fechaLarga = (f) =>
  f ? new Date(`${f}T12:00:00Z`).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }) : "";

export const fechaCorta = (f) =>
  f ? new Date(`${f.slice(0, 10)}T12:00:00Z`).toLocaleDateString("es-PE", { day: "2-digit", month: "short", timeZone: "UTC" }) : "";

export const soles = (n) => `S/ ${Number(n || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const hoyLima = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export const NIVEL = {
  AD: { nombre: "Logro destacado", clase: "bg-emerald-600 text-white" },
  A: { nombre: "Logro esperado", clase: "bg-blue-600 text-white" },
  B: { nombre: "En proceso", clase: "bg-amber-400 text-amber-950" },
  C: { nombre: "En inicio", clase: "bg-red-600 text-white" },
};

export const ASISTENCIA = {
  P: { nombre: "Puntual", clase: "bg-emerald-100 text-emerald-800", punto: "bg-emerald-500" },
  T: { nombre: "Tardanza", clase: "bg-amber-100 text-amber-800", punto: "bg-amber-400" },
  F: { nombre: "Falta", clase: "bg-red-100 text-red-800", punto: "bg-red-500" },
  J: { nombre: "Justificada", clase: "bg-sky-100 text-sky-800", punto: "bg-sky-500" },
};

export const iniciales = (nombre = "") => {
  // "Apellidos, Nombres" -> iniciales del primer nombre y primer apellido
  const [ap, no] = nombre.split(",").map((s) => (s || "").trim());
  return `${(no || ap || "?")[0] || ""}${(ap || "")[0] || ""}`.toUpperCase();
};
