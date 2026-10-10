"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiIntranet, descargar } from "../../../../lib/api";
import { useApi, soles, fechaCorta, hoyLima } from "../../../../lib/intranet";
import { Titulo, Tarjeta, Cargando, Vacio, Etiqueta, Modal, Campo, Indicador, Pestanas, inputClase, botonClase, botonSecundario, AvisoError, Exito } from "../../../../components/intranet/ui";

const VOUCHER = { pendiente: ["Por revisar", "amber"], aprobado: ["Validado", "green"], rechazado: ["Rechazado", "red"] };

// Pagos reportados por las familias con foto del voucher (Yape, Plin, transferencia).
function Vouchers() {
  const [estado, setEstado] = useState("pendiente");
  const { data, cargando, recargar } = useApi(`/admin/pagos-reportados?estado=${estado}`);
  const [obs, setObs] = useState({});
  const [error, setError] = useState("");
  const resolver = async (v, nuevo) => {
    try { await apiIntranet(`/admin/pagos-reportados/${v._id}`, { method: "PUT", body: { estado: nuevo, observacion: obs[v._id] || "" } }); recargar(); } catch (e) { setError(e.message); }
  };
  return (
    <>
      <div className="mb-4"><Pestanas valor={estado} onChange={setEstado} opciones={Object.entries(VOUCHER).map(([k, v]) => [k, v[0]])} /></div>
      <AvisoError texto={error} />
      {cargando ? <Cargando /> : !data?.length ? <Tarjeta><Vacio texto="No hay pagos en esta sección" icono="pagos" /></Tarjeta> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((v) => (
            <Tarjeta key={v._id}>
              <div className="flex gap-4">
                <a href={v.comprobanteUrl} target="_blank" rel="noreferrer" className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.comprobanteUrl} alt="Voucher" className="w-28 h-36 object-cover rounded-lg border" />
                </a>
                <div className="flex-1 min-w-0 text-sm">
                  <div className="flex justify-between gap-2"><p className="font-semibold">{v.estudiante?.nombre}</p><Etiqueta color={VOUCHER[v.estado][1]}>{VOUCHER[v.estado][0]}</Etiqueta></div>
                  <p className="text-xs text-gray-500">{v.estudiante?.codigo} · {v.estudiante?.aula?.nombre}</p>
                  <p className="mt-2 text-lg font-bold">{soles(v.monto)}</p>
                  <p className="text-xs">{v.metodo}{v.operacion && ` · Op. ${v.operacion}`} · {fechaCorta(v.fechaPago)}</p>
                  <p className="text-xs text-gray-500 mt-1">{v.pensiones.map((p) => p.concepto).join(", ")}</p>
                  <p className="text-xs text-gray-400">Reportado por {v.reportadoPor?.nombre}</p>
                  {v.estado === "pendiente" ? (
                    <div className="mt-3 grid gap-2">
                      <input className={inputClase} placeholder="Observación (opcional)" value={obs[v._id] || ""} onChange={(e) => setObs({ ...obs, [v._id]: e.target.value })} />
                      <div className="flex gap-2">
                        <button onClick={() => resolver(v, "aprobado")} className="bg-emerald-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700">Validar y emitir recibo</button>
                        <button onClick={() => resolver(v, "rechazado")} className="bg-red-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700">Rechazar</button>
                      </div>
                    </div>
                  ) : v.observacion && <p className="text-xs mt-2">Obs.: {v.observacion}</p>}
                </div>
              </div>
            </Tarjeta>
          ))}
        </div>
      )}
    </>
  );
}

