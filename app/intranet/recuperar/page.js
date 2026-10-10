"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { olvidePassword } from "../../../lib/api";

function Recuperar() {
  const rol = useSearchParams().get("rol") || undefined;
  const [usuario, setUsuario] = useState("");
  const [msg, setMsg] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const r = await olvidePassword(usuario.trim(), rol);
      setMsg(r.mensaje);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-aduni-900">Recuperar contraseña</h1>
      <p className="text-sm text-gray-600 mt-1 mb-6">Escribe tu código, DNI o correo. Te enviaremos un enlace al correo registrado en tu cuenta.</p>
      {msg ? (
        <p className="text-sm bg-aduni-100 text-aduni-900 rounded-lg p-4">{msg}</p>
      ) : (
        <form onSubmit={enviar} className="grid gap-4">
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} required placeholder="Código, DNI o correo" className="border border-gray-300 rounded-lg px-3 py-2.5" />
          <button disabled={cargando} className="bg-aduni-700 text-white rounded-lg py-2.5 font-semibold hover:bg-aduni-900 disabled:opacity-50">{cargando ? "Enviando..." : "Enviar enlace"}</button>
        </form>
      )}
      <Link href="/intranet" className="block text-sm text-aduni-700 mt-6 hover:underline">← Volver a la intranet</Link>
    </div>
  );
}

export default function PaginaRecuperar() {
  return <Suspense><Recuperar /></Suspense>;
}
