"use client";

import { useState } from "react";
import { apiIntranet, descargar, API_URL } from "../../../../lib/api";
import { obtenerToken } from "../../../../lib/auth";
import { useApi, soles, fechaCorta } from "../../../../lib/intranet";
import { usePortal } from "../../../../components/intranet/PortalLayout";
import { Titulo, Tarjeta, Cargando, Vacio, Etiqueta, Indicador, Pestanas, Campo, inputClase, botonClase, botonSecundario, AvisoError, Exito } from "../../../../components/intranet/ui";

const ESTADO = { aceptado: ["Aceptado", "green"], rechazado: ["Rechazado", "red"], error: ["Error de envío", "amber"], pendiente: ["Pendiente", "gray"] };
const TIPO = { boleta: "Boleta", factura: "Factura", nota_credito: "Nota de crédito" };

function Comprobantes() {
  const [f, setF] = useState({ tipo: "", estado: "" });
  const { data, cargando, recargar } = useApi(`/admin/facturacion/comprobantes?tipo=${f.tipo}&estado=${f.estado}`);
  const [msg, setMsg] = useState({ ok: "", error: "" });
  const accion = async (ruta, texto) => {
    try { await apiIntranet(ruta, { method: "POST", body: texto ? { motivo: texto } : {} }); setMsg({ ok: "Listo", error: "" }); recargar(); } catch (e) { setMsg({ ok: "", error: e.message }); }
  };
  const abrir = (c, archivo) => descargar(`/admin/facturacion/comprobantes/${c._id}/${archivo}`, `${c.serie}-${c.correlativo}.${archivo === "pdf" ? "pdf" : archivo === "xml" ? "xml" : "zip"}`, { abrir: archivo === "pdf" }).catch((e) => setMsg({ ok: "", error: e.message }));

  return (
    <div className="grid gap-4">
      {data && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Indicador etiqueta="Emitidos" valor={data.resumen.emitidos} icono="dinero" />
          <Indicador etiqueta="Aceptados" valor={data.resumen.aceptados} icono="check" color="text-emerald-700 bg-emerald-100" />
          <Indicador etiqueta="Con problemas" valor={data.resumen.conError} icono="alerta" color="text-red-700 bg-red-100" />
          <Indicador etiqueta="Total boletas válidas" valor={soles(data.resumen.totalBoletas)} detalle={`Facturas: ${soles(data.resumen.totalFacturas)}`} icono="caja" color="text-violet-700 bg-violet-100" />
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <select className={`${inputClase} w-auto`} value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}><option value="">Todos los tipos</option>{Object.entries(TIPO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select className={`${inputClase} w-auto`} value={f.estado} onChange={(e) => setF({ ...f, estado: e.target.value })}><option value="">Todos los estados</option>{Object.entries(ESTADO).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select>
      </div>
      <AvisoError texto={msg.error} /><Exito texto={msg.ok} />
      <Tarjeta>
        {cargando || !data ? <Cargando /> : data.lista.length === 0 ? <Vacio texto="Aún no se emitieron comprobantes. Se emiten desde Caja o automáticamente al registrar pagos." icono="dinero" /> : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="text-left px-5 py-3">Comprobante</th><th className="text-left px-3 py-3">Cliente</th><th className="text-left px-3 py-3">Estudiante</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3">SUNAT</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {data.lista.map((c) => (
                  <tr key={c._id} className={c.anulado ? "opacity-60" : ""}>
                    <td className="px-5 py-2.5">
                      <p className="font-mono font-semibold">{c.serie}-{String(c.correlativo).padStart(8, "0")}</p>
                      <p className="text-xs text-gray-500">{TIPO[c.tipo]} · {fechaCorta(c.fechaEmision)}{c.ambiente === "beta" && " · PRUEBA"}{c.afectado?.serie && ` · anula ${c.afectado.serie}-${c.afectado.correlativo}`}</p>
                    </td>
                    <td className="px-3 py-2.5 text-xs">{c.cliente.nombre}<span className="block text-gray-400">{c.cliente.tipoDocumento} {c.cliente.documento}</span></td>
                    <td className="px-3 py-2.5 text-xs">{c.estudiante?.nombre}</td>
                    <td className="px-3 py-2.5 text-right font-semibold">{soles(c.total)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <Etiqueta color={ESTADO[c.estado][1]}>{ESTADO[c.estado][0]}</Etiqueta>
                      {c.anulado && <span className="block text-[11px] text-red-600">Anulado</span>}
                      {c.observaciones && c.estado !== "aceptado" && <span className="block text-[11px] text-gray-500 max-w-48 mx-auto">{c.observaciones}</span>}
                    </td>
                    <td className="px-5 py-2.5 text-right whitespace-nowrap space-x-2 text-xs">
                      <button onClick={() => abrir(c, "pdf")} className="text-aduni-700 font-semibold hover:underline">PDF</button>
                      <button onClick={() => abrir(c, "xml")} className="text-gray-600 hover:underline">XML</button>
                      {c.estado === "aceptado" && <button onClick={() => abrir(c, "cdr")} className="text-gray-600 hover:underline">CDR</button>}
                      {c.estado === "error" && <button onClick={() => accion(`/admin/facturacion/comprobantes/${c._id}/reenviar`)} className="text-amber-700 hover:underline">Reenviar</button>}
                      {c.estado === "aceptado" && c.tipo !== "nota_credito" && !c.anulado && (
                        <button onClick={() => { const m = prompt("Motivo de la anulación (se emitirá una nota de crédito):", "ANULACION DE LA OPERACION"); if (m) accion(`/admin/facturacion/comprobantes/${c._id}/anular`, m); }} className="text-red-600 hover:underline">Anular</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>
    </div>
  );
}

function Configuracion() {
  const { areas } = usePortal();
  const esDireccion = areas.includes("direccion");
  const { data: c, cargando, recargar } = useApi("/admin/facturacion/config");
  const [form, setForm] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [msg, setMsg] = useState({ ok: "", error: "" });
  if (cargando || !c) return <Cargando />;
  const v = form || { razonSocial: c.razonSocial, nombreComercial: c.nombreComercial, direccion: c.direccion, ambiente: c.ambiente, emitirAutomatico: c.emitirAutomatico, usuarioSol: "", claveSol: "", claveCertificado: "", ...Object.fromEntries(Object.entries(c.series).map(([k, s]) => [`serie_${k}`, s])) };
  const set = (k, val) => setForm({ ...v, [k]: val });

  const guardar = async (activo) => {
    const datos = new FormData();
    Object.entries(v).forEach(([k, val]) => { if (val !== "" && val !== undefined) datos.append(k, String(val)); });
    if (activo !== undefined) datos.append("activo", String(activo));
    if (archivo) datos.append("certificado", archivo);
    try {
      const r = await fetch(`${API_URL}/intranet/admin/facturacion/config`, { method: "PUT", headers: { Authorization: `Bearer ${obtenerToken()}` }, body: datos });
      const j = await r.json();
      if (!r.ok) throw new Error(j.mensaje);
      setMsg({ ok: activo === true ? "Facturación electrónica ACTIVADA" : activo === false ? "Facturación desactivada" : "Configuración guardada", error: "" });
      setForm(null); setArchivo(null); recargar();
    } catch (e) {
      setMsg({ ok: "", error: e.message });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Tarjeta titulo="Estado" className="lg:col-span-2">
        <div className="flex flex-wrap items-center gap-4">
          <Etiqueta color={c.activo ? "green" : "gray"}>{c.activo ? "ACTIVA" : "INACTIVA"}</Etiqueta>
          <span className="text-sm">Ambiente: <strong>{c.ambiente === "beta" ? "Beta (pruebas, sin valor tributario)" : "PRODUCCIÓN"}</strong></span>
          <span className="text-sm">Certificado: <strong>{c.tieneCertificado ? `cargado${c.certificadoInfo?.validoHasta ? ` (vence ${new Date(c.certificadoInfo.validoHasta).toLocaleDateString("es-PE")})` : ""}` : "falta"}</strong></span>
          <span className="text-sm">Usuario SOL: <strong>{c.tieneSol ? "configurado" : "falta"}</strong></span>
          {esDireccion && (c.activo
            ? <button onClick={() => guardar(false)} className={`${botonSecundario} ml-auto`}>Desactivar</button>
            : <button onClick={() => guardar(true)} disabled={!c.listo} className={`${botonClase} ml-auto`}>Activar facturación</button>)}
        </div>
        <p className="text-xs text-gray-500 mt-3">Las pensiones y la matrícula se emiten como <strong>exoneradas de IGV</strong> (servicios educativos). Con la emisión automática, cada pago registrado en Caja o voucher validado genera su boleta a nombre del apoderado (DNI). Correlativos actuales: B {c.correlativos.boleta} · F {c.correlativos.factura}.</p>
      </Tarjeta>
      {!esDireccion ? <Tarjeta className="lg:col-span-2"><p className="text-sm text-gray-500">Solo Dirección puede modificar la configuración de facturación (credenciales y certificado).</p></Tarjeta> : (
        <>
          <Tarjeta titulo="Datos del emisor y series">
            <div className="grid gap-3">
              <Campo etiqueta="RUC"><input className={inputClase} value={c.ruc} disabled /></Campo>
              <Campo etiqueta="Razón social"><input className={inputClase} value={v.razonSocial} onChange={(e) => set("razonSocial", e.target.value)} /></Campo>
              <Campo etiqueta="Nombre comercial"><input className={inputClase} value={v.nombreComercial} onChange={(e) => set("nombreComercial", e.target.value)} /></Campo>
              <Campo etiqueta="Dirección fiscal"><input className={inputClase} value={v.direccion} onChange={(e) => set("direccion", e.target.value)} /></Campo>
              <div className="grid grid-cols-2 gap-3">
                {[["boleta", "Serie boletas"], ["factura", "Serie facturas"], ["notaCreditoBoleta", "N. crédito boleta"], ["notaCreditoFactura", "N. crédito factura"]].map(([k, t]) => (
                  <Campo key={k} etiqueta={t}><input className={inputClase} maxLength={4} value={v[`serie_${k}`]} onChange={(e) => set(`serie_${k}`, e.target.value.toUpperCase())} /></Campo>
                ))}
              </div>
              <Campo etiqueta="Ambiente">
                <select className={inputClase} value={v.ambiente} onChange={(e) => set("ambiente", e.target.value)}>
                  <option value="beta">Beta (pruebas)</option>
                  <option value="produccion">Producción (con valor tributario)</option>
                </select>
              </Campo>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.emitirAutomatico} onChange={(e) => set("emitirAutomatico", e.target.checked)} /> Emitir boleta automáticamente al registrar cada pago</label>
            </div>
          </Tarjeta>
          <Tarjeta titulo="Credenciales SUNAT (se guardan cifradas)">
            <div className="grid gap-3">
              <p className="text-xs text-gray-500">Usa un <strong>usuario secundario SOL</strong> con permiso de “Envío de comprobantes electrónicos”, no la clave SOL principal. Escríbelos aquí; nunca por chat ni correo.</p>
              <Campo etiqueta="Usuario secundario SOL"><input className={inputClase} autoComplete="off" placeholder={c.tieneSol ? "(configurado — escribe solo para cambiar)" : "Ej. ADUNIFE1"} value={v.usuarioSol} onChange={(e) => set("usuarioSol", e.target.value)} /></Campo>
              <Campo etiqueta="Clave del usuario SOL"><input type="password" className={inputClase} autoComplete="new-password" value={v.claveSol} onChange={(e) => set("claveSol", e.target.value)} /></Campo>
              <Campo etiqueta="Certificado digital (.pfx / .p12)"><input type="file" accept=".pfx,.p12" onChange={(e) => setArchivo(e.target.files?.[0] || null)} className="text-sm" /></Campo>
              <Campo etiqueta="Contraseña del certificado"><input type="password" className={inputClase} autoComplete="new-password" value={v.claveCertificado} onChange={(e) => set("claveCertificado", e.target.value)} /></Campo>
              {c.certificadoInfo?.sujeto && <p className="text-xs text-gray-500 break-all">Certificado actual: {c.certificadoInfo.sujeto}</p>}
            </div>
          </Tarjeta>
          <div className="lg:col-span-2 grid gap-3">
            <AvisoError texto={msg.error} /><Exito texto={msg.ok} />
            <button onClick={() => guardar()} className={`${botonClase} w-fit`}>Guardar configuración</button>
            <p className="text-xs text-gray-400">Recomendado: activa primero en <strong>Beta</strong>, emite 2-3 boletas de prueba desde Caja, revisa que salgan “Aceptado”, y recién luego cambia a Producción.</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function Facturacion() {
  const [tab, setTab] = useState("comprobantes");
  return (
    <>
      <Titulo titulo="Facturación electrónica SUNAT" subtitulo="Boletas y facturas de pensiones y matrícula (exoneradas de IGV) enviadas directamente a SUNAT" />
      <div className="mb-6"><Pestanas valor={tab} onChange={setTab} opciones={[["comprobantes", "Comprobantes"], ["config", "Configuración"]]} /></div>
      {tab === "comprobantes" ? <Comprobantes /> : <Configuracion />}
    </>
  );
}
