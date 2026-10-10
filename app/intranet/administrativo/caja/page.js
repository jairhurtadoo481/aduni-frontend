"use client";

import { useState } from "react";
import { apiIntranet, descargar } from "../../../../lib/api";
import { useApi, soles, hoyLima } from "../../../../lib/intranet";
import Icono from "../../../../components/intranet/Icono";
import { Titulo, Tarjeta, Cargando, Vacio, Etiqueta, Indicador, Campo, inputClase, botonSecundario, AvisoError } from "../../../../components/intranet/ui";

export default function Caja() {
  const [fecha, setFecha] = useState(hoyLima());
  const { data, cargando, recargar } = useApi(`/admin/caja?fecha=${fecha}`);
  const [error, setError] = useState("");

  const anular = async (r) => {
    const motivo = prompt(`Motivo para anular el recibo ${r.serie}-${r.numero} (la cuota volverá a pendiente):`);
    if (!motivo) return;
    try { await apiIntranet(`/admin/recibos/${r._id}/anular`, { method: "PUT", body: { motivo } }); recargar(); } catch (e) { setError(e.message); }
  };
  const pdf = (r) => descargar(`/admin/recibos/${r._id}/pdf`, `recibo-${r.numero}.pdf`, { abrir: true }).catch((e) => setError(e.message));
  const emitir = async (r, tipo) => {
    let cliente;
    if (tipo === "factura") {
      const ruc = prompt("RUC del cliente (11 dígitos):");
      if (!ruc) return;
      const nombre = prompt("Razón social o nombre del cliente:");
      if (!nombre) return;
      cliente = { documento: ruc.trim(), nombre };
    }
    try {
      const c = await apiIntranet("/admin/facturacion/emitir", { method: "POST", body: { recibo: r._id, tipo, cliente } });
      setError(c.estado === "aceptado" ? "" : `SUNAT: ${c.observaciones || c.estado}`);
      recargar();
    } catch (e) { setError(e.message); }
  };
  const verComprobante = (c) => descargar(`/admin/facturacion/comprobantes/${c._id}/pdf`, "comprobante.pdf", { abrir: true }).catch((e) => setError(e.message));

  return (
    <>
      <Titulo titulo="Caja" subtitulo="Recibos emitidos y cierre de caja del día">
        <button onClick={() => window.print()} className={botonSecundario}><Icono nombre="imprimir" className="w-4 h-4" /> Imprimir cierre</button>
      </Titulo>
      <div className="mb-4 no-imprimir"><Campo etiqueta="Fecha"><input type="date" max={hoyLima()} className={`${inputClase} w-auto`} value={fecha} onChange={(e) => setFecha(e.target.value)} /></Campo></div>
      <AvisoError texto={error} />
      {cargando || !data ? <Cargando /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
            <Indicador etiqueta="Total del día" valor={soles(data.total)} detalle={`${data.recibos.length - data.anulados} recibos válidos`} icono="caja" color="text-emerald-700 bg-emerald-100" />
            {Object.entries(data.porMetodo).map(([m, v]) => <Indicador key={m} etiqueta={m} valor={soles(v)} icono="dinero" />)}
          </div>
          <Tarjeta titulo={`Recibos del ${fecha}`}>
            {data.recibos.length === 0 ? <Vacio texto="Sin movimientos" icono="caja" /> : (
              <div className="overflow-x-auto -m-5">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="text-left px-5 py-3">Recibo</th><th className="text-left px-3 py-3">Estudiante</th><th className="text-left px-3 py-3">Concepto</th><th className="px-3 py-3">Medio</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3">SUNAT</th><th className="px-5 py-3 no-imprimir" /></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.recibos.map((r) => (
                      <tr key={r._id} className={r.anulado ? "opacity-50 line-through" : ""}>
                        <td className="px-5 py-2.5 font-mono">{r.serie}-{String(r.numero).padStart(6, "0")}<span className="block text-xs text-gray-400 no-underline">{r.hora} · {r.cajero?.nombre?.split(",")[1]}</span></td>
                        <td className="px-3 py-2.5">{r.estudiante?.nombre}<span className="block text-xs text-gray-400">{r.estudiante?.aula?.nombre}</span></td>
                        <td className="px-3 py-2.5 text-xs">{r.conceptos.map((c) => c.concepto).join(", ")}</td>
                        <td className="px-3 py-2.5 text-center text-xs">{r.metodo}{r.operacion && <span className="block text-gray-400">Op. {r.operacion}</span>}</td>
                        <td className="px-3 py-2.5 text-right font-semibold">{soles(r.total)}</td>
                        <td className="px-3 py-2.5 text-center text-xs no-underline">
                          {r.comprobante ? (
                            <button onClick={() => verComprobante(r.comprobante)} className="hover:underline">
                              <span className="font-mono">{r.comprobante.serie}-{r.comprobante.correlativo}</span>
                              <span className={`block ${r.comprobante.estado === "aceptado" ? "text-emerald-700" : "text-red-600"}`}>{r.comprobante.anulado ? "anulado" : r.comprobante.estado}</span>
                            </button>
                          ) : !r.anulado && data.sunatActivo ? (
                            <span className="flex flex-col gap-0.5 no-imprimir">
                              <button onClick={() => emitir(r, "boleta")} className="text-aduni-700 font-semibold hover:underline">Emitir boleta</button>
                              <button onClick={() => emitir(r, "factura")} className="text-gray-500 hover:underline">Factura (RUC)</button>
                            </span>
                          ) : <span className="text-gray-400">{data.sunatActivo ? "—" : "SUNAT inactivo"}</span>}
                        </td>
                        <td className="px-5 py-2.5 text-right whitespace-nowrap no-imprimir">
                          {r.anulado ? <Etiqueta color="red">Anulado</Etiqueta> : <>
                            <button onClick={() => pdf(r)} className="text-aduni-700 text-xs font-semibold hover:underline mr-3">PDF</button>
                            <button onClick={() => anular(r)} className="text-red-600 text-xs hover:underline">Anular</button>
                          </>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Tarjeta>
        </>
      )}
    </>
  );
}
