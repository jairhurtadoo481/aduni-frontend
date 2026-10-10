"use client";

import { useState } from "react";
import { apiIntranet, descargar } from "../../../../lib/api";
import { soles, fechaCorta, hoyLima } from "../../../../lib/intranet";
import { useApiEst, usePortal, conHijo } from "../../../../components/intranet/PortalLayout";
import SubirArchivo from "../../../../components/intranet/SubirArchivo";
import Icono from "../../../../components/intranet/Icono";
import { Titulo, Tarjeta, Indicador, Cargando, Etiqueta, AvisoError, Exito, Vacio, Modal, Campo, inputClase, botonClase } from "../../../../components/intranet/ui";

const ESTADO = { pagado: ["Pagado", "green"], pendiente: ["Pendiente", "amber"], vencido: ["Vencido", "red"] };
const REPORTE = { pendiente: ["En revisión", "amber"], aprobado: ["Validado", "green"], rechazado: ["Rechazado", "red"] };

export default function PagosEstudiante() {
  const { hijo } = usePortal();
  const { data, cargando, error, recargar } = useApiEst("/estudiante/pagos");
  const [reportando, setReportando] = useState(false);
  const [form, setForm] = useState({ pensiones: [], metodo: "Yape", operacion: "", fechaPago: hoyLima(), comprobanteUrl: "" });
  const [msg, setMsg] = useState({ ok: "", error: "" });

  if (cargando) return <Cargando />;
  if (error) return <AvisoError texto={error} />;
  const pendientes = data.cuotas.filter((c) => c.estado !== "pagado");
  const enRevision = new Set(data.reportes.filter((r) => r.estado === "pendiente").flatMap((r) => r.pensiones.map(String)));
  const totalSel = pendientes.filter((c) => form.pensiones.includes(c._id)).reduce((s, c) => s + c.total, 0);

  const enviar = async (e) => {
    e.preventDefault();
    try {
      await apiIntranet("/estudiante/pagos/reportar", { method: "POST", body: { ...form, hijo } });
      setReportando(false);
      setForm({ pensiones: [], metodo: "Yape", operacion: "", fechaPago: hoyLima(), comprobanteUrl: "" });
      setMsg({ ok: "Pago reportado. Secretaría lo validará y te avisaremos.", error: "" });
      recargar();
    } catch (err) {
      setMsg({ ok: "", error: err.message });
    }
  };

  const verRecibo = (r) => descargar(conHijo(`/estudiante/recibos/${r._id}/pdf`, hijo), `recibo-${r.numero}.pdf`, { abrir: true }).catch((e) => setMsg({ ok: "", error: e.message }));

  return (
    <>
      <Titulo titulo="Estado de cuenta" subtitulo="Cronograma de matrícula y pensiones">
        {pendientes.length > 0 && <button onClick={() => { setReportando(true); setMsg({ ok: "", error: "" }); }} className={botonClase}><Icono nombre="subir" className="w-4 h-4" /> Reportar pago (Yape / transferencia)</button>}
      </Titulo>
      <div className="mb-4 grid gap-2"><AvisoError texto={msg.error} /><Exito texto={msg.ok} /></div>
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Indicador etiqueta="Pagado" valor={soles(data.totales.pagado)} icono="check" color="text-emerald-700 bg-emerald-100" />
        <Indicador etiqueta="Por vencer" valor={soles(data.totales.pendiente)} icono="calendario" color="text-amber-700 bg-amber-100" />
        <Indicador etiqueta="Vencido" valor={soles(data.totales.vencido)} icono="alerta" color="text-red-700 bg-red-100" />
      </div>

      <Tarjeta titulo="Cronograma de pagos" className="mb-6">
        {data.cuotas.length === 0 ? <Vacio texto="Aún no hay cronograma generado" icono="pagos" /> : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr><th className="text-left px-5 py-3">Concepto</th><th className="px-3 py-3">Vence</th><th className="px-3 py-3 text-right">Monto</th><th className="px-3 py-3 text-right">Beca</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3">Estado</th><th className="px-5 py-3 text-left">Pago</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.cuotas.map((c) => (
                  <tr key={c._id}>
                    <td className="px-5 py-3 font-medium">{c.concepto}</td>
                    <td className="px-3 py-3 text-center text-gray-600">{fechaCorta(c.vencimiento)}</td>
                    <td className="px-3 py-3 text-right">{soles(c.monto)}</td>
                    <td className="px-3 py-3 text-right text-emerald-700">{c.descuento ? `- ${soles(c.descuento)}` : "—"}</td>
                    <td className="px-3 py-3 text-right font-semibold">{soles(c.total)}</td>
                    <td className="px-3 py-3 text-center">{enRevision.has(c._id) ? <Etiqueta color="blue">En revisión</Etiqueta> : <Etiqueta color={ESTADO[c.estadoActual][1]}>{ESTADO[c.estadoActual][0]}</Etiqueta>}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{c.estado === "pagado" ? `${fechaCorta(c.fechaPago)} · ${c.metodo}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Recibos">
          {data.recibos.length === 0 ? <Vacio texto="Sin recibos" icono="caja" /> : (
            <ul className="divide-y divide-gray-100 -my-3">
              {data.recibos.map((r) => (
                <li key={r._id} className="py-2.5 flex items-center justify-between text-sm">
                  <span><span className="font-mono font-semibold">{r.serie}-{String(r.numero).padStart(6, "0")}</span><span className="block text-xs text-gray-500">{fechaCorta(r.fecha)} · {r.conceptos.map((c) => c.concepto).join(", ")}</span></span>
                  <span className="flex items-center gap-3"><strong>{soles(r.total)}</strong><button onClick={() => verRecibo(r)} className="text-aduni-700 text-xs font-semibold hover:underline">PDF</button></span>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
        {data.comprobantes?.length > 0 && (
          <Tarjeta titulo="Boletas electrónicas (SUNAT)" className="lg:col-span-2">
            <ul className="divide-y divide-gray-100 -my-3">
              {data.comprobantes.map((c) => (
                <li key={c._id} className="py-2.5 flex items-center justify-between text-sm">
                  <span><span className="font-mono font-semibold">{c.serie}-{String(c.correlativo).padStart(8, "0")}</span><span className="block text-xs text-gray-500">{c.tipo === "factura" ? "Factura" : "Boleta"} · {fechaCorta(c.fechaEmision)}{c.anulado ? " · ANULADA" : ""}{c.ambiente === "beta" ? " · prueba" : ""}</span></span>
                  <span className="flex items-center gap-3"><strong>{soles(c.total)}</strong><button onClick={() => descargar(conHijo(`/estudiante/comprobantes/${c._id}/pdf`, hijo), "boleta.pdf", { abrir: true }).catch((e) => setMsg({ ok: "", error: e.message }))} className="text-aduni-700 text-xs font-semibold hover:underline">PDF</button></span>
                </li>
              ))}
            </ul>
          </Tarjeta>
        )}
        <Tarjeta titulo="Pagos reportados">
          {data.reportes.length === 0 ? <Vacio texto="No has reportado pagos" icono="subir" /> : (
            <ul className="divide-y divide-gray-100 -my-3">
              {data.reportes.map((r) => (
                <li key={r._id} className="py-2.5 flex items-center justify-between text-sm gap-2">
                  <span>{soles(r.monto)} · {r.metodo}{r.operacion && ` · Op. ${r.operacion}`}<span className="block text-xs text-gray-500">{fechaCorta(r.fechaPago)}{r.observacion && ` · ${r.observacion}`}</span></span>
                  <Etiqueta color={REPORTE[r.estado][1]}>{REPORTE[r.estado][0]}</Etiqueta>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
      <p className="text-xs text-gray-500 mt-4">Puedes pagar en secretaría o por Yape/Plin/transferencia y reportar aquí la foto del voucher. Indica siempre el código del estudiante.</p>

      <Modal abierto={reportando} titulo="Reportar un pago" onCerrar={() => setReportando(false)}>
        <form onSubmit={enviar} className="grid gap-3">
          <div>
            <span className="block text-xs font-semibold text-gray-600 mb-1">¿Qué cuotas pagaste?</span>
            <div className="grid gap-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {pendientes.map((c) => (
                <label key={c._id} className={`flex items-center justify-between gap-2 text-sm p-1 ${enRevision.has(c._id) ? "opacity-40" : ""}`}>
                  <span className="flex items-center gap-2">
                    <input type="checkbox" disabled={enRevision.has(c._id)} checked={form.pensiones.includes(c._id)}
                      onChange={(e) => setForm({ ...form, pensiones: e.target.checked ? [...form.pensiones, c._id] : form.pensiones.filter((x) => x !== c._id) })} />
                    {c.concepto}
                  </span>
                  <span>{soles(c.total)}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-right mt-1">Total: <strong>{soles(totalSel)}</strong></p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Medio"><select className={inputClase} value={form.metodo} onChange={(e) => setForm({ ...form, metodo: e.target.value })}>{["Yape", "Plin", "Transferencia BCP", "Transferencia BN", "Depósito"].map((m) => <option key={m}>{m}</option>)}</select></Campo>
            <Campo etiqueta="Fecha del pago"><input type="date" max={hoyLima()} className={inputClase} value={form.fechaPago} onChange={(e) => setForm({ ...form, fechaPago: e.target.value })} required /></Campo>
          </div>
          <Campo etiqueta="N.° de operación"><input className={inputClase} value={form.operacion} onChange={(e) => setForm({ ...form, operacion: e.target.value })} /></Campo>
          <div>
            <span className="block text-xs font-semibold text-gray-600 mb-1">Foto o captura del voucher</span>
            {form.comprobanteUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.comprobanteUrl} alt="Voucher" className="max-h-48 rounded-lg border" />
            ) : <SubirArchivo carpeta="vouchers" accept="image/*,.pdf" texto="Subir voucher" onSubido={(r) => setForm((f) => ({ ...f, comprobanteUrl: r.url }))} />}
          </div>
          <AvisoError texto={msg.error} />
          <button disabled={!form.pensiones.length || !form.comprobanteUrl} className={`${botonClase} w-fit`}>Enviar para validación</button>
        </form>
      </Modal>
    </>
  );
}
