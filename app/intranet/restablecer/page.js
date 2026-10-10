"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { restablecerPassword } from "../../../lib/api";

function Restablecer() {
  const p = useSearchParams();
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [msg, setMsg] = useState({ ok: "", error: "" });

  const enviar = async (e) => {
    e.preventDefault();
    if (nueva !== repetir) return setMsg({ ok: "", error: "Las contraseñas no coinciden" });
    try {
      const r = await restablecerPassword(p.get("u"), p.get("t"), nueva);
      setMsg({ ok: r.mensaje, error: "" });
    } catch (err) {
      setMsg({ ok: "", error: err.message });
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-aduni-900">Nueva contraseña</h1>
      {msg.ok ? (
        <>
          <p className="text-sm bg-emerald-50 text-emerald-800 rounded-lg p-4 mt-6">{msg.ok}</p>
          <Link href="/intranet" className="block mt-6 text-aduni-700 hover:underline">Ir a la intranet</Link>
        </>
      ) : (
        <form onSubmit={enviar} className="grid gap-4 mt-6">
          <input type="password" minLength={8} value={nueva} onChange={(e) => setNueva(e.target.value)} required placeholder="Nueva contraseña (mín. 8)" className="border border-gray-300 rounded-lg px-3 py-2.5" />
          <input type="password" minLength={8} value={repetir} onChange={(e) => setRepetir(e.target.value)} required placeholder="Repite la contraseña" className="border border-gray-300 rounded-lg px-3 py-2.5" />
          {msg.error && <p className="text-sm text-red-700">{msg.error}</p>}
          <button className="bg-aduni-700 text-white rounded-lg py-2.5 font-semibold hover:bg-aduni-900">Guardar</button>
        </form>
      )}
    </div>
  );
}

export default function PaginaRestablecer() {
  return <Suspense><Restablecer /></Suspense>;
}