const MESES = ["Matrícula", "", "", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const ESTADO = { pagado: ["Pagado", "green"], pendiente: ["Pendiente", "amber"], vencido: ["Vencido", "red"] };

function Pensiones() {
  const params = useSearchParams();
  const aulas = useApi("/admin/aulas");
  const [f, setF] = useState({ aula: "", estado: params.get("estado") || "", mes: "" });
  const lista = useApi(`/admin/pensiones?aula=${f.aula}&estado=${f.estado}&mes=${f.mes}`);
  const [pagando, setPagando] = useState(null);
  const [pago, setPago] = useState({ metodo: "Efectivo", operacion: "", fechaPago: hoyLima() });
  const [msg, setMsg] = useState({ ok: "", error: "" });

  const generar = async () => {
    if (!confirm("Se creará el cronograma (matrícula + marzo a diciembre) para los estudiantes que aún no lo tengan. ¿Continuar?")) return;
    try {
      const r = await apiIntranet("/admin/pensiones/generar", { method: "POST", body: { aula: f.aula } });
      setMsg({ ok: r.mensaje, error: "" });
      lista.recargar();
    } catch (err) {
      setMsg({ ok: "", error: err.message });
    }
  };

  const pagar = async (e) => {
    e.preventDefault();
    try {
      const r = await apiIntranet(`/admin/pensiones/${pagando._id}/pagar`, { method: "PUT", body: pago });
      setPagando(null);
      lista.recargar();
      if (r.recibo && confirm("Pago registrado. ¿Abrir el recibo para imprimir?")) descargar(`/admin/recibos/${r.recibo}/pdf`, "recibo.pdf", { abrir: true });
    } catch (err) {
      setMsg({ ok: "", error: err.message });
    }
  };

  const anular = async (p) => {
    if (!confirm(`¿Anular el pago de ${p.concepto} de ${p.estudiante.nombre}?`)) return;
    await apiIntranet(`/admin/pensiones/${p._id}/anular`, { method: "PUT" });
    lista.recargar();
  };

  const descuento = async (p) => {
    const v = prompt("Descuento / beca en soles para esta cuota:", p.descuento);
    if (v === null) return;
    await apiIntranet(`/admin/pensiones/${p._id}`, { method: "PUT", body: { descuento: Number(v) } });
    lista.recargar();
  };

  const datos = lista.data || [];
  const suma = (e) => datos.filter((p) => p.estadoActual === e).reduce((s, p) => s + p.total, 0);

  return (
    <>
      <Titulo titulo="Pensiones" subtitulo="Cronograma de pagos, cobranza y morosidad">
        <button onClick={generar} className={botonSecundario}>Generar cronograma</button>
      </Titulo>
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Indicador etiqueta="Cobrado (filtro)" valor={soles(suma("pagado"))} icono="check" color="text-emerald-700 bg-emerald-100" />
        <Indicador etiqueta="Por vencer" valor={soles(suma("pendiente"))} icono="calendario" color="text-amber-700 bg-amber-100" />
        <Indicador etiqueta="Vencido" valor={soles(suma("vencido"))} icono="alerta" color="text-red-700 bg-red-100" />
      </div>
      <Tarjeta className="mb-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Campo etiqueta="Aula"><select className={inputClase} value={f.aula} onChange={(e) => setF({ ...f, aula: e.target.value })}><option value="">Todas</option>{aulas.data?.map((a) => <option key={a._id} value={a._id}>{a.nombre}</option>)}</select></Campo>
          <Campo etiqueta="Estado"><select className={inputClase} value={f.estado} onChange={(e) => setF({ ...f, estado: e.target.value })}><option value="">Todos</option><option value="pagado">Pagado</option><option value="pendiente">Por vencer</option><option value="vencido">Vencido</option></select></Campo>
          <Campo etiqueta="Concepto"><select className={inputClase} value={f.mes} onChange={(e) => setF({ ...f, mes: e.target.value })}><option value="">Todos</option>{MESES.map((m, i) => m && <option key={i} value={i}>{m}</option>)}</select></Campo>
        </div>
      </Tarjeta>
      <div className="mb-4 grid gap-2"><AvisoError texto={msg.error} /><Exito texto={msg.ok} /></div>
      <Tarjeta>
        {lista.cargando ? <Cargando /> : datos.length === 0 ? <Vacio texto="Sin cuotas para este filtro" icono="pagos" /> : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr><th className="text-left px-5 py-3">Estudiante</th><th className="text-left px-3 py-3">Concepto</th><th className="px-3 py-3">Vence</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3">Estado</th><th className="px-5 py-3 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {datos.map((p) => (
                  <tr key={p._id}>
                    <td className="px-5 py-2.5"><p className="font-medium">{p.estudiante?.nombre}</p><p className="text-xs text-gray-400">{p.estudiante?.codigo} · {p.estudiante?.aula?.nombre}</p></td>
                    <td className="px-3 py-2.5">{p.concepto}{p.descuento > 0 && <span className="block text-xs text-emerald-700">Beca: -{soles(p.descuento)}</span>}</td>
                    <td className="px-3 py-2.5 text-center text-gray-600">{fechaCorta(p.vencimiento)}</td>
                    <td className="px-3 py-2.5 text-right font-semibold">{soles(p.total)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <Etiqueta color={ESTADO[p.estadoActual][1]}>{ESTADO[p.estadoActual][0]}</Etiqueta>
                      {p.estado === "pagado" && <p className="text-[11px] text-gray-400">{fechaCorta(p.fechaPago)} · {p.metodo}</p>}
                    </td>
                    <td className="px-5 py-2.5 text-right whitespace-nowrap">
                      {p.estado === "pagado" ? (
                        <button onClick={() => anular(p)} className="text-xs text-red-600 hover:underline">Anular pago</button>
                      ) : (
                        <>
                          {p.estadoActual === "vencido" && p.estudiante?.apoderado?.celular && (
                            <a href={`https://wa.me/51${p.estudiante.apoderado.celular}?text=${encodeURIComponent(`Estimado(a) ${p.estudiante.apoderado.nombre}, le recordamos que la cuota "${p.concepto}" de ${p.estudiante.nombre} por ${soles(p.total)} venció el ${fechaCorta(p.vencimiento)}. Colegio ADUNI+.`)}`}
                              target="_blank" rel="noreferrer" className="text-xs text-emerald-700 hover:underline mr-3">Recordar</a>
                          )}
                          <button onClick={() => descuento(p)} className="text-xs text-gray-600 hover:underline mr-3">Beca</button>
                          <button onClick={() => { setPagando(p); setPago({ metodo: "Efectivo", operacion: "", fechaPago: hoyLima() }); }} className="text-sm font-semibold text-aduni-700 hover:underline">Registrar pago</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>

      <Modal abierto={!!pagando} titulo="Registrar pago" onCerrar={() => setPagando(null)}>
        <form onSubmit={pagar} className="grid gap-3">
          <p className="text-sm">{pagando?.estudiante?.nombre} · <strong>{pagando?.concepto}</strong> · {soles(pagando?.total)}</p>
          <Campo etiqueta="Método"><select className={inputClase} value={pago.metodo} onChange={(e) => setPago({ ...pago, metodo: e.target.value })}>{["Efectivo", "Yape", "Plin", "Transferencia BCP", "Transferencia BN", "Depósito"].map((m) => <option key={m}>{m}</option>)}</select></Campo>
          <Campo etiqueta="N.° de operación (opcional)"><input className={inputClase} value={pago.operacion} onChange={(e) => setPago({ ...pago, operacion: e.target.value })} /></Campo>
          <Campo etiqueta="Fecha de pago"><input type="date" max={hoyLima()} className={inputClase} value={pago.fechaPago} onChange={(e) => setPago({ ...pago, fechaPago: e.target.value })} /></Campo>
          <button className={`${botonClase} w-fit`}>Confirmar pago</button>
        </form>
      </Modal>
    </>
  );
}

function Contenedor() {
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") === "vouchers" ? "vouchers" : "cuotas");
  return (
    <>
      <div className="mb-4"><Pestanas valor={tab} onChange={setTab} opciones={[["cuotas", "Cuotas y cobranza"], ["vouchers", "Pagos reportados por familias"]]} /></div>
      {tab === "cuotas" ? <Pensiones /> : (
        <>
          <Titulo titulo="Pagos reportados" subtitulo="Valida los vouchers de Yape, Plin o transferencia enviados desde el portal de familias" />
          <Vouchers />
        </>
      )}
    </>
  );
}

export default function PensionesAdmin() {
  return <Suspense fallback={<Cargando />}><Contenedor /></Suspense>;
}
